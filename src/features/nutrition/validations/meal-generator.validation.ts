import { z } from 'zod';

import {
  FOOD_ALLERGENS,
  MEAL_PREFERENCES,
} from '@/shared/const/nutrition.const';

export const MealGeneratorSchema = z.strictObject({
  ingredients: z
    .array(z.string().trim().min(1).max(80))
    .min(1)
    .max(20),
  excludedAllergens: z
    .array(z.enum(FOOD_ALLERGENS.map(({ value }) => value)))
    .max(FOOD_ALLERGENS.length),
  preference: z.enum(MEAL_PREFERENCES.map(({ value }) => value)),
});

export type MealGeneratorType = z.infer<typeof MealGeneratorSchema>;
