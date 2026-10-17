import { describe, expect, it } from 'vitest';

import {
  WorkoutLogIdSchema,
  WorkoutLogQuerySchema,
  WorkoutLogSchema,
} from '@/features/fitness/validations/workout-log.validation';

const validLog = {
  title: 'Strength session',
  completedAt: '2026-10-04T05:00:00.000Z',
  notes: 'Felt comfortable',
  exercises: [
    {
      exerciseId: 'bodyweight-squat',
      sets: [
        { repetitions: '10', weightKg: '' },
        { repetitions: '8', weightKg: '12.5' },
      ],
    },
  ],
};

describe('WorkoutLogSchema', () => {
  it('converts and validates workout inputs', () => {
    expect(WorkoutLogSchema.parse(validLog)).toEqual({
      title: 'Strength session',
      completedAt: validLog.completedAt,
      notes: 'Felt comfortable',
      exercises: [
        {
          exerciseId: 'bodyweight-squat',
          sets: [{ repetitions: 10 }, { repetitions: 8, weightKg: 12.5 }],
        },
      ],
    });
  });

  it('allows an omitted completion time and optional notes', () => {
    expect(
      WorkoutLogSchema.parse({
        title: 'Workout',
        exercises: [
          { exerciseId: 'bird-dog', sets: [{ repetitions: '5' }] },
        ],
      })
    ).toMatchObject({
      title: 'Workout',
      exercises: [{ exerciseId: 'bird-dog', sets: [{ repetitions: 5 }] }],
    });
  });

  it('rejects invalid exercises, empty sets, and out-of-range values', () => {
    expect(
      WorkoutLogSchema.safeParse({
        ...validLog,
        exercises: [{ exerciseId: 'unknown', sets: [{ repetitions: '10' }] }],
      }).success
    ).toBe(false);
    expect(
      WorkoutLogSchema.safeParse({
        ...validLog,
        exercises: [{ exerciseId: 'bodyweight-squat', sets: [] }],
      }).success
    ).toBe(false);
    expect(
      WorkoutLogSchema.safeParse({
        ...validLog,
        exercises: [
          {
            exerciseId: 'bodyweight-squat',
            sets: [{ repetitions: '101', weightKg: '501' }],
          },
        ],
      }).success
    ).toBe(false);
  });

  it('accepts only hexadecimal ObjectId values for update and delete routes', () => {
    expect(WorkoutLogIdSchema.safeParse('507f1f77bcf86cd799439011').success).toBe(
      true
    );
    expect(WorkoutLogIdSchema.safeParse('z'.repeat(24)).success).toBe(false);
  });

  it('validates date and exercise filters', () => {
    expect(
      WorkoutLogQuerySchema.safeParse({
        from: '2026-10-01T00:00:00.000Z',
        exerciseId: 'bird-dog',
      }).success
    ).toBe(true);
    expect(
      WorkoutLogQuerySchema.safeParse({ exerciseId: 'unknown-exercise' }).success
    ).toBe(false);
    expect(WorkoutLogQuerySchema.safeParse({ from: 'not-a-date' }).success).toBe(
      false
    );
  });
});
