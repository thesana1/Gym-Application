import { z } from 'zod';

export const NominatimResultsSchema = z.array(
  z.object({
    lat: z.string(),
    lon: z.string(),
    display_name: z.string(),
  })
);

const OverpassResultSchema = z.object({
  elements: z.array(
    z.object({
      type: z.enum(['node', 'way', 'relation']),
      id: z.number(),
      lat: z.number().optional(),
      lon: z.number().optional(),
      center: z.object({ lat: z.number(), lon: z.number() }).optional(),
      tags: z.record(z.string(), z.string()).default({}),
    })
  ),
});

export type NearbyGym = {
  id: string;
  name: string;
  distanceKm: number;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  fee?: string;
  operator?: string;
  wheelchair?: string;
  sports?: string;
};

export type GymSearchResult = {
  searchLocation: string;
  gyms: NearbyGym[];
  radiusKm: number;
  attribution: 'OpenStreetMap contributors';
};

const getDistanceKm = (
  sourceLatitude: number,
  sourceLongitude: number,
  targetLatitude: number,
  targetLongitude: number
) => {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDifference = radians(targetLatitude - sourceLatitude);
  const longitudeDifference = radians(targetLongitude - sourceLongitude);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(radians(sourceLatitude)) *
      Math.cos(radians(targetLatitude)) *
      Math.sin(longitudeDifference / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const getAddress = (tags: Record<string, string>) => {
  const street = [tags['addr:housenumber'], tags['addr:street']]
    .filter(Boolean)
    .join(' ');
  return tags['addr:full'] ?? [street, tags['addr:suburb'], tags['addr:city']]
    .filter(Boolean)
    .join(', ');
};

const toGym = (
  element: z.infer<typeof OverpassResultSchema>['elements'][number],
  latitude: number,
  longitude: number
): NearbyGym | null => {
  const gymLatitude = element.lat ?? element.center?.lat;
  const gymLongitude = element.lon ?? element.center?.lon;
  if (gymLatitude === undefined || gymLongitude === undefined) {
    return null;
  }

  const tags = element.tags;
  const website = tags.website ?? tags['contact:website'];
  const safeWebsite = website && /^https?:\/\//i.test(website) ? website : undefined;
  const address = getAddress(tags);

  return {
    id: `${element.type}/${element.id}`,
    name: tags.name ?? 'Unnamed fitness facility',
    distanceKm: Number(
      getDistanceKm(latitude, longitude, gymLatitude, gymLongitude).toFixed(1)
    ),
    ...(address ? { address } : {}),
    ...(tags.phone ?? tags['contact:phone']
      ? { phone: tags.phone ?? tags['contact:phone'] }
      : {}),
    ...(safeWebsite ? { website: safeWebsite } : {}),
    ...(tags.opening_hours ? { openingHours: tags.opening_hours } : {}),
    ...(tags.fee ? { fee: tags.fee } : {}),
    ...(tags.operator ? { operator: tags.operator } : {}),
    ...(tags.wheelchair ? { wheelchair: tags.wheelchair } : {}),
    ...(tags.sport ? { sports: tags.sport } : {}),
  };
};

export const mapOverpassGyms = (
  response: unknown,
  latitude: number,
  longitude: number
): NearbyGym[] | null => {
  const parsed = OverpassResultSchema.safeParse(response);
  if (!parsed.success) return null;

  return parsed.data.elements
    .map((element) => toGym(element, latitude, longitude))
    .filter((gym): gym is NearbyGym => gym !== null)
    .sort((first, second) => first.distanceKm - second.distanceKm);
};
