import type { Property, PropertyType, ListingType } from "@/types/property";
import type { PropertyDetailItem, RentPaymentScheduleRow } from "@/types/property";
import type { UserRentPaymentPublishInput } from "@/utils/rentPayments";
import { buildRentPaymentScheduleFromPublishForm } from "@/utils/rentPayments";
import { parseBackendDateMs } from "@/utils/dateParsing";

/** Backend Prisma-style listing row (public or mine). */
export type ApiListingDto = {
  id: string;
  listingNumber?: number;
  title: string;
  description: string | null;
  price: number;
  priceType: "NIGHTLY" | "MONTHLY" | "YEARLY";
  listingType: "RENT" | "SALE";
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  latitude: number;
  longitude: number;
  city: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown> | null;
  media?: {
    id?: string;
    url: string;
    order: number;
    kind?: "PHOTO" | "VIDEO";
  }[];
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string | null;
    profileImage?: string | null;
  };
};

type AttachmentMetaRow = {
  id: string;
  mediaType?: "photo" | "video" | "unknown" | string;
  note?: string;
};

function readAttachmentPhotoCaptionsInOrder(metadata: unknown): string[] {
  if (!metadata || typeof metadata !== "object") return [];
  const rows = (metadata as any).attachmentsMeta as unknown;
  if (!Array.isArray(rows)) return [];
  return (rows as AttachmentMetaRow[])
    .filter((r) => (r?.mediaType ?? "") !== "video")
    .map((r) => String(r?.note ?? "").trim());
}

function readPublishDetailRows(metadata: unknown): PropertyDetailItem[] | undefined {
  if (!metadata || typeof metadata !== "object") return undefined;
  const rows = (metadata as any).publishDetailRows as unknown;
  if (!Array.isArray(rows)) return undefined;
  const out: PropertyDetailItem[] = [];
  for (const r of rows as any[]) {
    const type = r?.type === "toggle" ? "toggle" : "value";
    const label = String(r?.label ?? "").trim();
    if (!label) continue;
    out.push({
      type,
      label,
      ...(r?.value != null ? { value: String(r.value) } : {}),
      ...(r?.icon != null ? { icon: String(r.icon) } : {}),
      ...(typeof r?.enabled === "boolean" ? { enabled: r.enabled } : {}),
    });
  }
  return out.length ? out : undefined;
}

function readExtraFields(metadata: unknown): {
  livingRooms?: number;
  restroomsListed?: number;
  estateAgeYears?: number;
} {
  if (!metadata || typeof metadata !== "object") return {};
  const e = (metadata as any).extraFields;
  if (!e || typeof e !== "object") return {};
  const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
  return {
    ...(n((e as any).livingRooms) != null ? { livingRooms: n((e as any).livingRooms) } : {}),
    ...(n((e as any).restroomsListed) != null ? { restroomsListed: n((e as any).restroomsListed) } : {}),
    ...(n((e as any).estateAgeYears) != null ? { estateAgeYears: n((e as any).estateAgeYears) } : {}),
  };
}

function readRentPaymentSchedule(metadata: unknown): RentPaymentScheduleRow[] | undefined {
  if (!metadata || typeof metadata !== "object") return undefined;
  const raw = (metadata as any).rentPaymentOptions as unknown;
  if (!raw || typeof raw !== "object") return undefined;
  const input = raw as UserRentPaymentPublishInput;
  const rows = buildRentPaymentScheduleFromPublishForm(input);
  return rows.length ? rows : undefined;
}

const PRISMA_TO_UI_TYPE: Record<string, PropertyType> = {
  APARTMENT: "apartment",
  LAND: "land",
  BUILDING: "building",
  VILLA: "villa",
  COMMERCIAL: "office",
  HOUSE: "small_house",
  LOUNGE: "lounge",
  FARM: "farm",
  STORE: "store",
  FLOOR: "floor",
  OTHER: "other",
};

/** Stable numeric id for navigation; kept in 600M+ range to avoid collisions with legacy static ids. */
export function uuidToStablePropertyNumericId(uuid: string): number {
  // Use the first 13 hex chars (52 bits) of the UUID (without dashes).
  // This dramatically reduces collision risk compared to a 32-bit hash while
  // staying within JS safe integer range.
  const hex = uuid.replace(/-/g, "").slice(0, 13);
  const n = Number.parseInt(hex, 16);
  if (Number.isFinite(n) && n > 0) {
    return 600_000_000 + n;
  }
  // Fallback: deterministic 32-bit hash (should be practically unreachable).
  let h = 0;
  for (let i = 0; i < uuid.length; i++) {
    h = (Math.imul(31, h) + uuid.charCodeAt(i)) | 0;
  }
  const positive = Math.abs(h);
  return 600_000_000 + (positive % 100_000_000);
}

function compactSarPrice(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "---";
  if (n >= 1_000_000) {
    const compact = (n / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return `${compact} M`;
  }
  if (n >= 1_000) {
    const compact = (n / 1_000).toFixed(1).replace(/\.0$/, "");
    return `${compact} K`;
  }
  return String(Math.round(n));
}

export function mapApiListingToProperty(row: ApiListingDto): Property {
  const listingType: ListingType =
    row.listingType === "RENT" ? "rent" : "sale";
  const type =
    PRISMA_TO_UI_TYPE[row.propertyType] ?? "other";
  const sortedMedia =
    row.media && row.media.length > 0
      ? [...row.media].sort((a, b) => a.order - b.order)
      : [];
  const images = sortedMedia
    .filter((m) => m.kind !== "VIDEO")
    .map((m) => m.url);
  const videoUris = sortedMedia
    .filter((m) => m.kind === "VIDEO")
    .map((m) => m.url);

  const numericId = uuidToStablePropertyNumericId(row.id);
  const createdAtMs = parseBackendDateMs(row.createdAt);
  const updatedAtMs = parseBackendDateMs(row.updatedAt);
  const createdAtIso = createdAtMs != null ? new Date(createdAtMs).toISOString() : undefined;
  const updatedAtIso = updatedAtMs != null ? new Date(updatedAtMs).toISOString() : undefined;

  const advertiserName = row.owner
    ? `${row.owner.firstName} ${row.owner.lastName}`.trim()
    : undefined;
  const advertiserPhone = row.owner?.phoneNumber ?? undefined;

  const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata : null;
  const imageCaptionsFromMeta = readAttachmentPhotoCaptionsInOrder(metadata);
  const detailsItemsFromMeta = readPublishDetailRows(metadata);
  const extraFields = readExtraFields(metadata);
  const rentPaymentSchedule = readRentPaymentSchedule(metadata);
  const locationDisplayName =
    metadata && typeof (metadata as any).locationDisplayName === "string"
      ? String((metadata as any).locationDisplayName).trim()
      : "";

  return {
    id: numericId,
    serverListingId: row.id,
    ...(typeof row.listingNumber === "number" && row.listingNumber > 0
      ? { listingId: row.listingNumber }
      : {}),
    ...(createdAtIso ? { createdAt: createdAtIso } : {}),
    ...(updatedAtIso ? { updatedAt: updatedAtIso } : {}),
    lat: row.latitude,
    lng: row.longitude,
    type,
    listingType,
    verified: row.status === "ACTIVE",
    area: row.area,
    usage: "family",
    bedrooms: row.bedrooms,
    livingRooms: extraFields.livingRooms ?? 0,
    restrooms: extraFields.restroomsListed ?? row.bathrooms,
    estateAge: extraFields.estateAgeYears ?? 0,
    address: locationDisplayName || row.title?.trim() || row.city?.trim() || "",
    city: row.city?.trim() || "",
    images: images.length > 0 ? images : [],
    ...(imageCaptionsFromMeta.length > 0 ? { imageCaptions: imageCaptionsFromMeta } : {}),
    ...(videoUris.length > 0 ? { videoUris } : {}),
    ...(metadata ? { listingMetadata: metadata as Record<string, unknown> } : {}),
    ...(row.status ? { listingStatus: String(row.status) } : {}),
    ...(detailsItemsFromMeta ? { detailsItems: detailsItemsFromMeta } : {}),
    description: row.description?.trim() || undefined,
    price: compactSarPrice(row.price),
    ...(listingType === "rent" && rentPaymentSchedule ? { rentPaymentSchedule } : {}),
    advertiserName,
    advertiserId: row.owner?.id,
    ...(advertiserPhone ? { advertiserPhone } : {}),
  };
}
