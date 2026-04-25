import type { Property } from "../types/property";
import type { SearchFilterState } from "../types/searchFilters";
import { calculateDays } from "./dateHelpers";

/** Params for filtering daily listings (city + dates). */
export interface DailyFilterDates {
  startDate: string | null;
  endDate: string | null;
}

/**
 * Filter daily properties by city and dates (shared logic for DailyScreen and BookingListScreen).
 * Treats empty city, "City", and "Current Location" as no city filter.
 */
export function filterDailyPropertiesByCityAndDates(
  properties: Property[],
  selectedCity: string,
  dates: DailyFilterDates,
): Property[] {
  let filtered = properties.filter(
    (p) =>
      p.listingType === "daily" &&
      !("isProject" in p && (p as { isProject?: boolean }).isProject),
  );

  if (
    selectedCity &&
    selectedCity !== "City" &&
    selectedCity !== "Current Location"
  ) {
    filtered = filtered.filter((p) => {
      const city = (p as { city?: string }).city;
      return city && city.toLowerCase() === selectedCity.toLowerCase();
    });
  }

  if (dates.startDate && dates.endDate) {
    const days = calculateDays(dates.startDate, dates.endDate);
    if (days < 30) {
      filtered = filtered.filter(
        (p) =>
          !(
            "bookingType" in p &&
            (p as { bookingType?: string }).bookingType === "monthly"
          ),
      );
    }
    if (days < 7) {
      filtered = filtered.filter((p) => {
        const dailyProp = p as { bookingType?: string };
        return !("bookingType" in p && dailyProp.bookingType === "weekly");
      });
    }
  }

  return filtered;
}

/**
 * Full filtered set for daily listings: city + dates + search filters.
 * Single source of truth so DailyScreen (map) and BookingListScreen (list) show the same properties.
 */
export function getFilteredDailyProperties(
  properties: Property[],
  selectedCity: string,
  dates: DailyFilterDates,
  searchFilters: SearchFilterState | null,
): Property[] {
  let filtered = filterDailyPropertiesByCityAndDates(
    properties,
    selectedCity,
    dates,
  );
  if (searchFilters) {
    filtered = applySearchFilters(filtered, searchFilters);
  }
  return filtered;
}

/**
 * Apply search filters to properties. Used by PropertyListScreen, DailyScreen, and SearchFilterModal.
 */
export function applySearchFilters(
  properties: Property[],
  filters: SearchFilterState,
): Property[] {
  let filtered = [...properties];

  const parsePrice = (p: Property): number | null => {
    // Daily listings can have numeric price fields.
    if (p.listingType === "daily" && "dailyPrice" in p) {
      const n = Number((p as any).dailyPrice);
      return Number.isFinite(n) ? n : null;
    }
    if (p.listingType === "daily" && "monthlyPrice" in p) {
      const n = Number((p as any).monthlyPrice);
      return Number.isFinite(n) ? n : null;
    }

    // Rent/Sale listings store price as a compact string (e.g. "55,700", "1.2 M", "950 K").
    const raw = (p as any)?.price;
    if (typeof raw !== "string") return null;
    const s = raw.trim();
    if (!s || s === "---") return null;

    const compact = s.match(/^([\d.,]+)\s*([kKmM])$/);
    if (compact) {
      const amount = Number.parseFloat(compact[1].replace(/,/g, ""));
      if (!Number.isFinite(amount)) return null;
      const mult = compact[2].toLowerCase() === "m" ? 1_000_000 : 1_000;
      return amount * mult;
    }

    const digitsOnly = s.replace(/[^\d.]/g, "");
    if (!digitsOnly) return null;
    const n = Number.parseFloat(digitsOnly);
    return Number.isFinite(n) ? n : null;
  };

  if (filters.selectedPropertyType) {
    filtered = filtered.filter((p) => p.type === filters.selectedPropertyType);
  }

  if (filters.fromPrice || filters.toPrice) {
    filtered = filtered.filter((p) => {
      const price = parsePrice(p);
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

  if (
    filters.bedrooms &&
    filters.bedrooms !== "" &&
    filters.bedrooms !== "All"
  ) {
    if (filters.bedrooms === "6+") {
      filtered = filtered.filter((p) => p.bedrooms >= 6);
    } else {
      const bedrooms = parseInt(filters.bedrooms, 10);
      if (!Number.isNaN(bedrooms)) {
        filtered = filtered.filter((p) => p.bedrooms === bedrooms);
      }
    }
  }

  if (
    filters.livingRooms &&
    filters.livingRooms !== "" &&
    filters.livingRooms !== "All"
  ) {
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
        (p) => p.features && p.features.includes(featureName),
      );
    }
  });

  return filtered;
}
