import type { NearbyGym } from '@/features/gyms/types/gym.types';
import type { NearbyGymsQueryType } from '@/features/gyms/validations/gym.validation';
import { NEARBY_GYMS_LIMIT, NEARBY_GYMS_RADIUS_METERS } from '@/shared/const/gyms.const';
import { overpass, type OverpassPlace } from '@/shared/lib/overpass';
import type { ServiceResult } from '@/shared/types/common';

const EARTH_RADIUS_METERS = 6_371_000;

// Straight-line (haversine) distance in meters.
const distanceMeters = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
  const rad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = rad(toLat - fromLat);
  const dLng = rad(toLng - fromLng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(fromLat)) * Math.cos(rad(toLat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a)));
};

const addressOf = (tags: Record<string, string>) => {
  const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ');
  const line = [street, tags['addr:city']].filter(Boolean).join(', ');
  return line || null;
};

// Main photo: a direct https `image` link, or a Wikimedia Commons file (resized by Commons itself).
const photoOf = (tags: Record<string, string>) => {
  if (tags.image?.startsWith('https://')) return tags.image;
  const commonsFile = tags.wikimedia_commons?.match(/^File:(.+)$/)?.[1];
  if (commonsFile) return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(commonsFile)}?width=640`;
  return null;
};

const toNearbyGym =(place: OverpassPlace, lat: number, lng: number): NearbyGym => ({
  id: place.id,
  name: place.tags.name ?? null,
  lat: place.lat,
  lng: place.lng,
  distanceMeters: distanceMeters(lat, lng, place.lat, place.lng),
  address: addressOf(place.tags),
  openingHours: place.tags.opening_hours ?? null,
  photoUrl: photoOf(place.tags),
});

export async function findNearbyGymsService({ lat, lng }: NearbyGymsQueryType): Promise<ServiceResult<NearbyGym[]>> {
  const places = await overpass.findGyms(lat, lng, NEARBY_GYMS_RADIUS_METERS);
  if (!places) return { data: { error: 'GYMS_UNAVAILABLE' }, status: 502 };

  const gyms = places
    .map((place) => toNearbyGym(place, lat, lng))
    // Named gyms first, then by distance.
    .sort((a, b) => Number(a.name === null) - Number(b.name === null) || a.distanceMeters - b.distanceMeters)
    .slice(0, NEARBY_GYMS_LIMIT)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
  return { data: gyms, status: 200 };
}
