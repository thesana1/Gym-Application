import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/overpass', () => ({ overpass: { findGyms: vi.fn() } }));

import { findNearbyGymsService } from '@/features/gyms/service/nearby-gyms.service';
import { overpass } from '@/shared/lib/overpass';

const mockFindGyms = vi.mocked(overpass.findGyms);

describe('findNearbyGymsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns gyms nearest first with distance, address and hours', async () => {
    mockFindGyms.mockResolvedValueOnce([
      { id: 'node/2', lat: 41.72, lng: 44.8, tags: { name: 'Far Gym' } },
      {
        id: 'node/1', lat: 41.701, lng: 44.8,
        tags: { name: 'Near Gym', 'addr:street': 'Rustaveli Ave', 'addr:housenumber': '12', 'addr:city': 'Tbilisi', opening_hours: 'Mo-Su 07:00-23:00' },
      },
    ]);

    const result = await findNearbyGymsService({ lat: 41.7, lng: 44.8 });

    expect(result.status).toBe(200);
    expect(result.data).toEqual([
      {
        id: 'node/1', name: 'Near Gym', lat: 41.701, lng: 44.8, distanceMeters: 111,
        address: 'Rustaveli Ave 12, Tbilisi', openingHours: 'Mo-Su 07:00-23:00',
      },
      { id: 'node/2', name: 'Far Gym', lat: 41.72, lng: 44.8, distanceMeters: 2224, address: null, openingHours: null },
    ]);
    expect(mockFindGyms).toHaveBeenCalledWith(41.7, 44.8, 5000);
  });

  it('keeps named gyms ahead of unnamed ones when trimming to the limit', async () => {
    const unnamed = Array.from({ length: 10 }, (_, index) => ({ id: `node/u${index}`, lat: 41.7, lng: 44.8 + index * 0.0001, tags: {} }));
    mockFindGyms.mockResolvedValueOnce([...unnamed, { id: 'node/named', lat: 41.75, lng: 44.8, tags: { name: 'Named' } }]);

    const result = await findNearbyGymsService({ lat: 41.7, lng: 44.8 });

    const gyms = result.data as { id: string }[];
    expect(gyms).toHaveLength(10);
    expect(gyms.map(({ id }) => id)).toContain('node/named');
  });

  it('returns 502 when the map service fails', async () => {
    mockFindGyms.mockResolvedValueOnce(null);
    expect(await findNearbyGymsService({ lat: 0, lng: 0 })).toEqual({ data: { error: 'GYMS_UNAVAILABLE' }, status: 502 });
  });
});
