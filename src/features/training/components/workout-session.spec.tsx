import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/http', () => ({ http: { get: vi.fn(), post: vi.fn() } }));

import { WorkoutSession } from '@/features/training/components/workout-session';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';
import { http } from '@/shared/lib/http';

const definition = WORKOUT_EXERCISE_LIBRARY.find(({ id }) => id === 'barbell-bench-press');
const session = {
  workout: { id: 'w1', name: 'Upper push', weekday: 1, exercises: [] },
  exercises: [{
    exerciseId: 'barbell-bench-press', sets: 2, repMin: 8, repMax: 12, restSeconds: 90, definition,
    target: { exerciseId: 'barbell-bench-press', change: 'up', weightKg: 42.5, lastWeightKg: 40, lastSets: [{ repetitions: 12, weightKg: 40 }] },
  }],
};

describe('WorkoutSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(http.get).mockImplementation(async (url: string) => {
      if (url.startsWith('/training/workouts/')) return session;
      if (url === '/fitness/records') return [{ exerciseId: 'barbell-bench-press', heaviestSet: { weightKg: 40, repetitions: 12 } }];
      if (url === '/training/plan') return null;
      return [];
    });
    vi.mocked(http.post).mockResolvedValue({});
  });

  it('prefills the suggested weight, needs reps before a set is done, and saves a linked log', async () => {
    render(<WorkoutSession workoutId="w1" />);
    expect(await screen.findByText('Go up to 42.5 kg. You hit the top of the range on every set last time.')).toBeInTheDocument();
    expect(screen.getByLabelText('Bench press set 1 weight in kg')).toHaveValue('42.5');

    fireEvent.click(screen.getByRole('button', { name: 'Mark Bench press set 1 done' }));
    expect(screen.getByText('Type how many reps you did first.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Bench press set 1 reps'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Mark Bench press set 1 done' }));
    expect(screen.getByText('1 of 2 sets done')).toBeInTheDocument();
    expect(screen.getByRole('timer')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Bench press set 2 reps'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Mark Bench press set 2 done' }));
    fireEvent.click(screen.getByRole('button', { name: 'Complete workout' }));

    await waitFor(() => expect(http.post).toHaveBeenCalledWith('/fitness/workouts', {
      title: 'Upper push', planWorkoutId: 'w1',
      exercises: [{ exerciseId: 'barbell-bench-press', sets: [{ repetitions: 12, weightKg: 42.5 }, { repetitions: 10, weightKg: 42.5 }] }],
    }));
    expect(await screen.findByText('You did it!')).toBeInTheDocument();
    expect(screen.getByText('Bench press: 42.5 kg × 12')).toBeInTheDocument();
    expect(screen.getByText('Stay at 42.5 kg and try for 1 more rep per set.')).toBeInTheDocument();
  });
});
