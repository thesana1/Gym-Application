import type { AvailableEquipment } from '@/shared/const/fitness.const';

export type WorkoutExerciseDefinition = {
  id: string;
  name: string;
  equipment: AvailableEquipment[];
  targetMuscles: string;
  instructions: string[];
  commonMistake: string;
  regression: string;
  safetyCue: string;
};

export type WorkoutTemplate = {
  id: 'A' | 'B';
  title: string;
  exerciseIds: string[];
};
