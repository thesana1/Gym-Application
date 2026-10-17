import {
  mapOverpassGyms,
  NominatimResultsSchema,
  type GymSearchResult,
} from '@/features/gyms/service/gym-search.mapper';
import type { GymSearchType } from '@/features/gyms/validations/gym-search.validation';
import type { ServiceResult } from '@/shared/types/common';

const getProviderUrl = (environmentVariable: string, fallback: string) => {
  const value = process.env[environmentVariable] ?? fallback;
  const url = new URL(value);
  if (url.protocol !== 'https:') {
    throw new Error(`${environmentVariable} must use HTTPS`);
  }
  return url;
};

let geocoderQueue: Promise<void> = Promise.resolve();
let lastGeocoderRequestAt = 0;

const fetchNominatim = (url: URL) => {
  const request = geocoderQueue.then(async () => {
    const waitMs = Math.max(0, 1000 - (Date.now() - lastGeocoderRequestAt));
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    lastGeocoderRequestAt = Date.now();
    return fetchProviderData(url, 86400);
  });
  geocoderQueue = request.then(
    () => undefined,
    () => undefined
  );
  return request;
};

const fetchProviderData = async (url: URL, revalidateSeconds: number) => {
  try {
    return await fetch(url, {
      headers: { 'User-Agent': 'Gym-Application/0.1.0' },
      signal: AbortSignal.timeout(12000),
      next: { revalidate: revalidateSeconds },
    });
  } catch (error) {
    if (
      error instanceof TypeError ||
      (error instanceof DOMException && error.name === 'TimeoutError')
    ) {
      return null;
    }
    throw error;
  }
};

export async function findNearbyGymsService(
  input: GymSearchType
): Promise<ServiceResult<GymSearchResult>> {
  const geocoderUrl = getProviderUrl(
    'OSM_NOMINATIM_URL',
    'https://nominatim.openstreetmap.org/search'
  );
  geocoderUrl.searchParams.set('format', 'jsonv2');
  geocoderUrl.searchParams.set('limit', '1');
  geocoderUrl.searchParams.set('q', input.location);

  const geocoderResponse = await fetchNominatim(geocoderUrl);
  if (!geocoderResponse) {
    return { data: { error: 'GEOCODER_UNAVAILABLE' }, status: 503 };
  }
  if (!geocoderResponse.ok) {
    return {
      data: { error: 'GEOCODER_UNAVAILABLE' },
      status: geocoderResponse.status === 429 ? 503 : 502,
    };
  }

  let geocoderJson: unknown;
  try {
    geocoderJson = await geocoderResponse.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { data: { error: 'INVALID_GEOCODER_RESPONSE' }, status: 502 };
    }
    throw error;
  }
  const geocoderResult = NominatimResultsSchema.safeParse(geocoderJson);
  if (!geocoderResult.success) {
    return { data: { error: 'INVALID_GEOCODER_RESPONSE' }, status: 502 };
  }
  const place = geocoderResult.data[0];
  if (!place) {
    return { data: { error: 'LOCATION_NOT_FOUND' }, status: 404 };
  }

  const latitude = Number(place.lat);
  const longitude = Number(place.lon);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return { data: { error: 'INVALID_GEOCODER_RESPONSE' }, status: 502 };
  }

  const overpassUrl = getProviderUrl(
    'OSM_OVERPASS_URL',
    'https://overpass-api.de/api/interpreter'
  );
  const query = [
    '[out:json][timeout:15];',
    '(',
    `nwr(around:5000,${latitude},${longitude})["leisure"="fitness_centre"];`,
    `nwr(around:5000,${latitude},${longitude})["amenity"="gym"];`,
    `nwr(around:5000,${latitude},${longitude})["sport"~"fitness|gym"];`,
    ');',
    'out center tags 50;',
  ].join('');
  overpassUrl.searchParams.set('data', query);

  const overpassResponse = await fetchProviderData(overpassUrl, 3600);
  if (!overpassResponse) {
    return { data: { error: 'GYM_DATA_UNAVAILABLE' }, status: 503 };
  }
  if (!overpassResponse.ok) {
    return {
      data: { error: 'GYM_DATA_UNAVAILABLE' },
      status: overpassResponse.status === 429 ? 503 : 502,
    };
  }

  let overpassJson: unknown;
  try {
    overpassJson = await overpassResponse.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { data: { error: 'INVALID_GYM_DATA_RESPONSE' }, status: 502 };
    }
    throw error;
  }
  const gyms = mapOverpassGyms(overpassJson, latitude, longitude);
  if (!gyms) {
    return { data: { error: 'INVALID_GYM_DATA_RESPONSE' }, status: 502 };
  }

  return {
    data: {
      searchLocation: place.display_name,
      gyms,
      radiusKm: 5,
      attribution: 'OpenStreetMap contributors',
    },
    status: 200,
  };
}
