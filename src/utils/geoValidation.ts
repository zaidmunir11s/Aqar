import type { LocationRegion } from "@/hooks/useLocation";

export function isValidLatitude(value: number | undefined | null): boolean {
  return (
    typeof value === "number" &&
    !isNaN(value) &&
    isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

export function isValidLongitude(value: number | undefined | null): boolean {
  return (
    typeof value === "number" &&
    !isNaN(value) &&
    isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

export function isValidMapRegion(r: LocationRegion): boolean {
  return (
    isValidLatitude(r.latitude) &&
    isValidLongitude(r.longitude) &&
    isValidLatitude(r.latitudeDelta) &&
    isValidLongitude(r.longitudeDelta) &&
    r.latitudeDelta > 0 &&
    r.longitudeDelta > 0
  );
}
