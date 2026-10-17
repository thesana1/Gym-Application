import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  saveWorkout: vi.fn(),
  loadWorkouts: vi.fn(),
  deleteWorkout: vi.fn(),
  setError: vi.fn(),
}));

vi.mock('@/features/fitness/hooks/use-workout-logs', () => ({
  useWorkoutLogs: () => ({
    workouts: [],
    loading: false,
    saving: false,
    error: null,
    loadWorkouts: mocks.loadWorkouts,
    saveWorkout: mocks.saveWorkout,
    deleteWorkout: mocks.deleteWorkout,
    setError: mocks.setError,
  }),
}));
vi.mock('@/features/fitness/components/workout-log-history', () => ({
  WorkoutLogHistory: () => <div>Workout history</div>,
}));
vi.mock('@/features/fitness/components/workout-log-form', () => ({
  WorkoutLogForm: ({
    initialValues,
    onSubmit,
  }: {
    initialValues: {
      title: string;
      completedAt?: string;
      exercises: {
        exerciseId: string;
        sets: { repetitions: string; weightKg?: string }[];
      }[];
    };
    onSubmit: (value: never) => Promise<void>;
  }) => (
    <div>
      <output data-testid="prefill">{JSON.stringify(initialValues)}</output>
      <button
        type="button"
        onClick={() =>
          void onSubmit({
            title: initialValues.title,
            completedAt: '',
            exercises: initialValues.exercises.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              sets: exercise.sets.map(() => ({ repetitions: '8', weightKg: '' })),
            })),
          } as never)
        }
      >
        Save test workout
      </button>
    </div>
  ),
}));

import { WorkoutLogManager } from '@/features/fitness/components/workout-log-manager';

describe('WorkoutLogManager planned session logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.saveWorkout.mockResolvedValue(true);
  });

  it('prefills plan exercises without actual reps or weight and saves only on submit', async () => {
    render(
      <WorkoutLogManager
        startSession={{
          title: 'Full body A',
          exercises: [
            {
              id: 'bodyweight-squat',
              name: 'Bodyweight squat',
              equipment: ['bodyweight'],
              targetMuscles: 'Legs',
              instructions: [],
              commonMistake: '',
              regression: '',
              safetyCue: '',
              sets: 2,
              repetitions: '8–12',
              restSeconds: 90,
            },
          ],
        }}
      />
    );

    const values = JSON.parse(screen.getByTestId('prefill').textContent ?? '');
    expect(values.title).toBe('Full body A');
    expect(values.completedAt).toBe('');
    expect(values.exercises).toEqual([
      {
        exerciseId: 'bodyweight-squat',
        sets: [
          { repetitions: '', weightKg: '' },
          { repetitions: '', weightKg: '' },
        ],
      },
    ]);
    expect(mocks.saveWorkout).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Save test workout' }));

    await waitFor(() => {
      expect(mocks.saveWorkout).toHaveBeenCalledWith(null, {
        title: 'Full body A',
        completedAt: '',
        exercises: [
          {
            exerciseId: 'bodyweight-squat',
            sets: [
              { repetitions: '8', weightKg: '' },
              { repetitions: '8', weightKg: '' },
            ],
          },
        ],
      });
    });
  });
});
