import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TodayNutritionCard } from '@/features/dashboard/components/today-nutrition-card';
import type { NutritionEntry } from '@/features/nutrition/service/nutrition.service';

const entry = (id: string, calories: number): NutritionEntry => ({
  id, date: '2026-10-17', mealType: 'lunch', foodName: 'Meal', calories,
  proteinGrams: 10, carbohydrateGrams: 20, fatGrams: 5, fiberGrams: 3, waterMl: 0,
});
const targets = { calories: 2000, proteinGrams: 100, carbohydrateGrams: 250, fatGrams: 70, fiberGrams: 30, waterMl: 2000 };

describe('TodayNutritionCard', () => {
  it('adds up only the food entered today against the calorie goal the person set', () => {
    render(<TodayNutritionCard entries={[entry('a', 300), entry('b', 450)]} targets={targets} />);

    expect(screen.getByText('750')).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Calories' })).toHaveAttribute('aria-valuemax', '2000');
    expect(screen.getByRole('link', { name: 'Add food' })).toHaveAttribute('href', '/dashboard/nutrition?add=1');
  });

  it('tells the person what to do when nothing is logged and no goal is set', () => {
    render(<TodayNutritionCard entries={[]} targets={null} />);

    expect(screen.getByText('Nothing added yet today.')).toBeInTheDocument();
    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
  });
});
