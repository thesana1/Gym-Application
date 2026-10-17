import { describe, expect, it } from 'vitest';

import type { FitnessProfile } from '@/features/fitness/service/fitness-profile.service';
import {
  createWorkoutPlanService,
  type WorkoutPlan,
} from '@/features/fitness/service/workout-plan.service';
import type { ServiceResult } from '@/shared/types/common';

const makeProfile = (
  overrides: Partial<FitnessProfile> = {}
): FitnessProfile => ({
  goal: 'general-fitness',
  experience: 'beginner',
  age: undefined,
  heightCm: undefined,
  weightKg: undefined,
  trainingDaysPerWeek: 3,
  availableEquipment: [],
  ...overrides,
});

const getPlan = (result: ServiceResult<WorkoutPlan>): WorkoutPlan => {
  if ('error' in result.data) {
    throw new Error('Expected a workout plan');
  }
  return result.data;
};

describe('createWorkoutPlanService', () => {
  it('uses the profile goal, experience, and available training days', () => {
    const result = createWorkoutPlanService(
      makeProfile({
        goal: 'strength',
        experience: 'intermediate',
        trainingDaysPerWeek: 2,
      })
    );

    expect(result.status).toBe(200);
    const plan = getPlan(result);
    expect(plan).toMatchObject({
      goal: 'strength',
      weeklySessionLimit: 2,
      sessions: [
        { title: 'Full body A' },
        { title: 'Full body B' },
      ],
    });
    expect(plan.sessions[0]?.exercises[0]).toMatchObject({
      sets: 3,
      repetitions: '6–10',
      restSeconds: 120,
    });
  });

  it('limits the starting plan to three weekly sessions for recovery', () => {
    const plan = getPlan(createWorkoutPlanService(
      makeProfile({ trainingDaysPerWeek: 7 })
    ));

    expect(plan.weeklySessionLimit).toBe(3);
    expect(plan.sessions).toHaveLength(3);
  });

  it('uses bodyweight exercises if no equipment preference is saved', () => {
    const plan = getPlan(createWorkoutPlanService(makeProfile()));

    expect(plan.equipmentPersonalized).toBe(false);
    expect(
      plan.sessions.flatMap(({ exercises }) =>
        exercises.flatMap(({ equipment }) => equipment)
      )
    ).toContain('bodyweight');
    expect(
      plan.sessions
        .flatMap(({ exercises }) => exercises)
        .some(({ id }) => id === 'dumbbell-row')
    ).toBe(false);
  });

  it('adds movements that match the selected equipment', () => {
    const plan = getPlan(createWorkoutPlanService(
      makeProfile({ availableEquipment: ['dumbbells'] })
    ));

    expect(plan.equipmentPersonalized).toBe(true);
    expect(
      plan.sessions[0]?.exercises.some(({ id }) => id === 'dumbbell-row')
    ).toBe(true);
  });
});
