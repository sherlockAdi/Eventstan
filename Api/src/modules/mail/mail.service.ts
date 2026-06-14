import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

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

  constructor(config: ConfigService) {
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
}
