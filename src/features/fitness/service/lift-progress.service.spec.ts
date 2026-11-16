import { describe, expect, it } from 'vitest';

import { buildLiftProgress } from '@/features/fitness/service/lift-progress.service';
import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';

const log = (completedAt: string, exerciseId: string, sets: WorkoutLog['exercises'][number]['sets']): WorkoutLog => ({
  id: completedAt,
  title: 'Workout',
  completedAt,
  exercises: [{ exerciseId, exerciseName: exerciseId, sets }],
});

describe('buildLiftProgress', () => {
  it('tracks the heaviest set per day and the gain from the first session to the best', () => {
    const [squat] = buildLiftProgress([
      log('2026-11-10T10:00:00', 'squat', [{ repetitions: 8, weightKg: 70 }]),
      log('2026-11-01T10:00:00', 'squat', [{ repetitions: 8, weightKg: 55 }, { repetitions: 8, weightKg: 60 }]),
      log('2026-11-01T18:00:00', 'squat', [{ repetitions: 5, weightKg: 62.5 }]),
      log('2026-11-14T10:00:00', 'squat', [{ repetitions: 8, weightKg: 67.5 }]),
    ]);

    expect(squat.unit).toBe('kg');
    expect(squat.points.map(({ value }) => value)).toEqual([62.5, 70, 67.5]);
    expect(squat).toMatchObject({ first: 62.5, best: 70, latest: 67.5, gain: 7.5, gainPercent: 12 });
  });

  it('uses reps for bodyweight moves and lists the most-trained exercise first', () => {
    const result = buildLiftProgress([
      log('2026-11-01T10:00:00', 'push-up', [{ repetitions: 10 }]),
      log('2026-11-08T10:00:00', 'push-up', [{ repetitions: 14 }]),
      log('2026-11-08T10:00:00', 'plank', [{ repetitions: 1 }]),
    ]);

    expect(result.map(({ exerciseId }) => exerciseId)).toEqual(['push-up', 'plank']);
    expect(result[0]).toMatchObject({ unit: 'reps', gain: 4, gainPercent: 40 });
  });
});
