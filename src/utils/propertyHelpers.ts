import { Image } from "react-native";
import type { Property, RentSaleProperty } from "../types/property";

// Bundled placeholder when a listing has no photos (marketing publish, detail, cards).

const DEFAULT_PROPERTY_AD_IMAGE = require("../../assets/images/default-image-for-ads.png");

export interface FilterOption {
  id: string;
  label: string;
  type: string | null;
}

/**
 * Get translated property type label based on property type and listing type
 * @param type - Property type (e.g., "apartment", "villa", "big_flat")
 * @param listingType - Listing type ("rent", "sale", "daily")
 * @param t - Translation function from i18next
 * @returns Translated type label
 */
export function getTranslatedPropertyTypeLabel(
  type: string,
  listingType: "rent" | "sale" | "daily",
  t: (key: string) => string,
): string {
  // Map property type to translation key format (convert snake_case to camelCase)
  const typeKeyMap: Record<string, string> = {
    apartment: "apartment",
    villa: "villa",
    big_flat: "bigFlat",
    lounge: "lounge",
    small_house: "smallHouse",
    store: "store",
    building: "building",
    land: "land",
    room: "room",
    office: "office",
    tent: "tent",
    warehouse: "warehouse",
    furnished_apartment: "apartment", // Use apartment for furnished
    chalet: "chalet",
    farm: "farm",
    floor: "floor",
    studio: "studio",
    hall: "hall",
  };

  const typeKey = typeKeyMap[type.toLowerCase()] || type.toLowerCase();
  const listingKey =
    listingType === "daily"
      ? "Daily"
      : listingType === "rent"
        ? "Rent"
        : "Sale";
  const translationKey = `listings.propertyTypes.${typeKey}For${listingKey}`;

  // Try to get the translation, fallback to a generic pattern if not found
  const translated = t(translationKey);
  if (translated !== translationKey) {
    return translated;
  }

  // Fallback: construct from base type name
  const baseTypeName =
    t(`listings.propertyTypes.${type.toLowerCase()}`) || type;
  const listingLabel =
    listingType === "daily"
      ? t("listings.forRent") || "for daily rent"
      : listingType === "rent"
        ? t("listings.forRent") || "for rent"
        : t("listings.forSale") || "for sale";

  return `${baseTypeName} ${listingLabel}`;
}

const normTitleSuffix = (s: string): string =>
  s.toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

/**
 * Builds list/card titles like "Villa for rent" without duplicating the suffix when the base
 * string already ends with the translated "for rent" / "for sale" (e.g. marketing categoryLabel).
 */
export function ensurePropertyCardListingSuffix(
  baseTitle: string,
  listingType: "rent" | "sale",
  t: (key: string) => string,
): string {
  const base = baseTitle.trim();
  const suffix = (
    listingType === "rent" ? t("listings.forRent") : t("listings.forSale")
  ).trim();
  if (!base) return suffix;
  if (!suffix) return base;
  const nBase = normTitleSuffix(base);
  const nSuffix = normTitleSuffix(suffix);
  if (nBase.endsWith(nSuffix)) return base;
  return `${base} ${suffix}`;
}

/**
 * Get property type label from filter options
 * @param type - Property type
 * @param filterOptions - Array of filter options
 * @returns Type label
 */
export function getTypeLabelFromType(
  type: string,
  filterOptions: FilterOption[],
): string {
  const opt = filterOptions.find((o) => o.type === type);
  return opt ? opt.label : type;
}

/**
 * Format price string by replacing K and M with full numbers
 * @param price - Price string like "90 K" or "1.2 M"
 * @returns Formatted price
 */
export function formatPrice(price: string | undefined): string {
  if (!price) return "0";
  const trimmed = String(price).trim();
  const kMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*K$/i);
  if (kMatch) {
    const n = Math.round(parseFloat(kMatch[1]) * 1000);
    return Number.isFinite(n) ? n.toLocaleString("en-US") : "0";
  }
  const mMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*M$/i);
  if (mMatch) {
    const n = Math.round(parseFloat(mMatch[1]) * 1_000_000);
    return Number.isFinite(n) ? n.toLocaleString("en-US") : "0";
  }

  const digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return "0";
  const n = Number(digits);
  return Number.isFinite(n) ? n.toLocaleString("en-US") : "0";
}

/**
 * Parse compact rent marker/list price (e.g. "45 K", "1.2 M", plain digits) to SAR.
 */
export function parseRentListingPriceToSar(
  raw: string | undefined,
): number | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;
  const kMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*K$/i);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
  const mMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*M$/i);
  if (mMatch) return Math.round(parseFloat(mMatch[1]) * 1000000);
  const digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Annual rent for cards: yearly row from schedule when present, else parsed `price`.
 */
export function getRentAnnualDisplayAmountSar(
  property: Property,
): number | null {
  if (property.listingType !== "rent") return null;
  const rent = property as RentSaleProperty;
  const schedule = rent.rentPaymentSchedule;
  const yearly = schedule?.find((r) => r.frequency === "yearly");
  if (
    yearly != null &&
    Number.isFinite(yearly.primaryAmountSar) &&
    yearly.primaryAmountSar > 0
  ) {
    return Math.round(yearly.primaryAmountSar);
  }
  return parseRentListingPriceToSar(rent.price);
}

const localeFromLanguage = (language: string | undefined): string =>
  language?.toLowerCase().startsWith("ar") ? "ar-SA" : "en-US";

/**
 * List/map card line for rent: formatted annual amount + SAR + / Yearly (annual contract).
 */
export function formatRentPropertyCardPriceLine(
  property: Property,
  t: (key: string) => string,
  language?: string,
): string {
  if (property.listingType !== "rent") return "";
  const loc = localeFromLanguage(language);
  const amount = getRentAnnualDisplayAmountSar(property);
  const sar = t("listings.sar");
  const yearly = t("listings.yearly");
  if (amount != null) {
    return `${amount.toLocaleString(loc)} ${sar} / ${yearly}`;
  }
  const rent = property as RentSaleProperty;
  const fallback = formatPrice(rent.price);
  return `${fallback || "0"} ${sar} / ${yearly}`;
}

/**
 * Get usage label (Family or Single)
 * @param usage - Usage type
 * @returns Usage label
 */
export function getUsageLabel(usage: string): string {
  return usage === "family" ? "Family" : "Single";
}

/**
 * Resolved URI for the bundled default listing image (no user photos).
 */
export function getDefaultPropertyAdImageUri(): string {
  const src = Image.resolveAssetSource(DEFAULT_PROPERTY_AD_IMAGE);
  return src?.uri ?? "";
}

/**
 * Get default image source/URI if no images available.
 * @param type - `"project"` keeps remote placeholder; `"property"` uses bundled ad placeholder asset.
 */
export function getDefaultImageUrl(type: string = "property"): string {
  if (type === "project") {
    return "https://via.placeholder.com/400x250.png?text=Project+Image";
  }
  const local = getDefaultPropertyAdImageUri();
  return local || "https://via.placeholder.com/400x250.png?text=Property+Image";
}

/** True when the listing only shows the bundled “no photos” placeholder (no carousel / see-all). */
export function isOnlyDefaultPropertyPlaceholderImages(
  images: string[] | undefined | null,
): boolean {
  if (!images || images.length !== 1) return false;
  const uri = images[0]?.trim() ?? "";
  if (!uri) return false;
  const bundled = getDefaultPropertyAdImageUri();
  if (bundled && uri === bundled) return true;
  if (uri.includes("default-image-for-ads")) return true;
  const lower = uri.toLowerCase();
  if (lower.includes("via.placeholder.com") && lower.includes("property"))
    return true;
  return false;
}

/**
 * Normalize stored advertiser phone to E.164 for `tel:` links.
 * Accepts +966..., national 9 digits (5xxxxxxxx), or 966..., 05...
 */
export function normalizeAdvertiserPhoneForTel(
  input?: string | null,
): string | undefined {
  const raw = input?.trim();
  if (!raw) return undefined;
  if (raw.startsWith("+")) {
    const d = raw.replace(/\D/g, "");
    if (d.length >= 10) return `+${d}`;
    return undefined;
  }
  const d = raw.replace(/\D/g, "");
  let national = d;
  if (d.length === 12 && d.startsWith("966")) national = d.slice(3);
  else if (d.length === 10 && d.startsWith("05")) national = d.slice(1);
  if (national.length === 9 && national.startsWith("5")) {
    return `+966${national}`;
  }
  return undefined;
}

/** WhatsApp `phone` query param: country code + national, digits only (no +). */
export function normalizeAdvertiserPhoneForWhatsApp(
  input?: string | null,
): string | undefined {
  const tel = normalizeAdvertiserPhoneForTel(input);
  if (!tel) return undefined;
  return tel.replace(/^\+/, "");
}
