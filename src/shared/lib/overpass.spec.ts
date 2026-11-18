import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OverpassClient } from '@/shared/lib/overpass';

describe('OverpassClient', () => {
  const fetchMock = vi.fn();
  let client: OverpassClient;

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    client = new OverpassClient();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('asks for gyms around the point and returns nodes and ways with a position', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      elements: [
        { type: 'node', id: 1, lat: 41.7, lon: 44.8, tags: { name: 'Iron Club' } },
        { type: 'way', id: 2, center: { lat: 41.71, lon: 44.81 } },
        { type: 'relation', id: 3 },
      ],
    }), { status: 200 }));

    const places = await client.findGyms(41.7, 44.8, 5000);

    expect(places).toEqual([
      { id: 'node/1', lat: 41.7, lng: 44.8, tags: { name: 'Iron Club' } },
      { id: 'way/2', lat: 41.71, lng: 44.81, tags: {} },
    ]);
    const [, init] = fetchMock.mock.calls[0];
    const query = new URLSearchParams(init.body).get('data');
    expect(query).toContain('"leisure"="fitness_centre"');
    expect(query).toContain('(around:5000,41.7,44.8)');
    expect(init.headers['User-Agent']).toBe('GainBase/1.0');
  });

  it('returns null when the service fails', async () => {
    fetchMock.mockResolvedValueOnce(new Response('busy', { status: 429 }));
    expect(await client.findGyms(0, 0, 5000)).toBeNull();
  });

  it('returns null when the request throws', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('network'));
    expect(await client.findGyms(0, 0, 5000)).toBeNull();
  });

  it('returns null for an unexpected answer', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ nope: true }), { status: 200 }));
    expect(await client.findGyms(0, 0, 5000)).toBeNull();
  });
});
