// Public OpenStreetMap Overpass API. No key needed; the map data is © OpenStreetMap contributors (ODbL).
export const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
// The public server can be slow when busy, so the request may wait up to 45 s; the query itself is capped at 25 s.
export const OVERPASS_TIMEOUT_MS = 45_000;
export const OVERPASS_QUERY_TIMEOUT_S = 25;
export const OSM_COPYRIGHT_URL = 'https://www.openstreetmap.org/copyright';

export const NEARBY_GYMS_RADIUS_METERS = 5_000;
export const NEARBY_GYMS_LIMIT = 10;

// Approximate location from the visitor's IP, used only when the browser cannot give one. Free, no key, allows browser calls.
export const IP_LOCATION_URL = 'https://get.geojs.io/v1/ip/geo.json';

// Coordinates are rounded to about 100 m before they leave the browser.
export const LOCATION_DECIMALS = 3;
