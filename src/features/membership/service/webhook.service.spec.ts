import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notifyOwnerService } from '@/features/email/service/owner-notification.service';
import { purchaseRepository } from '@/features/membership/repository/purchase.repository';
import { handleWebhookService } from '@/features/membership/service/webhook.service';
import { dodoPayments } from '@/shared/lib/dodo-payments';

vi.mock('@/features/email/service/owner-notification.service', () => ({ notifyOwnerService: vi.fn() }));
vi.mock('@/features/auth/repository/user.repository', () => ({ userRepository: { updateMembershipById: vi.fn(), recordMembershipRefund: vi.fn() } }));
vi.mock('@/features/membership/repository/purchase.repository', () => ({ purchaseRepository: {
  findById: vi.fn(), applyEvent: vi.fn(), recordRefund: vi.fn(),
} }));
vi.mock('@/shared/lib/dodo-payments', () => ({ dodoPayments: {
  config: { environment: 'test_mode' }, verifyWebhook: vi.fn(),
  client: { subscriptions: { retrieve: vi.fn() }, payments: { retrieve: vi.fn() } },
} }));

const purchaseId = '507f1f77bcf86cd799439011';
const timestamp = '2026-11-07T12:00:00.000Z';
const periodEnd = '2026-12-07T12:00:00.000Z';
const metadata = { purchase_id: purchaseId, user_id: 'owner' };
const event = (type: string, data: object) => ({ type, timestamp, data });

describe('handleWebhookService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(purchaseRepository.findById).mockResolvedValue({
      userId: 'owner', kind: 'premium', productId: 'pdt_premium', checkoutSessionId: 'cks_1',
    } as never);
    vi.mocked(dodoPayments.client.subscriptions.retrieve).mockResolvedValue({
      metadata, subscription_id: 'sub_1', product_id: 'pdt_premium', status: 'active',
      next_billing_date: periodEnd, cancel_at_next_billing_date: false, customer: { customer_id: 'cus_owner', email: 'member@example.com' },
    } as never);
    vi.mocked(dodoPayments.client.payments.retrieve).mockResolvedValue({
      metadata, payment_id: 'pay_1', subscription_id: 'sub_1', subscription_ids: ['sub_1'],
      status: 'succeeded', refunds: [], service_periods: [], customer: { customer_id: 'cus_owner' },
    } as never);
  });

  it('rejects invalid signatures before making any database/provider queries', async () => {
    vi.mocked(dodoPayments.verifyWebhook).mockImplementation(() => { throw new Error('signature'); });
    expect((await handleWebhookService('raw', {})).status).toBe(401);
    expect(purchaseRepository.findById).not.toHaveBeenCalled();
  });

  it('fetches authoritative subscription state and writes with an event timestamp', async () => {
    vi.mocked(dodoPayments.verifyWebhook).mockReturnValue(event('subscription.active', { subscription_id: 'sub_1', status: 'failed' }) as never);
    expect((await handleWebhookService('raw-body', { 'webhook-id': 'evt_1' })).status).toBe(200);
    expect(dodoPayments.verifyWebhook).toHaveBeenCalledWith('raw-body', { 'webhook-id': 'evt_1' });
    expect(purchaseRepository.applyEvent).toHaveBeenCalledWith(purchaseId, new Date(timestamp), expect.objectContaining({
      subscriptionStatus: 'active', currentPeriodEnd: new Date(periodEnd), customerId: 'cus_owner', status: 'paid',
    }));
  });

  it('notifies the owner once when Premium becomes active, not on duplicate deliveries', async () => {
    vi.mocked(dodoPayments.verifyWebhook).mockReturnValue(event('subscription.active', { subscription_id: 'sub_1' }) as never);
    await handleWebhookService('raw', {});
    expect(notifyOwnerService).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Premium started' }));

    vi.mocked(notifyOwnerService).mockClear();
    vi.mocked(purchaseRepository.findById).mockResolvedValue({
      userId: 'owner', kind: 'premium', productId: 'pdt_premium', subscriptionStatus: 'active',
    } as never);
    await handleWebhookService('raw', {});
    expect(notifyOwnerService).not.toHaveBeenCalled();
  });

  it('does not attach a subscription with another product or owner', async () => {
    vi.mocked(dodoPayments.verifyWebhook).mockReturnValue(event('subscription.active', { subscription_id: 'sub_1' }) as never);
    vi.mocked(purchaseRepository.findById).mockResolvedValue({ kind: 'premium', productId: 'pdt_other', userId: 'attacker' } as never);
    await handleWebhookService('raw', {});
    expect(purchaseRepository.applyEvent).not.toHaveBeenCalled();
  });

  it('lets transient database failures reach the route so Dodo can retry', async () => {
    vi.mocked(dodoPayments.verifyWebhook).mockReturnValue(event('subscription.renewed', { subscription_id: 'sub_1' }) as never);
    vi.mocked(purchaseRepository.applyEvent).mockRejectedValueOnce(new Error('database unavailable'));
    await expect(handleWebhookService('raw', {})).rejects.toThrow('database unavailable');
  });

  it('persists a consultation once per purchase, without incrementing on duplicate delivery', async () => {
    vi.mocked(dodoPayments.verifyWebhook).mockReturnValue(event('payment.succeeded', { payment_id: 'pay_1' }) as never);
    vi.mocked(purchaseRepository.findById).mockResolvedValue({ kind: 'consultation', userId: 'owner', productId: 'pdt_coach', checkoutSessionId: 'cks_1' } as never);
    vi.mocked(dodoPayments.client.payments.retrieve).mockResolvedValue({
      metadata, payment_id: 'pay_1', checkout_session_id: 'cks_1', status: 'succeeded', refunds: [],
      product_cart: [{ product_id: 'pdt_coach', quantity: 1 }], customer: { customer_id: 'cus_owner' },
    } as never);
    await handleWebhookService('raw', {});
    await handleWebhookService('raw', {});
    expect(purchaseRepository.applyEvent).toHaveBeenCalledTimes(2);
    expect(purchaseRepository.applyEvent).toHaveBeenLastCalledWith(purchaseId, new Date(timestamp), {
      status: 'paid', paymentId: 'pay_1', customerId: 'cus_owner',
    });
  });

  it('revokes the refunded subscription period independently of event ordering', async () => {
    vi.mocked(dodoPayments.verifyWebhook).mockReturnValue(event('refund.succeeded', { payment_id: 'pay_1' }) as never);
    vi.mocked(dodoPayments.client.payments.retrieve).mockResolvedValue({
      metadata, subscription_id: 'sub_1', subscription_ids: ['sub_1'], refunds: [{ status: 'succeeded', is_partial: false }],
      service_periods: [{ subscription_id: 'sub_1', ends_at: periodEnd }],
    } as never);
    await handleWebhookService('raw', {});
    expect(purchaseRepository.recordRefund).toHaveBeenCalledWith(purchaseId, new Date(periodEnd));
  });

  it('acknowledges unrelated products and event types without granting access', async () => {
    vi.mocked(dodoPayments.verifyWebhook).mockReturnValue(event('subscription.active', { subscription_id: 'sub_unrelated' }) as never);
    vi.mocked(dodoPayments.client.subscriptions.retrieve).mockResolvedValue({ metadata: {} } as never);
    expect((await handleWebhookService('raw', {})).status).toBe(200);
    expect(purchaseRepository.applyEvent).not.toHaveBeenCalled();
  });
});
