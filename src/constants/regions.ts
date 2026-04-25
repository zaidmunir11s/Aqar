export const RIYADH_REGION = {
  latitude: 24.7136,
  longitude: 46.6753,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export const SAUDI_BOUNDS = {
  north: 32.0,
  south: 16.0,
  east: 55.0,
  west: 34.0,
};

// City coordinates for map navigation - Updated with accurate GPS coordinates
export const CITY_REGIONS: Record<
  string,
  {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }
> = {
  Riyadh: {
    latitude: 24.7136,
    longitude: 46.6753,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  Jeddah: {
    latitude: 21.4858,
    longitude: 39.1925,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  Dammam: {
    latitude: 26.4207,
    longitude: 50.0888,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Al Khobar": {
    latitude: 26.2041,
    longitude: 50.1972,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  },
  Medina: {
    latitude: 24.4672,
    longitude: 39.6142,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  },
  Macca: {
    latitude: 21.3891,
    longitude: 39.8579,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  },
  Buraydah: {
    latitude: 26.326,
    longitude: 43.975,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  },
  Taif: {
    latitude: 21.2703,
    longitude: 40.4158,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  },
  Jazan: {
    latitude: 16.8894,
    longitude: 42.5706,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  },
  Abha: {
    latitude: 18.2164,
    longitude: 42.5042,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  },
  "Khamis Mushait": {
    latitude: 18.3,
    longitude: 42.7333,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  },
  "Al Hofuf": {
    latitude: 25.36,
    longitude: 49.5878,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  },
  Unayzah: {
    latitude: 26.0833,
    longitude: 43.9833,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Kharj": {
    latitude: 24.1556,
    longitude: 47.3056,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Hail: {
    latitude: 27.5114,
    longitude: 41.7208,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Al Bukayriyah": {
    latitude: 26.1442,
    longitude: 43.6575,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Jubail": {
    latitude: 27.0174,
    longitude: 49.6225,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Ad Diriyah": {
    latitude: 24.7375,
    longitude: 46.5731,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Dhahran: {
    latitude: 26.3031,
    longitude: 50.135,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Tabuk: {
    latitude: 28.3998,
    longitude: 36.57,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Al Majmaah": {
    latitude: 25.9,
    longitude: 45.35,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Ahad Rufaidah": {
    latitude: 18.2167,
    longitude: 42.5,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Thadiq: {
    latitude: 25.2833,
    longitude: 45.9833,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Hafr Al Batin": {
    latitude: 28.4333,
    longitude: 45.9667,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  "Al Quwaiiyah": {
    latitude: 24.0667,
    longitude: 45.2833,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Abu `Arish": {
    latitude: 16.9667,
    longitude: 42.8333,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Bahah": {
    latitude: 20.0129,
    longitude: 41.4677,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  Shaqra: {
    latitude: 25.1833,
    longitude: 45.1833,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Thuwal: {
    latitude: 22.2833,
    longitude: 39.1,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Riyadh Al Khabra": {
    latitude: 25.4833,
    longitude: 45.4,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Az Zulfi": {
    latitude: 26.3,
    longitude: 44.8,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Ar Rass": {
    latitude: 25.8667,
    longitude: 43.5,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Badayea": {
    latitude: 26.4167,
    longitude: 44.0167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Buqayq: {
    latitude: 25.9333,
    longitude: 49.6667,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Duwadimi": {
    latitude: 24.5,
    longitude: 44.3833,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Nairyah: {
    latitude: 27.4667,
    longitude: 45.9667,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Safwa: {
    latitude: 26.65,
    longitude: 49.95,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Muhayil: {
    latitude: 18.5167,
    longitude: 42.0333,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "King Abdullah Economic City": {
    latitude: 22.4,
    longitude: 39.0833,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  Rabigh: {
    latitude: 22.8,
    longitude: 39.0333,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Henakiyah": {
    latitude: 24.0833,
    longitude: 40.5,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Almajaridah: {
    latitude: 20.9,
    longitude: 40.2,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Sabya: {
    latitude: 17.15,
    longitude: 42.6167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "An Nabhaniyah": {
    latitude: 25.0167,
    longitude: 49.6167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Qunfudhah": {
    latitude: 19.1333,
    longitude: 41.0833,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Baish: {
    latitude: 17.4167,
    longitude: 42.6167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Hayathem": {
    latitude: 26.5333,
    longitude: 50.0167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  AlShinana: {
    latitude: 25.8122,
    longitude: 43.4444,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Baqaa: {
    latitude: 21.2667,
    longitude: 40.4167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Najran: {
    latitude: 17.4924,
    longitude: 44.1277,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  },
  "Al GHazalah": {
    latitude: 26.3,
    longitude: 44.0,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  BIsha: {
    latitude: 19.9833,
    longitude: 42.6,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Howtat Bani Tamin": {
    latitude: 25.0333,
    longitude: 45.4333,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Rumah: {
    latitude: 25.7333,
    longitude: 46.2167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Saihat: {
    latitude: 26.4833,
    longitude: 50.0333,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Khafji: {
    latitude: 28.4333,
    longitude: 48.5,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Arar: {
    latitude: 30.9753,
    longitude: 41.0381,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  },
  "Ahad al Masrihah": {
    latitude: 18.2167,
    longitude: 42.5,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Ghat": {
    latitude: 26.5667,
    longitude: 44.9667,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "AL Mithnab": {
    latitude: 25.85,
    longitude: 44.2167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Qatif": {
    latitude: 26.5194,
    longitude: 49.9989,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Jumum": {
    latitude: 21.6167,
    longitude: 39.7,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Samtah: {
    latitude: 16.6,
    longitude: 42.95,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Ad Dilam": {
    latitude: 23.9833,
    longitude: 47.1667,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Afif: {
    latitude: 23.9167,
    longitude: 42.9167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Ash Shimasiyah": {
    latitude: 25.4833,
    longitude: 49.6,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Yanbu: {
    latitude: 24.0892,
    longitude: 38.0618,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  },
  "Dumah AL Jandal": {
    latitude: 29.8167,
    longitude: 39.8667,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Ras Tanura": {
    latitude: 26.65,
    longitude: 50.1667,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Sakaka: {
    latitude: 29.9697,
    longitude: 40.2064,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
  },
  Turbah: {
    latitude: 21.1667,
    longitude: 40.7,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "As Sulayyil": {
    latitude: 20.4667,
    longitude: 45.5833,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Lith": {
    latitude: 20.15,
    longitude: 40.2833,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Billasmar: {
    latitude: 20.0,
    longitude: 41.45,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Tayma: {
    latitude: 27.6333,
    longitude: 38.55,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Mahd adh Dhahab": {
    latitude: 23.5,
    longitude: 40.8667,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al `Uyun": {
    latitude: 25.6167,
    longitude: 49.6667,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Kamil": {
    latitude: 22.2167,
    longitude: 39.4167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Tarout: {
    latitude: 26.5667,
    longitude: 50.0667,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Rafha: {
    latitude: 29.6333,
    longitude: 43.5167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Sharorah: {
    latitude: 17.5,
    longitude: 47.1333,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Ula": {
    latitude: 26.6167,
    longitude: 37.9167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Turaif: {
    latitude: 31.6833,
    longitude: 40.65,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Duba: {
    latitude: 27.35,
    longitude: 35.7,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "AL Hariq": {
    latitude: 24.4333,
    longitude: 46.2833,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "AL Khurma": {
    latitude: 21.9167,
    longitude: 40.4167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Tathleeth: {
    latitude: 19.5167,
    longitude: 43.5,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Ranyah: {
    latitude: 21.2667,
    longitude: 40.4167,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "AL Qurayyat": {
    latitude: 31.3333,
    longitude: 37.3333,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Anak: {
    latitude: 25.0333,
    longitude: 45.4333,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Wajh": {
    latitude: 26.2333,
    longitude: 36.4667,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Umluj: {
    latitude: 25.0333,
    longitude: 37.2667,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  "Al Wadiah": {
    latitude: 17.7333,
    longitude: 42.7333,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Khaybar: {
    latitude: 25.7,
    longitude: 39.3,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  Badr: {
    latitude: 23.7833,
    longitude: 38.7833,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
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
