import type { FitnessGoal } from '@/shared/const/fitness.const';
import { MEAL_RECIPES, type MealRecipe } from '@/shared/const/meal-recipes.const';
import type { ServiceResult } from '@/shared/types/common';

// The nutrient a pick is chosen for, so the card can show why it fits.
export type FoodPickHighlight = 'protein' | 'calories' | 'carbs' | 'fiber';

export type FoodPicks = {
  highlight: FoodPickHighlight;
  recipes: MealRecipe[];
};

export const FOOD_PICKS_LIMIT = 4;

const HIGHLIGHT_FOR_GOAL: Record<FitnessGoal, FoodPickHighlight> = {
  'muscle-building': 'protein',
  strength: 'protein',
  'fat-loss': 'calories',
  endurance: 'carbs',
  'athletic-performance': 'carbs',
  'general-fitness': 'fiber',
};

// Higher score comes first.
const SCORE: Record<FoodPickHighlight, (recipe: MealRecipe) => number> = {
  protein: ({ nutritionEstimate }) => nutritionEstimate.proteinGrams,
  calories: ({ nutritionEstimate }) => -nutritionEstimate.calories,
  carbs: ({ nutritionEstimate }) => nutritionEstimate.carbohydrateGrams,
  fiber: ({ nutritionEstimate }) => nutritionEstimate.fiberGrams,
};

// Meals from the recipe library, ordered by what helps the member's goal most.
export function recommendFoodService(goal?: FitnessGoal): ServiceResult<FoodPicks> {
  const highlight = goal ? HIGHLIGHT_FOR_GOAL[goal] : 'fiber';
  const score = SCORE[highlight];
  const recipes = [...MEAL_RECIPES].sort((a, b) => score(b) - score(a)).slice(0, FOOD_PICKS_LIMIT);
  return { data: { highlight, recipes }, status: 200 };
}
