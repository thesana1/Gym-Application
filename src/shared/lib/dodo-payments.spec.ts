// @vitest-environment node
import { createHmac } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DodoPaymentsClient } from '@/shared/lib/dodo-payments';

describe('DodoPaymentsClient', () => {
  const client = new DodoPaymentsClient();
  const secret = Buffer.from('test-webhook-secret-with-enough-entropy').toString('base64');

  beforeEach(() => {
    vi.stubEnv('DODO_PAYMENTS_API_KEY', ' test-api-key ');
    vi.stubEnv('DODO_PAYMENTS_WEBHOOK_KEY', `whsec_${secret}`);
    vi.stubEnv('DODO_PAYMENTS_ENVIRONMENT', 'test');
    vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('maps test and live aliases explicitly and rejects invalid environments', () => {
    expect(client.config.environment).toBe('test_mode');
    expect(client.config.apiKey).toBe('test-api-key');
    vi.stubEnv('DODO_PAYMENTS_ENVIRONMENT', 'live');
    expect(client.config.environment).toBe('live_mode');
    vi.stubEnv('DODO_PAYMENTS_ENVIRONMENT', 'production');
    expect(() => client.config).toThrow();
  });

  it('rejects missing secrets and uses the configured origin for redirects', () => {
    expect(client.returnUrl).toBe('http://localhost:3000/dashboard/membership');
    vi.stubEnv('DODO_PAYMENTS_WEBHOOK_KEY', '');
    expect(() => client.config).toThrow();
  });

  it('verifies the exact raw body with the official SDK and rejects tampering and replay', () => {
    const body = JSON.stringify({ type: 'payment.succeeded', timestamp: new Date().toISOString(), data: {} });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac('sha256', Buffer.from(secret, 'base64')).update(`msg_test.${timestamp}.${body}`).digest('base64');
    const headers = { 'webhook-id': 'msg_test', 'webhook-timestamp': timestamp, 'webhook-signature': `v1,${signature}` };
    expect(client.verifyWebhook(body, headers).type).toBe('payment.succeeded');
    expect(() => client.verifyWebhook(`${body} `, headers)).toThrow();
    expect(() => client.verifyWebhook(body, { ...headers, 'webhook-timestamp': '1' })).toThrow();
    expect(() => client.verifyWebhook(body, {})).toThrow();
  });

  it('reuses an existing tagged product without creating another', async () => {
    const create = vi.fn();
    vi.spyOn(client, 'client', 'get').mockReturnValue({ products: {
      list: () => [{ product_id: 'pdt_existing', metadata: { catalog_key: client.catalogKey('premium') } }], create,
    } } as never);
    expect(await client.findOrCreateProduct('premium')).toBe('pdt_existing');
    expect(create).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('schedules cancellation without immediately cancelling paid access', async () => {
    const update = vi.fn();
    vi.spyOn(client, 'client', 'get').mockReturnValue({ subscriptions: { update } } as never);
    await client.cancelAtBillingDate('sub_1');
    expect(update).toHaveBeenCalledWith('sub_1', { cancel_at_next_billing_date: true });
    vi.restoreAllMocks();
  });

  it('creates the Premium product with server-owned pricing', async () => {
    const create = vi.fn().mockResolvedValue({ product_id: 'pdt_new' });
    vi.spyOn(client, 'client', 'get').mockReturnValue({ products: { list: () => [], create } } as never);
    expect(await client.findOrCreateProduct('premium')).toBe('pdt_new');
    const input = create.mock.calls[0][0];
    expect(input.price).toMatchObject({ price: 2000, currency: 'USD', type: 'recurring_price' });
    expect(input.price).toMatchObject({
      payment_frequency_count: 1, payment_frequency_interval: 'Month', subscription_period_count: 20, subscription_period_interval: 'Year',
    });
    vi.restoreAllMocks();
  });
});
