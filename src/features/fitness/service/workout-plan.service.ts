import type { FitnessProfile } from '@/features/fitness/service/fitness-profile.service';
import type { FitnessGoal } from '@/shared/const/fitness.const';
import {
  WORKOUT_EXERCISE_LIBRARY,
  WORKOUT_TEMPLATES,
} from '@/shared/const/workout.const';
import type { ServiceResult } from '@/shared/types/common';
import type { WorkoutExerciseDefinition } from '@/shared/types/workout';

export type WorkoutExercise = WorkoutExerciseDefinition & {
  sets: number;
  repetitions: string;
  restSeconds: number;
};

export type WorkoutSession = {
  title: string;
  exercises: WorkoutExercise[];
};

export type WorkoutPlan = {
  sessions: WorkoutSession[];
  weeklySessionLimit: number;
  equipmentPersonalized: boolean;
  goal: FitnessGoal;
};

export type WorkoutPlanOverride = {
  sessionIndex: number;
  exerciseIds: string[];
};

const REPETITIONS_BY_GOAL: Record<FitnessGoal, string> = {
  'muscle-building': '8–12',
  'fat-loss': '8–12',
  'general-fitness': '8–12',
  strength: '6–10',
  endurance: '12–15',
  'athletic-performance': '8–12',
};

export function createWorkoutPlanService(
  profile: FitnessProfile
): ServiceResult<WorkoutPlan> {
  const weeklySessionLimit = Math.min(profile.trainingDaysPerWeek ?? 3, 3);
  const availableEquipment = new Set(profile.availableEquipment);

  const sessions = Array.from({ length: weeklySessionLimit }, (_, index) => {
    const template = WORKOUT_TEMPLATES[index % WORKOUT_TEMPLATES.length];
    const exercises = template.exerciseIds
      .map((exerciseId) =>
        WORKOUT_EXERCISE_LIBRARY.find(({ id }) => id === exerciseId)
      )
      .filter(
        (exercise): exercise is WorkoutExerciseDefinition =>
          exercise !== undefined &&
          (exercise.equipment.includes('bodyweight') ||
            exercise.equipment.some((equipment) => availableEquipment.has(equipment)))
      )
      .slice(0, 5)
      .map((exercise) => ({
        ...exercise,
        sets: profile.experience === 'beginner' ? 2 : 3,
        repetitions: REPETITIONS_BY_GOAL[profile.goal],
        restSeconds: profile.goal === 'strength' ? 120 : 90,
      }));

    return { title: template.title, exercises };
  });

  return {
    data: {
      sessions,
      weeklySessionLimit,
      equipmentPersonalized: profile.availableEquipment.length > 0,
      goal: profile.goal,
    },
    status: 200,
  };
}

export function applyWorkoutPlanOverrides(
  profile: FitnessProfile,
  overrides: WorkoutPlanOverride[]
): ServiceResult<WorkoutPlan> {
  const generated = createWorkoutPlanService(profile);
  if ('error' in generated.data) return generated;

  const availableEquipment = new Set(profile.availableEquipment);
  const sessions = generated.data.sessions.map((session, sessionIndex) => {
    const override = overrides.find(
      (candidate) => candidate.sessionIndex === sessionIndex
    );
    if (!override || override.exerciseIds.length !== session.exercises.length) {
      return session;
    }

    const selectedExercises = override.exerciseIds
      .map((id) =>
        WORKOUT_EXERCISE_LIBRARY.find((exercise) => exercise.id === id)
      )
      .filter(
        (exercise): exercise is WorkoutExerciseDefinition =>
          exercise !== undefined &&
          (exercise.equipment.includes('bodyweight') ||
            exercise.equipment.some((equipment) => availableEquipment.has(equipment)))
      );
    const isValid =
      new Set(override.exerciseIds).size === override.exerciseIds.length &&
      selectedExercises.length === override.exerciseIds.length;
    if (!isValid) return session;

    return {
      ...session,
      exercises: selectedExercises.map((exercise, exerciseIndex) => ({
        ...exercise,
        sets: session.exercises[exerciseIndex].sets,
        repetitions: session.exercises[exerciseIndex].repetitions,
        restSeconds: session.exercises[exerciseIndex].restSeconds,
      })),
    };
  });

  return {
    data: { ...generated.data, sessions },
    status: generated.status,
  };
}

export function getAvailableExercisesForProfile(profile: FitnessProfile) {
  const availableEquipment = new Set(profile.availableEquipment);
  return WORKOUT_EXERCISE_LIBRARY.filter(
    (exercise) =>
      exercise.equipment.includes('bodyweight') ||
      exercise.equipment.some((equipment) => availableEquipment.has(equipment))
  );
}
