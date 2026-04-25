import { Property } from "../types/property";
import { SearchRequestData } from "@/context/searchRequest-context";
import { getSelectedFeatures } from "./featureMapping";

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Map category name to property type
 */
function mapCategoryToType(category: string): string | null {
  const categoryMap: Record<string, string> = {
    "Apartment for rent": "apartment",
    "Villa for rent": "villa",
    "Big flat for rent": "big_flat",
    "Lounge for rent": "lounge",
    "Small house for rent": "small_house",
    "Store for rent": "store",
    "Building for rent": "building",
    "Land for rent": "land",
    "Room for rent": "room",
    "Office for rent": "office",
    "Tent for rent": "tent",
    "Warehouse for rent": "warehouse",
    "Chalet for rent": "chalet",
    "Villa for sale": "villa",
    "Land for sale": "land",
    "Apartment for sale": "apartment",
    "Building for sale": "building",
    "Small house for sale": "small_house",
    "Lounge for sale": "lounge",
    "Farm for sale": "farm",
    "Store for sale": "store",
    "Floor for sale": "floor",
  };
  return categoryMap[category] || null;
}

export function getListingTypeFromCategory(
  category: string,
): "rent" | "sale" | null {
  return getListingType(category);
}

export function getPropertyTypeFromCategory(category: string): string | null {
  return mapCategoryToType(category);
}

/**
 * Extract listing type from category
 */
function getListingType(category: string): "rent" | "sale" | null {
  if (category.toLowerCase().includes("rent")) return "rent";
  if (category.toLowerCase().includes("sale")) return "sale";
  return null;
}

/**
 * Parse price string to number (e.g., "90 K" -> 90000)
 */
function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^\d.KkMm]/g, "");
  const num = parseFloat(cleaned);
  if (cleaned.toLowerCase().includes("k")) return num * 1000;
  if (cleaned.toLowerCase().includes("m")) return num * 1000000;
  return num;
}

/**
 * Check if property matches the search criteria
 */
export function matchesCriteria(
  property: Property,
  request: SearchRequestData,
): boolean {
  const orderData = request.orderFormData || {};

  // Check listing type
  const listingType = getListingType(request.category);
  if (listingType && property.listingType !== listingType) {
    return false;
  }

  // Check property type
  const expectedType = mapCategoryToType(request.category);
  if (expectedType && property.type !== expectedType) {
    return false;
  }

  // Check location (within 10km radius)
  const distance = calculateDistance(
    request.location.latitude,
    request.location.longitude,
    property.lat,
    property.lng,
  );
  if (distance > 10) {
    return false; // Properties more than 10km away
  }

  // Check bedrooms - "any of" logic: if user selects "1", match properties with 1 OR MORE bedrooms
  if (orderData.selectedBedroom && orderData.selectedBedroom !== "ALL") {
    const requiredBedrooms = parseInt(orderData.selectedBedroom);
    // Match if property has at least the required bedrooms (>=)
    if (property.bedrooms < requiredBedrooms) {
      return false;
    }
  }

  // Check living rooms - "any of" logic: if user selects "1", match properties with 1 OR MORE living rooms
  if (orderData.selectedLivingRoom && orderData.selectedLivingRoom !== "ALL") {
    const requiredLivingRooms = parseInt(orderData.selectedLivingRoom);
    // Match if property has at least the required living rooms (>=)
    if (property.livingRooms < requiredLivingRooms) {
      return false;
    }
  }

  // Check WC/restrooms - "any of" logic: if user selects "1", match properties with 1 OR MORE restrooms
  if (orderData.selectedWc && orderData.selectedWc !== "ALL") {
    const requiredWc = parseInt(orderData.selectedWc);
    // Match if property has at least the required restrooms (>=)
    if (property.restrooms < requiredWc) {
      return false;
    }
  }

  // Check features with AND logic
  // If user selects ANY features, property must have ALL of them
  // If user selects NO features, don't filter by features (all properties match)
  const selectedFeatures = getSelectedFeatures(orderData);
  if (selectedFeatures.length > 0) {
    const propertyFeatures = property.features || [];

    // AND logic: property must have ALL of the selected features
    const hasAllFeatures = selectedFeatures.every((selectedFeature) =>
      propertyFeatures.includes(selectedFeature),
    );

    if (!hasAllFeatures) {
      return false;
    }
  }

  // Check price range
  if (
    orderData.fromPrice ||
    orderData.toPrice ||
    orderData.priceFrom ||
    orderData.priceTo
  ) {
    const fromPrice = parseFloat(
      orderData.fromPrice || orderData.priceFrom || "0",
    );
    const toPrice = parseFloat(
      orderData.toPrice || orderData.priceTo || "999999999",
    );

    // Handle different property types
    let propertyPrice = 0;
    if ("price" in property && property.price) {
      propertyPrice = parsePrice(property.price);
    } else if ("dailyPrice" in property) {
      propertyPrice = (property as any).dailyPrice || 0;
    }

    if (propertyPrice < fromPrice || propertyPrice > toPrice) {
      return false;
    }
  }

  // Check area range
  if (orderData.areaFrom || orderData.areaTo) {
    const fromArea = parseFloat(orderData.areaFrom || "0");
    const toArea = parseFloat(orderData.areaTo || "999999999");

    if (property.area < fromArea || property.area > toArea) {
      return false;
    }
  }

  // Check age
  if (orderData.age && orderData.age !== "ALL") {
    const maxAge = parseInt(orderData.age);
    if (property.estateAge > maxAge) {
      return false;
    }
  }

  // Check if only ads with photo required
  if (
    request.onlyAdsWithPhoto &&
    (!property.images || property.images.length === 0)
  ) {
    return false;
  }

  return true;
}

/**
 * Find matching properties for a search request
 */
export function findMatchingPropertiesFromList(
  properties: Property[],
  request: SearchRequestData,
): Property[] {
  if (!request?.category) return [];
  return properties.filter((property) => matchesCriteria(property, request));
}
