import { coachRepository } from '@/features/coaches/repository/coach.repository';
import { purchaseRepository } from '@/features/membership/repository/purchase.repository';
import { dodoPayments } from '@/shared/lib/dodo-payments';
import type { ServiceResult } from '@/shared/types/common';

export async function getConsultationCreditsService(userId: string): Promise<ServiceResult<{ purchaseIds: string[] }>> {
  const [purchases, requests] = await Promise.all([
    purchaseRepository.findForUser(userId, dodoPayments.config.environment),
    coachRepository.findMemberRequests(userId),
  ]);
  const usedIds = new Set(requests.filter((request) => request.status === 'pending' || request.status === 'accepted')
    .map((request) => request.paymentPurchaseId));
  const available = purchases.filter((purchase) => purchase.kind === 'consultation' && purchase.status === 'paid'
    && !usedIds.has(purchase._id.toString()));
  return { data: { purchaseIds: available.map((purchase) => purchase._id.toString()) }, status: 200 };
}
