import { describe, expect, it } from 'vitest';

import {
  getLocalNutritionDateRange,
  summarizeNutritionByLocalDay,
} from '@/features/nutrition/components/seven-day-nutrition-summary';
import type { NutritionEntry } from '@/features/nutrition/service/nutrition.service';

const entry = (
  id: string,
  date: string,
  overrides: Partial<NutritionEntry> = {}
): NutritionEntry => ({
  id,
  date,
  mealType: 'lunch',
  foodName: 'Logged meal',
  calories: 500,
  proteinGrams: 20,
  carbohydrateGrams: 60,
  fatGrams: 12,
  fiberGrams: 8,
  ...overrides,
});

describe('seven-day nutrition summary helpers', () => {
  it('uses local calendar dates to make a seven-day window across DST dates', () => {
    expect(
      getLocalNutritionDateRange(new Date(2026, 2, 29, 12))
    ).toEqual({ from: '2026-03-23', to: '2026-03-29' });
    expect(
      getLocalNutritionDateRange(new Date(2026, 9, 25, 12))
    ).toEqual({ from: '2026-10-19', to: '2026-10-25' });
  });

  it('sums only recorded entries and preserves unlogged days as empty', () => {
    const days = summarizeNutritionByLocalDay(
      [
        entry('one', '2026-10-16', { waterMl: 250 }),
        entry('two', '2026-10-16', {
          calories: 300,
          proteinGrams: 10,
          carbohydrateGrams: 40,
          fatGrams: 6,
          fiberGrams: 4,
          waterMl: 350,
        }),
        entry('outside', '2026-10-10'),
      ],
      new Date(2026, 9, 17, 12)
    );

    expect(days).toHaveLength(7);
    expect(days[5]).toMatchObject({
      date: '2026-10-16',
      entryCount: 2,
      totals: {
        calories: 800,
        proteinGrams: 30,
        carbohydrateGrams: 100,
        fatGrams: 18,
        fiberGrams: 12,
        waterMl: 600,
      },
    });
    expect(days[0].entryCount).toBe(0);
    expect(days[0].totals.calories).toBe(0);
  });
});
