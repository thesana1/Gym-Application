import { sendEmailService } from '@/features/email/service/email.service';
import { APP_NAME } from '@/shared/const/app.const';
import type { ServiceResult } from '@/shared/types/common';

const NOTIFICATION_TIMEOUT_MS = 5_000;

type OwnerNotification = { subject: string; lines: string[] };

// Best effort: a slow or broken mail server must never block or fail the user's action.
export async function notifyOwnerService({ subject, lines }: OwnerNotification): Promise<ServiceResult<{ sent: boolean }>> {
  const to = process.env.OWNER_NOTIFICATION_EMAIL?.trim();
  if (!to) return { data: { sent: false }, status: 200 };
  const timeout = new Promise<ServiceResult<{ sent: boolean }>>((resolve) =>
    setTimeout(() => resolve({ data: { error: 'EMAIL_TIMEOUT' }, status: 504 }), NOTIFICATION_TIMEOUT_MS)
  );
  const send = sendEmailService({ to, subject: `[${APP_NAME}] ${subject}`, text: [...lines, '', `Sent by ${APP_NAME}.`].join('\n') })
    .then((result): ServiceResult<{ sent: boolean }> =>
      ('error' in result.data ? { data: result.data, status: result.status } : { data: { sent: true }, status: 200 }))
    .catch((): ServiceResult<{ sent: boolean }> => ({ data: { error: 'EMAIL_SEND_FAILED' }, status: 502 }));
  const result = await Promise.race([send, timeout]);
  if ('error' in result.data) console.warn(`Owner notification not sent: ${result.data.error}`);
  return result;
}
