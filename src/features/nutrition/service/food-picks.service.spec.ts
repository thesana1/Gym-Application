import { describe, expect, it } from 'vitest';

import { FOOD_PICKS_LIMIT, recommendFoodService, type FoodPicks } from '@/features/nutrition/service/food-picks.service';

const picksFor = (goal?: Parameters<typeof recommendFoodService>[0]) => recommendFoodService(goal).data as FoodPicks;

describe('recommendFoodService', () => {
  it('puts the most protein first for muscle building', () => {
    const { highlight, recipes } = picksFor('muscle-building');
    expect(highlight).toBe('protein');
    const protein = recipes.map(({ nutritionEstimate }) => nutritionEstimate.proteinGrams);
    expect(protein).toEqual([...protein].sort((a, b) => b - a));
  });

  it('puts the fewest calories first for fat loss', () => {
    const { highlight, recipes } = picksFor('fat-loss');
    expect(highlight).toBe('calories');
    const calories = recipes.map(({ nutritionEstimate }) => nutritionEstimate.calories);
    expect(calories).toEqual([...calories].sort((a, b) => a - b));
  });

  it('falls back to fiber when there is no goal yet and never returns more than the limit', () => {
    const { highlight, recipes } = picksFor();
    expect(highlight).toBe('fiber');
    expect(recipes.length).toBeLessThanOrEqual(FOOD_PICKS_LIMIT);
    expect(recipes.length).toBeGreaterThan(0);
  });
});
