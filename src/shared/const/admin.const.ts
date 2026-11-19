export const ADMIN_LIMITS = { chartDays: 14, listUsers: 50 } as const;

// Tailwind height steps for the sign-up bars; index 0 is a day with no sign-ups.
export const ADMIN_BAR_HEIGHTS = ['h-1', 'h-3', 'h-5', 'h-7', 'h-9', 'h-11', 'h-14', 'h-16', 'h-20', 'h-24', 'h-28', 'h-32'] as const;

// How long an admin can give Premium for, in months.
export const ADMIN_GIFT_MONTHS = [1, 3, 12] as const;

// Marks Premium given by an admin, so it never mixes with real Dodo subscriptions.
export const ADMIN_GIFT_ID = 'admin-gift';
