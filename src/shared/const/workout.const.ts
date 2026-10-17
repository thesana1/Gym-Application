import { BODYWEIGHT_EXERCISES } from '@/shared/const/workout-bodyweight.const';
import { EQUIPPED_EXERCISES } from '@/shared/const/workout-equipped.const';
import type { WorkoutTemplate } from '@/shared/types/workout';

export const WORKOUT_EXERCISE_LIBRARY = [
  ...BODYWEIGHT_EXERCISES,
  ...EQUIPPED_EXERCISES,
];

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'A',
    title: 'Full body A',
    exerciseIds: [
      'bodyweight-squat',
      'incline-push-up',
      'glute-bridge',
      'bird-dog',
      'dumbbell-row',
      'band-row',
      'machine-row',
      'barbell-hip-hinge',
    ],
  },
  {
    id: 'B',
    title: 'Full body B',
    exerciseIds: [
      'reverse-lunge',
      'hip-hinge',
      'incline-push-up',
      'dead-bug',
      'dumbbell-press',
      'band-pull-apart',
      'machine-chest-press',
      'barbell-floor-press',
    ],
  },
];
