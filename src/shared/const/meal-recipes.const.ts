import type { FoodAllergen } from '@/shared/const/nutrition.const';

export type MealRecipe = {
  id: string;
  name: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  allergens: FoodAllergen[];
  substitutions: string[];
  nutritionEstimate: {
    calories: number;
    proteinGrams: number;
    carbohydrateGrams: number;
    fatGrams: number;
    fiberGrams: number;
  };
};

export const MEAL_RECIPES: MealRecipe[] = [
  {
    id: 'chicken-rice-tomato-bowl',
    name: 'Chicken, rice, and tomato bowl',
    ingredients: [
      { name: 'chicken breast', amount: '120 g' },
      { name: 'rice', amount: '150 g cooked' },
      { name: 'tomato', amount: '1 medium' },
      { name: 'olive oil', amount: '1 teaspoon' },
    ],
    steps: [
      'Cook the rice according to its package directions.',
      'Cook chicken fully in a pan with the olive oil.',
      'Serve with chopped tomato and seasonings you have available.',
    ],
    allergens: [],
    substitutions: ['Use beans instead of chicken if you have beans available.'],
    nutritionEstimate: {
      calories: 480,
      proteinGrams: 38,
      carbohydrateGrams: 56,
      fatGrams: 10,
      fiberGrams: 3,
    },
  },
  {
    id: 'egg-oat-pancakes',
    name: 'Egg and oat pancakes',
    ingredients: [
      { name: 'eggs', amount: '2 large' },
      { name: 'oats', amount: '40 g' },
      { name: 'banana', amount: '1 medium' },
    ],
    steps: [
      'Mash the banana and mix it with the eggs and oats.',
      'Spoon small portions into a warm non-stick pan.',
      'Cook both sides until set and cooked through.',
    ],
    allergens: ['eggs'],
    substitutions: ['Use apple instead of banana if you have apple available.'],
    nutritionEstimate: {
      calories: 360,
      proteinGrams: 17,
      carbohydrateGrams: 48,
      fatGrams: 11,
      fiberGrams: 7,
    },
  },
  {
    id: 'yogurt-oat-bowl',
    name: 'Yogurt, oat, and fruit bowl',
    ingredients: [
      { name: 'greek yogurt', amount: '170 g' },
      { name: 'oats', amount: '35 g' },
      { name: 'berries', amount: '100 g' },
    ],
    steps: [
      'Spoon the yogurt into a bowl.',
      'Top with oats and berries.',
      'Let it stand briefly if you prefer softer oats.',
    ],
    allergens: ['milk'],
    substitutions: ['Use a fortified plant yogurt if you have one available.'],
    nutritionEstimate: {
      calories: 330,
      proteinGrams: 23,
      carbohydrateGrams: 43,
      fatGrams: 6,
      fiberGrams: 8,
    },
  },
  {
    id: 'bean-tomato-rice',
    name: 'Bean, tomato, and rice bowl',
    ingredients: [
      { name: 'black beans', amount: '150 g cooked' },
      { name: 'rice', amount: '120 g cooked' },
      { name: 'tomato', amount: '1 medium' },
      { name: 'onion', amount: '¼ medium' },
    ],
    steps: [
      'Warm the cooked beans and rice thoroughly.',
      'Chop tomato and onion into small pieces.',
      'Serve the vegetables over the beans and rice.',
    ],
    allergens: [],
    substitutions: ['Use another cooked bean if you have it available.'],
    nutritionEstimate: {
      calories: 390,
      proteinGrams: 17,
      carbohydrateGrams: 72,
      fatGrams: 3,
      fiberGrams: 15,
    },
  },
];
