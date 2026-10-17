import { describe, expect, it } from 'vitest';

import {
  generateMealsService,
  type MealSuggestions,
} from '@/features/nutrition/service/meal-generator.service';
import { MealGeneratorSchema } from '@/features/nutrition/validations/meal-generator.validation';
import type { ServiceResult } from '@/shared/types/common';

const getSuggestions = (result: ServiceResult<MealSuggestions>) => {
  if ('error' in result.data) {
    throw new Error('Expected meal suggestions');
  }
  return result.data;
};

describe('generateMealsService', () => {
  it('suggests only recipes whose listed ingredients are available', () => {
    const input = MealGeneratorSchema.parse({
      ingredients: ['chicken breast', 'rice', 'tomatoes', 'olive oil'],
      excludedAllergens: [],
      preference: 'any',
    });

    const result = getSuggestions(generateMealsService(input));

    expect(result.recipes.map(({ id }) => id)).toEqual([
      'chicken-rice-tomato-bowl',
    ]);
  });

  it('filters recipes that carry an excluded allergen', () => {
    const result = getSuggestions(generateMealsService(
      MealGeneratorSchema.parse({
        ingredients: ['greek yogurt', 'oats', 'berries'],
        excludedAllergens: ['milk'],
        preference: 'any',
      })
    ));

    expect(result.recipes).toEqual([]);
    expect(result.message).toContain('No recipe');
  });

  it('filters recipes by the selected preference using labeled estimate fields', () => {
    const result = getSuggestions(generateMealsService(
      MealGeneratorSchema.parse({
        ingredients: ['black beans', 'rice', 'tomato', 'onion'],
        excludedAllergens: [],
        preference: 'high-fiber',
      })
    ));

    expect(result.recipes.map(({ id }) => id)).toEqual(['bean-tomato-rice']);
    expect(result.recipes[0]?.nutritionEstimate.fiberGrams).toBeGreaterThanOrEqual(
      8
    );
  });

  it('explains when the small recipe library has no matching result', () => {
    const result = getSuggestions(generateMealsService(
      MealGeneratorSchema.parse({
        ingredients: ['rice'],
        excludedAllergens: [],
        preference: 'any',
      })
    ));

    expect(result.recipes).toEqual([]);
    expect(result.message).toContain('small library');
  });
});
