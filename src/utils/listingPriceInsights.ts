import type { Property } from "@/types/property";
import type { PublicListingsQuery } from "@/redux/api/listingApi";
import type { ApiListingDto } from "@/utils/apiListingMapper";
import { parseBackendDateMs } from "@/utils/dateParsing";

export const INSIGHTS_DAYS = 90;

/** Maps UI `Property.type` to backend Prisma `propertyType` for `/api/listings` filters. */
export const UI_TO_PRISMA_PROPERTY_TYPE: Record<string, string> = {
  apartment: "APARTMENT",
  villa: "VILLA",
  land: "LAND",
  building: "BUILDING",
  office: "COMMERCIAL",
  small_house: "HOUSE",
  lounge: "LOUNGE",
  farm: "FARM",
  store: "STORE",
  floor: "FLOOR",
  other: "OTHER",
  big_flat: "APARTMENT",
  furnished_apartment: "APARTMENT",
  studio: "APARTMENT",
  hall: "COMMERCIAL",
  chalet: "VILLA",
  warehouse: "COMMERCIAL",
  room: "APARTMENT",
  tent: "OTHER",
};

export type ListingPriceFilters = {
  city?: string;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
};

export function median(values: number[]): number | null {
  const v = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (v.length === 0) return null;
  const mid = Math.floor(v.length / 2);
  if (v.length % 2 === 0) return (v[mid - 1] + v[mid]) / 2;
  return v[mid];
}

export function average(values: number[]): number | null {
  const v = values.filter((n) => Number.isFinite(n));
  if (v.length === 0) return null;
  const sum = v.reduce((a, b) => a + b, 0);
  return sum / v.length;
}

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function formatDayLabel(dayStart: Date): string {
  return dayStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getPrismaPropertyTypeForQuery(
  propertyType?: string,
): string | undefined {
  const key = String(propertyType ?? "").trim();
  return UI_TO_PRISMA_PROPERTY_TYPE[key] ?? undefined;
}

/**
 * Query args aligned with `AveragePriceDetailScreen` and backend `getPublicListings`.
 * Uses `property.city` when route filters omit `city`.
 */
export function buildMarketListingsQueryArgs(
  property: Property,
  kind: "rent" | "sale",
  filters?: ListingPriceFilters,
): PublicListingsQuery {
  const listingType = kind === "rent" ? "RENT" : "SALE";
  const prismaPropertyType = getPrismaPropertyTypeForQuery(property.type);
  const cityRaw = filters?.city?.trim() || property.city?.trim() || "";
  const city = cityRaw || undefined;

  const bedroomsFromFilters =
    typeof filters?.bedrooms === "number" ? filters.bedrooms : undefined;
  const bedroomsFromProperty =
    kind === "rent" &&
    typeof property.bedrooms === "number" &&
    property.bedrooms > 0
      ? property.bedrooms
      : undefined;
  const bedrooms =
    typeof bedroomsFromFilters === "number"
      ? bedroomsFromFilters
      : bedroomsFromProperty;

  return {
    page: 1,
    limit: 200,
    listingType,
    ...(prismaPropertyType ? { propertyType: prismaPropertyType } : {}),
    ...(city ? { city } : {}),
    ...(typeof bedrooms === "number" && bedrooms > 0 ? { bedrooms } : {}),
    ...(typeof filters?.minArea === "number" ? { minArea: filters.minArea } : {}),
    ...(typeof filters?.maxArea === "number" ? { maxArea: filters.maxArea } : {}),
  };
}

export type ListingPriceInsights = {
  sampleSize: number;
  medianPrice: number | null;
  avgPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  medianPricePerSqm: number | null;
  chart: { period: string; value: number }[];
};

export function computeListingPriceInsights(
  rows: ApiListingDto[],
  options?: { excludeListingId?: string; insightsDays?: number },
): ListingPriceInsights {
  const insightsDays = options?.insightsDays ?? INSIGHTS_DAYS;
  const excludeListingId = options?.excludeListingId;
  const now = Date.now();
  const minTs = now - insightsDays * 24 * 60 * 60 * 1000;

  const parsed = rows
    .filter((r) => !excludeListingId || r.id !== excludeListingId)
    .map((r) => {
      const created = parseBackendDateMs(r.createdAt);
      return {
        createdAtMs: created ?? 0,
        price: Number(r.price),
        area: Number(r.area),
      };
    })
    .filter(
      (r) =>
        r.createdAtMs >= minTs && Number.isFinite(r.price) && r.price > 0,
    );

  const prices = parsed.map((r) => r.price);
  const pricePerSqm = parsed
    .map((r) =>
      Number.isFinite(r.area) && r.area > 0 ? r.price / r.area : NaN,
    )
    .filter((n) => Number.isFinite(n) && n > 0);

  const medPrice = median(prices);
  const avgPrice = average(prices);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const medPpsm = median(pricePerSqm);

  const daily = new Map<number, number[]>();
  for (const r of parsed) {
    const d = startOfDay(new Date(r.createdAtMs)).getTime();
    const list = daily.get(d) ?? [];
    list.push(r.price);
    daily.set(d, list);
  }

  const chart = Array.from(daily.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([dayStartMs, list]) => ({
      period: formatDayLabel(new Date(dayStartMs)),
      value: Math.round(median(list) ?? 0),
    }))
    .filter((p) => p.value > 0);

  return {
    sampleSize: parsed.length,
    medianPrice: medPrice != null ? Math.round(medPrice) : null,
    avgPrice: avgPrice != null ? Math.round(avgPrice) : null,
    minPrice: minPrice != null ? Math.round(minPrice) : null,
    maxPrice: maxPrice != null ? Math.round(maxPrice) : null,
    medianPricePerSqm: medPpsm != null ? Math.round(medPpsm) : null,
    chart,
  };
}
