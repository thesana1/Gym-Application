import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TodayNutritionCard } from '@/features/dashboard/components/today-nutrition-card';
import type { NutritionEntry } from '@/features/nutrition/service/nutrition.service';

const entries: NutritionEntry[] = [
  {
    id: 'entry-1',
    date: '2026-10-17',
    mealType: 'breakfast',
    foodName: 'Oats',
    calories: 300,
    proteinGrams: 12,
    carbohydrateGrams: 50,
    fatGrams: 6,
    fiberGrams: 8,
    waterMl: 250,
  },
  {
    id: 'entry-2',
    date: '2026-10-17',
    mealType: 'lunch',
    foodName: 'Beans',
    calories: 450,
    proteinGrams: 22,
    carbohydrateGrams: 60,
    fatGrams: 10,
    fiberGrams: 12,
    waterMl: 300,
  },
];

describe('TodayNutritionCard', () => {
  it('sums only entered records and distinguishes user-entered targets', () => {
    render(
      <TodayNutritionCard
        entries={entries}
        targets={{
          calories: 2000,
          proteinGrams: 100,
          carbohydrateGrams: 250,
          fatGrams: 70,
          fiberGrams: 30,
          waterMl: 2000,
        }}
      />
    );

    expect(screen.getByText('750 kcal')).toBeInTheDocument();
    expect(screen.getByText('34 g')).toBeInTheDocument();
    expect(screen.getByText('550 ml')).toBeInTheDocument();
    expect(
      screen.getByText(/User-entered targets — calories 2,000 kcal, protein 100 g/)
    ).toBeInTheDocument();
  });

  it('does not show targets or imply intake when no records or targets exist', () => {
    render(<TodayNutritionCard entries={[]} targets={null} />);

    expect(screen.getByText('No food or water entries logged today.')).toBeInTheDocument();
    expect(screen.getByText(/none are set/)).toBeInTheDocument();
    expect(screen.queryByText(/User-entered targets/)).not.toBeInTheDocument();
  });
});
