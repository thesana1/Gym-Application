export const MEMBERSHIP_PLANS = [
  { tier: 'vip', name: 'VIP', price: 10 },
  { tier: 'vipplus', name: 'VIP Plus', price: 20 },
  { tier: 'supervip', name: 'Super VIP', price: 40 },
] as const;

export type MembershipTier = (typeof MEMBERSHIP_PLANS)[number]['tier'];
