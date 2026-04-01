import { useCallback, useEffect, useMemo } from "react";
import {
  AGE_OPTIONS,
  FLOOR_OPTIONS,
  STORES_OPTIONS,
  STREET_DIRECTION_OPTIONS,
  STREET_WIDTH_OPTIONS,
} from "@/constants/orderFormOptions";

interface Args {
  form: any;
}

export function useSearchRequestOrderContainer({ form }: Args) {
  const openCategoryModal = useCallback(
    () => form.setShowCategoryModal(true),
    [form.setShowCategoryModal]
  );
  const openFloorModal = useCallback(
    () => form.setShowFloorModal(true),
    [form.setShowFloorModal]
  );
  const openAgeModal = useCallback(
    () => form.setShowAgeModal(true),
    [form.setShowAgeModal]
  );
  const openStreetDirectionModal = useCallback(
    () => form.setShowStreetDirectionModal(true),
    [form.setShowStreetDirectionModal]
  );
  const openStreetWidthModal = useCallback(
    () => form.setShowStreetWidthModal(true),
    [form.setShowStreetWidthModal]
  );
  const openStoresModal = useCallback(
    () => form.setShowStoresModal(true),
    [form.setShowStoresModal]
  );

  const streetDirectionModalValue = useMemo(
    () =>
      form.isVillaForSale
        ? form.streetDirection
        : form.isLandForSale
        ? form.landStreetDirection
        : form.isSmallHouseForSale
        ? form.smallHouseStreetDirection
        : form.isBuildingForSale
        ? form.buildingStreetDirection
        : form.isVillaForRent
        ? form.villaRentStreetDirection
        : form.isSmallHouseForRent
        ? form.smallHouseRentStreetDirection
        : form.isBuildingForRent
        ? form.buildingRentStreetDirection
        : form.isLandForRent
        ? form.landRentStreetDirection
        : "",
    [
      form.isVillaForSale,
      form.streetDirection,
      form.isLandForSale,
      form.landStreetDirection,
      form.isSmallHouseForSale,
      form.smallHouseStreetDirection,
      form.isBuildingForSale,
      form.buildingStreetDirection,
      form.isVillaForRent,
      form.villaRentStreetDirection,
      form.isSmallHouseForRent,
      form.smallHouseRentStreetDirection,
      form.isBuildingForRent,
      form.buildingRentStreetDirection,
      form.isLandForRent,
      form.landRentStreetDirection,
    ]
  );

  const streetWidthModalValue = useMemo(
    () =>
      form.isVillaForSale
        ? form.streetWidth
        : form.isLandForSale
        ? form.landStreetWidth
        : form.isSmallHouseForSale
        ? form.smallHouseStreetWidth
        : form.isBuildingForSale
        ? form.streetWidth
        : form.isLoungeForSale
        ? form.loungeStreetWidth
        : form.isStoreForSale
        ? form.storeStreetWidth
        : form.isVillaForRent
        ? form.villaRentStreetWidth
        : form.isSmallHouseForRent
        ? form.smallHouseRentStreetWidth
        : form.isStoreForRent
        ? form.storeRentStreetWidth
        : form.isBuildingForRent
        ? form.buildingRentStreetWidth
        : form.isLandForRent
        ? form.landRentStreetWidth
        : form.isOfficeForRent
        ? form.officeRentStreetWidth
        : form.isWarehouseForRent
        ? form.warehouseRentStreetWidth
        : "",
    [
      form.isVillaForSale,
      form.streetWidth,
      form.isLandForSale,
      form.landStreetWidth,
      form.isSmallHouseForSale,
      form.smallHouseStreetWidth,
      form.isBuildingForSale,
      form.isLoungeForSale,
      form.loungeStreetWidth,
      form.isStoreForSale,
      form.storeStreetWidth,
      form.isVillaForRent,
      form.villaRentStreetWidth,
      form.isSmallHouseForRent,
      form.smallHouseRentStreetWidth,
      form.isStoreForRent,
      form.storeRentStreetWidth,
      form.isBuildingForRent,
      form.buildingRentStreetWidth,
      form.isLandForRent,
      form.landRentStreetWidth,
      form.isOfficeForRent,
      form.officeRentStreetWidth,
      form.isWarehouseForRent,
      form.warehouseRentStreetWidth,
    ]
  );

  // Initialize picker defaults when category changes.
  useEffect(() => {
    if (!form.category) return;
    const firstFloor = FLOOR_OPTIONS[0] ?? "";
    const firstAge = AGE_OPTIONS[0] ?? "";
    const firstStreetDirection = STREET_DIRECTION_OPTIONS[0] ?? "";
    const firstStreetWidth = STREET_WIDTH_OPTIONS[0] ?? "";
    const firstStores = STORES_OPTIONS[0] ?? "";

    form.setFloor(firstFloor);
    form.setAge(firstAge);
    form.setStreetDirection(firstStreetDirection);
    form.setLandStreetDirection(firstStreetDirection);
    form.setSmallHouseStreetDirection(firstStreetDirection);
    form.setBuildingStreetDirection(firstStreetDirection);
    form.setVillaRentStreetDirection(firstStreetDirection);
    form.setSmallHouseRentStreetDirection(firstStreetDirection);
    form.setBuildingRentStreetDirection(firstStreetDirection);
    form.setLandRentStreetDirection(firstStreetDirection);
    form.setStreetWidth(firstStreetWidth);
    form.setLandStreetWidth(firstStreetWidth);
    form.setSmallHouseStreetWidth(firstStreetWidth);
    form.setLoungeStreetWidth(firstStreetWidth);
    form.setStoreStreetWidth(firstStreetWidth);
    form.setVillaRentStreetWidth(firstStreetWidth);
    form.setSmallHouseRentStreetWidth(firstStreetWidth);
    form.setStoreRentStreetWidth(firstStreetWidth);
    form.setBuildingRentStreetWidth(firstStreetWidth);
    form.setLandRentStreetWidth(firstStreetWidth);
    form.setOfficeRentStreetWidth(firstStreetWidth);
    form.setWarehouseRentStreetWidth(firstStreetWidth);
    form.setStores(firstStores);
    form.setBuildingRentStores(firstStores);
  }, [form.category]);

  return {
    openCategoryModal,
    openFloorModal,
    openAgeModal,
    openStreetDirectionModal,
    openStreetWidthModal,
    openStoresModal,
    streetDirectionModalValue,
    streetWidthModalValue,
  };
}

