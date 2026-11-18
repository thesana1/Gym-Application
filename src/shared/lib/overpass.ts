import { z } from 'zod';

import { APP_NAME } from '@/shared/const/app.const';
import { OVERPASS_API_URL, OVERPASS_QUERY_TIMEOUT_S, OVERPASS_TIMEOUT_MS } from '@/shared/const/gyms.const';

export type OverpassPlace = {
  id: string;
  lat: number;
  lng: number;
  tags: Record<string, string>;
};

const OverpassResponseSchema = z.object({
  elements: z.array(z.object({
    type: z.string(),
    id: z.number(),
    lat: z.number().optional(),
    lon: z.number().optional(),
    // Ways and relations have no point of their own; `out center` adds one.
    center: z.object({ lat: z.number(), lon: z.number() }).optional(),
    tags: z.record(z.string(), z.string()).optional(),
  })),
});

const gymQuery = (lat: number, lng: number, radiusMeters: number) => {
  const around = `(around:${radiusMeters},${lat},${lng})`;
  return `[out:json][timeout:${OVERPASS_QUERY_TIMEOUT_S}];`
    + `(nwr["leisure"="fitness_centre"]${around};nwr["amenity"="gym"]${around};);out center 60;`;
};

class OverpassClient {
  // Gyms and fitness centres around a point. Returns null when the service fails or answers with something unexpected.
  async findGyms(lat: number, lng: number, radiusMeters: number): Promise<OverpassPlace[] | null> {
    let response: Response;
    try {
      response = await fetch(OVERPASS_API_URL, {
        method: 'POST',
        // Overpass rejects requests without a meaningful User-Agent (406/429).
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': `${APP_NAME}/1.0` },
        body: new URLSearchParams({ data: gymQuery(lat, lng, radiusMeters) }).toString(),
        signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
        cache: 'no-store',
      });
    } catch {
      return null;
    }
    if (!response.ok) return null;

    const parsed = OverpassResponseSchema.safeParse(await response.json().catch(() => null));
    if (!parsed.success) return null;

    return parsed.data.elements.flatMap((element) => {
      const point = element.center ?? (element.lat !== undefined && element.lon !== undefined ? { lat: element.lat, lon: element.lon } : null);
      if (!point) return [];
      return [{ id: `${element.type}/${element.id}`, lat: point.lat, lng: point.lon, tags: element.tags ?? {} }];
    });
  }
}

export const overpass = new OverpassClient();
export { OverpassClient };
