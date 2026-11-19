export const LEADERBOARD_LIMITS = {
  // Members shown on each board; everyone still sees their own place below it.
  topSize: 100,
  // The progress board compares the best lifts of the last 30 days with everything before.
  progressDays: 30,
} as const;

// Only the regular barbell deadlift counts for now.
export const DEADLIFT_EXERCISE_IDS = ['barbell-deadlift'];

export type LeaderboardKind = 'progress' | 'deadlift';

// Where the "no place yet" button sends each member.
export const LEADERBOARD_EMPTY_LINKS: Record<LeaderboardKind, string> = {
  progress: '/dashboard/workouts',
  deadlift: '/dashboard/workouts?tab=plan',
};
