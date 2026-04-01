import { PROPERTY_DATA } from "@/data/propertyData";
import type { Property } from "@/types/property";
import { isValidLatitude, isValidLongitude } from "@/utils/geoValidation";
import { getPublishedListings } from "@/utils/publishedListingsStore";

/** Property has lat/lng suitable for map markers. */
export function hasValidMapCoordinates(property: Property): boolean {
  return isValidLatitude(property.lat) && isValidLongitude(property.lng);
}

/**
 * Rent/sale rules for map + property list: both tabs exclude project markers/listings.
 */
export function propertyMatchesRentSaleTab(p: Property, tab: "rent" | "sale"): boolean {
  if ("isProject" in p && p.isProject) return false;
  if (tab === "sale") return p.listingType === "sale";
  return p.listingType === "rent";
}

export type RentSaleFilterOptions = {
  /** When true (map), drop items without coordinates. */
  requireMapCoordinates?: boolean;
};

export function filterRentSaleFromPropertyData(
  tab: "rent" | "sale",
  options?: RentSaleFilterOptions
): Property[] {
  const allListings = [...getPublishedListings(), ...PROPERTY_DATA];
  return allListings.filter((p) => {
    if (options?.requireMapCoordinates && !hasValidMapCoordinates(p)) {
      return false;
    }
    return propertyMatchesRentSaleTab(p, tab);
  });
}
