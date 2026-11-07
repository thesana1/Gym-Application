import { userRepository } from '@/features/auth/repository/user.repository';
import type {
  Membership,
  MembershipSummary,
} from '@/features/membership/types/membership.types';
import { dodoPayments } from '@/shared/lib/dodo-payments';
import type { ServiceResult } from '@/shared/types/common';
import { isMembershipEntitled } from '@/shared/utils/membership';

const hasOngoingSubscription = (status: Membership['status']) =>
  !['cancelled', 'failed', 'expired'].includes(status);

export async function getMembershipService(
  userId: string
): Promise<ServiceResult<MembershipSummary | null>> {
  const user = await userRepository.findById(userId);
  if (!user) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (!user.membership) return { data: null, status: 200 };

  const membership: MembershipSummary = {
    tier: user.membership.tier,
    entitled: isMembershipEntitled(user.membership),
    status: user.membership.status,
    subscriptionId: user.membership.subscriptionId,
    nextBillingDate: user.membership.nextBillingDate?.toISOString(),
    cancelAtPeriodEnd: user.membership.cancelAtPeriodEnd,
    ...(user.membership.refundedPeriodEnd ? { refundedPeriodEnd: user.membership.refundedPeriodEnd.toISOString() } : {}),
  };

  return { data: membership, status: 200 };
}

export async function cancelMembershipService(
  userId: string
): Promise<ServiceResult<{ message: string }>> {
  const user = await userRepository.findById(userId);
  if (!user) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (!user.membership || !hasOngoingSubscription(user.membership.status)) {
    return { data: { error: 'ACTIVE_MEMBERSHIP_NOT_FOUND' }, status: 404 };
  }
  if (user.membership.cancelAtPeriodEnd) {
    return { data: { message: 'Cancellation is already scheduled' }, status: 200 };
  }
  if (!process.env.DODO_PAYMENTS_API_KEY) {
    return { data: { error: 'PAYMENTS_NOT_CONFIGURED' }, status: 503 };
  }

  await dodoPayments.cancelAtBillingDate(user.membership.subscriptionId);
  const updated = await userRepository.markMembershipCancellationById(userId);
  if (!updated) {
    throw new Error('Membership could not be updated after cancellation was confirmed');
  }

  return {
    data: { message: 'Membership will remain active until the end of the billing period' },
    status: 200,
  };
}

export async function syncMembershipFromWebhook(
  membership: Membership,
  userId: string | undefined,
  customerEmail: string
): Promise<boolean> {
  const user = userId
    ? null
    : await userRepository.findByEmail(customerEmail);
  const resolvedUserId = userId ?? user?._id.toString();
  if (!resolvedUserId) return false;
  return userRepository.updateMembershipById(resolvedUserId, membership);
}
