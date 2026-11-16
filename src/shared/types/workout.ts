import type { AvailableEquipment } from '@/shared/const/fitness.const';
import type { FocusArea } from '@/shared/const/training.const';

export type WorkoutExerciseDefinition = {
  id: string;
  name: string;
  equipment: AvailableEquipment[];
  targetMuscles: string;
  // Upper-body lifts progress in smaller weight steps than lower-body lifts.
  region: 'upper' | 'lower' | 'core';
  focus: FocusArea[];
  instructions: string[];
  commonMistake: string;
  regression: string;
  safetyCue: string;
};
