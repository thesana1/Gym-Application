import type { PlanExerciseType, PlanPrioritiesType, TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import type { AvailableEquipment, FitnessGoal, TrainingExperience } from '@/shared/const/fitness.const';
import { CORE_RULE, GOAL_RULES, SETS_BY_EXPERIENCE, TRAINING_LIMITS, type FocusArea } from '@/shared/const/training.const';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';
import type { WorkoutExerciseDefinition } from '@/shared/types/workout';

type WorkoutKind = 'full' | 'upper' | 'lower';

export type PlanContext = { experience: TrainingExperience; equipment: AvailableEquipment[] };

// Each slot names the muscles one exercise should cover, so every workout stays balanced.
const SLOTS: Record<WorkoutKind, FocusArea[][]> = {
  full: [['legs'], ['chest', 'shoulders'], ['back'], ['glutes'], ['core']],
  upper: [['chest'], ['back'], ['shoulders'], ['back', 'chest'], ['arms']],
  lower: [['legs'], ['glutes'], ['legs'], ['glutes'], ['core']],
};

const SPLITS: Record<number, WorkoutKind[]> = {
  1: ['full'], 2: ['full', 'full'], 3: ['full', 'full', 'full'], 4: ['upper', 'lower', 'upper', 'lower'],
  5: ['upper', 'lower', 'full', 'upper', 'lower'], 6: ['upper', 'lower', 'upper', 'lower', 'upper', 'lower'],
};

const KIND_NAMES: Record<WorkoutKind, string> = { full: 'Full body', upper: 'Upper body', lower: 'Lower body' };
const LETTERS = ['A', 'B', 'C'];

export const availableExercises = (equipment: AvailableEquipment[]) =>
  WORKOUT_EXERCISE_LIBRARY.filter((exercise) => exercise.equipment.some((item) => item === 'bodyweight' || equipment.includes(item)));

// Research-based starting numbers for an exercise: rep range and rest by goal, sets by experience.
export const planExerciseDefaults = (exercise: WorkoutExerciseDefinition, goal: FitnessGoal, experience: TrainingExperience): PlanExerciseType => {
  const rule = exercise.region === 'core' ? CORE_RULE : GOAL_RULES[goal];
  return { exerciseId: exercise.id, sets: SETS_BY_EXPERIENCE[experience], repMin: rule.repMin, repMax: rule.repMax, restSeconds: rule.restSeconds };
};

const pickExercises = (kind: WorkoutKind, rotation: number, options: WorkoutExerciseDefinition[], focus: FocusArea[]) => {
  const score = (exercise: WorkoutExerciseDefinition) =>
    (exercise.focus.some((area) => focus.includes(area)) ? 2 : 0) + (exercise.equipment.includes('bodyweight') ? 0 : 1);
  const chosen: WorkoutExerciseDefinition[] = [];
  const slots = [...SLOTS[kind], ...focus.map((area) => [area])];
  for (const slot of slots) {
    if (chosen.length >= TRAINING_LIMITS.exercisesPerWorkout + (focus.length ? 1 : 0)) break;
    const matches = options
      .filter((exercise) => !chosen.includes(exercise) && exercise.focus.some((area) => slot.includes(area)))
      .sort((a, b) => score(b) - score(a));
    if (matches.length) chosen.push(matches[rotation % Math.min(matches.length, 2)]);
  }
  return chosen;
};

// A balanced plan built from the exercise list without AI, used when AI is off or busy.
export const buildLibraryPlan = (priorities: PlanPrioritiesType, context: PlanContext): TrainingPlanType => {
  const weekdays = [...priorities.weekdays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  const kinds = SPLITS[weekdays.length] ?? SPLITS[3];
  const options = availableExercises(context.equipment);
  const seen: Record<WorkoutKind, number> = { full: 0, upper: 0, lower: 0 };
  const sameKind = (kind: WorkoutKind) => kinds.filter((item) => item === kind).length;
  return {
    goal: priorities.goal,
    focusAreas: priorities.focusAreas,
    source: 'library',
    workouts: kinds.map((kind, index) => {
      const rotation = seen[kind]++;
      return {
        id: `w${index + 1}`,
        name: sameKind(kind) > 1 ? `${KIND_NAMES[kind]} ${LETTERS[rotation] ?? rotation + 1}` : KIND_NAMES[kind],
        weekday: weekdays[index] ?? null,
        exercises: pickExercises(kind, rotation, options, priorities.focusAreas)
          .map((exercise) => planExerciseDefaults(exercise, priorities.goal, context.experience)),
      };
    }),
  };
};
