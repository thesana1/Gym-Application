import type { FitnessGoal, TrainingExperience } from '@/shared/const/fitness.const';

export const FOCUS_AREAS = [
  { value: 'legs', label: 'Legs' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'arms', label: 'Arms' },
  { value: 'core', label: 'Core' },
] as const;

export type FocusArea = (typeof FOCUS_AREAS)[number]['value'];

export type GoalRule = { repMin: number; repMax: number; restSeconds: number };

// Rep ranges and rest follow the ACSM 2009 progression position stand and Schoenfeld et al. 2021
// ("Loading recommendations for muscle strength, hypertrophy, and local endurance").
export const GOAL_RULES: Record<FitnessGoal, GoalRule> = {
  'muscle-building': { repMin: 8, repMax: 12, restSeconds: 90 },
  strength: { repMin: 4, repMax: 6, restSeconds: 180 },
  'athletic-performance': { repMin: 5, repMax: 8, restSeconds: 120 },
  'general-fitness': { repMin: 8, repMax: 12, restSeconds: 90 },
  'fat-loss': { repMin: 10, repMax: 15, restSeconds: 60 },
  endurance: { repMin: 15, repMax: 20, restSeconds: 45 },
};

// Core moves are counted in reps and kept in a moderate range whatever the goal.
export const CORE_RULE: GoalRule = { repMin: 10, repMax: 15, restSeconds: 45 };

// Novices start with fewer sets; more sets per exercise suit trained lifters (ACSM 2009).
export const SETS_BY_EXPERIENCE: Record<TrainingExperience, number> = {
  beginner: 2,
  intermediate: 3,
  advanced: 4,
};

export const TRAINING_LIMITS = {
  minDays: 1,
  maxDays: 6,
  maxWorkouts: 7,
  minExercises: 1,
  maxExercises: 8,
  minSets: 1,
  maxSets: 6,
  minReps: 1,
  maxReps: 30,
  minRest: 30,
  maxRest: 300,
  maxNameLength: 40,
  exercisesPerWorkout: 5,
} as const;

// Double progression: add weight once every set reaches the top of the range,
// using the smallest common plate jumps for upper and lower body.
export const PROGRESSION = {
  incrementKg: { upper: 2.5, lower: 5, core: 0 },
  // Two short sessions in a row at the same weight means the load is too heavy for now.
  missesBeforeLighter: 2,
  lighterFactor: 0.9,
  plateStepKg: 2.5,
} as const;

// Spread training days through the week so muscles get rest between sessions.
export const DEFAULT_WEEKDAYS: Record<number, number[]> = {
  1: [1], 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 5, 6], 6: [1, 2, 3, 4, 5, 6],
};
