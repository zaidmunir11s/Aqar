import type { PropertyDetailItem } from "@/types/property";

function serializePropertyDetailItems(
  items: PropertyDetailItem[] | undefined
): Record<string, unknown>[] {
  if (!items?.length) return [];
  return items.map((item) => ({
    type: item.type,
    label: item.label,
    ...(item.value !== undefined ? { value: item.value } : {}),
    ...(item.enabled !== undefined ? { enabled: item.enabled } : {}),
    ...(item.icon ? { icon: item.icon } : {}),
  }));
}
import type { PropertyDetailsDisplayItem } from "@/components/marketingRequestPropertyDetails/shared/CategoryFormProps";
import type { UserRentPaymentPublishInput } from "./rentPayments";
import { parseRentListingPriceToSar } from "./propertyHelpers";

/** Prisma `PropertyType` values accepted by POST /api/listings */
const CATEGORY_TO_PROPERTY_TYPE: Record<string, string> = {
  "sale-1": "VILLA",
  "sale-2": "LAND",
  "sale-3": "APARTMENT",
  "sale-4": "BUILDING",
  "sale-5": "HOUSE",
  "sale-6": "LOUNGE",
  "sale-7": "FARM",
  "sale-8": "STORE",
  "sale-9": "FLOOR",
  "rent-1": "APARTMENT",
  "rent-2": "VILLA",
  "rent-3": "APARTMENT",
  "rent-4": "LOUNGE",
  "rent-5": "HOUSE",
  "rent-6": "STORE",
  "rent-7": "BUILDING",
  "rent-8": "LAND",
  "rent-9": "OTHER",
  "rent-10": "COMMERCIAL",
  "rent-11": "OTHER",
  "rent-12": "COMMERCIAL",
  "rent-13": "VILLA",
};

function parseNumericDetail(
  items: PropertyDetailItem[] | undefined,
  labelSubstrings: string[]
): number | undefined {
  if (!items?.length) return undefined;
  for (const item of items) {
    if (item.type !== "value") continue;
    const label = (item.label ?? "").toLowerCase();
    if (!labelSubstrings.some((s) => label.includes(s))) continue;
    const raw = (item.value ?? "").replace(/[^\d.]/g, "");
    const n = parseFloat(raw);
    if (Number.isFinite(n)) return Math.round(n);
  }
  return undefined;
}

function serializeDisplayItems(
  items: PropertyDetailsDisplayItem[] | undefined
): Record<string, unknown>[] {
  if (!items?.length) return [];
  return items.map((item) => ({
    type: item.type,
    label: item.label,
    ...(item.value !== undefined ? { value: item.value } : {}),
    ...(item.enabled !== undefined ? { enabled: item.enabled } : {}),
    ...(item.icon ? { icon: item.icon } : {}),
  }));
}

/** Best-effort city string from geocoded / modal label (e.g. "District, Riyadh"). */
export function inferCityFromLocationLabel(label?: string): string | undefined {
  const t = label?.trim();
  if (!t) return undefined;
  const parts = t
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const last = parts[parts.length - 1] ?? t;
  return last.slice(0, 120);
}

export type MarketingPublishParams = {
  selectedCategory: string;
  categoryLabel?: string;
  area?: string;
  price?: string;
  description?: string;
  /** Merged rows from property + pricing steps (publish preview). */
  detailsItems?: PropertyDetailItem[];
  selectedLocation?: {
    latitude: number;
    longitude: number;
  };
  locationDisplayName?: string;
  virtualTourLink?: string;
  hasCommission?: boolean;
  commissionType?: "percentage" | "fixed";
  commissionValue?: string;
  meterPrice?: string;
  propertyDetailsItems?: PropertyDetailsDisplayItem[];
  pricingDetailsItems?: PropertyDetailsDisplayItem[];
  rentPaymentOptions?: UserRentPaymentPublishInput;
  /** Photo/video notes and types from attachments (parallel to upload order). */
  attachmentsMeta?: Array<{
    id: string;
    mediaType?: "photo" | "video" | "unknown";
    note?: string;
  }>;
  /** Public https URLs after Supabase Storage upload (photos + videos). */
  media?: { url: string; order: number; kind: "PHOTO" | "VIDEO" }[];
  /** Optional deed payload for license-based flows. */
  deed?: {
    deedType: "ELECTRONIC" | "OTHER";
    deedNumber?: string;
    ownerIdNumber?: string;
    ownerBirthDate?: string;
    ownerPhone?: string;
  };
};

export type CreateListingBody = {
  listing: {
    title: string;
    description?: string;
    price: number;
    priceType: "NIGHTLY" | "MONTHLY" | "YEARLY";
    listingType: "RENT" | "SALE";
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    areaUnit: "SQM" | "SQFT";
    latitude: number;
    longitude: number;
    city?: string;
    media?: { url: string; order: number; kind: "PHOTO" | "VIDEO" }[];
    metadata?: Record<string, unknown>;
  };
  deed?: {
    deedType: "ELECTRONIC" | "OTHER";
    deedNumber?: string;
    ownerIdNumber?: string;
    ownerBirthDate?: string;
    ownerPhone?: string;
  };
};

/**
 * Structured JSON stored on `Listing.metadata` — full marketing-request context (no deed).
 */
export function buildMarketingListingMetadata(
  input: MarketingPublishParams
): Record<string, unknown> {
  const out: Record<string, unknown> = {
    flow: "marketing_request",
    categoryId: input.selectedCategory,
  };

  if (input.locationDisplayName?.trim()) {
    out.locationDisplayName = input.locationDisplayName.trim();
  }
  if (input.virtualTourLink?.trim()) {
    out.virtualTourLink = input.virtualTourLink.trim();
  }
  if (input.hasCommission && input.commissionValue?.trim()) {
    out.commission = {
      type: input.commissionType ?? "percentage",
      value: input.commissionValue.trim(),
    };
  }
  if (input.meterPrice?.trim()) {
    out.meterPrice = input.meterPrice.trim();
  }
  if (input.rentPaymentOptions) {
    out.rentPaymentOptions = input.rentPaymentOptions;
  }
  if (input.propertyDetailsItems?.length) {
    out.propertyDetailsItems = serializeDisplayItems(
      input.propertyDetailsItems
    );
  }
  if (input.pricingDetailsItems?.length) {
    out.pricingDetailsItems = serializeDisplayItems(
      input.pricingDetailsItems
    );
  }
  if (input.attachmentsMeta?.length) {
    out.attachmentsMeta = input.attachmentsMeta.map((a) => ({
      id: a.id,
      ...(a.mediaType ? { mediaType: a.mediaType } : {}),
      ...(a.note?.trim() ? { note: a.note.trim() } : {}),
    }));
  }

  if (input.detailsItems?.length) {
    out.publishDetailRows = serializePropertyDetailItems(input.detailsItems);
  }

  const livingRooms = parseNumericDetail(input.detailsItems, [
    "living",
    "صالة",
    "صالون",
  ]);
  const restroomsExtra = parseNumericDetail(input.detailsItems, [
    "restroom",
    "wc",
    "دورات مياه",
  ]);
  const estateAge = parseNumericDetail(input.detailsItems, [
    "age",
    "عمر",
    "سنة",
    "real estate age",
  ]);
  if (
    livingRooms != null ||
    restroomsExtra != null ||
    estateAge != null
  ) {
    out.extraFields = {
      ...(livingRooms != null ? { livingRooms } : {}),
      ...(restroomsExtra != null ? { restroomsListed: restroomsExtra } : {}),
      ...(estateAge != null ? { estateAgeYears: estateAge } : {}),
    };
  }

  return out;
}

/**
 * Builds POST /api/listings body from the full marketing-request stack (placeholder → … → publish).
 * Deed is intentionally omitted. Rich UI data is duplicated into `metadata` JSON for the DB.
 */
export function buildCreateListingBodyFromMarketing(
  input: MarketingPublishParams
): CreateListingBody {
  const isRent = input.selectedCategory.startsWith("rent-");
  const listingType: "RENT" | "SALE" = isRent ? "RENT" : "SALE";
  const priceType: "MONTHLY" | "YEARLY" = isRent ? "MONTHLY" : "YEARLY";

  const propertyType =
    CATEGORY_TO_PROPERTY_TYPE[input.selectedCategory] ?? "OTHER";

  const priceParsed = parseRentListingPriceToSar(input.price);
  const digitsOnly = Number(String(input.price ?? "").replace(/[^\d]/g, ""));
  const priceSar = Math.max(
    1,
    priceParsed ??
      (Number.isFinite(digitsOnly) && digitsOnly > 0 ? digitsOnly : 1)
  );

  const areaSqm =
    Number(String(input.area ?? "").replace(/[^\d.]/g, "")) || 1;

  const bedrooms =
    parseNumericDetail(input.detailsItems, [
      "bedroom",
      "غرف",
      "غرفة",
      "room",
    ]) ?? 0;
  const bathrooms =
    parseNumericDetail(input.detailsItems, [
      "bath",
      "restroom",
      "حمام",
      "دورة",
    ]) ?? 0;

  const lat = input.selectedLocation?.latitude ?? 24.7136;
  const lng = input.selectedLocation?.longitude ?? 46.6753;

  const title =
    input.categoryLabel?.trim() ||
    (isRent ? "Property for rent" : "Property for sale");

  const city =
    inferCityFromLocationLabel(input.locationDisplayName) ?? "Riyadh";

  const metadata = buildMarketingListingMetadata(input);

  return {
    listing: {
      title,
      description: input.description?.trim() || undefined,
      price: Math.max(1, priceSar),
      priceType,
      listingType,
      propertyType,
      bedrooms,
      bathrooms,
      area: Math.max(1, areaSqm),
      areaUnit: "SQM",
      latitude: lat,
      longitude: lng,
      city,
      metadata,
      ...(input.media?.length ? { media: input.media } : {}),
    },
    ...(input.deed ? { deed: input.deed } : {}),
  };
}
