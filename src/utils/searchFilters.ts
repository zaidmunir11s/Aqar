import type { Property } from "../types/property";
import type { SearchFilterState } from "../types/searchFilters";

/**
 * Apply search filters to properties. Used by PropertyListScreen, DailyScreen, and SearchFilterModal.
 */
export function applySearchFilters(
  properties: Property[],
  filters: SearchFilterState
): Property[] {
  let filtered = [...properties];

  if (filters.selectedPropertyType) {
    filtered = filtered.filter((p) => p.type === filters.selectedPropertyType);
  }

  if (filters.fromPrice || filters.toPrice) {
    filtered = filtered.filter((p) => {
      let price: number | null = null;

      if (p.listingType === "daily" && "dailyPrice" in p) {
        price = p.dailyPrice;
      } else if (p.listingType === "daily" && "monthlyPrice" in p) {
        price = p.monthlyPrice;
      }

      if (price === null) return false;

      const fromPrice = filters.fromPrice ? parseFloat(filters.fromPrice) : 0;
      const toPrice = filters.toPrice ? parseFloat(filters.toPrice) : Infinity;

      return price >= fromPrice && price <= toPrice;
    });
  }

  if (filters.usageType) {
    const usage = filters.usageType === "Singles" ? "single" : "family";
    filtered = filtered.filter((p) => p.usage === usage);
  }

  if (filters.bedrooms && filters.bedrooms !== "" && filters.bedrooms !== "All") {
    if (filters.bedrooms === "6+") {
      filtered = filtered.filter((p) => p.bedrooms >= 6);
    } else {
      const bedrooms = parseInt(filters.bedrooms, 10);
      if (!Number.isNaN(bedrooms)) {
        filtered = filtered.filter((p) => p.bedrooms === bedrooms);
      }
    }
  }

  if (filters.livingRooms && filters.livingRooms !== "" && filters.livingRooms !== "All") {
    const livingRooms = parseInt(filters.livingRooms.replace("+", ""), 10);
    if (!Number.isNaN(livingRooms)) {
      filtered = filtered.filter((p) => p.livingRooms >= livingRooms);
    }
  }

  if (filters.wc && filters.wc !== "" && filters.wc !== "All") {
    const wc = parseInt(filters.wc.replace("+", ""), 10);
    if (!Number.isNaN(wc)) {
      filtered = filtered.filter((p) => p.restrooms >= wc);
    }
  }

  const featureFilters: { [key: string]: string } = {
    furnished: "Furnished",
    carEntrance: "Car Entrance",
    airConditioned: "Air Conditioned",
    privateRoof: "Private Roof",
    apartmentInVilla: "Apartment in Villa",
    twoEntrances: "Two Entrances",
    specialEntrances: "Special Entrances",
    nearBus: "Near Bus",
    nearMetro: "Near Metro",
    pool: "Pool",
    footballPitch: "Football Pitch",
    volleyballCourt: "Volleyball Court",
    tent: "Tent",
    kitchen: "Kitchen",
    playground: "Playground",
    familySection: "Family Section",
    stairs: "Stairs",
    driverRoom: "Driver Room",
    maidRoom: "Maid Room",
    basement: "Basement",
  };

  Object.entries(featureFilters).forEach(([key, featureName]) => {
    if (filters[key as keyof SearchFilterState] === true) {
      filtered = filtered.filter(
        (p) => p.features && p.features.includes(featureName)
      );
    }
  });

  return filtered;
}
