import type { Property, RentSaleProperty } from "../types/property";
import {
  formatPrice,
  formatRentPropertyCardPriceLine,
  getTranslatedPropertyTypeLabel,
  ensurePropertyCardListingSuffix,
} from "./propertyHelpers";
import { isPublishedListingProperty } from "./propertyInfoRows";

/**
 * Title + price line for PropertyCard on profile ads (matches list screen behavior).
 */
export function buildProfileAdCardLines(
  item: Property,
  t: (key: string) => string,
  language: string | undefined
): { title: string; priceLine: string; listingTypeForCard: "rent" | "sale" } {
  const listingType = item.listingType === "rent" ? "rent" : "sale";
  const typeLabel = getTranslatedPropertyTypeLabel(item.type, listingType, t);
  const published = isPublishedListingProperty(item);
  const categoryTitle = item.categoryLabel?.trim();

  if (listingType === "rent") {
    const core = published && categoryTitle ? categoryTitle : typeLabel;
    const title = ensurePropertyCardListingSuffix(core, "rent", t);
    const priceLine = formatRentPropertyCardPriceLine(item, t, language);
    return { title, priceLine, listingTypeForCard: "rent" };
  }

  const core = published && categoryTitle ? categoryTitle : typeLabel;
  const title = ensurePropertyCardListingSuffix(core, "sale", t);
  const saleProperty = item as RentSaleProperty;
  const rawPrice = saleProperty?.price?.trim();
  let priceLine: string;
  if (published && rawPrice) {
    priceLine = `${rawPrice} ${t("listings.sar")}`;
  } else {
    priceLine = `${rawPrice ? formatPrice(saleProperty.price) : "0"} ${t("listings.sar")}`;
  }
  return { title, priceLine, listingTypeForCard: "sale" };
}
