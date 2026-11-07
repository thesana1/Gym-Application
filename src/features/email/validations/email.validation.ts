import { z } from 'zod';

export const SendEmailSchema = z.object({
  to: z.string().trim().email(),
  subject: z.string().trim().min(1).max(200).regex(/^[^\r\n]+$/),
  text: z.string().min(1).max(50000),
  html: z.string().min(1).max(200000).optional(),
  replyTo: z.string().trim().email().optional(),
}).strict();

export type SendEmailType = z.infer<typeof SendEmailSchema>;

export const SmtpConfigSchema = z.object({
  host: z.string().trim().min(1),
  port: z.coerce.number().int().min(1).max(65535).default(587),
  secure: z.enum(['true', 'false']).optional(),
  requireTls: z.enum(['true', 'false']).default('true'),
  user: z.string().trim().min(1).optional(),
  password: z.string().min(1).optional(),
  fromEmail: z.string().trim().email(),
  fromName: z.string().trim().min(1).max(100).regex(/^[^\r\n]+$/),
}).superRefine((config, context) => {
  if (Boolean(config.user) !== Boolean(config.password)) {
    context.addIssue({ code: 'custom', path: ['user'], message: 'SMTP_USER and SMTP_PASSWORD must be provided together' });
  }
}).transform((config) => ({
  ...config,
  secure: config.secure === undefined ? config.port === 465 : config.secure === 'true',
  requireTls: config.requireTls === 'true',
}));
