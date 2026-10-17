import { describe, expect, it } from 'vitest';

import { TrainingScheduleSchema } from '@/features/fitness/validations/training-schedule.validation';

describe('TrainingScheduleSchema', () => {
  it('accepts an empty schedule and unique weekday/session assignments', () => {
    expect(TrainingScheduleSchema.safeParse({ assignments: [] }).success).toBe(true);
    expect(
      TrainingScheduleSchema.safeParse({
        assignments: [
          { weekday: 1, sessionIndex: 0 },
          { weekday: 3, sessionIndex: 1 },
        ],
      }).success
    ).toBe(true);
  });

  it('rejects duplicate days, duplicate sessions, and invalid weekdays', () => {
    expect(
      TrainingScheduleSchema.safeParse({
        assignments: [
          { weekday: 2, sessionIndex: 0 },
          { weekday: 2, sessionIndex: 1 },
        ],
      }).success
    ).toBe(false);
    expect(
      TrainingScheduleSchema.safeParse({
        assignments: [
          { weekday: 2, sessionIndex: 0 },
          { weekday: 4, sessionIndex: 0 },
        ],
      }).success
    ).toBe(false);
    expect(
      TrainingScheduleSchema.safeParse({
        assignments: [{ weekday: 7, sessionIndex: 0 }],
      }).success
    ).toBe(false);
  });
});
