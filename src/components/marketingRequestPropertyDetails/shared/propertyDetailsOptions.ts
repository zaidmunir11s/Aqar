export const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5+"];
export const LIVING_ROOM_OPTIONS = ["0", "1", "2", "3", "4", "5+"];
export const WC_OPTIONS = ["1", "2", "3", "4", "5+"];

export const STREET_DIRECTION_OPTIONS = [
  "Not Defined",
  "North",
  "East",
  "West",
  "South",
  "Northeast",
  "Southeast",
  "Southwest",
  "Northwest",
  "3 Streets",
  "4 Streets",
];

export const VILLA_TYPE_OPTIONS = ["Standalone", "Duplex", "Townhouse"] as const;

export type VillaTypeCanonical = (typeof VILLA_TYPE_OPTIONS)[number];

export function villaTypeRowLabel(option: string, t: (key: string) => string): string {
  if (option === "Standalone") return t("listings.standalone");
  if (option === "Duplex") return t("listings.duplex");
  if (option === "Townhouse") return t("listings.townhouse");
  return option;
}

export function buildVillaTypeDisplayOptions(t: (key: string) => string): string[] {
  return VILLA_TYPE_OPTIONS.map((o) => villaTypeRowLabel(o, t));
}

export function canonicalVillaTypeFromDisplayLabel(
  display: string,
  t: (key: string) => string
): string {
  const labels = buildVillaTypeDisplayOptions(t);
  const i = labels.indexOf(display);
  return i >= 0 ? VILLA_TYPE_OPTIONS[i]! : display;
}

export const APARTMENT_PICKER_OPTIONS = [
  ...Array.from({ length: 30 }, (_, i) => `${i}`),
  "30+",
];

export const AGE_PICKER_OPTIONS: string[] = [
  "unknown",
  "New",
  ...Array.from({ length: 34 }, (_, i) => `${i + 1}`),
  "35+",
];

/** Single age row label for wheel / field (canonical value → localized display). */
export function agePickerRowLabel(option: string, t: (key: string) => string): string {
  if (option === "unknown") return t("listings.unknown");
  if (option === "New") return t("common.new");
  return option;
}

export function buildAgePickerDisplayOptions(t: (key: string) => string): string[] {
  return AGE_PICKER_OPTIONS.map((o) => agePickerRowLabel(o, t));
}

export function canonicalAgeFromDisplayLabel(display: string, t: (key: string) => string): string {
  const labels = buildAgePickerDisplayOptions(t);
  const i = labels.indexOf(display);
  return i >= 0 ? AGE_PICKER_OPTIONS[i]! : display;
}

export function getDirectionLabel(option: string, t: (key: string) => string): string {
  if (option === "Not Defined") return t("listings.notDefined");
  if (option === "North") return t("listings.address.north");
  if (option === "East") return t("listings.address.east");
  if (option === "West") return t("listings.address.west");
  if (option === "South") return t("listings.address.south");
  if (option === "Northeast") return t("listings.address.northeast");
  if (option === "Southeast") return t("listings.address.southeast");
  if (option === "Southwest") return t("listings.address.southwest");
  if (option === "Northwest") return t("listings.address.northwest");
  if (option === "3 Streets") return t("listings.threeStreets");
  if (option === "4 Streets") return t("listings.fourStreets");
  return option;
}

export function buildFloorPickerOptions(t: (key: string) => string): string[] {
  return [t("listings.ground"), t("listings.upperGround"), ...Array.from({ length: 19 }, (_, i) => `${i + 1}`), "20+"];
}

export function formatRealEstateAgeLabel(value: string, t: (key: string) => string): string {
  if (value === "unknown") return t("listings.unknown");
  if (value === "New") return t("common.new");
  if (value.endsWith("+")) return `${value} ${t("listings.years")}`;
  const asNumber = Number(value);
  if (Number.isNaN(asNumber) || asNumber <= 0) return value;
  return `${asNumber} ${asNumber === 1 ? t("listings.year") : t("listings.years")}`;
}

