import type { Property } from "../types/property";
import {
  MAP_CARD_MAX_CORE_FIELDS,
  resolveMapCardCoreFieldKeys,
} from "../constants/mapCardCorePropertyFields";
import {
  formatPropertyDetailValueForListingDisplay,
  formatStaticEstateAgeForListing,
} from "./propertyDetailDisplayFormat";

export type DetailIconSpec = {
  library: "Ionicons" | "MaterialCommunityIcons" | "Feather";
  name: string;
};

export type PropertyDetailInfoRow = {
  /** `null` = no icon (e.g. price per meter, tent). */
  icon: DetailIconSpec | null;
  label: string;
  value: string;
};

/**
 * Maps `detailsItems[].icon` strings into vector spec.
 * Marketing publish uses `mdi:*`, `feather:*`, and plain Ionicons glyph names from category forms.
 */
export function parseStoredDetailIcon(iconName?: string): DetailIconSpec | undefined {
  const raw = iconName?.trim();
  if (!raw) return undefined;
  if (raw.startsWith("mdi:")) {
    return { library: "MaterialCommunityIcons", name: raw.slice(4) };
  }
  if (raw.startsWith("feather:")) {
    return { library: "Feather", name: raw.slice("feather:".length) };
  }
  return { library: "Ionicons", name: raw };
}

export function isPublishedListingProperty(property: Property | null | undefined): boolean {
  return Boolean(property?.listingId || property?.createdAt || property?.detailsItems?.length);
}

/**
 * Value rows derived from `detailsItems` (category-specific fields), aligned with Property Details.
 */
export function buildDynamicValueDetailRows(
  property: Property | null | undefined,
  t: (key: string) => string
): PropertyDetailInfoRow[] {
  if (!property) return [];

  const resolveIcon = (label: string, storedIcon?: string): DetailIconSpec | null => {
    const normalized = label.trim().toLowerCase();
    const tentLabel = t("listings.tent").trim().toLowerCase();
    if (normalized === tentLabel) {
      return null;
    }
    if (label === t("listings.pricePerMeter") || label === t("listings.meterPrice")) {
      return null;
    }

    if (normalized === t("listings.well").trim().toLowerCase()) {
      return { library: "MaterialCommunityIcons", name: "water-well" };
    }
    if (normalized === t("listings.trees").trim().toLowerCase()) {
      return { library: "MaterialCommunityIcons", name: "tree-outline" };
    }

    if (
      normalized.includes("real estate age") ||
      normalized.includes("age less than") ||
      normalized.includes("estate age") ||
      normalized.includes("عمر العقار")
    ) {
      return { library: "MaterialCommunityIcons", name: "calendar-clock-outline" };
    }

    if (
      normalized.includes("living room") ||
      normalized.includes("living rooms") ||
      normalized.includes("مجلس") ||
      normalized.includes("صالات")
    ) {
      return { library: "MaterialCommunityIcons", name: "sofa-outline" };
    }

    if (
      normalized.includes("restroom") ||
      normalized.includes("bathroom") ||
      normalized.includes("toilet") ||
      normalized.includes("دورة مياه") ||
      normalized.includes("حمام")
    ) {
      return { library: "MaterialCommunityIcons", name: "toilet" };
    }

    if (
      normalized.includes("street width") ||
      normalized.includes("عرض الشارع")
    ) {
      return { library: "MaterialCommunityIcons", name: "arrow-expand-horizontal" };
    }

    if (
      normalized.includes("type") ||
      normalized.includes("category") ||
      normalized.includes("النوع") ||
      normalized.includes("الفئة")
    ) {
      return { library: "Feather", name: "tag" };
    }

    if (
      normalized.includes("usage") ||
      normalized.includes("family") ||
      normalized.includes("single") ||
      normalized.includes("الاستخدام") ||
      normalized.includes("عائ") ||
      normalized.includes("عزاب")
    ) {
      return { library: "Feather", name: "users" };
    }

    if (
      normalized.includes("bedroom") ||
      normalized.includes("غرفة نوم")
    ) {
      return { library: "MaterialCommunityIcons", name: "bed-outline" };
    }

    if (
      normalized === t("listings.area").toLowerCase() ||
      normalized.includes("area") ||
      normalized.includes("المساحة")
    ) {
      return { library: "Feather", name: "maximize" };
    }

    return (
      parseStoredDetailIcon(storedIcon) ?? {
        library: "MaterialCommunityIcons",
        name: "information-outline",
      }
    );
  };

  const valueRows: PropertyDetailInfoRow[] = (property.detailsItems ?? [])
    .filter((item) => item.type === "value")
    .map((item) => ({
      icon: resolveIcon(item.label, item.icon),
      label: item.label,
      value: (() => {
        const raw = (item.value ?? "").trim();
        if (!raw.length) return "---";
        return formatPropertyDetailValueForListingDisplay(item.label, raw, t);
      })(),
    }));

  const hasTentValueRow = valueRows.some(
    (row) => row.label.trim().toLowerCase() === t("listings.tent").trim().toLowerCase()
  );
  const hasTentToggleEnabled = (property.detailsItems ?? []).some(
    (item) =>
      item.type === "toggle" &&
      item.enabled &&
      item.label.trim().toLowerCase() === t("listings.tent").trim().toLowerCase()
  );

  if (hasTentToggleEnabled && !hasTentValueRow) {
    valueRows.push({
      icon: null,
      label: t("listings.tent"),
      value: "1",
    });
  }

  return valueRows;
}

/**
 * Same rows as Property Details → Property Information (published = category fields only; legacy = base + dynamic).
 */
export function buildPropertyInfoRows(
  property: Property | null | undefined,
  t: (key: string) => string
): PropertyDetailInfoRow[] {
  if (!property) return [];

  const dynamicValueDetails = buildDynamicValueDetailRows(property, t);
  const published = isPublishedListingProperty(property);

  if (published) {
    return dynamicValueDetails;
  }

  return [
    {
      icon: { library: "Feather", name: "maximize" },
      label: t("listings.area"),
      value: `${property.area ?? 0}`,
    },
    {
      icon: { library: "MaterialCommunityIcons", name: "bed-outline" },
      label: t("listings.bedrooms"),
      value: String(property.bedrooms ?? 0),
    },
    {
      icon: { library: "MaterialCommunityIcons", name: "sofa-outline" },
      label: t("listings.livingRooms"),
      value: String(property.livingRooms || 1),
    },
    {
      icon: { library: "MaterialCommunityIcons", name: "toilet" },
      label: t("listings.restrooms"),
      value: String(property.restrooms || 2),
    },
    {
      icon: { library: "MaterialCommunityIcons", name: "calendar-clock-outline" },
      label: t("listings.realEstateAge"),
      value: formatStaticEstateAgeForListing(property.estateAge ?? 0, t),
    },
    {
      icon: { library: "Feather", name: "tag" },
      label: t("listings.type"),
      value: t("listings.residential"),
    },
    ...dynamicValueDetails,
  ];
}

export function buildDynamicFeatureLabels(
  property: Property | null | undefined,
  t: (key: string) => string
): string[] {
  if (!property) return [];
  return (property.detailsItems ?? [])
    .filter(
      (item) =>
        item.type === "toggle" &&
        item.enabled &&
        item.label.trim().toLowerCase() !== t("listings.tent").trim().toLowerCase()
    )
    .map((item) => item.label);
}

const isVisibleDetailValue = (value: string): boolean => {
  const v = value.trim();
  return v.length > 0 && v !== "---";
};

/**
 * Map bottom card: 2–3 core fields per category; area included when that category uses it
 * (synthetic from `property.area` if missing from rows but allowed by core keys).
 */
export function pickCorePropertyInfoRowsForMapCard(
  rows: PropertyDetailInfoRow[],
  property: Property,
  t: (key: string) => string
): PropertyDetailInfoRow[] {
  const visible = rows.filter((row) => isVisibleDetailValue(row.value));
  const keys = resolveMapCardCoreFieldKeys(property);
  const maxCount = MAP_CARD_MAX_CORE_FIELDS;
  const picked: PropertyDetailInfoRow[] = [];
  const used = new Set<string>();

  const pushRow = (row: PropertyDetailInfoRow) => {
    if (picked.length >= maxCount) return;
    if (used.has(row.label)) return;
    used.add(row.label);
    picked.push(row);
  };

  for (const key of keys) {
    if (picked.length >= maxCount) break;
    const label = t(key);
    const row = visible.find((r) => r.label === label);
    if (row) {
      pushRow(row);
      continue;
    }
    if (key === "listings.area" && property.area != null && property.area > 0) {
      pushRow({
        icon: { library: "Feather", name: "maximize" },
        label,
        value: String(property.area),
      });
    }
  }

  if (picked.length === 0) {
    for (const row of visible) {
      if (picked.length >= maxCount) break;
      pushRow(row);
    }
  }

  return picked;
}
