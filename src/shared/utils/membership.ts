import type { Membership } from '@/features/membership/types/membership.types';

type MembershipAccessInput = Pick<Membership, 'status'> & {
  environment?: string | null;
  nextBillingDate?: Date | null;
  refundedPeriodEnd?: Date | null;
};

export function isMembershipEntitled(
  membership?: MembershipAccessInput | null,
  environment = process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'test_mode'
): boolean {
  if (!membership || !['active', 'cancelled'].includes(membership.status) || !membership.nextBillingDate) return false;
  const currentEnvironment = environment === 'live' || environment === 'live_mode' ? 'live_mode' : 'test_mode';
  if (membership.environment && membership.environment !== currentEnvironment) return false;
  if (membership.nextBillingDate.getTime() <= Date.now()) return false;
  return !membership.refundedPeriodEnd || membership.nextBillingDate > membership.refundedPeriodEnd;
}
