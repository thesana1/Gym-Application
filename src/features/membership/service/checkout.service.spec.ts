import { beforeEach, describe, expect, it, vi } from 'vitest';

import { userRepository } from '@/features/auth/repository/user.repository';
import { purchaseRepository } from '@/features/membership/repository/purchase.repository';
import { getBillingAccessService } from '@/features/membership/service/access.service';
import { getProductService } from '@/features/membership/service/catalog.service';
import { createCheckoutService, createPortalService } from '@/features/membership/service/checkout.service';
import { dodoPayments } from '@/shared/lib/dodo-payments';

vi.mock('@/features/auth/repository/user.repository', () => ({ userRepository: { findById: vi.fn() } }));
vi.mock('@/features/membership/repository/purchase.repository', () => ({ purchaseRepository: {
  findForUser: vi.fn(), expirePending: vi.fn(), create: vi.fn(), update: vi.fn(),
} }));
vi.mock('@/features/membership/service/access.service', () => ({ getBillingAccessService: vi.fn() }));
vi.mock('@/features/membership/service/catalog.service', () => ({ getProductService: vi.fn() }));
vi.mock('@/shared/lib/dodo-payments', () => ({ dodoPayments: {
  config: { environment: 'test_mode' }, returnUrl: 'http://localhost:3000/dashboard/membership',
  client: { checkoutSessions: { create: vi.fn() }, customers: { customerPortal: { create: vi.fn() } } },
} }));

describe('billing checkout', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(userRepository.findById).mockResolvedValue({ email: 'alice@example.com', name: 'Alice' } as never);
    vi.mocked(getBillingAccessService).mockResolvedValue({ data: { plan: 'free' }, status: 200 } as never);
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([]);
    vi.mocked(getProductService).mockResolvedValue({ data: { productId: 'pdt_server' }, status: 200 });
    vi.mocked(purchaseRepository.create).mockResolvedValue('507f1f77bcf86cd799439011');
    vi.mocked(dodoPayments.client.checkoutSessions.create).mockResolvedValue({ session_id: 'cks_1', checkout_url: 'https://test.checkout.dodopayments.com/session/cks_1' });
  });

  it('uses server-owned product, identity and return URL', async () => {
    const result = await createCheckoutService('user-id', { kind: 'premium' });
    expect(result.status).toBe(200);
    expect(dodoPayments.client.checkoutSessions.create).toHaveBeenCalledWith(expect.objectContaining({
      product_cart: [{ product_id: 'pdt_server', quantity: 1 }],
      customer: { email: 'alice@example.com', name: 'Alice' },
      metadata: { purchase_id: '507f1f77bcf86cd799439011', user_id: 'user-id', kind: 'premium' },
      return_url: 'http://localhost:3000/dashboard/membership?checkout=returned',
    }));
    expect(purchaseRepository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', expect.objectContaining({ checkoutSessionId: 'cks_1' }));
  });

  it('includes coaching for Premium without making a charge', async () => {
    vi.mocked(getBillingAccessService).mockResolvedValue({ data: { plan: 'premium' }, status: 200 } as never);
    expect(await createCheckoutService('user-id', { kind: 'consultation' })).toEqual({ data: { included: true }, status: 200 });
    expect((await createCheckoutService('user-id', { kind: 'premium' })).status).toBe(409);
    expect(dodoPayments.client.checkoutSessions.create).not.toHaveBeenCalled();
  });

  it('reuses a pending session instead of starting a second payment', async () => {
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([{ kind: 'premium', status: 'pending', checkoutUrl: 'https://existing' }] as never);
    expect((await createCheckoutService('user-id', { kind: 'premium' })).data).toEqual({ checkoutUrl: 'https://existing' });
    expect(purchaseRepository.create).not.toHaveBeenCalled();
  });

  it('directs a failed renewal to the portal instead of selling another subscription', async () => {
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([{ kind: 'premium', subscriptionId: 'sub_1', subscriptionStatus: 'on_hold' }] as never);
    expect((await createCheckoutService('user-id', { kind: 'premium' })).data).toEqual({ error: 'MANAGE_EXISTING_SUBSCRIPTION' });
  });

  it('keeps subscriptions from another environment from blocking checkout', async () => {
    vi.mocked(userRepository.findById).mockResolvedValueOnce({
      email: 'alice@example.com', name: 'Alice', membership: { status: 'active', environment: 'live_mode' },
    } as never);
    expect((await createCheckoutService('user-id', { kind: 'premium' })).status).toBe(200);
  });

  it('handles concurrent checkout creation and retains unknown outcomes for reconciliation', async () => {
    vi.mocked(purchaseRepository.create).mockRejectedValueOnce(Object.assign(new Error('duplicate'), { code: 11000 }));
    expect((await createCheckoutService('user-id', { kind: 'premium' })).status).toBe(409);
    vi.mocked(dodoPayments.client.checkoutSessions.create).mockRejectedValueOnce(new Error('timeout'));
    expect((await createCheckoutService('user-id', { kind: 'premium' })).status).toBe(502);
    expect(purchaseRepository.update).not.toHaveBeenCalled();
  });

  it('opens only the authenticated account customer portal', async () => {
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([{ customerId: 'cus_owned' }] as never);
    vi.mocked(dodoPayments.client.customers.customerPortal.create).mockResolvedValue({ link: 'https://portal.example' });
    expect((await createPortalService('user-id')).data).toEqual({ url: 'https://portal.example' });
    expect(dodoPayments.client.customers.customerPortal.create).toHaveBeenCalledWith('cus_owned', expect.objectContaining({ send_email: false }));
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([]);
    expect((await createPortalService('other-user')).status).toBe(404);
  });
});
