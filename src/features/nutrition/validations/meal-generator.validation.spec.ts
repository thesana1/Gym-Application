import { describe, expect, it } from 'vitest';

import { MealGeneratorSchema } from '@/features/nutrition/validations/meal-generator.validation';

describe('MealGeneratorSchema', () => {
  it('accepts bounded ingredient lists and known allergy and preference values', () => {
    expect(
      MealGeneratorSchema.parse({
        ingredients: [' chicken breast ', 'rice'],
        excludedAllergens: ['milk', 'peanuts'],
        preference: 'high-protein',
      })
    ).toEqual({
      ingredients: ['chicken breast', 'rice'],
      excludedAllergens: ['milk', 'peanuts'],
      preference: 'high-protein',
    });
  });

  it('rejects empty or unknown ingredient and preference inputs', () => {
    expect(
      MealGeneratorSchema.safeParse({
        ingredients: [],
        excludedAllergens: [],
        preference: 'any',
      }).success
    ).toBe(false);
    expect(
      MealGeneratorSchema.safeParse({
        ingredients: ['x'.repeat(81)],
        excludedAllergens: ['milk'],
        preference: 'high-protein',
      }).success
    ).toBe(false);
    expect(
      MealGeneratorSchema.safeParse({
        ingredients: ['rice'],
        excludedAllergens: ['unknown-allergen'],
        preference: 'any',
      }).success
    ).toBe(false);
  });
});
