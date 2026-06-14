import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        channel: dto.channel,
        event: dto.event,
        recipient: dto.recipient,
        payload: dto.payload as Prisma.InputJsonValue,
      },
    });
    if (dto.channel !== 'EMAIL') return notification;

    try {
      await this.sendEmail(notification);
      return this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENT', sentAt: new Date() },
      });
    } catch {
      return this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'FAILED' },
      });
    }
  }

  list(userId?: string, status?: string) {
    return this.prisma.notification.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markSent(id: string) {
    const notification = await this.get(id);
    if (notification.channel === 'EMAIL') await this.sendEmail(notification);
    return this.prisma.notification.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
    });
  }

  verifyEmail() {
    return this.mail.verify();
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { status: 'READ' },
    });
  }

  async delete(id: string) {
    await this.get(id);
    return this.prisma.notification.delete({ where: { id } });
  }

  private async get(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  private sendEmail(notification: {
    recipient: string;
    event: string;
    payload: Prisma.JsonValue;
  }) {
    const payload = this.payload(notification.payload);
    const title = this.value(payload.title);
    const message = this.value(payload.message);
    const subject = this.value(payload.subject) || title || notification.event.replaceAll('_', ' ');
    const text = message || title || subject;
    const html = this.value(payload.html) || this.defaultHtml(title || subject, text);
    return this.mail.send({ to: notification.recipient, subject, text, html });
  }

  private payload(value: Prisma.JsonValue) {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Prisma.JsonObject)
      : {};
  }

  private value(value: Prisma.JsonValue | undefined) {
    return typeof value === 'string' ? value : '';
  }

  private defaultHtml(title: string, message: string) {
    return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:24px">
      <h2 style="color:#f87a25">${this.escape(title)}</h2>
      <p style="color:#374151;line-height:1.6">${this.escape(message)}</p>
      <p style="color:#9ca3af;font-size:12px;margin-top:32px">EventStan</p>
    </div>`;
  }

  private escape(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
