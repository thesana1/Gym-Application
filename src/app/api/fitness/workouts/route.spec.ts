import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/fitness/service/workout-log.service', () => ({
  createWorkoutLogService: vi.fn(),
  listWorkoutLogsService: vi.fn(),
}));
vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import {
  createWorkoutLogService,
  listWorkoutLogsService,
} from '@/features/fitness/service/workout-log.service';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

import { GET, POST } from './route';

const mockAuth = vi.mocked(auth);
const mockCreate = vi.mocked(createWorkoutLogService);
const mockList = vi.mocked(listWorkoutLogsService);
const mockValidate = vi.mocked(validateBody);

const USER_ID = '507f1f77bcf86cd799439011';
const validWorkout = {
  title: 'Workout',
  exercises: [
    { exerciseId: 'bodyweight-squat', sets: [{ repetitions: 10 }] },
  ],
};

const makeRequest = (url: string, method = 'GET') =>
  new NextRequest(url, { method, body: method === 'POST' ? '{}' : undefined });

describe('/api/fitness/workouts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires authentication for workout history', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await GET(makeRequest('http://localhost/api/fitness/workouts'));

    expect(response.status).toBe(401);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('validates history filters and scopes list to the signed-in user', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockList.mockResolvedValueOnce({ data: [], status: 200 });

    const response = await GET(
      makeRequest(
        'http://localhost/api/fitness/workouts?from=2026-10-01T00%3A00%3A00.000Z&exerciseId=bird-dog'
      )
    );

    expect(response.status).toBe(200);
    expect(mockList).toHaveBeenCalledWith(USER_ID, {
      from: '2026-10-01T00:00:00.000Z',
      exerciseId: 'bird-dog',
    });
  });

  it('rejects reversed date ranges', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);

    const response = await GET(
      makeRequest(
        'http://localhost/api/fitness/workouts?from=2026-10-04T00%3A00%3A00.000Z&to=2026-10-01T00%3A00%3A00.000Z'
      )
    );

    expect(response.status).toBe(400);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('validates new workout data and saves it for the authenticated user', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockValidate.mockResolvedValueOnce({ data: validWorkout } as never);
    mockCreate.mockResolvedValueOnce({
      data: { id: 'workout-id', title: 'Workout' },
      status: 201,
    } as never);

    const response = await POST(
      makeRequest('http://localhost/api/fitness/workouts', 'POST')
    );

    expect(response.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(USER_ID, validWorkout);
  });
});
