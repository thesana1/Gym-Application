import { BODYWEIGHT_EXERCISES } from '@/shared/const/workout-bodyweight.const';
import { EQUIPPED_EXERCISES } from '@/shared/const/workout-equipped.const';
import { GYM_EXERCISES } from '@/shared/const/workout-gym.const';
import { HOME_EXERCISES } from '@/shared/const/workout-home.const';

export const WORKOUT_EXERCISE_LIBRARY = [
  ...BODYWEIGHT_EXERCISES,
  ...EQUIPPED_EXERCISES,
  ...GYM_EXERCISES,
  ...HOME_EXERCISES,
];
