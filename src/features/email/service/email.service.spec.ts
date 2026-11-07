import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendEmailService } from '@/features/email/service/email.service';
import { mailer } from '@/shared/lib/mailer';

const mocks = vi.hoisted(() => ({ configured: true, send: vi.fn() }));
vi.mock('@/shared/lib/mailer', () => ({ mailer: { get isConfigured() { return mocks.configured; }, send: mocks.send } }));

describe('sendEmailService', () => {
  const message = { to: 'member@example.com', subject: 'Training', text: 'Your workout is ready.' };
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.configured = true;
  });

  it('returns the SMTP message ID on success', async () => {
    vi.mocked(mailer.send).mockResolvedValue({ messageId: 'message-123' });
    expect(await sendEmailService(message)).toEqual({ data: { messageId: 'message-123' }, status: 200 });
  });

  it('reports missing configuration without attempting to send', async () => {
    mocks.configured = false;
    expect(await sendEmailService(message)).toEqual({ data: { error: 'EMAIL_NOT_CONFIGURED' }, status: 503 });
    expect(mailer.send).not.toHaveBeenCalled();
  });

  it('rejects unvalidated content before attempting to send', async () => {
    expect((await sendEmailService({ ...message, to: 'bad-address' })).status).toBe(400);
    expect((await sendEmailService({ ...message, subject: 'Hello\nBcc: someone@example.com' })).status).toBe(400);
    expect(mailer.send).not.toHaveBeenCalled();
  });

  it('does not leak transport credentials or provider errors through the service result', async () => {
    vi.mocked(mailer.send).mockRejectedValue(new Error('authentication failed: private-password'));
    expect(await sendEmailService(message)).toEqual({ data: { error: 'EMAIL_SEND_FAILED' }, status: 502 });
  });
});
