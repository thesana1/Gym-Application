export const COACH_SPECIALIZATIONS = [
  'general-fitness',
  'strength-training',
  'muscle-building',
  'endurance',
  'mobility',
  'weight-management',
] as const;

export type CoachSpecialization = (typeof COACH_SPECIALIZATIONS)[number];

export const COACH_ERRORS: Record<string, string> = {
  CONSULTATION_PAYMENT_REQUIRED: 'Join Premium or buy a consultation credit from Membership before sending a request.',
  CONSULTATION_CREDIT_IN_USE: 'That credit was used by another request. Refresh and try again.',
  COACH_NOT_AVAILABLE: 'This coach is no longer available in the directory.',
  CANNOT_REQUEST_SELF: 'You cannot request a consultation with your own profile.',
  FORBIDDEN: 'You do not have permission to review coach applications.',
  NOT_FOUND: 'This profile or request is no longer available.',
  UNAUTHORIZED: 'Sign in to use the coach directory.',
  VALIDATION_ERROR: 'Please review the submitted details and try again.',
};
