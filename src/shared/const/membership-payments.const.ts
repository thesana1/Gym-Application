export const BILLING_PRODUCTS = {
  premium: {
    name: 'Fitness Premium',
    description: 'Unlimited photo uploads, body measurements, meals, workouts, and tracking.',
    price: 2000,
    currency: 'USD',
  },
} as const;

export const PREMIUM_BENEFITS = [
  'Upload progress photos',
  '50 AI questions a day instead of 5',
  'Everything else in the app, with no limits',
];

export const CHECKOUT_LIFETIME_MS = 24 * 60 * 60 * 1000;
export const CATALOG_LEASE_MS = 5 * 60 * 1000;

export const BILLING_ERRORS: Record<string, string> = {
  PRODUCT_CATEGORY_NOT_ENABLED: 'This payment option is not ready yet. Please try later.',
  INVALID_ORIGIN: 'Payments are not set up correctly yet. Please try later.',
  ALREADY_PREMIUM: 'You already have Premium.',
  MANAGE_EXISTING_SUBSCRIPTION: 'Tap Manage payments to change or restart your plan.',
  CHECKOUT_IN_PROGRESS: 'Your payment page is getting ready. Please try again in a moment.',
  PRODUCT_SETUP_IN_PROGRESS: 'Your payment page is getting ready. Please try again in a moment.',
  PAYMENT_PROVIDER_UNAVAILABLE: 'Payments are not working right now. Please try later.',
  UNAUTHORIZED: 'Please sign in again.',
};
