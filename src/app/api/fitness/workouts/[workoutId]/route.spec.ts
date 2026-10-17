import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/fitness/service/workout-log.service', () => ({
  deleteWorkoutLogService: vi.fn(),
  updateWorkoutLogService: vi.fn(),
}));
vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import {
  deleteWorkoutLogService,
  updateWorkoutLogService,
} from '@/features/fitness/service/workout-log.service';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

import { DELETE, PATCH } from './route';

const mockAuth = vi.mocked(auth);
const mockDelete = vi.mocked(deleteWorkoutLogService);
const mockUpdate = vi.mocked(updateWorkoutLogService);
const mockValidate = vi.mocked(validateBody);
const USER_ID = '507f1f77bcf86cd799439011';
const WORKOUT_ID = '507f1f77bcf86cd799439012';
const context = { params: Promise.resolve({ workoutId: WORKOUT_ID }) };
const request = new NextRequest(
  'http://localhost/api/fitness/workouts/507f1f77bcf86cd799439012',
  { method: 'PATCH' }
);

describe('/api/fitness/workouts/[workoutId]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires authentication before accepting workout updates', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await PATCH(request, context);

    expect(response.status).toBe(401);
    expect(mockValidate).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('validates the id and updates only the authenticated user workout', async () => {
    const body = {
      title: 'Workout',
      exercises: [
        { exerciseId: 'bird-dog', sets: [{ repetitions: 10 }] },
      ],
    };
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockValidate.mockResolvedValueOnce({ data: body } as never);
    mockUpdate.mockResolvedValueOnce({
      data: { id: WORKOUT_ID, title: 'Workout' },
      status: 200,
    } as never);

    const response = await PATCH(request, context);

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(USER_ID, WORKOUT_ID, body);
  });

  it('returns not found for malformed ids and does not delete a record', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);

    const response = await DELETE(
      request,
      { params: Promise.resolve({ workoutId: 'bad-id' }) }
    );

    expect(response.status).toBe(404);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('deletes only the authenticated user workout', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockDelete.mockResolvedValueOnce({
      data: { deleted: true },
      status: 200,
    });

    const response = await DELETE(request, context);

    expect(response.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith(USER_ID, WORKOUT_ID);
  });
});
