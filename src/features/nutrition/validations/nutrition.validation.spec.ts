import { describe, expect, it } from 'vitest';

import {
  NutritionEntryQuerySchema,
  NutritionEntrySchema,
  NutritionTargetsSchema,
} from '@/features/nutrition/validations/nutrition.validation';

describe('nutrition validation', () => {
  it('accepts one-day and bounded seven-day entry queries', () => {
    expect(
      NutritionEntryQuerySchema.safeParse({ date: '2026-10-04' }).success
    ).toBe(true);
    expect(
      NutritionEntryQuerySchema.safeParse({
        from: '2026-09-28',
        to: '2026-10-04',
      }).success
    ).toBe(true);
    expect(
      NutritionEntryQuerySchema.safeParse({
        from: '2026-09-27',
        to: '2026-10-04',
      }).success
    ).toBe(false);
    expect(
      NutritionEntryQuerySchema.safeParse({
        from: '2026-10-05',
        to: '2026-10-04',
      }).success
    ).toBe(false);
  });

  it('converts manual daily targets into numeric values', () => {
    expect(
      NutritionTargetsSchema.parse({
        calories: '2000',
        proteinGrams: '100',
        carbohydrateGrams: '240',
        fatGrams: '65',
        fiberGrams: '30',
        waterMl: '2200',
      })
    ).toEqual({
      calories: 2000,
      proteinGrams: 100,
      carbohydrateGrams: 240,
      fatGrams: 65,
      fiberGrams: 30,
      waterMl: 2200,
    });
  });

  it('rejects targets outside supported ranges', () => {
    expect(
      NutritionTargetsSchema.safeParse({
        calories: '400',
        proteinGrams: '100',
        carbohydrateGrams: '240',
        fatGrams: '65',
        fiberGrams: '30',
        waterMl: '2200',
      }).success
    ).toBe(false);
  });

  it('validates food entries and makes water optional', () => {
    expect(
      NutritionEntrySchema.parse({
        date: '2026-10-04',
        mealType: 'lunch',
        foodName: 'Rice and beans',
        calories: '560',
        proteinGrams: '22',
        carbohydrateGrams: '88',
        fatGrams: '11',
        fiberGrams: '14',
      })
    ).toMatchObject({
      date: '2026-10-04',
      mealType: 'lunch',
      calories: 560,
    });
  });

  it('rejects invalid dates, macros, meals, and additional properties', () => {
    const base = {
      date: '2026-10-04',
      mealType: 'snack',
      foodName: 'Fruit',
      calories: 100,
      proteinGrams: 1,
      carbohydrateGrams: 25,
      fatGrams: 0,
      fiberGrams: 3,
    };

    expect(NutritionEntrySchema.safeParse({ ...base, date: '2026-02-30' }).success).toBe(
      false
    );
    expect(NutritionEntrySchema.safeParse({ ...base, mealType: 'brunch' }).success).toBe(
      false
    );
    expect(NutritionEntrySchema.safeParse({ ...base, calories: -1 }).success).toBe(
      false
    );
    expect(
      NutritionEntrySchema.safeParse({ ...base, medicalAdvice: 'condition' }).success
    ).toBe(false);
  });
});
