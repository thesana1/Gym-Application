import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/fitness/service/training-activity.service', () => ({
  getTrainingActivityService: vi.fn(),
  isAllowedTrainingActivityWeeks: vi.fn(
    (value: number) => value === 4 || value === 8
  ),
}));

import { getTrainingActivityService } from '@/features/fitness/service/training-activity.service';
import { auth } from '@/shared/lib/auth';

import { GET } from './route';

const mockAuth = vi.mocked(auth);
const mockGetActivity = vi.mocked(getTrainingActivityService);
const USER_ID = '507f1f77bcf86cd799439011';
const makeRequest = (weeks?: string) =>
  new NextRequest(
    `http://localhost/api/fitness/activity${weeks === undefined ? '' : `?weeks=${weeks}`}`
  );

describe('GET /api/fitness/activity', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires an authenticated member', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    expect(mockGetActivity).not.toHaveBeenCalled();
  });

  it('defaults to four periods and scopes reports to the authenticated member', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockGetActivity.mockResolvedValueOnce({
      data: { weeks: 4, periods: [] },
      status: 200,
    });

    const response = await GET(makeRequest());

    expect(response.status).toBe(200);
    expect(mockGetActivity).toHaveBeenCalledWith(USER_ID, 4);
  });

  it('accepts eight periods when explicitly requested', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockGetActivity.mockResolvedValueOnce({
      data: { weeks: 8, periods: [] },
      status: 200,
    });

    const response = await GET(makeRequest('8'));

    expect(response.status).toBe(200);
    expect(mockGetActivity).toHaveBeenCalledWith(USER_ID, 8);
  });

  it.each(['0', '5', '52', 'invalid'])(
    'rejects unsupported periods: %s',
    async (weeks) => {
      mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);

      const response = await GET(makeRequest(weeks));

      expect(response.status).toBe(400);
      expect(mockGetActivity).not.toHaveBeenCalled();
    }
  );
});
