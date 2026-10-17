export const PERSONAL_WORKOUT_CHALLENGES = [
  {
    id: 'start-a-routine',
    title: 'Start a routine',
    description: 'Log two workouts during your first 7 days.',
    durationDays: 7,
    targetWorkouts: 2,
  },
  {
    id: 'build-consistency',
    title: 'Build consistency',
    description: 'Log four workouts over 14 days, at a pace that works for you.',
    durationDays: 14,
    targetWorkouts: 4,
  },
  {
    id: 'keep-showing-up',
    title: 'Keep showing up',
    description: 'Log eight workouts over 30 days. Rest days are part of training.',
    durationDays: 30,
    targetWorkouts: 8,
  },
] as const;

export type PersonalWorkoutChallenge =
  (typeof PERSONAL_WORKOUT_CHALLENGES)[number];
