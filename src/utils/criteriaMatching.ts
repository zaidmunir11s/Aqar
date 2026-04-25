import { Property } from "../types/property";
import { SearchRequestData } from "@/context/searchRequest-context";
import { getSelectedFeatures } from "./featureMapping";

type TFn = (key: string, options?: Record<string, any>) => string;

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
 * Interface for matched criteria information
 */
export interface MatchedCriteria {
  totalCriteria: number;
  matchedCriteria: number;
  matchedItems: string[]; // List of matched criteria labels
  unmatchedItems: string[]; // List of unmatched criteria labels (optional, for debugging)
}

/**
 * Calculate which criteria from the search request match the property
 * Returns count and list of matched criteria
 */
export function getMatchedCriteria(
  property: Property,
  request: SearchRequestData,
  t: TFn,
): MatchedCriteria {
  const orderData = request.orderFormData || {};
  const matchedItems: string[] = [];
  const unmatchedItems: string[] = [];
  let totalCriteria = 0;

  // 1. Check bedrooms
  if (orderData.selectedBedroom && orderData.selectedBedroom !== "ALL") {
    totalCriteria++;
    const requiredBedrooms = parseInt(orderData.selectedBedroom);
    if (property.bedrooms >= requiredBedrooms) {
      matchedItems.push(
        `${orderData.selectedBedroom} ${t("listings.bedrooms")}`,
      );
    } else {
      unmatchedItems.push(
        `${orderData.selectedBedroom} ${t("listings.bedrooms")}`,
      );
    }
  }

  // 2. Check living rooms
  if (orderData.selectedLivingRoom && orderData.selectedLivingRoom !== "ALL") {
    totalCriteria++;
    const requiredLivingRooms = parseInt(orderData.selectedLivingRoom);
    if (property.livingRooms >= requiredLivingRooms) {
      matchedItems.push(
        `${orderData.selectedLivingRoom} ${t("listings.livingRooms")}`,
      );
    } else {
      unmatchedItems.push(
        `${orderData.selectedLivingRoom} ${t("listings.livingRooms")}`,
      );
    }
  }

  // 3. Check WC/restrooms
  if (orderData.selectedWc && orderData.selectedWc !== "ALL") {
    totalCriteria++;
    const requiredWc = parseInt(orderData.selectedWc);
    if (property.restrooms >= requiredWc) {
      matchedItems.push(`${orderData.selectedWc} ${t("listings.wc")}`);
    } else {
      unmatchedItems.push(`${orderData.selectedWc} ${t("listings.wc")}`);
    }
  }

  // 4. Check floor
  if (orderData.floor && orderData.floor !== "ALL") {
    totalCriteria++;
    // Note: Property type doesn't have floor field, so we'll skip this for now
    // If properties had floor, we would check: property.floor === orderData.floor
    unmatchedItems.push(`${t("listings.floor")}: ${orderData.floor}`);
  }

  // 5. Check age
  if (orderData.age && orderData.age !== "ALL") {
    totalCriteria++;
    const maxAge = parseInt(orderData.age);
    if (property.estateAge <= maxAge) {
      matchedItems.push(
        `${t("listings.realEstateAge")}: ≤${orderData.age} ${t("listings.years")}`,
      );
    } else {
      unmatchedItems.push(
        `${t("listings.realEstateAge")}: ≤${orderData.age} ${t("listings.years")}`,
      );
    }
  }

  // 6. Check price range
  if (
    orderData.fromPrice ||
    orderData.toPrice ||
    orderData.priceFrom ||
    orderData.priceTo ||
    orderData.villaPriceFrom ||
    orderData.villaPriceTo ||
    orderData.apartmentSalePriceFrom ||
    orderData.apartmentSalePriceTo ||
    orderData.bigFlatPriceFrom ||
    orderData.bigFlatPriceTo ||
    orderData.loungePriceFrom ||
    orderData.loungePriceTo ||
    orderData.smallHousePriceFrom ||
    orderData.smallHousePriceTo ||
    orderData.storePriceFrom ||
    orderData.storePriceTo ||
    orderData.buildingPriceFrom ||
    orderData.buildingPriceTo ||
    orderData.landPriceFrom ||
    orderData.landPriceTo ||
    orderData.roomPriceFrom ||
    orderData.roomPriceTo ||
    orderData.officePriceFrom ||
    orderData.officePriceTo ||
    orderData.tentPriceFrom ||
    orderData.tentPriceTo ||
    orderData.warehousePriceFrom ||
    orderData.warehousePriceTo ||
    orderData.chaletPriceFrom ||
    orderData.chaletPriceTo
  ) {
    totalCriteria++;
    const fromPrice = parseFloat(
      orderData.fromPrice ||
        orderData.priceFrom ||
        orderData.villaPriceFrom ||
        orderData.apartmentSalePriceFrom ||
        orderData.bigFlatPriceFrom ||
        orderData.loungePriceFrom ||
        orderData.smallHousePriceFrom ||
        orderData.storePriceFrom ||
        orderData.buildingPriceFrom ||
        orderData.landPriceFrom ||
        orderData.roomPriceFrom ||
        orderData.officePriceFrom ||
        orderData.tentPriceFrom ||
        orderData.warehousePriceFrom ||
        orderData.chaletPriceFrom ||
        "0",
    );
    const toPrice = parseFloat(
      orderData.toPrice ||
        orderData.priceTo ||
        orderData.villaPriceTo ||
        orderData.apartmentSalePriceTo ||
        orderData.bigFlatPriceTo ||
        orderData.loungePriceTo ||
        orderData.smallHousePriceTo ||
        orderData.storePriceTo ||
        orderData.buildingPriceTo ||
        orderData.landPriceTo ||
        orderData.roomPriceTo ||
        orderData.officePriceTo ||
        orderData.tentPriceTo ||
        orderData.warehousePriceTo ||
        orderData.chaletPriceTo ||
        "999999999",
    );

    let propertyPrice = 0;
    if ("price" in property && property.price) {
      propertyPrice = parsePrice(property.price);
    } else if ("dailyPrice" in property) {
      propertyPrice = (property as any).dailyPrice || 0;
    }

    if (propertyPrice >= fromPrice && propertyPrice <= toPrice) {
      matchedItems.push(
        `${t("listings.price")}: ${fromPrice.toLocaleString()} - ${toPrice.toLocaleString()}`,
      );
    } else {
      unmatchedItems.push(
        `${t("listings.price")}: ${fromPrice.toLocaleString()} - ${toPrice.toLocaleString()}`,
      );
    }
  }

  // 7. Check area range
  if (orderData.areaFrom || orderData.areaTo) {
    totalCriteria++;
    const fromArea = parseFloat(orderData.areaFrom || "0");
    const toArea = parseFloat(orderData.areaTo || "999999999");

    if (property.area >= fromArea && property.area <= toArea) {
      matchedItems.push(
        `${t("listings.area")}: ${fromArea} - ${toArea} ${t("listings.m2")}`,
      );
    } else {
      unmatchedItems.push(
        `${t("listings.area")}: ${fromArea} - ${toArea} ${t("listings.m2")}`,
      );
    }
  }

  // 8. Check features (toggle options)
  const selectedFeatures = getSelectedFeatures(orderData);
  if (selectedFeatures.length > 0) {
    // Count each feature as a separate criterion for better granularity
    const propertyFeatures = property.features || [];

    selectedFeatures.forEach((feature) => {
      totalCriteria++;
      if (propertyFeatures.includes(feature)) {
        matchedItems.push(feature);
      } else {
        unmatchedItems.push(feature);
      }
    });
  }

  // 9. Check photos requirement
  if (request.onlyAdsWithPhoto) {
    totalCriteria++;
    if (property.images && property.images.length > 0) {
      matchedItems.push(t("listings.hasPhotos"));
    } else {
      unmatchedItems.push(t("listings.hasPhotos"));
    }
  }

  return {
    totalCriteria,
    matchedCriteria: matchedItems.length,
    matchedItems,
    unmatchedItems,
  };
}
