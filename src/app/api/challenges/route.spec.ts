import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/challenges/service/challenge.service', () => ({
  joinPersonalChallengeService: vi.fn(),
  leavePersonalChallengeService: vi.fn(),
  listPersonalChallengesService: vi.fn(),
}));

import {
  joinPersonalChallengeService,
  leavePersonalChallengeService,
  listPersonalChallengesService,
} from '@/features/challenges/service/challenge.service';
import { auth } from '@/shared/lib/auth';

import { DELETE, GET, POST } from './route';

const mockAuth = vi.mocked(auth);
const mockJoin = vi.mocked(joinPersonalChallengeService);
const mockLeave = vi.mocked(leavePersonalChallengeService);
const mockList = vi.mocked(listPersonalChallengesService);
const USER_ID = '507f1f77bcf86cd799439011';

describe('/api/challenges', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires authentication to list challenges', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('returns private challenge data for the authenticated user', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockList.mockResolvedValueOnce({ data: [], status: 200 });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mockList).toHaveBeenCalledWith(USER_ID);
  });

  it('joins only a catalog challenge under the authenticated user', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockJoin.mockResolvedValueOnce({
      data: {
        challengeId: 'build-consistency',
        joinedAt: '2026-10-05T00:00:00.000Z',
      },
      status: 200,
    });
    const request = new NextRequest('http://localhost/api/challenges', {
      method: 'POST',
      body: JSON.stringify({ challengeId: 'build-consistency' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockJoin).toHaveBeenCalledWith(USER_ID, 'build-consistency');
  });

  it('rejects unknown challenges before saving an enrollment', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    const request = new NextRequest('http://localhost/api/challenges', {
      method: 'POST',
      body: JSON.stringify({ challengeId: 'leaderboard' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mockJoin).not.toHaveBeenCalled();
  });

  it('scopes leaving a challenge to authenticated user and valid catalog id', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockLeave.mockResolvedValueOnce({ data: { left: true }, status: 200 });

    const response = await DELETE(
      new NextRequest(
        'http://localhost/api/challenges?challengeId=build-consistency',
        { method: 'DELETE' }
      )
    );

    expect(response.status).toBe(200);
    expect(mockLeave).toHaveBeenCalledWith(USER_ID, 'build-consistency');
  });
});
