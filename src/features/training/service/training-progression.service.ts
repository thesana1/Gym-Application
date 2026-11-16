import type { PlanExerciseType } from '@/features/training/validations/training-plan.validation';
import { PROGRESSION } from '@/shared/const/training.const';
import type { WorkoutExerciseDefinition } from '@/shared/types/workout';

export type SetResult = { repetitions: number; weightKg?: number };
// start: no history yet · up: add weight · same: keep weight, aim for more reps
// down: lighter for now · harder: bodyweight move done at the top of the range
export type ProgressionChange = 'start' | 'up' | 'same' | 'down' | 'harder';

export type ExerciseTarget = {
  exerciseId: string;
  change: ProgressionChange;
  weightKg?: number;
  lastWeightKg?: number;
  lastSets: SetResult[];
};

const roundToPlate = (kg: number) => Math.max(0, Math.round(kg / PROGRESSION.plateStepKg) * PROGRESSION.plateStepKg);
const heaviest = (sets: SetResult[]) => Math.max(0, ...sets.map((set) => set.weightKg ?? 0));

// Double progression (ACSM 2009): once every planned set reaches the top of the rep range, add a small
// amount of weight; after two sessions in a row below the range at the same weight, go about 10% lighter.
export const suggestNextTarget = (
  plan: PlanExerciseType,
  region: WorkoutExerciseDefinition['region'],
  history: SetResult[][]
): ExerciseTarget => {
  const [last] = history;
  if (!last?.length) return { exerciseId: plan.exerciseId, change: 'start', lastSets: [] };

  const weight = heaviest(last);
  const allAtTop = last.length >= plan.sets && last.every((set) => set.repetitions >= plan.repMax);
  const base = { exerciseId: plan.exerciseId, lastSets: last, lastWeightKg: weight || undefined };
  const increment = PROGRESSION.incrementKg[region];

  if (weight === 0 || increment === 0) return { ...base, change: allAtTop ? 'harder' : 'same', weightKg: weight || undefined };
  if (allAtTop) return { ...base, change: 'up', weightKg: weight + increment };

  const recent = history.slice(0, PROGRESSION.missesBeforeLighter);
  const keptMissing = recent.length === PROGRESSION.missesBeforeLighter
    && recent.every((sets) => heaviest(sets) === weight && sets.some((set) => set.repetitions < plan.repMin));
  if (keptMissing) {
    return { ...base, change: 'down', weightKg: roundToPlate(weight * PROGRESSION.lighterFactor) };
  }
  return { ...base, change: 'same', weightKg: weight };
};
