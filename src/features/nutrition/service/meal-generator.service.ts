import type { MealGeneratorType } from '@/features/nutrition/validations/meal-generator.validation';
import { MEAL_RECIPES, type MealRecipe } from '@/shared/const/meal-recipes.const';
import type { MealPreference } from '@/shared/const/nutrition.const';
import type { ServiceResult } from '@/shared/types/common';

export type GeneratedMeal = MealRecipe & {
  matchedIngredients: string[];
  missingIngredients: string[];
};

export type MealSuggestions = {
  recipes: GeneratedMeal[];
  message?: string;
};

const INGREDIENT_ALIASES: Record<string, string> = {
  tomatoes: 'tomato',
  onions: 'onion',
  bananas: 'banana',
  egg: 'eggs',
  eggs: 'eggs',
  berry: 'berries',
  yoghurt: 'yogurt',
  'greek yoghurt': 'greek yogurt',
  beans: 'black beans',
  'black bean': 'black beans',
  oats: 'oats',
  'rolled oats': 'oats',
  'cooked rice': 'rice',
  'brown rice': 'rice',
};

const normalizeIngredient = (ingredient: string) => {
  const normalized = ingredient.toLowerCase().replace(/[^\da-z\s-]/g, '').trim();
  return INGREDIENT_ALIASES[normalized] ?? normalized;
};

const hasIngredient = (available: Set<string>, recipeIngredient: string) => {
  const target = normalizeIngredient(recipeIngredient);
  if (available.has(target)) return true;
  const targetWords = target.split(/\s+/);
  // A broader entry ("chicken", "yogurt") matches a more specific recipe ingredient ("chicken breast").
  return [...available].some((ingredient) => {
    const words = ingredient.split(/\s+/);
    return words.every((word) => targetWords.includes(word));
  });
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
  const availableIngredients = new Set(
    input.ingredients.map(normalizeIngredient).filter(Boolean)
  );
  const excludedAllergens = new Set(input.excludedAllergens);

  const recipes = MEAL_RECIPES
    .filter(
      (recipe) =>
        recipe.allergens.every((allergen) => !excludedAllergens.has(allergen)) &&
        meetsPreference(recipe, input.preference)
    )
    .map((recipe): GeneratedMeal => {
      const matchedIngredients: string[] = [];
      const missingIngredients: string[] = [];
      recipe.ingredients.forEach(({ name }) =>
        (hasIngredient(availableIngredients, name) ? matchedIngredients : missingIngredients).push(name)
      );
      return { ...recipe, matchedIngredients, missingIngredients };
    })
    .filter(({ matchedIngredients }) => matchedIngredients.length > 0)
    .sort(
      (a, b) =>
        a.missingIngredients.length - b.missingIngredients.length ||
        b.matchedIngredients.length - a.matchedIngredients.length
    );

  return {
    data: {
      recipes,
      ...(recipes.length === 0
        ? {
          message:
            'No recipe in this small library uses any of your ingredients with ' +
            'your allergy exclusions and preference. Try other ingredients or ' +
            'choose a different preference.',
        }
        : {}),
    },
    status: 200,
  };
}
