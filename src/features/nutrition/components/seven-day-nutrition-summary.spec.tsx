import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/http', () => ({
  http: { get: vi.fn() },
}));

import {
  getLocalNutritionDateRange,
  SevenDayNutritionSummary,
} from '@/features/nutrition/components/seven-day-nutrition-summary';
import { http } from '@/shared/lib/http';

const mockGet = vi.mocked(http.get);

describe('SevenDayNutritionSummary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads a bounded local date range and identifies days without entries', async () => {
    mockGet.mockResolvedValueOnce([
      {
        id: 'entry',
        date: getLocalNutritionDateRange().to,
        mealType: 'dinner',
        foodName: 'Meal',
        calories: 650,
        proteinGrams: 32,
        carbohydrateGrams: 70,
        fatGrams: 20,
        fiberGrams: 9,
        waterMl: 400,
      },
    ]);

    render(
      <SevenDayNutritionSummary
        targets={{
          calories: 2000,
          proteinGrams: 100,
          carbohydrateGrams: 240,
          fatGrams: 65,
          fiberGrams: 30,
          waterMl: 2200,
        }}
      />
    );

    expect(await screen.findByText('650 kcal')).toBeInTheDocument();
    expect(screen.getAllByText('No entries logged')).toHaveLength(6);
    expect(screen.getByText(/not recommendations/)).toBeInTheDocument();
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/nutrition/entries', {
        params: getLocalNutritionDateRange(),
      });
    });
  });
});
