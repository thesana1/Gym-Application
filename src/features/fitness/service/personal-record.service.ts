import { workoutLogRepository } from '@/features/fitness/repository/workout-log.repository';
import type { WorkoutLogDocument } from '@/features/fitness/schema/workout-log.schema';
import type { ServiceResult } from '@/shared/types/common';

export type PersonalExerciseRecord = {
  exerciseId: string;
  exerciseName: string;
  heaviestSet?: {
    weightKg: number;
    repetitions: number;
    completedAt: string;
  };
  highestRepSet: {
    repetitions: number;
    weightKg?: number;
    completedAt: string;
  };
  workoutCount: number;
};

const updateRecordForSet = (
  record: PersonalExerciseRecord,
  set: WorkoutLogDocument['exercises'][number]['sets'][number],
  completedAt: Date
) => {
  if (
    set.weightKg != null &&
    (!record.heaviestSet ||
      set.weightKg > record.heaviestSet.weightKg ||
      (set.weightKg === record.heaviestSet.weightKg &&
        completedAt.getTime() >
          new Date(record.heaviestSet.completedAt).getTime()))
  ) {
    record.heaviestSet = {
      weightKg: set.weightKg,
      repetitions: set.repetitions,
      completedAt: completedAt.toISOString(),
    };
  }

  const currentRepRecord = record.highestRepSet;
  const hasMoreReps = set.repetitions > currentRepRecord.repetitions;
  const tieHasMoreWeight =
    set.repetitions === currentRepRecord.repetitions &&
    (set.weightKg ?? 0) > (currentRepRecord.weightKg ?? 0);
  if (hasMoreReps || tieHasMoreWeight) {
    record.highestRepSet = {
      repetitions: set.repetitions,
      ...(set.weightKg == null ? {} : { weightKg: set.weightKg }),
      completedAt: completedAt.toISOString(),
    };
  }
};

const countWorkoutIfNew = (
  workoutIdsByExercise: Map<string, Set<string>>,
  record: PersonalExerciseRecord,
  workoutId: string
) => {
  const workoutIds = workoutIdsByExercise.get(record.exerciseId);
  if (!workoutIds || workoutIds.has(workoutId)) return;
  workoutIds.add(workoutId);
  record.workoutCount += 1;
};

const toPersonalRecords = (
  workouts: WorkoutLogDocument[]
): PersonalExerciseRecord[] => {
  const records = new Map<string, PersonalExerciseRecord>();
  const workoutIdsByExercise = new Map<string, Set<string>>();

  for (const workout of workouts) {
    const workoutId = workout._id.toString();
    for (const exercise of workout.exercises) {
      let record = records.get(exercise.exerciseId);
      if (!record) {
        record = {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          highestRepSet: {
            repetitions: 0,
            completedAt: workout.completedAt.toISOString(),
          },
          workoutCount: 0,
        };
        records.set(exercise.exerciseId, record);
        workoutIdsByExercise.set(exercise.exerciseId, new Set());
      }

      const workoutIds = workoutIdsByExercise.get(exercise.exerciseId);
      if (!workoutIds) workoutIdsByExercise.set(exercise.exerciseId, new Set());
      countWorkoutIfNew(workoutIdsByExercise, record, workoutId);
      for (const set of exercise.sets) {
        updateRecordForSet(record, set, workout.completedAt);
      }
    }
  }

  return [...records.values()].sort((first, second) =>
    first.exerciseName.localeCompare(second.exerciseName)
  );
};

export async function listPersonalRecordsService(
  userId: string
): Promise<ServiceResult<PersonalExerciseRecord[]>> {
  const workouts = await workoutLogRepository.findByUserId(userId, {});
  return { data: toPersonalRecords(workouts), status: 200 };
}
