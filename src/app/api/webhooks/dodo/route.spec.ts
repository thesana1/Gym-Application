import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/dodo-payments', () => ({
  dodoPayments: {
    verifyWebhook: vi.fn(),
  },
}));

vi.mock('@/features/membership/service/membership.service', () => ({
  getMembershipTierForProduct: vi.fn(),
  syncMembershipFromWebhook: vi.fn(),
}));

import {
  getMembershipTierForProduct,
  syncMembershipFromWebhook,
} from '@/features/membership/service/membership.service';
import { dodoPayments } from '@/shared/lib/dodo-payments';

import { POST } from './route';

const mockVerify = vi.mocked(dodoPayments.verifyWebhook);
const mockGetTier = vi.mocked(getMembershipTierForProduct);
const mockSyncMembership = vi.mocked(syncMembershipFromWebhook);

const makeRequest = () =>
  new NextRequest('http://localhost/api/webhooks/dodo', {
    method: 'POST',
    body: 'signed-webhook-body',
    headers: {
      'webhook-id': 'evt_123',
      'webhook-signature': 'signature',
      'webhook-timestamp': '123456',
    },
  });

describe('/api/webhooks/dodo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('DODO_PAYMENTS_WEBHOOK_KEY', 'test-webhook-key');
  });

  it('rejects requests with an invalid webhook signature', async () => {
    mockVerify.mockImplementationOnce(() => {
      throw new Error('Invalid signature');
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    expect(mockSyncMembership).not.toHaveBeenCalled();
  });

  it('syncs a verified subscription event to its server-associated user', async () => {
    const timestamp = '2026-10-24T10:00:00.000Z';
    mockVerify.mockReturnValueOnce({
      type: 'subscription.active',
      timestamp,
      data: {
        metadata: { userId: '507f1f77bcf86cd799439011' },
        product_id: 'pdt_vip',
        subscription_id: 'sub_123',
        customer: { customer_id: 'cus_123', email: 'member@example.com' },
        status: 'active',
        next_billing_date: '2026-11-24T10:00:00.000Z',
        cancel_at_next_billing_date: false,
      },
    } as never);
    mockGetTier.mockReturnValueOnce('vip');
    mockSyncMembership.mockResolvedValueOnce(true);

    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(mockSyncMembership).toHaveBeenCalledWith(
      {
        tier: 'vip',
        status: 'active',
        subscriptionId: 'sub_123',
        customerId: 'cus_123',
        nextBillingDate: new Date('2026-11-24T10:00:00.000Z'),
        cancelAtPeriodEnd: false,
        lastEventAt: new Date(timestamp),
      },
      '507f1f77bcf86cd799439011',
      'member@example.com'
    );
  });
});
