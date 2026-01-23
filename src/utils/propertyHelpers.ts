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
  t: (key: string) => string
): string {
  // Map property type to translation key format (convert snake_case to camelCase)
  const typeKeyMap: Record<string, string> = {
    "apartment": "apartment",
    "villa": "villa",
    "big_flat": "bigFlat",
    "lounge": "lounge",
    "small_house": "smallHouse",
    "store": "store",
    "building": "building",
    "land": "land",
    "room": "room",
    "office": "office",
    "tent": "tent",
    "warehouse": "warehouse",
    "furnished_apartment": "apartment", // Use apartment for furnished
    "chalet": "chalet",
    "farm": "farm",
    "floor": "floor",
    "studio": "studio",
    "hall": "hall",
  };
  
  const typeKey = typeKeyMap[type.toLowerCase()] || type.toLowerCase();
  const listingKey = listingType === "daily" ? "Daily" : listingType === "rent" ? "Rent" : "Sale";
  const translationKey = `listings.propertyTypes.${typeKey}For${listingKey}`;
  
  // Try to get the translation, fallback to a generic pattern if not found
  const translated = t(translationKey);
  if (translated !== translationKey) {
    return translated;
  }
  
  // Fallback: construct from base type name
  const baseTypeName = t(`listings.propertyTypes.${type.toLowerCase()}`) || type;
  const listingLabel = listingType === "daily" 
    ? t("listings.forRent") || "for daily rent"
    : listingType === "rent"
    ? t("listings.forRent") || "for rent"
    : t("listings.forSale") || "for sale";
  
  return `${baseTypeName} ${listingLabel}`;
}

/**
 * Get property type label from filter options
 * @param type - Property type
 * @param filterOptions - Array of filter options
 * @returns Type label
 */
export function getTypeLabelFromType(
  type: string,
  filterOptions: FilterOption[]
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
  const priceStr = String(price);
  return priceStr.replace(" M", ",000,000").replace(" K", ",000");
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
 * Get default image URL if no images available
 * @param type - Type of property/project
 * @returns Placeholder image URL
 */
export function getDefaultImageUrl(type: string = "property"): string {
  const text = type === "project" ? "Project" : "Property";
  return `https://via.placeholder.com/400x250.png?text=${text}+Image`;
}
