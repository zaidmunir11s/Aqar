import { useReducer, useMemo, useCallback } from "react";
import { useLocalization } from "./useLocalization";
import {
  orderFormReducer,
  initialOrderFormState,
  type RentPeriod,
  type OrderFormState,
} from "./orderFormReducer";

export type { RentPeriod };

/**
 * Order form state management via useReducer.
 * Replaces 80+ useState with a single reducer for batched updates.
 * Category reset is one dispatch instead of 80+ setState calls.
 */
export function useOrderForm() {
  const { t } = useLocalization();
  const [state, dispatch] = useReducer(orderFormReducer, initialOrderFormState);

  const setField = useCallback(<K extends keyof OrderFormState>(key: K) => {
    return (value: OrderFormState[K]) => {
      dispatch({ type: "SET", payload: { key, value } });
    };
  }, []);

  // ========== HANDLERS ==========
  const handleCategorySelect = useCallback((value: string) => {
    dispatch({ type: "RESET_AND_SELECT_CATEGORY", payload: value });
  }, []);

  const handleRentPeriodPress = useCallback(
    (period: "Yearly" | "Monthly") => {
      const next = state.rentPeriod === period ? null : period;
      dispatch({ type: "SET", payload: { key: "rentPeriod", value: next } });
      if (next === null) {
        dispatch({ type: "SET", payload: { key: "selectedPayment", value: null } });
      }
    },
    [state.rentPeriod]
  );

  const handlePaymentChipPress = useCallback((payment: string) => {
    const next = state.selectedPayment === payment ? null : payment;
    dispatch({ type: "SET", payload: { key: "selectedPayment", value: next } });
  }, [state.selectedPayment]);

  const handlePaymentTypePress = useCallback((value: string) => {
    const next = state.selectedPaymentType === value ? null : value;
    dispatch({ type: "SET", payload: { key: "selectedPaymentType", value: next } });
  }, [state.selectedPaymentType]);

  const handleBedroomPress = useCallback((value: string) => {
    const next = state.selectedBedroom === value ? null : value;
    dispatch({ type: "SET", payload: { key: "selectedBedroom", value: next } });
  }, [state.selectedBedroom]);

  const handleLivingRoomPress = useCallback((value: string) => {
    const next = state.selectedLivingRoom === value ? null : value;
    dispatch({ type: "SET", payload: { key: "selectedLivingRoom", value: next } });
  }, [state.selectedLivingRoom]);

  const handleWcPress = useCallback((value: string) => {
    const next = state.selectedWc === value ? null : value;
    dispatch({ type: "SET", payload: { key: "selectedWc", value: next } });
  }, [state.selectedWc]);

  const handleApartmentPress = useCallback((value: string) => {
    const next = state.selectedApartment === value ? null : value;
    dispatch({ type: "SET", payload: { key: "selectedApartment", value: next } });
  }, [state.selectedApartment]);

  const handleBuildingApartmentsPress = useCallback((value: string) => {
    const next = state.buildingApartments === value ? null : value;
    dispatch({ type: "SET", payload: { key: "buildingApartments", value: next } });
  }, [state.buildingApartments]);

  const handleBuildingRentApartmentsPress = useCallback((value: string) => {
    const next = state.buildingRentApartments === value ? null : value;
    dispatch({ type: "SET", payload: { key: "buildingRentApartments", value: next } });
  }, [state.buildingRentApartments]);

  const handleVillaTypePress = useCallback((value: string) => {
    const next = state.selectedVillaType === value ? null : value;
    dispatch({ type: "SET", payload: { key: "selectedVillaType", value: next } });
  }, [state.selectedVillaType]);

  const handleStreetDirectionSelect = useCallback(
    (value: string) => {
      const currentCategory = state.category;
      const key =
        currentCategory === "Villa for sale"
          ? "streetDirection"
          : currentCategory === "Land for sale"
            ? "landStreetDirection"
            : currentCategory === "Small house for sale"
              ? "smallHouseStreetDirection"
              : currentCategory === "Building for sale"
                ? "buildingStreetDirection"
                : currentCategory === "Villa for rent"
                  ? "villaRentStreetDirection"
                  : currentCategory === "Small house for rent"
                    ? "smallHouseRentStreetDirection"
                    : currentCategory === "Building for rent"
                      ? "buildingRentStreetDirection"
                      : currentCategory === "Land for rent"
                        ? "landRentStreetDirection"
                        : null;
      if (key) {
        dispatch({ type: "SET", payload: { key, value } });
      }
      dispatch({ type: "SET", payload: { key: "showStreetDirectionModal", value: false } });
    },
    [state.category]
  );

  const handleStreetWidthSelect = useCallback(
    (value: string) => {
      const currentCategory = state.category;
      const key =
        currentCategory === "Villa for sale"
          ? "streetWidth"
          : currentCategory === "Land for sale"
            ? "landStreetWidth"
            : currentCategory === "Small house for sale"
              ? "smallHouseStreetWidth"
              : currentCategory === "Building for sale"
                ? "streetWidth"
                : currentCategory === "Lounge for sale"
                  ? "loungeStreetWidth"
                  : currentCategory === "Store for sale"
                    ? "storeStreetWidth"
                    : currentCategory === "Villa for rent"
                      ? "villaRentStreetWidth"
                      : currentCategory === "Small house for rent"
                        ? "smallHouseRentStreetWidth"
                        : currentCategory === "Store for rent"
                          ? "storeRentStreetWidth"
                          : currentCategory === "Building for rent"
                            ? "buildingRentStreetWidth"
                            : currentCategory === "Land for rent"
                              ? "landRentStreetWidth"
                              : currentCategory === "Office for rent"
                                ? "officeRentStreetWidth"
                                : currentCategory === "Warehouse for rent"
                                  ? "warehouseRentStreetWidth"
                                  : null;
      if (key) {
        dispatch({ type: "SET", payload: { key, value } });
      }
      dispatch({ type: "SET", payload: { key: "showStreetWidthModal", value: false } });
    },
    [state.category]
  );

  const handleLandRentTypePress = useCallback(
    (value: string) => {
      const next = state.selectedLandRentType === value ? null : value;
      dispatch({ type: "SET", payload: { key: "selectedLandRentType", value: next } });
    },
    [state.selectedLandRentType]
  );

  const handleBuildingRentTypePress = useCallback(
    (value: string) => {
      const next = state.selectedBuildingRentType === value ? null : value;
      dispatch({ type: "SET", payload: { key: "selectedBuildingRentType", value: next } });
    },
    [state.selectedBuildingRentType]
  );

  const handleBuildingRentStoresSelect = useCallback((value: string) => {
    dispatch({ type: "SET", payload: { key: "buildingRentStores", value } });
    dispatch({ type: "SET", payload: { key: "showStoresModal", value: false } });
  }, []);

  const handleVillaRentRentPeriodPress = useCallback(
    (period: "Yearly" | "Monthly") => {
      const next = state.villaRentRentPeriod === period ? null : period;
      dispatch({ type: "SET", payload: { key: "villaRentRentPeriod", value: next } });
    },
    [state.villaRentRentPeriod]
  );

  const handleBigFlatRentPeriodPress = useCallback(
    (period: "Yearly" | "Monthly") => {
      const next = state.bigFlatRentPeriod === period ? null : period;
      dispatch({ type: "SET", payload: { key: "bigFlatRentPeriod", value: next } });
    },
    [state.bigFlatRentPeriod]
  );

  const handleLoungeRentRentPeriodPress = useCallback(
    (period: "Yearly" | "Monthly") => {
      const next = state.loungeRentRentPeriod === period ? null : period;
      dispatch({ type: "SET", payload: { key: "loungeRentRentPeriod", value: next } });
    },
    [state.loungeRentRentPeriod]
  );

  const handleRoomRentRentPeriodPress = useCallback(
    (period: "Yearly" | "Monthly") => {
      const next = state.roomRentRentPeriod === period ? null : period;
      dispatch({ type: "SET", payload: { key: "roomRentRentPeriod", value: next } });
    },
    [state.roomRentRentPeriod]
  );

  const handleTentRentRentPeriodPress = useCallback(
    (period: "Yearly" | "Monthly") => {
      const next = state.tentRentRentPeriod === period ? null : period;
      dispatch({ type: "SET", payload: { key: "tentRentRentPeriod", value: next } });
      if (next === null || period !== "Yearly") {
        dispatch({ type: "SET", payload: { key: "selectedPayment", value: null } });
      }
    },
    [state.tentRentRentPeriod]
  );

  const handleChaletRentRentPeriodPress = useCallback(
    (period: "Yearly" | "Monthly") => {
      const next = state.chaletRentRentPeriod === period ? null : period;
      dispatch({ type: "SET", payload: { key: "chaletRentRentPeriod", value: next } });
    },
    [state.chaletRentRentPeriod]
  );

  const handleLandTypePress = useCallback(
    (value: string) => {
      const next = state.selectedLandType === value ? null : value;
      dispatch({ type: "SET", payload: { key: "selectedLandType", value: next } });
    },
    [state.selectedLandType]
  );

  const handleBuildingTypePress = useCallback(
    (value: string) => {
      const next = state.selectedBuildingType === value ? null : value;
      dispatch({ type: "SET", payload: { key: "selectedBuildingType", value: next } });
    },
    [state.selectedBuildingType]
  );

  const handleStoresSelect = useCallback((value: string) => {
    dispatch({ type: "SET", payload: { key: "stores", value } });
    dispatch({ type: "SET", payload: { key: "showStoresModal", value: false } });
  }, []);

  const handleFloorSelect = useCallback((value: string) => {
    dispatch({ type: "SET", payload: { key: "floor", value } });
    dispatch({ type: "SET", payload: { key: "showFloorModal", value: false } });
  }, []);

  const handleAgeSelect = useCallback((value: string) => {
    dispatch({ type: "SET", payload: { key: "age", value } });
    dispatch({ type: "SET", payload: { key: "showAgeModal", value: false } });
  }, []);

  // ========== COMPUTED VALUES ==========
  const categoryChecks = useMemo(
    () => ({
      isApartmentForRent: state.category === "Apartment for rent",
      isVillaForSale: state.category === "Villa for sale",
      isLandForSale: state.category === "Land for sale",
      isApartmentForSale: state.category === "Apartment for sale",
      isBuildingForSale: state.category === "Building for sale",
      isSmallHouseForSale: state.category === "Small house for sale",
      isLoungeForSale: state.category === "Lounge for sale",
      isFarmForSale: state.category === "Farm for sale",
      isStoreForSale: state.category === "Store for sale",
      isFloorForSale: state.category === "Floor for sale",
      isVillaForRent: state.category === "Villa for rent",
      isBigFlatForRent: state.category === "Big flat for rent",
      isLoungeForRent: state.category === "Lounge for rent",
      isSmallHouseForRent: state.category === "Small house for rent",
      isStoreForRent: state.category === "Store for rent",
      isBuildingForRent: state.category === "Building for rent",
      isLandForRent: state.category === "Land for rent",
      isRoomForRent: state.category === "Room for rent",
      isOfficeForRent: state.category === "Office for rent",
      isTentForRent: state.category === "Tent for rent",
      isWarehouseForRent: state.category === "Warehouse for rent",
      isChaletForRent: state.category === "Chalet for rent",
      isOther: state.category === "Other",
    }),
    [state.category]
  );

  const apartmentForRentComputed = useMemo(() => {
    const showYearlyContent = state.rentPeriod === "Yearly";
    const showMonthlyContent = state.rentPeriod === "Monthly";
    const showPriceSection = (!state.rentPeriod || state.rentPeriod === "Monthly") && categoryChecks.isApartmentForRent;
    const showPaymentTypeTabBar = (!state.rentPeriod || state.rentPeriod === "Monthly") && categoryChecks.isApartmentForRent;
    const priceLabel =
      state.selectedPayment === "Monthly" && showYearlyContent ? t("listings.priceMonthly") : t("listings.annualPrice");

    return {
      showYearlyContent,
      showMonthlyContent,
      showPriceSection,
      showPaymentTypeTabBar,
      priceLabel,
    };
  }, [state.rentPeriod, state.selectedPayment, categoryChecks.isApartmentForRent, t]);

  // ========== RETURN ALL STATE AND HANDLERS ==========
  return {
    // Category
    category: state.category,
    setCategory: setField("category"),
    showCategoryModal: state.showCategoryModal,
    setShowCategoryModal: setField("showCategoryModal"),
    handleCategorySelect,

    // Category checks
    ...categoryChecks,

    // Apartment for rent computed
    ...apartmentForRentComputed,

    // Apartment for rent
    rentPeriod: state.rentPeriod,
    setRentPeriod: setField("rentPeriod"),
    selectedPayment: state.selectedPayment,
    setSelectedPayment: setField("selectedPayment"),
    fromPrice: state.fromPrice,
    setFromPrice: setField("fromPrice"),
    toPrice: state.toPrice,
    setToPrice: setField("toPrice"),
    priceFrom: state.priceFrom,
    setPriceFrom: setField("priceFrom"),
    priceTo: state.priceTo,
    setPriceTo: setField("priceTo"),
    selectedPaymentType: state.selectedPaymentType,
    setSelectedPaymentType: setField("selectedPaymentType"),
    selectedBedroom: state.selectedBedroom,
    setSelectedBedroom: setField("selectedBedroom"),
    selectedLivingRoom: state.selectedLivingRoom,
    setSelectedLivingRoom: setField("selectedLivingRoom"),
    selectedWc: state.selectedWc,
    setSelectedWc: setField("selectedWc"),
    floor: state.floor,
    setFloor: setField("floor"),
    showFloorModal: state.showFloorModal,
    setShowFloorModal: setField("showFloorModal"),
    age: state.age,
    setAge: setField("age"),
    showAgeModal: state.showAgeModal,
    setShowAgeModal: setField("showAgeModal"),
    furnished: state.furnished,
    setFurnished: setField("furnished"),
    carEntrance: state.carEntrance,
    setCarEntrance: setField("carEntrance"),
    airConditioned: state.airConditioned,
    setAirConditioned: setField("airConditioned"),
    privateRoof: state.privateRoof,
    setPrivateRoof: setField("privateRoof"),
    apartmentInVilla: state.apartmentInVilla,
    setApartmentInVilla: setField("apartmentInVilla"),
    twoEntrances: state.twoEntrances,
    setTwoEntrances: setField("twoEntrances"),
    specialEntrances: state.specialEntrances,
    setSpecialEntrances: setField("specialEntrances"),
    handleRentPeriodPress,
    handlePaymentChipPress,
    handlePaymentTypePress,
    handleBedroomPress,
    handleLivingRoomPress,
    handleWcPress,
    handleFloorSelect,
    handleAgeSelect,

    // Villa for sale
    villaPriceFrom: state.villaPriceFrom,
    setVillaPriceFrom: setField("villaPriceFrom"),
    villaPriceTo: state.villaPriceTo,
    setVillaPriceTo: setField("villaPriceTo"),
    selectedApartment: state.selectedApartment,
    setSelectedApartment: setField("selectedApartment"),
    streetDirection: state.streetDirection,
    setStreetDirection: setField("streetDirection"),
    showStreetDirectionModal: state.showStreetDirectionModal,
    setShowStreetDirectionModal: setField("showStreetDirectionModal"),
    areaFrom: state.areaFrom,
    setAreaFrom: setField("areaFrom"),
    areaTo: state.areaTo,
    setAreaTo: setField("areaTo"),
    streetWidth: state.streetWidth,
    setStreetWidth: setField("streetWidth"),
    showStreetWidthModal: state.showStreetWidthModal,
    setShowStreetWidthModal: setField("showStreetWidthModal"),
    stairs: state.stairs,
    setStairs: setField("stairs"),
    selectedVillaType: state.selectedVillaType,
    setSelectedVillaType: setField("selectedVillaType"),
    driverRoom: state.driverRoom,
    setDriverRoom: setField("driverRoom"),
    maidRoom: state.maidRoom,
    setMaidRoom: setField("maidRoom"),
    pool: state.pool,
    setPool: setField("pool"),
    villaFurnished: state.villaFurnished,
    setVillaFurnished: setField("villaFurnished"),
    kitchen: state.kitchen,
    setKitchen: setField("kitchen"),
    villaCarEntrance: state.villaCarEntrance,
    setVillaCarEntrance: setField("villaCarEntrance"),
    basement: state.basement,
    setBasement: setField("basement"),
    nearBus: state.nearBus,
    setNearBus: setField("nearBus"),
    nearMetro: state.nearMetro,
    setNearMetro: setField("nearMetro"),
    handleApartmentPress,
    handleBuildingApartmentsPress,
    handleBuildingRentApartmentsPress,
    handleVillaTypePress,
    handleStreetDirectionSelect,
    handleStreetWidthSelect,

    // Land for sale
    landPriceFrom: state.landPriceFrom,
    setLandPriceFrom: setField("landPriceFrom"),
    landPriceTo: state.landPriceTo,
    setLandPriceTo: setField("landPriceTo"),
    selectedLandType: state.selectedLandType,
    setSelectedLandType: setField("selectedLandType"),
    landAreaFrom: state.landAreaFrom,
    setLandAreaFrom: setField("landAreaFrom"),
    landAreaTo: state.landAreaTo,
    setLandAreaTo: setField("landAreaTo"),
    landStreetDirection: state.landStreetDirection,
    setLandStreetDirection: setField("landStreetDirection"),
    landStreetWidth: state.landStreetWidth,
    setLandStreetWidth: setField("landStreetWidth"),
    handleLandTypePress,
    
    // Apartment for sale
    apartmentSalePriceFrom: state.apartmentSalePriceFrom,
    setApartmentSalePriceFrom: setField("apartmentSalePriceFrom"),
    apartmentSalePriceTo: state.apartmentSalePriceTo,
    setApartmentSalePriceTo: setField("apartmentSalePriceTo"),
    apartmentSaleAreaFrom: state.apartmentSaleAreaFrom,
    setApartmentSaleAreaFrom: setField("apartmentSaleAreaFrom"),
    apartmentSaleAreaTo: state.apartmentSaleAreaTo,
    setApartmentSaleAreaTo: setField("apartmentSaleAreaTo"),
    apartmentSaleCarEntrance: state.apartmentSaleCarEntrance,
    setApartmentSaleCarEntrance: setField("apartmentSaleCarEntrance"),
    apartmentSalePrivateRoof: state.apartmentSalePrivateRoof,
    setApartmentSalePrivateRoof: setField("apartmentSalePrivateRoof"),
    apartmentSaleInVilla: state.apartmentSaleInVilla,
    setApartmentSaleInVilla: setField("apartmentSaleInVilla"),
    apartmentSaleTwoEntrances: state.apartmentSaleTwoEntrances,
    setApartmentSaleTwoEntrances: setField("apartmentSaleTwoEntrances"),
    apartmentSaleSpecialEntrances: state.apartmentSaleSpecialEntrances,
    setApartmentSaleSpecialEntrances: setField("apartmentSaleSpecialEntrances"),

    // Building for sale
    buildingPriceFrom: state.buildingPriceFrom,
    setBuildingPriceFrom: setField("buildingPriceFrom"),
    buildingPriceTo: state.buildingPriceTo,
    setBuildingPriceTo: setField("buildingPriceTo"),
    buildingApartments: state.buildingApartments,
    setBuildingApartments: setField("buildingApartments"),
    selectedBuildingType: state.selectedBuildingType,
    setSelectedBuildingType: setField("selectedBuildingType"),
    buildingStreetDirection: state.buildingStreetDirection,
    setBuildingStreetDirection: setField("buildingStreetDirection"),
    stores: state.stores,
    setStores: setField("stores"),
    showStoresModal: state.showStoresModal,
    setShowStoresModal: setField("showStoresModal"),
    buildingAreaFrom: state.buildingAreaFrom,
    setBuildingAreaFrom: setField("buildingAreaFrom"),
    buildingAreaTo: state.buildingAreaTo,
    setBuildingAreaTo: setField("buildingAreaTo"),
    handleBuildingTypePress,
    handleStoresSelect,

    // Small house for sale
    smallHousePriceFrom: state.smallHousePriceFrom,
    setSmallHousePriceFrom: setField("smallHousePriceFrom"),
    smallHousePriceTo: state.smallHousePriceTo,
    setSmallHousePriceTo: setField("smallHousePriceTo"),
    smallHouseStreetDirection: state.smallHouseStreetDirection,
    setSmallHouseStreetDirection: setField("smallHouseStreetDirection"),
    smallHouseAreaFrom: state.smallHouseAreaFrom,
    setSmallHouseAreaFrom: setField("smallHouseAreaFrom"),
    smallHouseAreaTo: state.smallHouseAreaTo,
    setSmallHouseAreaTo: setField("smallHouseAreaTo"),
    smallHouseStreetWidth: state.smallHouseStreetWidth,
    setSmallHouseStreetWidth: setField("smallHouseStreetWidth"),
    smallHouseFurnished: state.smallHouseFurnished,
    setSmallHouseFurnished: setField("smallHouseFurnished"),
    tent: state.tent,
    setTent: setField("tent"),

    // Lounge for sale
    loungePriceFrom: state.loungePriceFrom,
    setLoungePriceFrom: setField("loungePriceFrom"),
    loungePriceTo: state.loungePriceTo,
    setLoungePriceTo: setField("loungePriceTo"),
    loungeAreaFrom: state.loungeAreaFrom,
    setLoungeAreaFrom: setField("loungeAreaFrom"),
    loungeAreaTo: state.loungeAreaTo,
    setLoungeAreaTo: setField("loungeAreaTo"),
    loungeStreetWidth: state.loungeStreetWidth,
    setLoungeStreetWidth: setField("loungeStreetWidth"),

    // Farm for sale
    farmPriceFrom: state.farmPriceFrom,
    setFarmPriceFrom: setField("farmPriceFrom"),
    farmPriceTo: state.farmPriceTo,
    setFarmPriceTo: setField("farmPriceTo"),
    farmAreaFrom: state.farmAreaFrom,
    setFarmAreaFrom: setField("farmAreaFrom"),
    farmAreaTo: state.farmAreaTo,
    setFarmAreaTo: setField("farmAreaTo"),

    // Store for sale
    storePriceFrom: state.storePriceFrom,
    setStorePriceFrom: setField("storePriceFrom"),
    storePriceTo: state.storePriceTo,
    setStorePriceTo: setField("storePriceTo"),
    storeAreaFrom: state.storeAreaFrom,
    setStoreAreaFrom: setField("storeAreaFrom"),
    storeAreaTo: state.storeAreaTo,
    setStoreAreaTo: setField("storeAreaTo"),
    storeStreetWidth: state.storeStreetWidth,
    setStoreStreetWidth: setField("storeStreetWidth"),

    // Floor for sale
    floorSalePriceFrom: state.floorSalePriceFrom,
    setFloorSalePriceFrom: setField("floorSalePriceFrom"),
    floorSalePriceTo: state.floorSalePriceTo,
    setFloorSalePriceTo: setField("floorSalePriceTo"),
    floorSaleAreaFrom: state.floorSaleAreaFrom,
    setFloorSaleAreaFrom: setField("floorSaleAreaFrom"),
    floorSaleAreaTo: state.floorSaleAreaTo,
    setFloorSaleAreaTo: setField("floorSaleAreaTo"),
    floorSaleCarEntrance: state.floorSaleCarEntrance,
    setFloorSaleCarEntrance: setField("floorSaleCarEntrance"),

    // Villa for rent
    villaRentPriceFrom: state.villaRentPriceFrom,
    setVillaRentPriceFrom: setField("villaRentPriceFrom"),
    villaRentPriceTo: state.villaRentPriceTo,
    setVillaRentPriceTo: setField("villaRentPriceTo"),
    villaRentStreetDirection: state.villaRentStreetDirection,
    setVillaRentStreetDirection: setField("villaRentStreetDirection"),
    villaRentAreaFrom: state.villaRentAreaFrom,
    setVillaRentAreaFrom: setField("villaRentAreaFrom"),
    villaRentAreaTo: state.villaRentAreaTo,
    setVillaRentAreaTo: setField("villaRentAreaTo"),
    villaRentStreetWidth: state.villaRentStreetWidth,
    setVillaRentStreetWidth: setField("villaRentStreetWidth"),
    villaRentStairs: state.villaRentStairs,
    setVillaRentStairs: setField("villaRentStairs"),
    villaRentAirConditioned: state.villaRentAirConditioned,
    setVillaRentAirConditioned: setField("villaRentAirConditioned"),
    villaRentRentPeriod: state.villaRentRentPeriod,
    setVillaRentRentPeriod: setField("villaRentRentPeriod"),
    handleVillaRentRentPeriodPress,

    // Big flat for rent
    bigFlatPriceFrom: state.bigFlatPriceFrom,
    setBigFlatPriceFrom: setField("bigFlatPriceFrom"),
    bigFlatPriceTo: state.bigFlatPriceTo,
    setBigFlatPriceTo: setField("bigFlatPriceTo"),
    bigFlatAreaFrom: state.bigFlatAreaFrom,
    setBigFlatAreaFrom: setField("bigFlatAreaFrom"),
    bigFlatAreaTo: state.bigFlatAreaTo,
    setBigFlatAreaTo: setField("bigFlatAreaTo"),
    bigFlatRentPeriod: state.bigFlatRentPeriod,
    setBigFlatRentPeriod: setField("bigFlatRentPeriod"),
    bigFlatCarEntrance: state.bigFlatCarEntrance,
    setBigFlatCarEntrance: setField("bigFlatCarEntrance"),
    bigFlatAirConditioned: state.bigFlatAirConditioned,
    setBigFlatAirConditioned: setField("bigFlatAirConditioned"),
    bigFlatInVilla: state.bigFlatInVilla,
    setBigFlatInVilla: setField("bigFlatInVilla"),
    bigFlatTwoEntrances: state.bigFlatTwoEntrances,
    setBigFlatTwoEntrances: setField("bigFlatTwoEntrances"),
    bigFlatSpecialEntrances: state.bigFlatSpecialEntrances,
    setBigFlatSpecialEntrances: setField("bigFlatSpecialEntrances"),
    handleBigFlatRentPeriodPress,

    // Lounge for rent
    loungeRentPriceFrom: state.loungeRentPriceFrom,
    setLoungeRentPriceFrom: setField("loungeRentPriceFrom"),
    loungeRentPriceTo: state.loungeRentPriceTo,
    setLoungeRentPriceTo: setField("loungeRentPriceTo"),
    loungeRentAreaFrom: state.loungeRentAreaFrom,
    setLoungeRentAreaFrom: setField("loungeRentAreaFrom"),
    loungeRentAreaTo: state.loungeRentAreaTo,
    setLoungeRentAreaTo: setField("loungeRentAreaTo"),
    loungeRentRentPeriod: state.loungeRentRentPeriod,
    setLoungeRentRentPeriod: setField("loungeRentRentPeriod"),
    loungeRentPool: state.loungeRentPool,
    setLoungeRentPool: setField("loungeRentPool"),
    footballPitch: state.footballPitch,
    setFootballPitch: setField("footballPitch"),
    volleyballCourt: state.volleyballCourt,
    setVolleyballCourt: setField("volleyballCourt"),
    loungeRentTent: state.loungeRentTent,
    setLoungeRentTent: setField("loungeRentTent"),
    loungeRentKitchen: state.loungeRentKitchen,
    setLoungeRentKitchen: setField("loungeRentKitchen"),
    playground: state.playground,
    setPlayground: setField("playground"),
    familySection: state.familySection,
    setFamilySection: setField("familySection"),
    handleLoungeRentRentPeriodPress,

    // Small house for rent
    smallHouseRentPriceFrom: state.smallHouseRentPriceFrom,
    setSmallHouseRentPriceFrom: setField("smallHouseRentPriceFrom"),
    smallHouseRentPriceTo: state.smallHouseRentPriceTo,
    setSmallHouseRentPriceTo: setField("smallHouseRentPriceTo"),
    smallHouseRentStreetDirection: state.smallHouseRentStreetDirection,
    setSmallHouseRentStreetDirection: setField("smallHouseRentStreetDirection"),
    smallHouseRentAreaFrom: state.smallHouseRentAreaFrom,
    setSmallHouseRentAreaFrom: setField("smallHouseRentAreaFrom"),
    smallHouseRentAreaTo: state.smallHouseRentAreaTo,
    setSmallHouseRentAreaTo: setField("smallHouseRentAreaTo"),
    smallHouseRentStreetWidth: state.smallHouseRentStreetWidth,
    setSmallHouseRentStreetWidth: setField("smallHouseRentStreetWidth"),
    smallHouseRentFurnished: state.smallHouseRentFurnished,
    setSmallHouseRentFurnished: setField("smallHouseRentFurnished"),
    smallHouseRentTent: state.smallHouseRentTent,
    setSmallHouseRentTent: setField("smallHouseRentTent"),
    smallHouseRentKitchen: state.smallHouseRentKitchen,
    setSmallHouseRentKitchen: setField("smallHouseRentKitchen"),

    // Store for rent
    storeRentPriceFrom: state.storeRentPriceFrom,
    setStoreRentPriceFrom: setField("storeRentPriceFrom"),
    storeRentPriceTo: state.storeRentPriceTo,
    setStoreRentPriceTo: setField("storeRentPriceTo"),
    storeRentAreaFrom: state.storeRentAreaFrom,
    setStoreRentAreaFrom: setField("storeRentAreaFrom"),
    storeRentAreaTo: state.storeRentAreaTo,
    setStoreRentAreaTo: setField("storeRentAreaTo"),
    storeRentStreetWidth: state.storeRentStreetWidth,
    setStoreRentStreetWidth: setField("storeRentStreetWidth"),

    // Building for rent
    buildingRentPriceFrom: state.buildingRentPriceFrom,
    setBuildingRentPriceFrom: setField("buildingRentPriceFrom"),
    buildingRentPriceTo: state.buildingRentPriceTo,
    setBuildingRentPriceTo: setField("buildingRentPriceTo"),
    buildingRentApartments: state.buildingRentApartments,
    setBuildingRentApartments: setField("buildingRentApartments"),
    selectedBuildingRentType: state.selectedBuildingRentType,
    setSelectedBuildingRentType: setField("selectedBuildingRentType"),
    buildingRentStreetDirection: state.buildingRentStreetDirection,
    setBuildingRentStreetDirection: setField("buildingRentStreetDirection"),
    buildingRentStores: state.buildingRentStores,
    setBuildingRentStores: setField("buildingRentStores"),
    buildingRentAreaFrom: state.buildingRentAreaFrom,
    setBuildingRentAreaFrom: setField("buildingRentAreaFrom"),
    buildingRentAreaTo: state.buildingRentAreaTo,
    setBuildingRentAreaTo: setField("buildingRentAreaTo"),
    buildingRentStreetWidth: state.buildingRentStreetWidth,
    setBuildingRentStreetWidth: setField("buildingRentStreetWidth"),
    handleBuildingRentTypePress,
    handleBuildingRentStoresSelect,

    // Land for rent
    landRentStreetDirection: state.landRentStreetDirection,
    setLandRentStreetDirection: setField("landRentStreetDirection"),
    landRentAreaFrom: state.landRentAreaFrom,
    setLandRentAreaFrom: setField("landRentAreaFrom"),
    landRentAreaTo: state.landRentAreaTo,
    setLandRentAreaTo: setField("landRentAreaTo"),
    landRentStreetWidth: state.landRentStreetWidth,
    setLandRentStreetWidth: setField("landRentStreetWidth"),
    selectedLandRentType: state.selectedLandRentType,
    setSelectedLandRentType: setField("selectedLandRentType"),
    handleLandRentTypePress,

    // Room for rent
    roomRentPriceFrom: state.roomRentPriceFrom,
    setRoomRentPriceFrom: setField("roomRentPriceFrom"),
    roomRentPriceTo: state.roomRentPriceTo,
    setRoomRentPriceTo: setField("roomRentPriceTo"),
    roomRentRentPeriod: state.roomRentRentPeriod,
    setRoomRentRentPeriod: setField("roomRentRentPeriod"),
    roomRentKitchen: state.roomRentKitchen,
    setRoomRentKitchen: setField("roomRentKitchen"),
    handleRoomRentRentPeriodPress,

    // Office for rent
    officeRentPriceFrom: state.officeRentPriceFrom,
    setOfficeRentPriceFrom: setField("officeRentPriceFrom"),
    officeRentPriceTo: state.officeRentPriceTo,
    setOfficeRentPriceTo: setField("officeRentPriceTo"),
    officeRentAreaFrom: state.officeRentAreaFrom,
    setOfficeRentAreaFrom: setField("officeRentAreaFrom"),
    officeRentAreaTo: state.officeRentAreaTo,
    setOfficeRentAreaTo: setField("officeRentAreaTo"),
    officeRentStreetWidth: state.officeRentStreetWidth,
    setOfficeRentStreetWidth: setField("officeRentStreetWidth"),
    officeRentFurnished: state.officeRentFurnished,
    setOfficeRentFurnished: setField("officeRentFurnished"),

    // Tent for rent
    tentRentRentPeriod: state.tentRentRentPeriod,
    setTentRentRentPeriod: setField("tentRentRentPeriod"),
    handleTentRentRentPeriodPress,
    tentRentPriceFrom: state.tentRentPriceFrom,
    setTentRentPriceFrom: setField("tentRentPriceFrom"),
    tentRentPriceTo: state.tentRentPriceTo,
    setTentRentPriceTo: setField("tentRentPriceTo"),

    // Warehouse for rent
    warehouseRentPriceFrom: state.warehouseRentPriceFrom,
    setWarehouseRentPriceFrom: setField("warehouseRentPriceFrom"),
    warehouseRentPriceTo: state.warehouseRentPriceTo,
    setWarehouseRentPriceTo: setField("warehouseRentPriceTo"),
    warehouseRentAreaFrom: state.warehouseRentAreaFrom,
    setWarehouseRentAreaFrom: setField("warehouseRentAreaFrom"),
    warehouseRentAreaTo: state.warehouseRentAreaTo,
    setWarehouseRentAreaTo: setField("warehouseRentAreaTo"),
    warehouseRentStreetWidth: state.warehouseRentStreetWidth,
    setWarehouseRentStreetWidth: setField("warehouseRentStreetWidth"),

    // Chalet for rent
    chaletRentPriceFrom: state.chaletRentPriceFrom,
    setChaletRentPriceFrom: setField("chaletRentPriceFrom"),
    chaletRentPriceTo: state.chaletRentPriceTo,
    setChaletRentPriceTo: setField("chaletRentPriceTo"),
    chaletRentAreaFrom: state.chaletRentAreaFrom,
    setChaletRentAreaFrom: setField("chaletRentAreaFrom"),
    chaletRentAreaTo: state.chaletRentAreaTo,
    setChaletRentAreaTo: setField("chaletRentAreaTo"),
    chaletRentRentPeriod: state.chaletRentRentPeriod,
    setChaletRentRentPeriod: setField("chaletRentRentPeriod"),
    chaletRentPool: state.chaletRentPool,
    setChaletRentPool: setField("chaletRentPool"),
    chaletFootballPitch: state.chaletFootballPitch,
    setChaletFootballPitch: setField("chaletFootballPitch"),
    chaletVolleyballCourt: state.chaletVolleyballCourt,
    setChaletVolleyballCourt: setField("chaletVolleyballCourt"),
    chaletRentTent: state.chaletRentTent,
    setChaletRentTent: setField("chaletRentTent"),
    chaletRentKitchen: state.chaletRentKitchen,
    setChaletRentKitchen: setField("chaletRentKitchen"),
    chaletPlayground: state.chaletPlayground,
    setChaletPlayground: setField("chaletPlayground"),
    handleChaletRentRentPeriodPress,

    // Other category
    otherPriceFrom: state.otherPriceFrom,
    setOtherPriceFrom: setField("otherPriceFrom"),
    otherPriceTo: state.otherPriceTo,
    setOtherPriceTo: setField("otherPriceTo"),
    otherAreaFrom: state.otherAreaFrom,
    setOtherAreaFrom: setField("otherAreaFrom"),
    otherAreaTo: state.otherAreaTo,
    setOtherAreaTo: setField("otherAreaTo"),
  };
}

