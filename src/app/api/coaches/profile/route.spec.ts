import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/coaches/service/coach.service', () => ({
  getOwnCoachProfileService: vi.fn(),
  saveOwnCoachProfileService: vi.fn(),
}));

import {
  getOwnCoachProfileService,
  saveOwnCoachProfileService,
} from '@/features/coaches/service/coach.service';
import { auth } from '@/shared/lib/auth';

import { GET, PUT } from './route';

const mockAuth = vi.mocked(auth);
const mockGetProfile = vi.mocked(getOwnCoachProfileService);
const mockSaveProfile = vi.mocked(saveOwnCoachProfileService);
const USER_ID = '507f1f77bcf86cd799439011';
const profile = {
  displayName: 'Coach Example',
  bio: 'An experienced coach who helps people build sustainable routines.',
  experienceYears: 8,
  qualifications: [{ title: 'Fitness certification' }],
  specializations: ['strength-training'],
  languages: ['English'],
  availabilityNote: '',
};

describe('/api/coaches/profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires authentication before reading an application', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockGetProfile).not.toHaveBeenCalled();
  });

  it('loads only the signed-in coach profile', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockGetProfile.mockResolvedValueOnce({ data: null, status: 200 });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mockGetProfile).toHaveBeenCalledWith(USER_ID);
  });

  it('saves coach applications under the authenticated user id', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockSaveProfile.mockResolvedValueOnce({
      data: { id: 'profile-id', verificationStatus: 'pending' },
      status: 200,
    } as never);
    const request = new NextRequest('http://localhost/api/coaches/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });

    const response = await PUT(request);

    expect(response.status).toBe(200);
    expect(mockSaveProfile).toHaveBeenCalledWith(USER_ID, profile);
  });
});
