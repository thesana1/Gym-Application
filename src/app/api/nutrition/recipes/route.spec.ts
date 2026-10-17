import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/nutrition/service/meal-generator.service', () => ({
  generateMealsService: vi.fn(),
}));
vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import { generateMealsService } from '@/features/nutrition/service/meal-generator.service';
import { validateBody } from '@/shared/middleware/validate-body';

import { POST } from './route';

const mockGenerate = vi.mocked(generateMealsService);
const mockValidate = vi.mocked(validateBody);

describe('POST /api/nutrition/recipes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns validation errors for invalid meal requests', async () => {
    mockValidate.mockResolvedValueOnce(
      NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 })
    );
    const request = new NextRequest(
      'http://localhost/api/nutrition/recipes',
      { method: 'POST', body: JSON.stringify({ ingredients: [] }) }
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('returns meal suggestions for validated ingredient requests', async () => {
    const input = {
      ingredients: ['rice', 'tomato'],
      excludedAllergens: [],
      preference: 'any',
    };
    mockValidate.mockResolvedValueOnce({ data: input } as never);
    mockGenerate.mockReturnValueOnce({
      data: { recipes: [], message: 'No match' },
      status: 200,
    });
    const request = new NextRequest(
      'http://localhost/api/nutrition/recipes',
      { method: 'POST', body: JSON.stringify(input) }
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockGenerate).toHaveBeenCalledWith(input);
  });
});
