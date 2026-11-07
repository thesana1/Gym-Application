export const BILLING_PRODUCTS = {
  premium: {
    name: 'Fitness Premium',
    description: 'Unlimited photo uploads, body measurements, meals, workouts, tracking, and coach consultations.',
    price: 2000,
    currency: 'USD',
  },
  consultation: {
    name: 'Coach consultation',
    description: 'One individual coach consultation. Included with Premium.',
    price: 2000,
    currency: 'USD',
  },
} as const;

export const PREMIUM_BENEFITS = [
  'Unlimited photo uploads and body measurements',
  'Unlimited meal ideas and nutrition tracking',
  'Complete workout plans and equipment guides',
  'Unlimited progress tracking and analytics',
  'Coach consultations included',
  'Unlimited access to every feature',
];

export const CHECKOUT_LIFETIME_MS = 24 * 60 * 60 * 1000;
export const CATALOG_LEASE_MS = 5 * 60 * 1000;

export const BILLING_ERRORS: Record<string, string> = {
  ALREADY_PREMIUM: 'Premium is already active on your account.',
  MANAGE_EXISTING_SUBSCRIPTION: 'Use Manage billing to update or reactivate your existing subscription.',
  CHECKOUT_IN_PROGRESS: 'A checkout is being prepared. Please try again shortly.',
  PRODUCT_SETUP_IN_PROGRESS: 'Your payment option is being prepared. Please try again shortly.',
  PAYMENT_PROVIDER_UNAVAILABLE: 'Payments are temporarily unavailable. Please try again later.',
  UNAUTHORIZED: 'Please sign in again to manage your billing.',
};
