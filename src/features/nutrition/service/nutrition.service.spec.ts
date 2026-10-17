import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/nutrition/repository/nutrition.repository', () => ({
  nutritionRepository: {
    findTargetsByUserId: vi.fn(),
    upsertTargets: vi.fn(),
    findEntriesByUserAndDate: vi.fn(),
    findEntriesByUserAndDateRange: vi.fn(),
    createEntry: vi.fn(),
    updateEntry: vi.fn(),
    deleteEntry: vi.fn(),
  },
}));

import { nutritionRepository } from '@/features/nutrition/repository/nutrition.repository';
import {
  createNutritionEntryService,
  deleteNutritionEntryService,
  listNutritionEntriesInRangeService,
  listNutritionEntriesService,
  saveNutritionTargetsService,
  updateNutritionEntryService,
} from '@/features/nutrition/service/nutrition.service';
import { NutritionEntrySchema } from '@/features/nutrition/validations/nutrition.validation';


const mockRepository = vi.mocked(nutritionRepository);

const makeEntryDocument = () =>
  ({
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    userId: 'user-one',
    date: '2026-10-04',
    mealType: 'lunch',
    foodName: 'Rice and beans',
    calories: 560,
    proteinGrams: 22,
    carbohydrateGrams: 88,
    fatGrams: 11,
    fiberGrams: 14,
    waterMl: null,
    notes: null,
  }) as never;

const entry = NutritionEntrySchema.parse({
  date: '2026-10-04',
  mealType: 'lunch',
  foodName: 'Rice and beans',
  calories: '560',
  proteinGrams: '22',
  carbohydrateGrams: '88',
  fatGrams: '11',
  fiberGrams: '14',
});

describe('nutrition service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists entries by authenticated user and calendar date', async () => {
    mockRepository.findEntriesByUserAndDate.mockResolvedValueOnce([
      makeEntryDocument(),
    ]);

    const result = await listNutritionEntriesService('user-one', '2026-10-04');

    expect(mockRepository.findEntriesByUserAndDate).toHaveBeenCalledWith(
      'user-one',
      '2026-10-04'
    );
    expect(result.data).toMatchObject([
      { foodName: 'Rice and beans', calories: 560, waterMl: undefined },
    ]);
  });

  it('lists a bounded date range for the authenticated user', async () => {
    mockRepository.findEntriesByUserAndDateRange.mockResolvedValueOnce([
      makeEntryDocument(),
    ]);

    const result = await listNutritionEntriesInRangeService(
      'user-one',
      '2026-09-28',
      '2026-10-04'
    );

    expect(mockRepository.findEntriesByUserAndDateRange).toHaveBeenCalledWith(
      'user-one',
      '2026-09-28',
      '2026-10-04'
    );
    expect(result.data).toMatchObject([
      { date: '2026-10-04', foodName: 'Rice and beans' },
    ]);
  });

  it('creates and updates entries only for the supplied user', async () => {
    mockRepository.createEntry.mockResolvedValueOnce(makeEntryDocument());
    mockRepository.updateEntry.mockResolvedValueOnce(makeEntryDocument());

    const created = await createNutritionEntryService('user-one', entry);
    const updated = await updateNutritionEntryService(
      'user-two',
      '507f1f77bcf86cd799439011',
      entry
    );

    expect(mockRepository.createEntry).toHaveBeenCalledWith('user-one', entry);
    expect(mockRepository.updateEntry).toHaveBeenCalledWith(
      'user-two',
      '507f1f77bcf86cd799439011',
      entry
    );
    expect(created.status).toBe(201);
    expect(updated.status).toBe(200);
  });

  it('saves manually selected targets under the current user', async () => {
    const targets = {
      calories: 2000,
      proteinGrams: 100,
      carbohydrateGrams: 240,
      fatGrams: 65,
      fiberGrams: 30,
      waterMl: 2200,
    };
    mockRepository.upsertTargets.mockResolvedValueOnce({
      userId: 'user-one',
      ...targets,
    } as never);

    const result = await saveNutritionTargetsService('user-one', targets);

    expect(mockRepository.upsertTargets).toHaveBeenCalledWith('user-one', targets);
    expect(result.data).toEqual(targets);
  });

  it('does not reveal or delete entries that are not owned by the user', async () => {
    mockRepository.updateEntry.mockResolvedValueOnce(null);
    mockRepository.deleteEntry.mockResolvedValueOnce(false);

    const updated = await updateNutritionEntryService(
      'user-one',
      '507f1f77bcf86cd799439099',
      entry
    );
    const deleted = await deleteNutritionEntryService(
      'user-one',
      '507f1f77bcf86cd799439099'
    );

    expect(updated).toMatchObject({ status: 404, data: { error: 'NOT_FOUND' } });
    expect(deleted).toMatchObject({ status: 404, data: { error: 'NOT_FOUND' } });
  });
});
