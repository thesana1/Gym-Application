import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/fitness/service/training-schedule.service', () => ({
  getTrainingScheduleService: vi.fn(),
  saveTrainingScheduleService: vi.fn(),
}));

import {
  getTrainingScheduleService,
  saveTrainingScheduleService,
} from '@/features/fitness/service/training-schedule.service';
import { auth } from '@/shared/lib/auth';

import { GET, PUT } from './route';

const mockAuth = vi.mocked(auth);
const mockGetSchedule = vi.mocked(getTrainingScheduleService);
const mockSaveSchedule = vi.mocked(saveTrainingScheduleService);
const USER_ID = '507f1f77bcf86cd799439011';
const request = (body: unknown) =>
  new NextRequest('http://localhost/api/fitness/schedule', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('/api/fitness/schedule', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires authentication to read the schedule', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockGetSchedule).not.toHaveBeenCalled();
  });

  it('loads only the authenticated member schedule', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockGetSchedule.mockResolvedValueOnce({
      data: { sessions: [], assignments: [] },
      status: 200,
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mockGetSchedule).toHaveBeenCalledWith(USER_ID);
  });

  it('validates and saves assignments to the authenticated member', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockSaveSchedule.mockResolvedValueOnce({
      data: {
        sessions: [{ sessionIndex: 0, title: 'Full body A' }],
        assignments: [
          { weekday: 1, sessionIndex: 0, sessionTitle: 'Full body A' },
        ],
      },
      status: 200,
    });

    const response = await PUT(
      request({ assignments: [{ weekday: 1, sessionIndex: 0 }] })
    );

    expect(response.status).toBe(200);
    expect(mockSaveSchedule).toHaveBeenCalledWith(USER_ID, {
      assignments: [{ weekday: 1, sessionIndex: 0 }],
    });
  });

  it('rejects duplicate weekdays before calling the service', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);

    const response = await PUT(
      request({
        assignments: [
          { weekday: 1, sessionIndex: 0 },
          { weekday: 1, sessionIndex: 1 },
        ],
      })
    );

    expect(response.status).toBe(400);
    expect(mockSaveSchedule).not.toHaveBeenCalled();
  });

  it('requires authentication to save the schedule', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await PUT(
      request({ assignments: [{ weekday: 1, sessionIndex: 0 }] })
    );

    expect(response.status).toBe(401);
    expect(mockSaveSchedule).not.toHaveBeenCalled();
  });
});
