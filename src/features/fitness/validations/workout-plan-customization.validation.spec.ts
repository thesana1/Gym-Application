import { describe, expect, it } from 'vitest';

import { WorkoutPlanCustomizationSchema } from '@/features/fitness/validations/workout-plan-customization.validation';

describe('WorkoutPlanCustomizationSchema', () => {
  it('accepts reset and unique exercise choices', () => {
    expect(
      WorkoutPlanCustomizationSchema.safeParse({ overrides: [] }).success
    ).toBe(true);
    expect(
      WorkoutPlanCustomizationSchema.safeParse({
        overrides: [
          {
            sessionIndex: 0,
            exerciseIds: ['reverse-lunge', 'dead-bug'],
          },
        ],
      }).success
    ).toBe(true);
  });

  it('rejects duplicate exercises and duplicate session overrides', () => {
    expect(
      WorkoutPlanCustomizationSchema.safeParse({
        overrides: [{ sessionIndex: 0, exerciseIds: ['dead-bug', 'dead-bug'] }],
      }).success
    ).toBe(false);
    expect(
      WorkoutPlanCustomizationSchema.safeParse({
        overrides: [
          { sessionIndex: 0, exerciseIds: ['dead-bug'] },
          { sessionIndex: 0, exerciseIds: ['hip-hinge'] },
        ],
      }).success
    ).toBe(false);
  });
});
