import { purchaseRepository } from '@/features/membership/repository/purchase.repository';
import { getConsultationCreditsService } from '@/features/membership/service/consultation-credit.service';
import type { BillingAccess } from '@/features/membership/types/payment.types';
import { dodoPayments } from '@/shared/lib/dodo-payments';
import type { ServiceResult } from '@/shared/types/common';

export async function getBillingAccessService(userId: string): Promise<ServiceResult<BillingAccess>> {
  const purchases = await purchaseRepository.findForUser(userId, dodoPayments.config.environment);
  const credits = await getConsultationCreditsService(userId);
  if ('error' in credits.data) return { data: credits.data, status: credits.status };
  const subscription = purchases.find((purchase) => purchase.kind === 'premium' && purchase.subscriptionId);
  const premium = purchases.some((purchase) => purchase.kind === 'premium'
    && purchase.status === 'paid'
    && (purchase.subscriptionStatus === 'active' || purchase.subscriptionStatus === 'cancelled')
    && !!purchase.currentPeriodEnd && purchase.currentPeriodEnd.getTime() > Date.now()
    && (!purchase.refundedPeriodEnd || purchase.currentPeriodEnd > purchase.refundedPeriodEnd));
  return {
    data: {
      plan: premium ? 'premium' : 'free',
      unlimitedPhotoUploads: premium,
      unlimitedFeatures: premium,
      coachConsultationsIncluded: premium,
      consultationCredits: credits.data.purchaseIds.length,
      subscriptionStatus: subscription?.subscriptionStatus ?? null,
      currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
      canManageBilling: purchases.some((purchase) => !!purchase.customerId),
    },
    status: 200,
  };
}
