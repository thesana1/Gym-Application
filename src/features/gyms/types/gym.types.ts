export type NearbyGym = {
  id: string;
  // null when the map has no name for this gym.
  name: string | null;
  lat: number;
  lng: number;
  distanceMeters: number;
  address: string | null;
  openingHours: string | null;
  // Main photo from the map data; null when the gym has none.
  photoUrl: string | null;
};
