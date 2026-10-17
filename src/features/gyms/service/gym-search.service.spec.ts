import { afterEach, describe, expect, it, vi } from 'vitest';

import { findNearbyGymsService } from './gym-search.service';

const originalFetch = globalThis.fetch;

const providerResponse = (data: unknown) =>
  new Response(JSON.stringify(data), { status: 200 });

describe('findNearbyGymsService', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it('searches near the geocoded locality and returns only mapped details', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        providerResponse([
          {
            lat: '47.6',
            lon: '-122.3',
            display_name: 'Seattle, Washington, United States',
          },
        ])
      )
      .mockResolvedValueOnce(
        providerResponse({
          elements: [
            {
              type: 'way',
              id: 12,
              center: { lat: 47.61, lon: -122.3 },
              tags: {
                name: 'Community Fitness',
                'addr:street': 'Pine Street',
                'addr:housenumber': '10',
                fee: 'yes',
                opening_hours: 'Mo-Fr 06:00-20:00',
                website: 'https://example.com',
              },
            },
            {
              type: 'node',
              id: 13,
              lat: 47.62,
              lon: -122.3,
              tags: {},
            },
          ],
        })
      );
    globalThis.fetch = fetchMock;

    const result = await findNearbyGymsService({ location: 'Seattle' });

    expect(result.status).toBe(200);
    if ('error' in result.data) throw new Error(result.data.error);
    expect(result.data.searchLocation).toBe('Seattle, Washington, United States');
    expect(result.data.gyms).toHaveLength(2);
    expect(result.data.gyms[0]).toMatchObject({
      name: 'Community Fitness',
      address: '10 Pine Street',
      fee: 'yes',
      openingHours: 'Mo-Fr 06:00-20:00',
      website: 'https://example.com',
    });
    expect(result.data.gyms[1]).toMatchObject({
      name: 'Unnamed fitness facility',
      distanceKm: 2.2,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: { 'User-Agent': 'Gym-Application/0.1.0' },
      next: { revalidate: 86400 },
    });
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      next: { revalidate: 3600 },
    });
  });

  it('returns not found when the geocoder has no matching locality', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce(providerResponse([]));

    const result = await findNearbyGymsService({ location: 'No such place' });

    expect(result).toEqual({
      data: { error: 'LOCATION_NOT_FOUND' },
      status: 404,
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('reports unavailable provider requests explicitly', async () => {
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new TypeError('network failure'));

    const result = await findNearbyGymsService({ location: 'Seattle' });

    expect(result).toEqual({
      data: { error: 'GEOCODER_UNAVAILABLE' },
      status: 503,
    });
  });

  it('rejects malformed provider payloads rather than fabricating results', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce(providerResponse({ unexpected: true }));

    const result = await findNearbyGymsService({ location: 'Seattle' });

    expect(result).toEqual({
      data: { error: 'INVALID_GEOCODER_RESPONSE' },
      status: 502,
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
