import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/ai/service/ai-request.service', () => ({
  runAiRequestService: vi.fn(),
  getAiUsageService: vi.fn(),
  listSavedAiResultsService: vi.fn(),
}));
vi.mock('@/features/nutrition/service/nutrition.service', () => ({ getNutritionTargetsService: vi.fn() }));

import { getAiUsageService, runAiRequestService } from '@/features/ai/service/ai-request.service';
import { generateAiMealIdeasService } from '@/features/nutrition/service/ai-meal.service';
import { getNutritionTargetsService } from '@/features/nutrition/service/nutrition.service';
import type { AiMeal } from '@/features/nutrition/validations/ai-meal.validation';

const userId = '507f1f77bcf86cd799439011';
const meal = (name: string, allergens: AiMeal['allergens']): AiMeal => ({
  name, summary: 's', ingredients: [{ name: 'eggs', amount: '2' }], missingIngredients: [], steps: ['Cook.'], allergens,
  nutritionEstimate: { calories: 300, proteinGrams: 20, carbohydrateGrams: 10, fatGrams: 15, fiberGrams: 2 }, fitsTargets: 'ok',
});
const input = { ingredients: ['Eggs', 'rice ', 'eggs'], excludedAllergens: ['milk' as const], preference: 'any' as const };

describe('generateAiMealIdeasService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getNutritionTargetsService).mockResolvedValue({
      data: { calories: 2200, proteinGrams: 150, carbohydrateGrams: 220, fatGrams: 70, fiberGrams: 30, waterMl: 2500 }, status: 200,
    });
    vi.mocked(getAiUsageService).mockResolvedValue({ data: { used: 5, limit: 5 }, status: 200 });
  });

  it('sends normalized ingredients and the user\'s macro targets, and removes meals with excluded allergens', async () => {
    vi.mocked(runAiRequestService).mockResolvedValue({
      data: { source: 'ai', data: { meals: [meal('Egg fried rice', ['eggs']), meal('Rice pudding', ['milk'])] }, usage: { used: 1, limit: 5 } },
      status: 200,
    });

    const result = await generateAiMealIdeasService(userId, input);

    const request = vi.mocked(runAiRequestService).mock.calls[0][0];
    expect(JSON.parse(request.cacheInput)).toMatchObject({
      ingredients: ['eggs', 'rice'], dailyTargets: { calories: 2200, proteinGrams: 150, fiberGrams: 30 },
    });
    expect(request.user).toContain('<user_input>');
    expect(result.data).toMatchObject({ source: 'ai', meals: [{ name: 'Egg fried rice' }], usage: { used: 1, limit: 5 } });
  });

  it('falls back to library recipes with a notice when the AI request fails', async () => {
    vi.mocked(runAiRequestService).mockResolvedValue({ data: { error: 'AI_DAILY_LIMIT_REACHED' }, status: 429 });

    const result = await generateAiMealIdeasService(userId, { ...input, excludedAllergens: [] });

    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({ source: 'library', meals: [], notice: 'AI_DAILY_LIMIT_REACHED', usage: { used: 5, limit: 5 } });
    expect('error' in result.data ? [] : result.data.libraryRecipes.map(({ id }) => id)).toContain('egg-oat-pancakes');
  });

  it('works without saved nutrition targets', async () => {
    vi.mocked(getNutritionTargetsService).mockResolvedValue({ data: null, status: 200 });
    vi.mocked(runAiRequestService).mockResolvedValue({ data: { source: 'saved', data: { meals: [] }, usage: { used: 0, limit: 5 } }, status: 200 });

    await generateAiMealIdeasService(userId, input);

    expect(JSON.parse(vi.mocked(runAiRequestService).mock.calls[0][0].cacheInput).dailyTargets).toBeNull();
  });
});
