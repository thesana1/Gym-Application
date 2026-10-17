import type { MealGeneratorType } from '@/features/nutrition/validations/meal-generator.validation';
import { MEAL_RECIPES, type MealRecipe } from '@/shared/const/meal-recipes.const';
import type { MealPreference } from '@/shared/const/nutrition.const';
import type { ServiceResult } from '@/shared/types/common';

export type GeneratedMeal = MealRecipe;

export type MealSuggestions = {
  recipes: GeneratedMeal[];
  message?: string;
};

const INGREDIENT_ALIASES: Record<string, string> = {
  tomatoes: 'tomato',
  onions: 'onion',
  bananas: 'banana',
  eggs: 'eggs',
  oats: 'oats',
  'rolled oats': 'oats',
  'cooked rice': 'rice',
  'brown rice': 'rice',
};

const normalizeIngredient = (ingredient: string) => {
  const normalized = ingredient.toLowerCase().replace(/[^\da-z\s-]/g, '').trim();
  return INGREDIENT_ALIASES[normalized] ?? normalized;
};

const meetsPreference = (
  recipe: MealRecipe,
  preference: MealPreference
): boolean => {
  const nutrition = recipe.nutritionEstimate;

  switch (preference) {
    case 'high-protein':
    case 'post-workout':
    case 'muscle-building':
      return nutrition.proteinGrams >= 20;
    case 'lower-calorie':
    case 'weight-loss':
      return nutrition.calories <= 500;
    case 'high-fiber':
      return nutrition.fiberGrams >= 8;
    case 'any':
      return true;
  }
};

export function generateMealsService(
  input: MealGeneratorType
): ServiceResult<MealSuggestions> {
  const availableIngredients = new Set(input.ingredients.map(normalizeIngredient));
  const excludedAllergens = new Set(input.excludedAllergens);
  const recipes = MEAL_RECIPES.filter(
    (recipe) =>
      recipe.ingredients.every(({ name }) =>
        availableIngredients.has(normalizeIngredient(name))
      ) &&
      recipe.allergens.every((allergen) => !excludedAllergens.has(allergen)) &&
      meetsPreference(recipe, input.preference)
  );

  return {
    data: {
      recipes,
      ...(recipes.length === 0
        ? {
          message:
            'No recipe in this small library matches all your ingredients, ' +
            'allergy exclusions, and preference. Try adding ingredients or ' +
            'choose a different preference.',
        }
        : {}),
    },
    status: 200,
  };
}
