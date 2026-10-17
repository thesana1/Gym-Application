import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/nutrition/service/nutrition.service', () => ({
  getNutritionTargetsService: vi.fn(),
  saveNutritionTargetsService: vi.fn(),
}));
vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import {
  getNutritionTargetsService,
  saveNutritionTargetsService,
} from '@/features/nutrition/service/nutrition.service';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

import { GET, PUT } from './route';

const mockAuth = vi.mocked(auth);
const mockGet = vi.mocked(getNutritionTargetsService);
const mockSave = vi.mocked(saveNutritionTargetsService);
const mockValidate = vi.mocked(validateBody);
const USER_ID = '507f1f77bcf86cd799439011';

describe('/api/nutrition/targets', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires an authenticated user to read targets', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('reads and writes targets scoped to the current user', async () => {
    const targets = {
      calories: 2000,
      proteinGrams: 100,
      carbohydrateGrams: 240,
      fatGrams: 65,
      fiberGrams: 30,
      waterMl: 2200,
    };
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockGet.mockResolvedValueOnce({ data: null, status: 200 });
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockValidate.mockResolvedValueOnce({ data: targets } as never);
    mockSave.mockResolvedValueOnce({ data: targets, status: 200 } as never);

    const getResponse = await GET();
    const putResponse = await PUT(
      new NextRequest('http://localhost/api/nutrition/targets', {
        method: 'PUT',
        body: JSON.stringify(targets),
      })
    );

    expect(getResponse.status).toBe(200);
    expect(putResponse.status).toBe(200);
    expect(mockGet).toHaveBeenCalledWith(USER_ID);
    expect(mockSave).toHaveBeenCalledWith(USER_ID, targets);
  });
});
