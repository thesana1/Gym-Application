import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/http', () => ({
  http: { get: vi.fn(), put: vi.fn() },
}));
vi.mock('@/features/fitness/components/workout-plan-view', () => ({
  WorkoutPlanView: () => <div>Workout plan preview</div>,
}));
vi.mock('@/features/fitness/components/weekly-workout-schedule', () => ({
  WeeklyWorkoutSchedule: () => <div>Weekly schedule</div>,
}));
vi.mock('@/features/fitness/components/workout-log-manager', () => ({
  WorkoutLogManager: () => <div>Workout logs</div>,
}));

import { WorkoutPlanPersonalizer } from '@/features/fitness/components/workout-plan-personalizer';
import type { FitnessProfile } from '@/features/fitness/service/fitness-profile.service';
import type { WorkoutPlanCustomization } from '@/features/fitness/service/workout-plan-customization.service';
import {
  createWorkoutPlanService,
  type WorkoutPlan,
} from '@/features/fitness/service/workout-plan.service';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';
import { http } from '@/shared/lib/http';

const mockGet = vi.mocked(http.get);
const mockPut = vi.mocked(http.put);
const profile: FitnessProfile = {
  goal: 'general-fitness',
  experience: 'beginner',
  availableEquipment: [],
};
const basePlan = (() => {
  const result = createWorkoutPlanService(profile);
  if ('error' in result.data) throw new Error('Expected generated plan');
  return result.data;
})();
const customization = (
  plan: WorkoutPlan = basePlan
): WorkoutPlanCustomization => ({
  defaultPlan: basePlan,
  plan,
  options: WORKOUT_EXERCISE_LIBRARY.filter((exercise) =>
    exercise.equipment.includes('bodyweight')
  ),
});

describe('WorkoutPlanPersonalizer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads and saves an exercise substitution without changing slot count', async () => {
    mockGet.mockResolvedValueOnce(customization());
    mockPut.mockResolvedValueOnce(customization());

    render(<WorkoutPlanPersonalizer initialPlan={basePlan} />);

    const exerciseSelectors = await screen.findAllByLabelText('Exercise 1');
    fireEvent.change(exerciseSelectors[0], {
      target: { value: 'reverse-lunge' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Save exercise choices' })
    );

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith('/fitness/plan', {
        overrides: [
          {
            sessionIndex: 0,
            exerciseIds: [
              'reverse-lunge',
              ...basePlan.sessions[0].exercises.slice(1).map(({ id }) => id),
            ],
          },
        ],
      });
    });
    expect(await screen.findByText('Exercise choices saved.')).toBeInTheDocument();
  });

  it('restores the generated plan by saving an empty override list', async () => {
    const alternate = WORKOUT_EXERCISE_LIBRARY.find(
      ({ id }) => id === 'reverse-lunge'
    );
    if (!alternate) throw new Error('Expected bodyweight exercise');
    const customized = basePlan.sessions.map((session, index) => ({
      ...session,
      exercises: session.exercises.map((exercise, slot) =>
        index === 0 && slot === 0
          ? {
            ...alternate,
            sets: exercise.sets,
            repetitions: exercise.repetitions,
            restSeconds: exercise.restSeconds,
          }
          : exercise
      ),
    }));
    const changedPlan = { ...basePlan, sessions: customized };
    mockGet.mockResolvedValueOnce(customization(changedPlan));
    mockPut.mockResolvedValueOnce(customization());

    render(<WorkoutPlanPersonalizer initialPlan={basePlan} />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Restore generated plan' })
    );

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith('/fitness/plan', { overrides: [] });
    });
    expect(await screen.findByText('Exercise choices saved.')).toBeInTheDocument();
  });
});
