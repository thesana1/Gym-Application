export const FOOD_ALLERGENS = [
  { value: 'milk', label: 'Milk' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'fish', label: 'Fish' },
  { value: 'crustaceans', label: 'Crustaceans' },
  { value: 'tree-nuts', label: 'Tree nuts' },
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'soy', label: 'Soy' },
  { value: 'sesame', label: 'Sesame' },
] as const;

export const MEAL_PREFERENCES = [
  { value: 'any', label: 'Any meal' },
  { value: 'high-protein', label: 'Higher protein' },
  { value: 'lower-calorie', label: 'Lower calorie' },
  { value: 'high-fiber', label: 'Higher fiber' },
  { value: 'post-workout', label: 'Post-workout idea' },
  { value: 'muscle-building', label: 'Muscle-building goal' },
  { value: 'weight-loss', label: 'Weight-loss goal' },
] as const;

export type FoodAllergen = (typeof FOOD_ALLERGENS)[number]['value'];
export type MealPreference = (typeof MEAL_PREFERENCES)[number]['value'];
