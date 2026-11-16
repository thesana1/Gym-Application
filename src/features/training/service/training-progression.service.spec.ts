import { describe, expect, it } from 'vitest';

import { suggestNextTarget } from '@/features/training/service/training-progression.service';

const plan = { exerciseId: 'barbell-bench-press', sets: 3, repMin: 8, repMax: 12, restSeconds: 90 };
const sets = (reps: number[], weightKg?: number) => reps.map((repetitions) => ({ repetitions, weightKg }));

describe('suggestNextTarget', () => {
  it('asks for a starting weight when the exercise was never logged', () => {
    expect(suggestNextTarget(plan, 'upper', [])).toMatchObject({ change: 'start', lastSets: [] });
  });

  it('adds 2.5 kg to an upper-body lift once every planned set reaches the top of the range', () => {
    expect(suggestNextTarget(plan, 'upper', [sets([12, 12, 12], 40)])).toMatchObject({ change: 'up', weightKg: 42.5, lastWeightKg: 40 });
  });

  it('adds 5 kg to a lower-body lift', () => {
    expect(suggestNextTarget({ ...plan, exerciseId: 'leg-press' }, 'lower', [sets([12, 12, 12], 100)])).toMatchObject({ weightKg: 105 });
  });

  it('keeps the weight when some sets are still below the top of the range', () => {
    expect(suggestNextTarget(plan, 'upper', [sets([12, 10, 9], 40)])).toMatchObject({ change: 'same', weightKg: 40 });
  });

  it('does not add weight when fewer sets than planned were done', () => {
    expect(suggestNextTarget(plan, 'upper', [sets([12, 12], 40)])).toMatchObject({ change: 'same' });
  });

  it('goes about 10% lighter after two sessions in a row below the range at the same weight', () => {
    expect(suggestNextTarget(plan, 'upper', [sets([7, 6, 6], 50), sets([7, 7, 6], 50)])).toMatchObject({ change: 'down', weightKg: 45 });
  });

  it('keeps the weight after only one short session', () => {
    expect(suggestNextTarget(plan, 'upper', [sets([7, 6, 6], 50), sets([9, 8, 8], 47.5)])).toMatchObject({ change: 'same', weightKg: 50 });
  });

  it('suggests a harder version of a bodyweight move done at the top of the range', () => {
    expect(suggestNextTarget({ ...plan, exerciseId: 'push-up' }, 'upper', [sets([12, 12, 12])])).toMatchObject({ change: 'harder' });
  });
});
