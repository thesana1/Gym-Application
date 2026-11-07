import nodemailer, { type Transporter } from 'nodemailer';


import type { EmailDelivery } from '@/features/email/types/email.types';
import { SendEmailSchema, SmtpConfigSchema, type SendEmailType } from '@/features/email/validations/email.validation';
import { APP_NAME } from '@/shared/const/app.const';

import type SMTPTransport from 'nodemailer/lib/smtp-transport';

class Mailer {
  private connection?: {
    transport: Transporter<SMTPTransport.SentMessageInfo>;
    from: { name: string; address: string };
  };

  private readConfig() {
    return SmtpConfigSchema.safeParse({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || undefined,
      secure: process.env.SMTP_SECURE || undefined,
      requireTls: process.env.SMTP_REQUIRE_TLS || undefined,
      user: process.env.SMTP_USER?.trim() || undefined,
      password: process.env.SMTP_PASSWORD || undefined,
      fromEmail: process.env.SMTP_FROM_EMAIL,
      fromName: process.env.SMTP_FROM_NAME || APP_NAME,
    });
  }

  get isConfigured(): boolean {
    return this.readConfig().success;
  }

  private getConnection() {
    if (this.connection) return this.connection;
    const parsed = this.readConfig();
    if (!parsed.success) throw new Error('EMAIL_NOT_CONFIGURED');
    const config = parsed.data;
    this.connection = {
      transport: nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        requireTLS: config.requireTls,
        auth: config.user && config.password ? { user: config.user, pass: config.password } : undefined,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        disableFileAccess: true,
        disableUrlAccess: true,
      }),
      from: { name: config.fromName, address: config.fromEmail },
    };
    return this.connection;
  }

  async verify(): Promise<void> {
    await this.getConnection().transport.verify();
  }

  async send(input: SendEmailType): Promise<EmailDelivery> {
    const message = SendEmailSchema.parse(input);
    const { transport, from } = this.getConnection();
    const result = await transport.sendMail({ ...message, from });
    if (result.rejected.length > 0 || result.accepted.length === 0) throw new Error('EMAIL_RECIPIENT_REJECTED');
    return { messageId: result.messageId };
  }
}

export const mailer = new Mailer();
export { Mailer };
