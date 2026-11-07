import type { EmailDelivery } from '@/features/email/types/email.types';
import { SendEmailSchema, type SendEmailType } from '@/features/email/validations/email.validation';
import { mailer } from '@/shared/lib/mailer';
import type { ServiceResult } from '@/shared/types/common';

export async function sendEmailService(input: SendEmailType): Promise<ServiceResult<EmailDelivery>> {
  const parsed = SendEmailSchema.safeParse(input);
  if (!parsed.success) return { data: { error: 'INVALID_EMAIL_MESSAGE' }, status: 400 };
  if (!mailer.isConfigured) return { data: { error: 'EMAIL_NOT_CONFIGURED' }, status: 503 };
  try {
    const result = await mailer.send(parsed.data);
    return { data: result, status: 200 };
  } catch {
    return { data: { error: 'EMAIL_SEND_FAILED' }, status: 502 };
  }
}
