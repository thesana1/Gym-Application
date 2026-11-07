import type { BILLING_PRODUCTS } from '@/shared/const/membership-payments.const';

export type PurchaseKind = keyof typeof BILLING_PRODUCTS;
export type BillingEnvironment = 'test_mode' | 'live_mode';
export type BillingAccess = {
  plan: 'free' | 'premium';
  unlimitedPhotoUploads: boolean;
  unlimitedFeatures: boolean;
  coachConsultationsIncluded: boolean;
  consultationCredits: number;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canManageBilling: boolean;
};

export type CheckoutResponse = { checkoutUrl: string } | { included: true };
