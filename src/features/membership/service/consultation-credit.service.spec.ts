import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { coachRepository } from '@/features/coaches/repository/coach.repository';
import { purchaseRepository } from '@/features/membership/repository/purchase.repository';
import { getConsultationCreditsService } from '@/features/membership/service/consultation-credit.service';

vi.mock('@/features/coaches/repository/coach.repository', () => ({ coachRepository: { findMemberRequests: vi.fn() } }));
vi.mock('@/features/membership/repository/purchase.repository', () => ({ purchaseRepository: { findForUser: vi.fn() } }));
vi.mock('@/shared/lib/dodo-payments', () => ({ dodoPayments: { config: { environment: 'test_mode' } } }));

const purchaseId = '507f1f77bcf86cd799439011';
describe('getConsultationCreditsService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([{
      _id: new Types.ObjectId(purchaseId), status: 'paid', kind: 'consultation',
    }] as never);
    vi.mocked(coachRepository.findMemberRequests).mockResolvedValue([]);
  });

  it('returns a verified paid credit scoped to the user and current environment', async () => {
    expect((await getConsultationCreditsService('owner')).data).toEqual({ purchaseIds: [purchaseId] });
    expect(purchaseRepository.findForUser).toHaveBeenCalledWith('owner', 'test_mode');
    expect(coachRepository.findMemberRequests).toHaveBeenCalledWith('owner');
  });

  it.each(['pending', 'accepted'])('reserves the credit for a %s consultation request', async (status) => {
    vi.mocked(coachRepository.findMemberRequests).mockResolvedValue([{ status, paymentPurchaseId: purchaseId }] as never);
    expect((await getConsultationCreditsService('owner')).data).toEqual({ purchaseIds: [] });
  });

  it.each(['declined', 'cancelled'])('restores the credit after a request is %s', async (status) => {
    vi.mocked(coachRepository.findMemberRequests).mockResolvedValue([{ status, paymentPurchaseId: purchaseId }] as never);
    expect((await getConsultationCreditsService('owner')).data).toEqual({ purchaseIds: [purchaseId] });
  });

  it.each(['pending', 'failed', 'refunded', 'expired'])('does not spend a %s purchase', async (status) => {
    vi.mocked(purchaseRepository.findForUser).mockResolvedValue([{ _id: new Types.ObjectId(purchaseId), kind: 'consultation', status }] as never);
    expect((await getConsultationCreditsService('owner')).data).toEqual({ purchaseIds: [] });
  });
});
