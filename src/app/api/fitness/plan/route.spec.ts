import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/fitness/service/workout-plan-customization.service', () => ({
  getWorkoutPlanCustomizationService: vi.fn(),
  saveWorkoutPlanCustomizationService: vi.fn(),
}));

import {
  getWorkoutPlanCustomizationService,
  saveWorkoutPlanCustomizationService,
} from '@/features/fitness/service/workout-plan-customization.service';
import { auth } from '@/shared/lib/auth';

import { GET, PUT } from './route';

const mockAuth = vi.mocked(auth);
const mockGetPlan = vi.mocked(getWorkoutPlanCustomizationService);
const mockSavePlan = vi.mocked(saveWorkoutPlanCustomizationService);
const USER_ID = '507f1f77bcf86cd799439011';
const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/fitness/plan', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('/api/fitness/plan', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires authentication when reading the plan', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockGetPlan).not.toHaveBeenCalled();
  });

  it('loads the signed-in member plan', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockGetPlan.mockResolvedValueOnce({
      data: { plan: {} as never, defaultPlan: {} as never, options: [] },
      status: 200,
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mockGetPlan).toHaveBeenCalledWith(USER_ID);
  });

  it('validates and saves choices under the signed-in member', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockSavePlan.mockResolvedValueOnce({
      data: { plan: {} as never, defaultPlan: {} as never, options: [] },
      status: 200,
    });

    const response = await PUT(
      makeRequest({
        overrides: [
          {
            sessionIndex: 0,
            exerciseIds: ['reverse-lunge', 'hip-hinge'],
          },
        ],
      })
    );

    expect(response.status).toBe(200);
    expect(mockSavePlan).toHaveBeenCalledWith(USER_ID, {
      overrides: [
        { sessionIndex: 0, exerciseIds: ['reverse-lunge', 'hip-hinge'] },
      ],
    });
  });

  it('rejects duplicate exercise ids before calling the service', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);

    const response = await PUT(
      makeRequest({
        overrides: [
          { sessionIndex: 0, exerciseIds: ['dead-bug', 'dead-bug'] },
        ],
      })
    );

    expect(response.status).toBe(400);
    expect(mockSavePlan).not.toHaveBeenCalled();
  });
});
