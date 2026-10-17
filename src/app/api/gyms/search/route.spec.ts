import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/features/gyms/service/gym-search.service', () => ({
  findNearbyGymsService: vi.fn(),
}));

import { findNearbyGymsService } from '@/features/gyms/service/gym-search.service';
import { auth } from '@/shared/lib/auth';

import { GET } from './route';

const mockAuth = vi.mocked(auth);
const mockFindNearbyGyms = vi.mocked(findNearbyGymsService);
const makeRequest = (location: string | null) =>
  new NextRequest(
    `http://localhost/api/gyms/search${location === null ? '' : `?location=${encodeURIComponent(location)}`}`
  );

describe('GET /api/gyms/search', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires an authenticated session', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const response = await GET(makeRequest('Seattle'));

    expect(response.status).toBe(401);
    expect(mockFindNearbyGyms).not.toHaveBeenCalled();
  });

  it('rejects missing or invalid search locations', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as never);

    const response = await GET(makeRequest(null));

    expect(response.status).toBe(400);
    expect(mockFindNearbyGyms).not.toHaveBeenCalled();
  });

  it('returns the service result for a valid locality', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as never);
    mockFindNearbyGyms.mockResolvedValueOnce({
      data: {
        searchLocation: 'Seattle',
        gyms: [],
        radiusKm: 5,
        attribution: 'OpenStreetMap contributors',
      },
      status: 200,
    });

    const response = await GET(makeRequest('Seattle'));

    expect(response.status).toBe(200);
    expect(mockFindNearbyGyms).toHaveBeenCalledWith({ location: 'Seattle' });
    await expect(response.json()).resolves.toMatchObject({
      searchLocation: 'Seattle',
      gyms: [],
    });
  });
});
