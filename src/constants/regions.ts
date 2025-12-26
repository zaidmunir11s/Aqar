export const RIYADH_REGION = {
  latitude: 24.7136,
  longitude: 46.6753,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2,
};

export const SAUDI_BOUNDS = {
  north: 32.0,
  south: 16.0,
  east: 55.0,
  west: 34.0,
};

export function isInsideSaudi(lat: number, lng: number): boolean {
  return (
    lat >= SAUDI_BOUNDS.south &&
    lat <= SAUDI_BOUNDS.north &&
    lng >= SAUDI_BOUNDS.west &&
    lng <= SAUDI_BOUNDS.east
  );
}
