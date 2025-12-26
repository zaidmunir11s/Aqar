/**
 * Feature mapping utility
 * Maps toggle option names from the order form to feature display names
 */

/**
 * Toggle name -> Feature display name mapping
 * This maps the toggle state keys from useOrderForm to human-readable feature names
 */
const TOGGLE_TO_FEATURE_MAP: Record<string, string> = {
  // Apartment for rent
  furnished: "Furnished",
  carEntrance: "Car Entrance",
  airConditioned: "Air Conditioned",
  privateRoof: "Private Roof",
  apartmentInVilla: "Apartment in Villa",
  twoEntrances: "Two Entrances",
  specialEntrances: "Special Entrance",

  // Villa for sale
  stairs: "Stairs",
  driverRoom: "Driver Room",
  maidRoom: "Maid Room",
  pool: "Pool",
  villaFurnished: "Furnished",
  kitchen: "Kitchen",
  villaCarEntrance: "Car Entrance",
  basement: "Basement",
  nearBus: "Near Bus",
  nearMetro: "Near Metro",

  // Apartment for sale
  apartmentSaleCarEntrance: "Car Entrance",
  apartmentSalePrivateRoof: "Private Roof",
  apartmentSaleInVilla: "Apartment in Villa",
  apartmentSaleTwoEntrances: "Two Entrances",
  apartmentSaleSpecialEntrances: "Special Entrance",

  // Small house for sale
  smallHouseFurnished: "Furnished",
  tent: "Tent",

  // Floor for sale
  floorSaleCarEntrance: "Car Entrance",

  // Villa for rent
  villaRentStairs: "Stairs",
  villaRentAirConditioned: "Air Conditioned",

  // Big flat for rent
  bigFlatCarEntrance: "Car Entrance",
  bigFlatAirConditioned: "Air Conditioned",
  bigFlatInVilla: "Apartment in Villa",
  bigFlatTwoEntrances: "Two Entrances",
  bigFlatSpecialEntrances: "Special Entrance",

  // Lounge for rent
  loungeRentPool: "Pool",
  footballPitch: "Football Pitch",
  volleyballCourt: "Volleyball Court",
  loungeRentTent: "Tent",
  loungeRentKitchen: "Kitchen",
  playground: "Playground",
  familySection: "Family Section",

  // Small house for rent
  smallHouseRentFurnished: "Furnished",
  smallHouseRentTent: "Tent",
  smallHouseRentKitchen: "Kitchen",

  // Room for rent
  roomRentKitchen: "Kitchen",

  // Office for rent
  officeRentFurnished: "Furnished",

  // Chalet for rent
  chaletRentPool: "Pool",
  chaletFootballPitch: "Football Pitch",
  chaletVolleyballCourt: "Volleyball Court",
  chaletRentTent: "Tent",
  chaletRentKitchen: "Kitchen",
  chaletPlayground: "Playground",
};

/**
 * Extract selected features from orderFormData
 * Uses OR logic: if ANY toggle is selected, include that feature
 * 
 * @param orderFormData - The order form data object containing toggle states
 * @returns Array of feature display names that were selected
 */
export function getSelectedFeatures(orderFormData: any): string[] {
  if (!orderFormData) return [];

  const features: string[] = [];

  // Check each toggle in the mapping
  for (const [toggleKey, featureName] of Object.entries(TOGGLE_TO_FEATURE_MAP)) {
    // If toggle is true (ON), add the corresponding feature
    if (orderFormData[toggleKey] === true) {
      // Avoid duplicates (e.g., both 'furnished' and 'villaFurnished' map to 'Furnished')
      if (!features.includes(featureName)) {
        features.push(featureName);
      }
    }
  }

  return features;
}

/**
 * Get feature display name for a toggle key
 * Useful for displaying feature names in UI
 * 
 * @param toggleKey - The toggle state key (e.g., 'furnished', 'pool')
 * @returns Feature display name or null if not found
 */
export function getFeatureName(toggleKey: string): string | null {
  return TOGGLE_TO_FEATURE_MAP[toggleKey] || null;
}

/**
 * Get all available feature names
 * Useful for displaying all possible features
 * 
 * @returns Array of unique feature display names
 */
export function getAllFeatureNames(): string[] {
  const features = Object.values(TOGGLE_TO_FEATURE_MAP);
  // Remove duplicates and return
  return Array.from(new Set(features)).sort();
}
