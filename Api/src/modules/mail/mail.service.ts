import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { PrismaService } from '../../shared/prisma/prisma.service';

export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const host = config.get<string>('SMTP_HOST');
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');
    if (!host || !user || !pass) {
      throw new Error('SMTP configuration is missing');
    }

    const port = Number(config.get<string>('SMTP_PORT', '465'));
    const secure = config.get<string>('SMTP_SECURE', 'true') === 'true';
    this.from = config.get<string>('SMTP_FROM', user);
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  async verify() {
    try {
      await this.transporter.verify();
      return { configured: true, connected: true };
    } catch {
      throw new ServiceUnavailableException('SMTP server is unavailable');
    }
  }

  async send(input: SendEmailInput) {
    try {
      const result = await this.transporter.sendMail({
        from: this.from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });
      return { messageId: result.messageId, accepted: result.accepted };
    } catch {
      throw new ServiceUnavailableException('Email delivery failed');
    }
  }

  async sendTemplate(
    trigger: string,
    to: string,
    variables: Record<string, string>,
    fallback: { subject: string; body: string },
  ) {
    let template = await this.prisma.emailTemplate.findFirst({
      where: { trigger, status: { equals: 'Active', mode: 'insensitive' } },
      orderBy: { updatedAt: 'desc' },
    });
    if (!template) {
      template = await this.prisma.emailTemplate.create({
        data: {
          name: trigger === 'VENDOR_WELCOME' ? 'Vendor Welcome Email' : 'Customer Welcome Email',
          trigger,
          subject: fallback.subject,
          body: fallback.body,
          status: 'Active',
        },
      });
    }
    const subject = this.render(template?.subject ?? fallback.subject, variables, false);
    const html = this.render(template?.body ?? fallback.body, variables, true);
    return this.send({
      to,
      subject,
      html,
      text: this.toText(html),
    });
  }

  private render(template: string, variables: Record<string, string>, escapeValues: boolean) {
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
      const value = variables[key] ?? '';
      return escapeValues ? this.escape(value) : value.replace(/[\r\n]/g, ' ');
    });
  }

  private escape(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private toText(html: string) {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }
}
