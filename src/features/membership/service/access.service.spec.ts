import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { purchaseRepository } from '@/features/membership/repository/purchase.repository';
import type { PurchaseDocument } from '@/features/membership/schema/purchase.schema';
import { getBillingAccessService } from '@/features/membership/service/access.service';

vi.mock('@/features/membership/repository/purchase.repository', () => ({ purchaseRepository: { findForUser: vi.fn() } }));
vi.mock('@/features/coaches/repository/coach.repository', () => ({ coachRepository: { findMemberRequests: vi.fn().mockResolvedValue([]) } }));
vi.mock('@/shared/lib/dodo-payments', () => ({ dodoPayments: { config: { environment: 'test_mode' } } }));

const purchase = (changes: Partial<PurchaseDocument> = {}): PurchaseDocument => ({
  _id: new Types.ObjectId(), userId: '507f1f77bcf86cd799439011', environment: 'test_mode', kind: 'premium',
  productId: 'pdt_premium', status: 'paid', expiresAt: new Date(), cancelAtPeriodEnd: false, latestEventAt: new Date(),
  createdAt: new Date(), updatedAt: new Date(), subscriptionId: 'sub_1', subscriptionStatus: 'active',
  currentPeriodEnd: new Date(Date.now() + 86400000), ...changes,
});

describe('getBillingAccessService', () => {
  beforeEach(() => vi.clearAllMocks());
  it('defaults to free without purchases', async () => {
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([]);
    expect((await getBillingAccessService('user')).data).toMatchObject({
      plan: 'free', unlimitedPhotoUploads: false, unlimitedFeatures: false, coachConsultationsIncluded: false,
    });
  });
  it('grants unlimited access and included coaching for a verified active subscription', async () => {
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([purchase()]);
    expect((await getBillingAccessService('user')).data).toMatchObject({
      plan: 'premium', unlimitedPhotoUploads: true, unlimitedFeatures: true, coachConsultationsIncluded: true,
    });
    expect(purchaseRepository.findForUser).toHaveBeenCalledWith('user', 'test_mode');
  });
  it.each(['pending', 'on_hold', 'failed', 'expired', 'paused', 'past_due'])('denies access for %s subscriptions', async (status) => {
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([purchase({ subscriptionStatus: status })]);
    expect((await getBillingAccessService('user')).data).toMatchObject({ plan: 'free' });
  });
  it('preserves a cancelled subscription through the paid period, then expires it', async () => {
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([purchase({ subscriptionStatus: 'cancelled', cancelAtPeriodEnd: true })]);
    expect((await getBillingAccessService('user')).data).toMatchObject({ plan: 'premium', cancelAtPeriodEnd: true });
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([purchase({ currentPeriodEnd: new Date(0) })]);
    expect((await getBillingAccessService('user')).data).toMatchObject({ plan: 'free' });
  });
  it('revokes a refunded period while allowing a subsequent paid renewal', async () => {
    const end = new Date(Date.now() + 86400000);
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([purchase({ currentPeriodEnd: end, refundedPeriodEnd: end })]);
    expect((await getBillingAccessService('user')).data).toMatchObject({ plan: 'free' });
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([purchase({ refundedPeriodEnd: new Date(0) })]);
    expect((await getBillingAccessService('user')).data).toMatchObject({ plan: 'premium' });
  });
  it('counts paid consultation purchases once and excludes refunds and pending checkouts', async () => {
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([
      purchase({ kind: 'consultation' }), purchase({ kind: 'consultation', status: 'pending' }),
      purchase({ kind: 'consultation', status: 'refunded' }),
    ]);
    expect((await getBillingAccessService('user')).data).toMatchObject({ plan: 'free', consultationCredits: 1 });
  });
});
