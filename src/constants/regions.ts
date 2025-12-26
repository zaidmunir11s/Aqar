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

// City coordinates for map navigation
export const CITY_REGIONS: Record<string, { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }> = {
  "Riyadh": {
    latitude: 24.7136,
    longitude: 46.6753,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  },
  "Jeddah": {
    latitude: 21.4858,
    longitude: 39.1925,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  },
  "Mecca": {
    latitude: 21.3891,
    longitude: 39.8579,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Medina": {
    latitude: 24.5247,
    longitude: 39.5692,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Dammam": {
    latitude: 26.4207,
    longitude: 50.0888,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  },
  "Khobar": {
    latitude: 26.2041,
    longitude: 50.1972,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Abha": {
    latitude: 18.2164,
    longitude: 42.5042,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Tabuk": {
    latitude: 28.3998,
    longitude: 36.5700,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  },
  "Buraidah": {
    latitude: 26.3260,
    longitude: 43.9750,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Khamis Mushait": {
    latitude: 18.3000,
    longitude: 42.7333,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Hail": {
    latitude: 27.5114,
    longitude: 41.7208,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  },
  "Najran": {
    latitude: 17.4924,
    longitude: 44.1277,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Jazan": {
    latitude: 16.8894,
    longitude: 42.5706,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Yanbu": {
    latitude: 24.0892,
    longitude: 38.0618,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Al Jubail": {
    latitude: 27.0174,
    longitude: 49.6225,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Al Khobar": {
    latitude: 26.2041,
    longitude: 50.1972,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Al Bukayriyah": {
    latitude: 26.1442,
    longitude: 43.6575,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Qatif": {
    latitude: 26.5194,
    longitude: 49.9989,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Arar": {
    latitude: 30.9753,
    longitude: 41.0381,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Sakaka": {
    latitude: 29.9697,
    longitude: 40.2064,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
};

export function isInsideSaudi(lat: number, lng: number): boolean {
  return (
    lat >= SAUDI_BOUNDS.south &&
    lat <= SAUDI_BOUNDS.north &&
    lng >= SAUDI_BOUNDS.west &&
    lng <= SAUDI_BOUNDS.east
  );
}
