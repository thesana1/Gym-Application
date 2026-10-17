import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/coaches/service/coach.service', () => ({
  listCoachProfilesForModerationService: vi.fn(),
  moderateCoachProfileService: vi.fn(),
}));

import {
  listCoachProfilesForModerationService,
  moderateCoachProfileService,
} from '@/features/coaches/service/coach.service';
import { auth } from '@/shared/lib/auth';

import { GET, PATCH } from './route';

const mockAuth = vi.mocked(auth);
const mockList = vi.mocked(listCoachProfilesForModerationService);
const mockModerate = vi.mocked(moderateCoachProfileService);
const ADMIN_ID = '507f1f77bcf86cd799439011';
const PROFILE_ID = '507f1f77bcf86cd799439012';

describe('/api/coaches/admin', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires an authenticated administrator to review coach profiles', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('rejects authenticated non-administrators', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: ADMIN_ID, role: 'user' },
    } as never);

    const response = await GET();

    expect(response.status).toBe(403);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('records moderation decisions against the authenticated admin', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: ADMIN_ID, role: 'admin' },
    } as never);
    mockModerate.mockResolvedValueOnce({
      data: { id: PROFILE_ID, verificationStatus: 'verified' },
      status: 200,
    } as never);
    const request = new NextRequest('http://localhost/api/coaches/admin', {
      method: 'PATCH',
      body: JSON.stringify({
        profileId: PROFILE_ID,
        decision: 'verified',
        confirmedCredentials: true,
        expectedRevision: 2,
      }),
    });

    const response = await PATCH(request);

    expect(response.status).toBe(200);
    expect(mockModerate).toHaveBeenCalledWith(ADMIN_ID, {
      profileId: PROFILE_ID,
      decision: 'verified',
      confirmedCredentials: true,
      expectedRevision: 2,
    });
  });
});
