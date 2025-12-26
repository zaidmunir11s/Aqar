export interface FilterOption {
  id: string;
  label: string;
  type: string | null;
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
