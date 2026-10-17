import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/fitness/service/fitness-profile.service', () => ({
  getFitnessProfileService: vi.fn(),
  saveFitnessProfileService: vi.fn(),
}));
vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import {
  getFitnessProfileService,
  saveFitnessProfileService,
} from '@/features/fitness/service/fitness-profile.service';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

import { GET, PUT } from './route';

const mockAuth = vi.mocked(auth);
const mockGetProfile = vi.mocked(getFitnessProfileService);
const mockSaveProfile = vi.mocked(saveFitnessProfileService);
const mockValidateBody = vi.mocked(validateBody);
const USER_ID = '507f1f77bcf86cd799439011';

const profile = {
  goal: 'strength',
  experience: 'beginner',
  age: undefined,
  heightCm: undefined,
  weightKg: undefined,
  trainingDaysPerWeek: undefined,
  availableEquipment: [],
};

const makeRequest = () =>
  new NextRequest('http://localhost/api/fitness/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
    headers: { 'Content-Type': 'application/json' },
  });

describe('/api/fitness/profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects profile reads without an authenticated user', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockGetProfile).not.toHaveBeenCalled();
  });

  it('reads only the authenticated user profile', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockGetProfile.mockResolvedValueOnce({ data: null, status: 200 });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mockGetProfile).toHaveBeenCalledWith(USER_ID);
  });

  it('rejects writes before parsing a body when unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await PUT(makeRequest());

    expect(response.status).toBe(401);
    expect(mockValidateBody).not.toHaveBeenCalled();
  });

  it('writes only to the authenticated user profile', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } } as never);
    mockValidateBody.mockResolvedValueOnce({ data: profile } as never);
    mockSaveProfile.mockResolvedValueOnce({ data: profile, status: 200 } as never);

    const response = await PUT(makeRequest());

    expect(response.status).toBe(200);
    expect(mockSaveProfile).toHaveBeenCalledWith(USER_ID, profile);
  });
});
