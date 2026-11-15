export const PERSONAL_WORKOUT_CHALLENGES = [
  {
    id: 'start-a-routine',
    title: 'Get started',
    description: 'Save 2 workouts in 7 days.',
    durationDays: 7,
    targetWorkouts: 2,
  },
  {
    id: 'build-consistency',
    title: 'Keep it going',
    description: 'Save 4 workouts in 14 days.',
    durationDays: 14,
    targetWorkouts: 4,
  },
  {
    id: 'keep-showing-up',
    title: 'Make it a habit',
    description: 'Save 8 workouts in 30 days.',
    durationDays: 30,
    targetWorkouts: 8,
  },
] as const;

export type PersonalWorkoutChallenge =
  (typeof PERSONAL_WORKOUT_CHALLENGES)[number];
