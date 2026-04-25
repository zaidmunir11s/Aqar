import type {
  Property,
  PropertyType,
  ListingType,
  PropertyDetailItem,
} from "@/types/property";
import {
  getDefaultImageUrl,
  normalizeAdvertiserPhoneForTel,
} from "./propertyHelpers";
import {
  buildRentPaymentScheduleFromPublishForm,
  type UserRentPaymentPublishInput,
} from "./rentPayments";
import { STORAGE_KEYS } from "@/constants/storage";
import { secureGet, secureSet } from "@/utils/secureStore";

type MarketingAttachment = {
  id: string;
  uri: string;
  mediaType?: "photo" | "video" | "unknown";
  note?: string;
};

type MarketingPublishInput = {
  selectedCategory?: string;
  attachments?: MarketingAttachment[];
  locationDisplayName?: string;
  selectedLocation?: {
    latitude: number;
    longitude: number;
  };
  area?: string;
  price?: string;
  description?: string;
  detailsItems?: PropertyDetailItem[];
  categoryLabel?: string;
  commissionText?: string;
  /** Rent listing: annual + optional installment options from pricing step. */
  rentPaymentOptions?: UserRentPaymentPublishInput;
  /** Logged-in user display name at publish time. */
  publisherDisplayName?: string;
  /** Logged-in user phone (9 national digits, or 966… / 05…). */
  publisherPhoneDigits?: string;
};

let publishedListings: Property[] = [];
let publishedSequence = 0;
let didInitSequence = false;

async function initPublishedSequenceOnce(): Promise<void> {
  if (didInitSequence) return;
  didInitSequence = true;
  const raw = await secureGet(STORAGE_KEYS.localPublishedSequenceV1);
  const n = raw ? Number(raw) : NaN;
  if (Number.isFinite(n) && n >= 0) {
    publishedSequence = Math.floor(n);
  }
}

function inferListingType(category?: string): ListingType {
  const normalized = (category ?? "").toLowerCase();
  if (normalized.startsWith("rent-")) return "rent";
  if (normalized.startsWith("sale-")) return "sale";
  if (normalized.includes("rent")) return "rent";
  if (normalized.includes("sale")) return "sale";
  return "sale";
}

function inferPropertyType(category?: string): PropertyType {
  const normalized = (category ?? "").toLowerCase();
  if (normalized === "rent-1" || normalized === "sale-3") return "apartment";
  if (normalized === "rent-2" || normalized === "sale-1") return "villa";
  if (normalized === "rent-3") return "big_flat";
  if (normalized === "rent-4" || normalized === "sale-6") return "lounge";
  if (normalized === "rent-5" || normalized === "sale-5") return "small_house";
  if (normalized === "rent-6" || normalized === "sale-8") return "store";
  if (normalized === "rent-7" || normalized === "sale-4") return "building";
  if (normalized === "rent-8" || normalized === "sale-2") return "land";
  if (normalized === "rent-9") return "room";
  if (normalized === "rent-10") return "office";
  if (normalized === "rent-11") return "tent";
  if (normalized === "rent-12") return "warehouse";
  if (normalized === "rent-13") return "chalet";
  if (normalized === "sale-7") return "farm";
  if (normalized === "sale-9") return "floor";
  if (normalized.includes("apartment")) return "apartment";
  if (normalized.includes("villa")) return "villa";
  if (normalized.includes("land")) return "land";
  if (normalized.includes("building")) return "building";
  if (normalized.includes("small house")) return "small_house";
  if (normalized.includes("lounge")) return "lounge";
  if (normalized.includes("farm")) return "farm";
  if (normalized.includes("store")) return "store";
  if (normalized.includes("floor")) return "floor";
  if (normalized.includes("room")) return "room";
  if (normalized.includes("office")) return "office";
  if (normalized.includes("tent")) return "tent";
  if (normalized.includes("warehouse")) return "warehouse";
  if (normalized.includes("big flat")) return "big_flat";
  if (normalized.includes("chalet")) return "chalet";
  return "other";
}

function nextPublishedSequence(): number {
  // Best-effort init; no need to await for UI-only sequence.
  void initPublishedSequenceOnce();
  publishedSequence += 1;
  secureSet(
    STORAGE_KEYS.localPublishedSequenceV1,
    String(publishedSequence),
  ).catch(() => {});
  return publishedSequence;
}

function publisherPhoneToAdvertiserField(
  digitsRaw: string | undefined,
): string | undefined {
  const trimmed = digitsRaw?.trim();
  if (!trimmed) return undefined;
  return normalizeAdvertiserPhoneForTel(trimmed);
}

function normalizeMarkerPrice(input?: string): string {
  const raw = (input ?? "").trim();
  if (!raw) return "---";
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return raw;
  const value = Number(digits);
  if (!Number.isFinite(value) || value <= 0) return raw;
  if (value >= 1000000) {
    const compact = (value / 1000000).toFixed(1).replace(/\.0$/, "");
    return `${compact} M`;
  }
  if (value >= 1000) {
    const compact = (value / 1000).toFixed(1).replace(/\.0$/, "");
    return `${compact} K`;
  }
  return String(value);
}

export function getPublishedListings(): Property[] {
  return publishedListings;
}

export function addPublishedListingFromMarketingRequest(
  input: MarketingPublishInput,
): Property {
  const listingType = inferListingType(input.selectedCategory);
  const type = inferPropertyType(input.selectedCategory);
  const photoUris =
    (input.attachments ?? [])
      .filter((a) => a.mediaType !== "video" && Boolean(a.uri?.trim()))
      .map((a) => a.uri.trim()) ?? [];
  const images =
    photoUris.length > 0 ? photoUris : [getDefaultImageUrl("property")];
  const imageCaptions =
    photoUris.length > 0
      ? (input.attachments ?? [])
          .filter((a) => a.mediaType !== "video" && Boolean(a.uri?.trim()))
          .map((a) => (a.note ?? "").trim())
      : [];
  const videoUris =
    (input.attachments ?? [])
      .filter((a) => a.mediaType === "video" && Boolean(a.uri?.trim()))
      .map((a) => a.uri.trim()) ?? [];

  const numericArea = Number((input.area ?? "").replace(/[^\d]/g, "")) || 0;
  const lat = input.selectedLocation?.latitude ?? 24.7136;
  const lng = input.selectedLocation?.longitude ?? 46.6753;
  const address =
    input.locationDisplayName?.trim() || "Published from Marketing Request";

  const sequence = nextPublishedSequence();
  const nowIso = new Date().toISOString();

  let rentPaymentSchedule = buildRentPaymentScheduleFromPublishForm(
    input.rentPaymentOptions,
  );
  if (listingType === "rent" && rentPaymentSchedule.length === 0) {
    const digits = (input.price ?? "").replace(/[^\d]/g, "");
    const n = digits ? Number(digits) : NaN;
    if (Number.isFinite(n) && n > 0) {
      rentPaymentSchedule = buildRentPaymentScheduleFromPublishForm({
        annualSar: n,
      });
    }
  }

  const publisherName = input.publisherDisplayName?.trim() || undefined;
  const publisherPhone = publisherPhoneToAdvertiserField(
    input.publisherPhoneDigits,
  );
  const publisherDigits = (input.publisherPhoneDigits ?? "").replace(/\D/g, "");

  const created: Property = {
    // Keep data IDs in a safe range away from mocked static IDs.
    id: 500000 + sequence,
    listingId: sequence,
    createdAt: nowIso,
    updatedAt: nowIso,
    lat,
    lng,
    type,
    listingType,
    verified: false,
    area: numericArea,
    usage: "family",
    bedrooms: 0,
    livingRooms: 0,
    restrooms: 0,
    estateAge: 0,
    address,
    city: "Riyadh",
    images,
    imageCaptions,
    videoUris,
    categoryLabel: input.categoryLabel?.trim() || undefined,
    categoryId: input.selectedCategory?.trim() || undefined,
    commissionText: input.commissionText?.trim() || undefined,
    detailsItems: input.detailsItems,
    description: input.description?.trim(),
    price: normalizeMarkerPrice(input.price),
    ...(publisherName ? { advertiserName: publisherName } : {}),
    ...(publisherPhone ? { advertiserPhone: publisherPhone } : {}),
    ...(publisherDigits.length > 0
      ? { advertiserId: `publisher-${publisherDigits}` }
      : {}),
    ...(listingType === "rent" && rentPaymentSchedule.length > 0
      ? { rentPaymentSchedule }
      : {}),
  };

  publishedListings = [created, ...publishedListings];
  return created;
}

function nationalDigitsFromStoredPhone(phone?: string): string {
  const normalized = normalizeAdvertiserPhoneForTel(phone);
  if (!normalized) return "";
  const d = normalized.replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("966")) return d.slice(3);
  if (d.length === 9 && d.startsWith("5")) return d;
  return d;
}

function publishedListingMatchesUser(
  p: Property,
  userPhoneDigits: string | null | undefined,
): boolean {
  if (p.id < 500000) return false;
  const u = (userPhoneDigits ?? "").replace(/\D/g, "");
  if (!u) return true;
  const fromPhone = nationalDigitsFromStoredPhone(p.advertiserPhone);
  if (fromPhone && fromPhone === u) return true;
  const idStr = String(p.advertiserId ?? "");
  if (idStr.startsWith("publisher-")) {
    const idDigits = idStr.replace("publisher-", "").replace(/\D/g, "");
    return idDigits === u;
  }
  return false;
}

/**
 * Current vs archived published listings for the logged-in user (by stored phone).
 * When phone is missing, all in-app published listings (id ≥ 500000) are included (dev fallback).
 */
export function getUserProfilePublishedAds(
  userPhoneDigits: string | null | undefined,
): { current: Property[]; archived: Property[] } {
  const mine = getPublishedListings().filter((p) =>
    publishedListingMatchesUser(p, userPhoneDigits),
  );
  const current = mine.filter((p) => !p.isArchived);
  const archived = mine.filter((p) => Boolean(p.isArchived));
  return { current, archived };
}

export function setPublishedListingArchived(
  propertyId: number,
  archived: boolean,
): void {
  publishedListings = publishedListings.map((p) =>
    p.id === propertyId ? { ...p, isArchived: archived } : p,
  );
}
