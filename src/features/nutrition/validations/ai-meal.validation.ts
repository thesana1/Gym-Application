import { z } from 'zod';

import { FOOD_ALLERGENS } from '@/shared/const/nutrition.const';

const AllergenSchema = z.enum(FOOD_ALLERGENS.map(({ value }) => value));

export const AiMealSchema = z.strictObject({
  name: z.string().min(1).max(120),
  summary: z.string().max(300),
  ingredients: z.array(z.strictObject({ name: z.string().min(1).max(80), amount: z.string().min(1).max(60) })).min(1).max(15),
  missingIngredients: z.array(z.string().min(1).max(80)).max(10),
  steps: z.array(z.string().min(1).max(300)).min(1).max(10),
  allergens: z.array(AllergenSchema).max(FOOD_ALLERGENS.length),
  nutritionEstimate: z.strictObject({
    calories: z.number().min(0).max(3000),
    proteinGrams: z.number().min(0).max(300),
    carbohydrateGrams: z.number().min(0).max(500),
    fatGrams: z.number().min(0).max(300),
    fiberGrams: z.number().min(0).max(100),
  }),
  fitsTargets: z.string().max(300),
});

export const AiMealIdeasSchema = z.strictObject({
  meals: z.array(AiMealSchema).max(3),
});

export type AiMeal = z.infer<typeof AiMealSchema>;
export type AiMealIdeas = z.infer<typeof AiMealIdeasSchema>;
