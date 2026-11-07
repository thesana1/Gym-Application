import nodemailer from 'nodemailer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Mailer } from '@/shared/lib/mailer';

const mocks = vi.hoisted(() => ({ sendMail: vi.fn(), verify: vi.fn() }));
vi.mock('nodemailer', () => ({ default: { createTransport: vi.fn(() => mocks) } }));

describe('Mailer', () => {
  let sender: Mailer;
  const message = { to: 'member@example.com', subject: 'Your training', text: 'Your workout is ready.' };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(nodemailer.createTransport).mockReturnValue(mocks as never);
    vi.stubEnv('SMTP_HOST', 'smtp.example.com');
    vi.stubEnv('SMTP_PORT', '587');
    vi.stubEnv('SMTP_SECURE', 'false');
    vi.stubEnv('SMTP_REQUIRE_TLS', 'true');
    vi.stubEnv('SMTP_USER', 'smtp-user');
    vi.stubEnv('SMTP_PASSWORD', 'smtp-password');
    vi.stubEnv('SMTP_FROM_EMAIL', 'sender@example.com');
    vi.stubEnv('SMTP_FROM_NAME', 'Gym Application');
    mocks.sendMail.mockResolvedValue({ messageId: 'message-123', accepted: ['member@example.com'], rejected: [] });
    sender = new Mailer();
  });
  afterEach(() => vi.unstubAllEnvs());

  it('creates the transport lazily and reuses it across messages and verification', async () => {
    expect(sender.isConfigured).toBe(true);
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
    await sender.verify();
    expect(mocks.sendMail).not.toHaveBeenCalled();
    expect(await sender.send(message)).toEqual({ messageId: 'message-123' });
    await sender.send(message);
    expect(nodemailer.createTransport).toHaveBeenCalledOnce();
    expect(mocks.sendMail).toHaveBeenCalledWith({ ...message, from: { name: 'Gym Application', address: 'sender@example.com' } });
    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: 'smtp.example.com', port: 587, secure: false, requireTLS: true,
      auth: { user: 'smtp-user', pass: 'smtp-password' }, disableFileAccess: true, disableUrlAccess: true,
    }));
  });

  it('automatically uses implicit TLS on port 465 when SMTP_SECURE is omitted', async () => {
    vi.stubEnv('SMTP_PORT', '465');
    vi.stubEnv('SMTP_SECURE', '');
    await sender.verify();
    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({ port: 465, secure: true }));
  });

  it('supports a local unauthenticated SMTP capture server when explicitly configured', async () => {
    vi.stubEnv('SMTP_USER', '');
    vi.stubEnv('SMTP_PASSWORD', '');
    vi.stubEnv('SMTP_REQUIRE_TLS', 'false');
    vi.stubEnv('SMTP_PORT', '1025');
    await sender.verify();
    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({ auth: undefined, secure: false, requireTLS: false }));
  });

  it.each([
    ['SMTP_HOST', ''], ['SMTP_FROM_EMAIL', 'not-an-address'], ['SMTP_PORT', 'bad-port'],
    ['SMTP_PORT', '0'], ['SMTP_SECURE', 'maybe'], ['SMTP_REQUIRE_TLS', 'maybe'], ['SMTP_PASSWORD', ''],
  ])('rejects invalid %s before attempting a connection', async (key, value) => {
    vi.stubEnv(key, value);
    expect(sender.isConfigured).toBe(false);
    await expect(sender.send(message)).rejects.toThrow('EMAIL_NOT_CONFIGURED');
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  it('sends supplied HTML and reply-to along with the required plain text', async () => {
    await sender.send({ ...message, html: '<p>Your workout is ready.</p>', replyTo: 'support@example.com' });
    expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({ html: '<p>Your workout is ready.</p>', replyTo: 'support@example.com' }));
  });

  it('rejects invalid recipients and header injection before contacting SMTP', async () => {
    await expect(sender.send({ ...message, to: 'not-an-email' })).rejects.toThrow();
    await expect(sender.send({ ...message, subject: 'Hello\r\nBcc: attacker@example.com' })).rejects.toThrow();
    expect(mocks.sendMail).not.toHaveBeenCalled();
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  it('does not report rejected mail as a successful delivery', async () => {
    mocks.sendMail.mockResolvedValue({ messageId: 'rejected', accepted: [], rejected: ['member@example.com'] });
    await expect(sender.send(message)).rejects.toThrow('EMAIL_RECIPIENT_REJECTED');
  });

  it('propagates transport failures without retrying an email with an unknown delivery outcome', async () => {
    mocks.sendMail.mockRejectedValue(new Error('SMTP unavailable'));
    await expect(sender.send(message)).rejects.toThrow('SMTP unavailable');
    expect(mocks.sendMail).toHaveBeenCalledOnce();
  });
});
