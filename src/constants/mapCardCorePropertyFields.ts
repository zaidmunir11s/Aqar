import type { Property, PropertyType } from "../types/property";

/** Max chips on map bottom card (target 2–3 core fields). */
export const MAP_CARD_MAX_CORE_FIELDS = 3;

const RESIDENTIAL = ["listings.area", "listings.bedrooms", "listings.restrooms"] as const;
const LAND = ["listings.area", "listings.streetWidth", "listings.landType"] as const;
const STORE = ["listings.area", "listings.streetDirection", "listings.streetWidth"] as const;
const ROOM = ["listings.area", "listings.streetWidth", "listings.realEstateAge"] as const;
const OFFICE = ["listings.area", "listings.streetDirection", "listings.streetWidth"] as const;
const BUILDING = ["listings.area", "listings.rooms", "listings.streetWidth"] as const;
const FARM = ["listings.area", "listings.streetWidth", "listings.well"] as const;
const TENT_ONLY = ["listings.area"] as const;
const FLOOR_SALE = ["listings.area", "listings.bedrooms", "listings.floor"] as const;

/**
 * Core Property Information fields to surface on the map card, in order.
 * Matches marketing-request category forms (`rent-1` … `sale-9`).
 */
export const MARKETING_CATEGORY_CORE_FIELD_KEYS: Record<string, readonly string[]> = {
  "rent-1": [...RESIDENTIAL],
  "rent-2": [...RESIDENTIAL],
  "rent-3": [...RESIDENTIAL],
  "rent-4": [...RESIDENTIAL],
  "rent-5": [...RESIDENTIAL],
  "rent-6": [...STORE],
  "rent-7": [...BUILDING],
  "rent-8": [...LAND],
  "rent-9": [...ROOM],
  "rent-10": [...OFFICE],
  "rent-11": [...TENT_ONLY],
  "rent-12": [...OFFICE],
  "rent-13": [...RESIDENTIAL],
  "sale-1": [...RESIDENTIAL],
  "sale-2": [...LAND],
  "sale-3": [...RESIDENTIAL],
  "sale-4": [...BUILDING],
  "sale-5": [...RESIDENTIAL],
  "sale-6": [...RESIDENTIAL],
  "sale-7": [...FARM],
  "sale-8": [...STORE],
  "sale-9": [...FLOOR_SALE],
};

const TYPE_FALLBACK: Partial<Record<PropertyType, readonly string[]>> = {
  land: [...LAND],
  apartment: [...RESIDENTIAL],
  villa: [...RESIDENTIAL],
  big_flat: [...RESIDENTIAL],
  lounge: [...RESIDENTIAL],
  small_house: [...RESIDENTIAL],
  room: [...ROOM],
  office: [...OFFICE],
  store: [...STORE],
  warehouse: [...OFFICE],
  building: [...BUILDING],
  chalet: [...RESIDENTIAL],
  tent: [...TENT_ONLY],
  farm: [...FARM],
  floor: [...FLOOR_SALE],
  studio: [...RESIDENTIAL],
  hall: [...RESIDENTIAL],
  furnished_apartment: [...RESIDENTIAL],
  other: [...RESIDENTIAL],
};

export function resolveMapCardCoreFieldKeys(property: Property): readonly string[] {
  const cid = property.categoryId?.trim();
  if (cid && MARKETING_CATEGORY_CORE_FIELD_KEYS[cid]) {
    return MARKETING_CATEGORY_CORE_FIELD_KEYS[cid];
  }
  const fromType = TYPE_FALLBACK[property.type];
  if (fromType) return fromType;
  return [...RESIDENTIAL];
}
