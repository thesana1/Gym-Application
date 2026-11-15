import { getAiUsageService, listSavedAiResultsService, runAiRequestService, type SavedAiResult } from '@/features/ai/service/ai-request.service';
import { generateMealsService, type GeneratedMeal } from '@/features/nutrition/service/meal-generator.service';
import { getNutritionTargetsService } from '@/features/nutrition/service/nutrition.service';
import { AiMealIdeasSchema, type AiMeal, type AiMealIdeas } from '@/features/nutrition/validations/ai-meal.validation';
import type { MealGeneratorType } from '@/features/nutrition/validations/meal-generator.validation';
import { AI_PROMPTS } from '@/shared/const/ai.const';
import type { AiSource, AiUsage } from '@/shared/types/ai';
import type { ServiceResult } from '@/shared/types/common';

export type AiMealIdeasResponse = {
  source: AiSource;
  meals: AiMeal[];
  // Library suggestions are always included so users have something when the AI is unavailable.
  libraryRecipes: GeneratedMeal[];
  usage: AiUsage | null;
  notice?: string;
};

export type SavedMealIdeas = { saved: SavedAiResult<AiMealIdeas>[]; usage: AiUsage };

const libraryRecipesFor = (input: MealGeneratorType): GeneratedMeal[] => {
  const library = generateMealsService(input);
  return 'error' in library.data ? [] : library.data.recipes;
};

export async function generateAiMealIdeasService(userId: string, input: MealGeneratorType): Promise<ServiceResult<AiMealIdeasResponse>> {
  const ingredients = [...new Set(input.ingredients.map((item) => item.trim().toLowerCase()))].sort();
  const excludedAllergens = [...input.excludedAllergens].sort();
  const targetsResult = await getNutritionTargetsService(userId);
  const targets = targetsResult.data && !('error' in targetsResult.data) ? targetsResult.data : null;
  const targetSummary = targets
    ? {
      calories: targets.calories, proteinGrams: targets.proteinGrams, carbohydrateGrams: targets.carbohydrateGrams,
      fatGrams: targets.fatGrams, fiberGrams: targets.fiberGrams,
    }
    : null;
  const requestData = { ingredients, excludedAllergens, preference: input.preference, dailyTargets: targetSummary };

  const result = await runAiRequestService({
    userId,
    kind: 'meal-ideas',
    scope: 'user',
    cacheInput: JSON.stringify(requestData),
    label: ingredients.join(', '),
    schema: AiMealIdeasSchema,
    schemaName: 'meal_ideas',
    system: AI_PROMPTS.mealIdeas,
    user: `<user_input>${JSON.stringify(requestData)}</user_input>`,
  });

  const libraryRecipes = libraryRecipesFor(input);
  if ('error' in result.data) {
    const usage = await getAiUsageService(userId);
    return {
      data: { source: 'library', meals: [], libraryRecipes, usage: 'error' in usage.data ? null : usage.data, notice: result.data.error },
      status: 200,
    };
  }

  // Defense in depth: never show a meal tagged with an allergen the user excluded.
  const excluded = new Set<string>(excludedAllergens);
  const meals = result.data.data.meals.filter((meal) => !meal.allergens.some((allergen) => excluded.has(allergen)));
  return { data: { source: result.data.source, meals, libraryRecipes, usage: result.data.usage }, status: 200 };
}

export async function listSavedMealIdeasService(userId: string): Promise<ServiceResult<SavedMealIdeas>> {
  const [saved, usage] = await Promise.all([
    listSavedAiResultsService(userId, 'meal-ideas', AiMealIdeasSchema, 10),
    getAiUsageService(userId),
  ]);
  if ('error' in saved.data) return { data: saved.data, status: saved.status };
  if ('error' in usage.data) return { data: usage.data, status: usage.status };
  return { data: { saved: saved.data, usage: usage.data }, status: 200 };
}
