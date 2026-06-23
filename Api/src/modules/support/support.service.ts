import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SupportTicketStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { MailService } from '../mail/mail.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { ReplySupportTicketDto } from './dto/reply-support-ticket.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';

type SupportTicketRecord = {
  id: string;
  subject: string;
  vendor: { companyName: string; contactPerson: string; email: string; phone: string };
};

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async findAll(user: AuthenticatedUser) {
    const where = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN
      ? {}
      : { vendor: { userId: user.id } };

    return this.prisma.supportTicket.findMany({
      where,
      include: {
        vendor: { select: { id: true, companyName: true, contactPerson: true, email: true, phone: true } },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async findOne(user: AuthenticatedUser, id: string) {
    const ticket = await this.loadTicket(id);
    await this.assertCanAccess(user, ticket.id);
    return ticket;
  }

  async createTicket(user: AuthenticatedUser, dto: CreateSupportTicketDto) {
    const vendor = await this.findVendorForUser(user.id);
    const admins = await this.prisma.user.findMany({
      where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
      select: { id: true, name: true, email: true, role: true },
    });

    const ticket = await this.prisma.$transaction(async (tx) => {
      const created = await tx.supportTicket.create({
        data: {
          vendorId: vendor.id,
          createdByUserId: user.id,
          subject: dto.subject.trim(),
          description: dto.message.trim(),
          lastMessageAt: new Date(),
          status: SupportTicketStatus.OPEN,
        },
      });

      await tx.supportMessage.create({
        data: {
          ticketId: created.id,
          authorUserId: user.id,
          body: dto.message.trim(),
          attachments: dto.attachments ?? [],
        },
      });

      return created;
    });

    const fullTicket = await this.loadTicket(ticket.id);
    try {
      await this.notifyOnCreate(fullTicket, dto.message.trim(), admins, vendor.email, user.email);
    } catch {
      // support ticket should still be created even if notifications fail
    }
    return fullTicket;
  }

  async reply(user: AuthenticatedUser, ticketId: string, dto: ReplySupportTicketDto) {
    const ticket = await this.loadTicket(ticketId);
    await this.assertCanAccess(user, ticket.id);

    const message = dto.message.trim();
    if (!message) {
      throw new ForbiddenException('Message is required');
    }

    const updatedStatus = this.nextStatusForReply(user.role, ticket.status);
    const saved = await this.prisma.$transaction(async (tx) => {
      await tx.supportMessage.create({
        data: {
          ticketId: ticket.id,
          authorUserId: user.id,
          body: message,
          attachments: dto.attachments ?? [],
        },
      });

      return tx.supportTicket.update({
        where: { id: ticket.id },
        data: {
          lastMessageAt: new Date(),
          status: updatedStatus,
        },
      });
    });

    const fullTicket = await this.loadTicket(saved.id);
    try {
      await this.notifyOnReply(fullTicket, message, user.role, dto.attachments ?? []);
    } catch {
      // keep the support thread flowing even if email delivery fails
    }
    return fullTicket;
  }

  async updateStatus(user: AuthenticatedUser, ticketId: string, dto: UpdateSupportTicketStatusDto) {
    this.ensureAdmin(user);
    const ticket = await this.loadTicket(ticketId);
    const updated = await this.prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: dto.status as SupportTicketStatus,
        lastMessageAt: new Date(),
      },
    });
    return this.loadTicket(updated.id);
  }

  private async loadTicket(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        vendor: { select: { id: true, companyName: true, contactPerson: true, email: true, phone: true, userId: true } },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Support ticket not found');
    return ticket;
  }

  private async findVendorForUser(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      select: { id: true, companyName: true, contactPerson: true, email: true, phone: true, userId: true },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor;
  }

  private async assertCanAccess(user: AuthenticatedUser, ticketId: string) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) return;
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { vendor: { select: { userId: true } } },
    });
    if (!ticket || ticket.vendor?.userId !== user.id) {
      throw new NotFoundException('Support ticket not found');
    }
  }

  private ensureAdmin(user: AuthenticatedUser) {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only admins can manage support ticket status');
    }
  }

  private nextStatusForReply(role: UserRole, current: SupportTicketStatus) {
    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      return current === SupportTicketStatus.RESOLVED || current === SupportTicketStatus.CLOSED
        ? SupportTicketStatus.IN_PROGRESS
        : SupportTicketStatus.WAITING_FOR_VENDOR;
    }
    return SupportTicketStatus.WAITING_FOR_ADMIN;
  }

  private async notifyOnCreate(
    ticket: SupportTicketRecord,
    initialMessage: string,
    admins: Array<{ id: string; name: string; email: string; role: UserRole }>,
    vendorEmail: string,
    createdByEmail: string,
  ) {
    const vendorPanelUrl = `https://vendor.eventstan.com/vendor/support/${ticket.id}`;
    const vendorInboxUrl = `https://vendor.eventstan.com/vendor/support`;
    const adminPanelUrl = `https://admin.eventstan.com/admin/support/${ticket.id}`;
    const subject = `Support ticket created: ${ticket.subject}`;

    const vendorHtml = `
      <h2>Your support ticket has been created</h2>
      <p><strong>Subject:</strong> ${this.escape(ticket.subject)}</p>
      <p><strong>Ticket ID:</strong> ${ticket.id}</p>
      <p>${this.escape(initialMessage).replace(/\n/g, '<br>')}</p>
      <p>
        <a href="${vendorPanelUrl}">Open ticket in vendor panel</a><br>
        <a href="${vendorInboxUrl}">Go to Help & Support</a>
      </p>
      <p>We will get back to you shortly.</p>
    `;

    const adminHtml = `
      <h2>New vendor support ticket</h2>
      <p><strong>Vendor:</strong> ${this.escape(ticket.vendor.companyName)} (${this.escape(ticket.vendor.contactPerson)})</p>
      <p><strong>Subject:</strong> ${this.escape(ticket.subject)}</p>
      <p><strong>Ticket ID:</strong> ${ticket.id}</p>
      <p>${this.escape(initialMessage).replace(/\n/g, '<br>')}</p>
      <p><a href="${adminPanelUrl}">Open in admin panel</a></p>
    `;

    await this.mail.send({ to: vendorEmail, subject, html: vendorHtml, text: initialMessage });
    await Promise.all(
      admins
        .filter((admin) => admin.email !== createdByEmail)
        .map((admin) =>
          this.mail.send({
            to: admin.email,
            subject,
            html: adminHtml,
            text: initialMessage,
          }).catch(() => undefined),
        ),
    );
  }

  private async notifyOnReply(
    ticket: SupportTicketRecord,
    message: string,
    role: UserRole,
    attachments: string[],
  ) {
    const ticketUrl = `https://vendor.eventstan.com/vendor/support/${ticket.id}`;
    const adminUrl = `https://admin.eventstan.com/admin/support/${ticket.id}`;
    const attachmentBlock = attachments.length
      ? `<p><strong>Attachments:</strong><br>${attachments.map((url) => `<a href="${url}">${url}</a>`).join('<br>')}</p>`
      : '';

    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      await this.mail.send({
        to: ticket.vendor.email,
        subject: `Reply on support ticket: ${ticket.subject}`,
        html: `
          <h2>New reply from our support team</h2>
          <p><strong>Subject:</strong> ${this.escape(ticket.subject)}</p>
          <p>${this.escape(message).replace(/\n/g, '<br>')}</p>
          ${attachmentBlock}
          <p><a href="${ticketUrl}">Open ticket in vendor panel</a></p>
        `,
        text: message,
      });
      return;
    }

    const admins = await this.prisma.user.findMany({
      where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
      select: { email: true },
    });
    await Promise.all(
      admins.map((admin) =>
        this.mail.send({
          to: admin.email,
          subject: `Vendor replied: ${ticket.subject}`,
          html: `
            <h2>Vendor replied to a support ticket</h2>
            <p><strong>Subject:</strong> ${this.escape(ticket.subject)}</p>
            <p>${this.escape(message).replace(/\n/g, '<br>')}</p>
            ${attachmentBlock}
            <p><a href="${adminUrl}">Open in admin panel</a></p>
          `,
          text: message,
        }).catch(() => undefined),
      ),
    );
  }

  private escape(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
