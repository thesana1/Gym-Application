import type { Membership } from '@/features/membership/types/membership.types';

type MembershipAccessInput = Pick<Membership, 'status'> & {
  environment?: string | null;
  nextBillingDate?: Date | null;
  refundedPeriodEnd?: Date | null;
};

// Billing records store the Dodo environment as test_mode or live_mode.
export const billingEnvironment = (environment = process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'test_mode') =>
  environment === 'live' || environment === 'live_mode' ? 'live_mode' : 'test_mode';

export function isMembershipEntitled(
  membership?: MembershipAccessInput | null,
  environment = process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'test_mode'
): boolean {
  if (!membership || !['active', 'cancelled'].includes(membership.status) || !membership.nextBillingDate) return false;
  const currentEnvironment = billingEnvironment(environment);
  if (membership.environment && membership.environment !== currentEnvironment) return false;
  if (membership.nextBillingDate.getTime() <= Date.now()) return false;
  return !membership.refundedPeriodEnd || membership.nextBillingDate > membership.refundedPeriodEnd;
}
