import DodoPayments from 'dodopayments';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createCheckout: vi.fn(),
  cancelSubscription: vi.fn(),
  unwrap: vi.fn(),
}));

vi.mock('dodopayments', () => ({
  default: vi.fn().mockImplementation(function DodoPaymentsMock() {
    return {
      checkoutSessions: { create: mocks.createCheckout },
      subscriptions: { update: mocks.cancelSubscription },
      webhooks: { unwrap: mocks.unwrap },
    };
  }),
}));

import { dodoPayments } from './dodo-payments';

describe('dodoPayments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('DODO_PAYMENTS_API_KEY', 'test-api-key');
    vi.stubEnv('DODO_PAYMENTS_WEBHOOK_KEY', 'test-webhook-key');
  });

  it('creates a hosted checkout with server-owned user metadata', async () => {
    mocks.createCheckout.mockResolvedValueOnce({ checkout_url: 'https://checkout.example' });

    const result = await dodoPayments.createCheckout(
      'pdt_vip',
      { id: 'user-123', email: 'member@example.com', name: 'Member' },
      'https://gym.example/dashboard/membership'
    );

    expect(result.checkout_url).toBe('https://checkout.example');
    expect(mocks.createCheckout).toHaveBeenCalledWith({
      product_cart: [{ product_id: 'pdt_vip', quantity: 1 }],
      customer: { email: 'member@example.com', name: 'Member' },
      metadata: { userId: 'user-123' },
      feature_flags: { allow_customer_editing_email: false },
      return_url: 'https://gym.example/dashboard/membership',
      cancel_url: 'https://gym.example/dashboard/membership',
    });
    expect(DodoPayments).toHaveBeenCalledWith({
      bearerToken: 'test-api-key',
      environment: 'test_mode',
    });
  });

  it('schedules cancellation at the next billing date', async () => {
    await dodoPayments.cancelAtBillingDate('sub_123');

    expect(mocks.cancelSubscription).toHaveBeenCalledWith('sub_123', {
      status: 'cancelled',
      cancel_at_next_billing_date: true,
      cancel_reason: 'cancelled_by_customer',
    });
  });

  it('verifies webhooks with the configured signing key', () => {
    const event = { type: 'subscription.active' };
    mocks.unwrap.mockReturnValueOnce(event);

    expect(
      dodoPayments.verifyWebhook('signed-body', {
        'webhook-id': 'evt_123',
        'webhook-signature': 'signature',
        'webhook-timestamp': '123456',
      })
    ).toBe(event);
    expect(mocks.unwrap).toHaveBeenCalledWith('signed-body', {
      headers: {
        'webhook-id': 'evt_123',
        'webhook-signature': 'signature',
        'webhook-timestamp': '123456',
      },
      key: 'test-webhook-key',
    });
  });

  it('fails explicitly when checkout credentials are missing', async () => {
    vi.stubEnv('DODO_PAYMENTS_API_KEY', '');

    await expect(
      dodoPayments.createCheckout(
        'pdt_vip',
        { id: 'user-123', email: 'member@example.com', name: 'Member' },
        'https://gym.example/dashboard/membership'
      )
    ).rejects.toThrow('DODO_PAYMENTS_API_KEY is not configured');
  });
});
