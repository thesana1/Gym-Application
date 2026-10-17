export const COACH_SPECIALIZATIONS = [
  'general-fitness',
  'strength-training',
  'muscle-building',
  'endurance',
  'mobility',
  'weight-management',
] as const;

export type CoachSpecialization = (typeof COACH_SPECIALIZATIONS)[number];
