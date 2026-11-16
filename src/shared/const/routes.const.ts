export const AUTH_ROUTES = ['/sign-in', '/sign-up'];

export const PROTECTED_ROUTES = ['/dashboard'];

// New members answer the profile questions first, then see the Premium offer page.
export const ONBOARDING_ROUTES = { profile: '/dashboard/profile', welcome: '/dashboard/welcome' } as const;
