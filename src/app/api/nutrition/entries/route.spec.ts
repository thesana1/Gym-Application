import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/nutrition/service/nutrition.service', () => ({
  createNutritionEntryService: vi.fn(),
  listNutritionEntriesInRangeService: vi.fn(),
  listNutritionEntriesService: vi.fn(),
}));
vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import {
  createNutritionEntryService,
  listNutritionEntriesInRangeService,
  listNutritionEntriesService,
} from '@/features/nutrition/service/nutrition.service';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

import { GET, POST } from './route';

const mockAuth = vi.mocked(auth);
const mockCreate = vi.mocked(createNutritionEntryService);
const mockList = vi.mocked(listNutritionEntriesService);
const mockListRange = vi.mocked(listNutritionEntriesInRangeService);
const mockValidate = vi.mocked(validateBody);
const USER_ID = '507f1f77bcf86cd799439011';
const entry = {
  date: '2026-10-04',
  mealType: 'lunch',
  foodName: 'Rice and beans',
  calories: 560,
  proteinGrams: 22,
  carbohydrateGrams: 88,
  fatGrams: 11,
  fiberGrams: 14,
};

describe('/api/nutrition/entries', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires authentication to list a food log', async () => {
    mockAuth.mockResolvedValueOnce(null as never);
    const request = new NextRequest(
      'http://localhost/api/nutrition/entries?date=2026-10-04'
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('requires a valid date and lists entries for the current user', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockList.mockResolvedValueOnce({ data: [], status: 200 });
    const request = new NextRequest(
      'http://localhost/api/nutrition/entries?date=2026-10-04'
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockList).toHaveBeenCalledWith(USER_ID, '2026-10-04');
  });

  it('lists a date range for the authenticated member', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockListRange.mockResolvedValueOnce({ data: [], status: 200 });
    const request = new NextRequest(
      'http://localhost/api/nutrition/entries?from=2026-09-28&to=2026-10-04'
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockListRange).toHaveBeenCalledWith(
      USER_ID,
      '2026-09-28',
      '2026-10-04'
    );
  });

  it('validates food entries and creates them for the signed-in user', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockValidate.mockResolvedValueOnce({ data: entry } as never);
    mockCreate.mockResolvedValueOnce({
      data: { id: 'entry-id', foodName: 'Rice and beans' },
      status: 201,
    } as never);
    const request = new NextRequest('http://localhost/api/nutrition/entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(USER_ID, entry);
  });
});
