import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/email/service/email.service', () => ({ sendEmailService: vi.fn() }));

import { sendEmailService } from '@/features/email/service/email.service';
import { notifyOwnerService } from '@/features/email/service/owner-notification.service';

describe('notifyOwnerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.stubEnv('OWNER_NOTIFICATION_EMAIL', 'owner@example.com');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('emails the configured owner address', async () => {
    vi.mocked(sendEmailService).mockResolvedValue({ data: { messageId: 'm1' }, status: 200 });

    expect(await notifyOwnerService({ subject: 'New member', lines: ['Ana signed up.'] })).toEqual({ data: { sent: true }, status: 200 });
    expect(sendEmailService).toHaveBeenCalledWith(expect.objectContaining({
      to: 'owner@example.com', subject: expect.stringContaining('New member'), text: expect.stringContaining('Ana signed up.'),
    }));
  });

  it('does nothing when no owner address is configured', async () => {
    vi.stubEnv('OWNER_NOTIFICATION_EMAIL', '');
    expect(await notifyOwnerService({ subject: 's', lines: ['l'] })).toEqual({ data: { sent: false }, status: 200 });
    expect(sendEmailService).not.toHaveBeenCalled();
  });

  it('reports mail failures without throwing', async () => {
    vi.mocked(sendEmailService).mockRejectedValue(new Error('smtp down'));
    expect(await notifyOwnerService({ subject: 's', lines: ['l'] })).toEqual({ data: { error: 'EMAIL_SEND_FAILED' }, status: 502 });
  });

  it('gives up after the timeout so the user action is not blocked', async () => {
    vi.useFakeTimers();
    vi.mocked(sendEmailService).mockReturnValue(new Promise(() => undefined));
    const pending = notifyOwnerService({ subject: 's', lines: ['l'] });
    await vi.advanceTimersByTimeAsync(5_000);
    expect(await pending).toEqual({ data: { error: 'EMAIL_TIMEOUT' }, status: 504 });
  });
});
