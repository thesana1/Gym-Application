import { describe, expect, it } from 'vitest';

import { availableExercises, buildLibraryPlan } from '@/features/training/service/training-library.service';
import { TrainingPlanSchema } from '@/features/training/validations/training-plan.validation';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';

const find = (id: string) => WORKOUT_EXERCISE_LIBRARY.find((exercise) => exercise.id === id);

describe('buildLibraryPlan', () => {
  it('makes one valid workout per chosen day with research-based numbers', () => {
    const plan = buildLibraryPlan({ goal: 'muscle-building', focusAreas: [], weekdays: [5, 1, 3] }, { experience: 'beginner', equipment: ['dumbbells'] });
    expect(TrainingPlanSchema.safeParse(plan).success).toBe(true);
    expect(plan.workouts.map(({ weekday }) => weekday)).toEqual([1, 3, 5]);
    const weighted = plan.workouts[0].exercises.find(({ exerciseId }) => find(exerciseId)?.region !== 'core');
    expect(weighted).toMatchObject({ sets: 2, repMin: 8, repMax: 12, restSeconds: 90 });
  });

  it('only uses equipment the person has', () => {
    const plan = buildLibraryPlan({ goal: 'strength', focusAreas: ['arms'], weekdays: [1, 2, 4, 5] }, { experience: 'advanced', equipment: [] });
    const ids = plan.workouts.flatMap(({ exercises }) => exercises.map(({ exerciseId }) => exerciseId));
    expect(ids.every((id) => find(id)?.equipment.includes('bodyweight'))).toBe(true);
    expect(plan.workouts.map(({ name }) => name)).toEqual(['Upper body A', 'Lower body A', 'Upper body B', 'Lower body B']);
  });

  it('uses heavier strength ranges and more sets for advanced lifters', () => {
    const plan = buildLibraryPlan({ goal: 'strength', focusAreas: [], weekdays: [1] }, { experience: 'advanced', equipment: ['barbell'] });
    const lift = plan.workouts[0].exercises.find(({ exerciseId }) => find(exerciseId)?.region === 'lower');
    expect(lift).toMatchObject({ sets: 4, repMin: 4, repMax: 6, restSeconds: 180 });
  });

  it('lists bodyweight moves for everyone', () => {
    expect(availableExercises([]).every(({ equipment }) => equipment.includes('bodyweight'))).toBe(true);
  });
});
