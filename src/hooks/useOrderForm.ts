import { useState, useMemo } from "react";

export type RentPeriod = "Yearly" | "Monthly" | null;

/**
 * Comprehensive hook to manage all order form state and handlers
 * This centralizes all form logic to reduce component size
 */
export function useOrderForm() {
  // ========== CATEGORY STATE ==========
  const [category, setCategory] = useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // ========== APARTMENT FOR RENT STATE ==========
  const [rentPeriod, setRentPeriod] = useState<RentPeriod>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [fromPrice, setFromPrice] = useState("");
  const [toPrice, setToPrice] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
  const [selectedBedroom, setSelectedBedroom] = useState<string | null>(null);
  const [selectedLivingRoom, setSelectedLivingRoom] = useState<string | null>(null);
  const [selectedWc, setSelectedWc] = useState<string | null>(null);
  const [floor, setFloor] = useState<string>("");
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [age, setAge] = useState<string>("");
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [carEntrance, setCarEntrance] = useState(false);
  const [airConditioned, setAirConditioned] = useState(false);
  const [privateRoof, setPrivateRoof] = useState(false);
  const [apartmentInVilla, setApartmentInVilla] = useState(false);
  const [twoEntrances, setTwoEntrances] = useState(false);
  const [specialEntrances, setSpecialEntrances] = useState(false);

  // ========== VILLA FOR SALE STATE ==========
  const [villaPriceFrom, setVillaPriceFrom] = useState("");
  const [villaPriceTo, setVillaPriceTo] = useState("");
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null);
  const [streetDirection, setStreetDirection] = useState<string>("");
  const [showStreetDirectionModal, setShowStreetDirectionModal] = useState(false);
  const [areaFrom, setAreaFrom] = useState("");
  const [areaTo, setAreaTo] = useState("");
  const [streetWidth, setStreetWidth] = useState<string>("");
  const [showStreetWidthModal, setShowStreetWidthModal] = useState(false);
  const [stairs, setStairs] = useState(false);
  const [selectedVillaType, setSelectedVillaType] = useState<string | null>(null);
  const [driverRoom, setDriverRoom] = useState(false);
  const [maidRoom, setMaidRoom] = useState(false);
  const [pool, setPool] = useState(false);
  const [villaFurnished, setVillaFurnished] = useState(false);
  const [kitchen, setKitchen] = useState(false);
  const [villaCarEntrance, setVillaCarEntrance] = useState(false);
  const [basement, setBasement] = useState(false);
  const [nearBus, setNearBus] = useState(false);
  const [nearMetro, setNearMetro] = useState(false);

  // ========== LAND FOR SALE STATE ==========
  const [landPriceFrom, setLandPriceFrom] = useState("");
  const [landPriceTo, setLandPriceTo] = useState("");
  const [selectedLandType, setSelectedLandType] = useState<string | null>(null);
  const [landAreaFrom, setLandAreaFrom] = useState("");
  const [landAreaTo, setLandAreaTo] = useState("");
  const [landStreetDirection, setLandStreetDirection] = useState<string>("");
  const [landStreetWidth, setLandStreetWidth] = useState<string>("");

  // ========== APARTMENT FOR SALE STATE ==========
  const [apartmentSalePriceFrom, setApartmentSalePriceFrom] = useState("");
  const [apartmentSalePriceTo, setApartmentSalePriceTo] = useState("");
  const [apartmentSaleAreaFrom, setApartmentSaleAreaFrom] = useState("");
  const [apartmentSaleAreaTo, setApartmentSaleAreaTo] = useState("");
  const [apartmentSaleCarEntrance, setApartmentSaleCarEntrance] = useState(false);
  const [apartmentSalePrivateRoof, setApartmentSalePrivateRoof] = useState(false);
  const [apartmentSaleInVilla, setApartmentSaleInVilla] = useState(false);
  const [apartmentSaleTwoEntrances, setApartmentSaleTwoEntrances] = useState(false);
  const [apartmentSaleSpecialEntrances, setApartmentSaleSpecialEntrances] = useState(false);

  // ========== BUILDING FOR SALE STATE ==========
  const [buildingPriceFrom, setBuildingPriceFrom] = useState("");
  const [buildingPriceTo, setBuildingPriceTo] = useState("");
  const [buildingApartments, setBuildingApartments] = useState<string | null>(null);
  const [selectedBuildingType, setSelectedBuildingType] = useState<string | null>(null);
  const [buildingStreetDirection, setBuildingStreetDirection] = useState<string>("");
  const [stores, setStores] = useState<string>("");
  const [showStoresModal, setShowStoresModal] = useState(false);
  const [buildingAreaFrom, setBuildingAreaFrom] = useState("");
  const [buildingAreaTo, setBuildingAreaTo] = useState("");

  // ========== SMALL HOUSE FOR SALE STATE ==========
  const [smallHousePriceFrom, setSmallHousePriceFrom] = useState("");
  const [smallHousePriceTo, setSmallHousePriceTo] = useState("");
  const [smallHouseStreetDirection, setSmallHouseStreetDirection] = useState<string>("");
  const [smallHouseAreaFrom, setSmallHouseAreaFrom] = useState("");
  const [smallHouseAreaTo, setSmallHouseAreaTo] = useState("");
  const [smallHouseStreetWidth, setSmallHouseStreetWidth] = useState<string>("");
  const [smallHouseFurnished, setSmallHouseFurnished] = useState(false);
  const [tent, setTent] = useState(false);

  // ========== LOUNGE FOR SALE STATE ==========
  const [loungePriceFrom, setLoungePriceFrom] = useState("");
  const [loungePriceTo, setLoungePriceTo] = useState("");
  const [loungeAreaFrom, setLoungeAreaFrom] = useState("");
  const [loungeAreaTo, setLoungeAreaTo] = useState("");
  const [loungeStreetWidth, setLoungeStreetWidth] = useState<string>("");

  // ========== FARM FOR SALE STATE ==========
  const [farmPriceFrom, setFarmPriceFrom] = useState("");
  const [farmPriceTo, setFarmPriceTo] = useState("");
  const [farmAreaFrom, setFarmAreaFrom] = useState("");
  const [farmAreaTo, setFarmAreaTo] = useState("");

  // ========== STORE FOR SALE STATE ==========
  const [storePriceFrom, setStorePriceFrom] = useState("");
  const [storePriceTo, setStorePriceTo] = useState("");
  const [storeAreaFrom, setStoreAreaFrom] = useState("");
  const [storeAreaTo, setStoreAreaTo] = useState("");
  const [storeStreetWidth, setStoreStreetWidth] = useState<string>("");

  // ========== FLOOR FOR SALE STATE ==========
  const [floorSalePriceFrom, setFloorSalePriceFrom] = useState("");
  const [floorSalePriceTo, setFloorSalePriceTo] = useState("");
  const [floorSaleAreaFrom, setFloorSaleAreaFrom] = useState("");
  const [floorSaleAreaTo, setFloorSaleAreaTo] = useState("");
  const [floorSaleCarEntrance, setFloorSaleCarEntrance] = useState(false);

  // ========== VILLA FOR RENT STATE ==========
  const [villaRentPriceFrom, setVillaRentPriceFrom] = useState("");
  const [villaRentPriceTo, setVillaRentPriceTo] = useState("");
  const [villaRentStreetDirection, setVillaRentStreetDirection] = useState<string>("");
  const [villaRentAreaFrom, setVillaRentAreaFrom] = useState("");
  const [villaRentAreaTo, setVillaRentAreaTo] = useState("");
  const [villaRentStreetWidth, setVillaRentStreetWidth] = useState<string>("");
  const [villaRentStairs, setVillaRentStairs] = useState(false);
  const [villaRentAirConditioned, setVillaRentAirConditioned] = useState(false);
  const [villaRentRentPeriod, setVillaRentRentPeriod] = useState<RentPeriod>(null);

  // ========== BIG FLAT FOR RENT STATE ==========
  const [bigFlatPriceFrom, setBigFlatPriceFrom] = useState("");
  const [bigFlatPriceTo, setBigFlatPriceTo] = useState("");
  const [bigFlatAreaFrom, setBigFlatAreaFrom] = useState("");
  const [bigFlatAreaTo, setBigFlatAreaTo] = useState("");
  const [bigFlatRentPeriod, setBigFlatRentPeriod] = useState<RentPeriod>(null);
  const [bigFlatCarEntrance, setBigFlatCarEntrance] = useState(false);
  const [bigFlatAirConditioned, setBigFlatAirConditioned] = useState(false);
  const [bigFlatInVilla, setBigFlatInVilla] = useState(false);
  const [bigFlatTwoEntrances, setBigFlatTwoEntrances] = useState(false);
  const [bigFlatSpecialEntrances, setBigFlatSpecialEntrances] = useState(false);

  // ========== LOUNGE FOR RENT STATE ==========
  const [loungeRentPriceFrom, setLoungeRentPriceFrom] = useState("");
  const [loungeRentPriceTo, setLoungeRentPriceTo] = useState("");
  const [loungeRentAreaFrom, setLoungeRentAreaFrom] = useState("");
  const [loungeRentAreaTo, setLoungeRentAreaTo] = useState("");
  const [loungeRentRentPeriod, setLoungeRentRentPeriod] = useState<RentPeriod>(null);
  const [loungeRentPool, setLoungeRentPool] = useState(false);
  const [footballPitch, setFootballPitch] = useState(false);
  const [volleyballCourt, setVolleyballCourt] = useState(false);
  const [loungeRentTent, setLoungeRentTent] = useState(false);
  const [loungeRentKitchen, setLoungeRentKitchen] = useState(false);
  const [playground, setPlayground] = useState(false);
  const [familySection, setFamilySection] = useState(false);

  // ========== SMALL HOUSE FOR RENT STATE ==========
  const [smallHouseRentPriceFrom, setSmallHouseRentPriceFrom] = useState("");
  const [smallHouseRentPriceTo, setSmallHouseRentPriceTo] = useState("");
  const [smallHouseRentStreetDirection, setSmallHouseRentStreetDirection] = useState<string>("");
  const [smallHouseRentAreaFrom, setSmallHouseRentAreaFrom] = useState("");
  const [smallHouseRentAreaTo, setSmallHouseRentAreaTo] = useState("");
  const [smallHouseRentStreetWidth, setSmallHouseRentStreetWidth] = useState<string>("");
  const [smallHouseRentFurnished, setSmallHouseRentFurnished] = useState(false);
  const [smallHouseRentTent, setSmallHouseRentTent] = useState(false);
  const [smallHouseRentKitchen, setSmallHouseRentKitchen] = useState(false);

  // ========== STORE FOR RENT STATE ==========
  const [storeRentPriceFrom, setStoreRentPriceFrom] = useState("");
  const [storeRentPriceTo, setStoreRentPriceTo] = useState("");
  const [storeRentAreaFrom, setStoreRentAreaFrom] = useState("");
  const [storeRentAreaTo, setStoreRentAreaTo] = useState("");
  const [storeRentStreetWidth, setStoreRentStreetWidth] = useState<string>("");

  // ========== BUILDING FOR RENT STATE ==========
  const [buildingRentPriceFrom, setBuildingRentPriceFrom] = useState("");
  const [buildingRentPriceTo, setBuildingRentPriceTo] = useState("");
  const [buildingRentApartments, setBuildingRentApartments] = useState<string | null>(null);
  const [selectedBuildingRentType, setSelectedBuildingRentType] = useState<string | null>(null);
  const [buildingRentStreetDirection, setBuildingRentStreetDirection] = useState<string>("");
  const [buildingRentStores, setBuildingRentStores] = useState<string>("");
  const [buildingRentAreaFrom, setBuildingRentAreaFrom] = useState("");
  const [buildingRentAreaTo, setBuildingRentAreaTo] = useState("");
  const [buildingRentStreetWidth, setBuildingRentStreetWidth] = useState<string>("");

  // ========== LAND FOR RENT STATE ==========
  const [landRentStreetDirection, setLandRentStreetDirection] = useState<string>("");
  const [landRentAreaFrom, setLandRentAreaFrom] = useState("");
  const [landRentAreaTo, setLandRentAreaTo] = useState("");
  const [landRentStreetWidth, setLandRentStreetWidth] = useState<string>("");
  const [selectedLandRentType, setSelectedLandRentType] = useState<string | null>(null);

  // ========== ROOM FOR RENT STATE ==========
  const [roomRentPriceFrom, setRoomRentPriceFrom] = useState("");
  const [roomRentPriceTo, setRoomRentPriceTo] = useState("");
  const [roomRentRentPeriod, setRoomRentRentPeriod] = useState<RentPeriod>(null);
  const [roomRentKitchen, setRoomRentKitchen] = useState(false);

  // ========== OFFICE FOR RENT STATE ==========
  const [officeRentPriceFrom, setOfficeRentPriceFrom] = useState("");
  const [officeRentPriceTo, setOfficeRentPriceTo] = useState("");
  const [officeRentAreaFrom, setOfficeRentAreaFrom] = useState("");
  const [officeRentAreaTo, setOfficeRentAreaTo] = useState("");
  const [officeRentStreetWidth, setOfficeRentStreetWidth] = useState<string>("");
  const [officeRentFurnished, setOfficeRentFurnished] = useState(false);

  // ========== TENT FOR RENT STATE ==========
  const [tentRentRentPeriod, setTentRentRentPeriod] = useState<RentPeriod>(null);

  // ========== WAREHOUSE FOR RENT STATE ==========
  const [warehouseRentPriceFrom, setWarehouseRentPriceFrom] = useState("");
  const [warehouseRentPriceTo, setWarehouseRentPriceTo] = useState("");
  const [warehouseRentAreaFrom, setWarehouseRentAreaFrom] = useState("");
  const [warehouseRentAreaTo, setWarehouseRentAreaTo] = useState("");
  const [warehouseRentStreetWidth, setWarehouseRentStreetWidth] = useState<string>("");

  // ========== CHALET FOR RENT STATE ==========
  const [chaletRentPriceFrom, setChaletRentPriceFrom] = useState("");
  const [chaletRentPriceTo, setChaletRentPriceTo] = useState("");
  const [chaletRentAreaFrom, setChaletRentAreaFrom] = useState("");
  const [chaletRentAreaTo, setChaletRentAreaTo] = useState("");
  const [chaletRentRentPeriod, setChaletRentRentPeriod] = useState<RentPeriod>(null);
  const [chaletRentPool, setChaletRentPool] = useState(false);
  const [chaletFootballPitch, setChaletFootballPitch] = useState(false);
  const [chaletVolleyballCourt, setChaletVolleyballCourt] = useState(false);
  const [chaletRentTent, setChaletRentTent] = useState(false);
  const [chaletRentKitchen, setChaletRentKitchen] = useState(false);
  const [chaletPlayground, setChaletPlayground] = useState(false);

  // ========== OTHER CATEGORY STATE ==========
  const [otherPriceFrom, setOtherPriceFrom] = useState("");
  const [otherPriceTo, setOtherPriceTo] = useState("");
  const [otherAreaFrom, setOtherAreaFrom] = useState("");
  const [otherAreaTo, setOtherAreaTo] = useState("");

  // ========== HANDLERS ==========
  const handleCategorySelect = (value: string) => {
    setCategory(value);
    setShowCategoryModal(false);
  };

  const handleRentPeriodPress = (period: "Yearly" | "Monthly") => {
    if (rentPeriod === period) {
      setRentPeriod(null);
      setSelectedPayment(null);
    } else {
      setRentPeriod(period);
    }
  };

  const handlePaymentChipPress = (payment: string) => {
    if (selectedPayment === payment) {
      setSelectedPayment(null);
    } else {
      setSelectedPayment(payment);
    }
  };

  const handlePaymentTypePress = (value: string) => {
    if (selectedPaymentType === value) {
      setSelectedPaymentType(null);
    } else {
      setSelectedPaymentType(value);
    }
  };

  const handleBedroomPress = (value: string) => {
    if (selectedBedroom === value) {
      setSelectedBedroom(null);
    } else {
      setSelectedBedroom(value);
    }
  };

  const handleLivingRoomPress = (value: string) => {
    if (selectedLivingRoom === value) {
      setSelectedLivingRoom(null);
    } else {
      setSelectedLivingRoom(value);
    }
  };

  const handleWcPress = (value: string) => {
    if (selectedWc === value) {
      setSelectedWc(null);
    } else {
      setSelectedWc(value);
    }
  };

  const handleApartmentPress = (value: string) => {
    if (selectedApartment === value) {
      setSelectedApartment(null);
    } else {
      setSelectedApartment(value);
    }
  };

  const handleVillaTypePress = (value: string) => {
    if (selectedVillaType === value) {
      setSelectedVillaType(null);
    } else {
      setSelectedVillaType(value);
    }
  };

  const handleStreetDirectionSelect = (value: string) => {
    const currentCategory = category;
    if (currentCategory === "Villa for sale") {
      setStreetDirection(value);
    } else if (currentCategory === "Land for sale") {
      setLandStreetDirection(value);
    } else if (currentCategory === "Small house for sale") {
      setSmallHouseStreetDirection(value);
    } else if (currentCategory === "Building for sale") {
      setBuildingStreetDirection(value);
    } else if (currentCategory === "Villa for rent") {
      setVillaRentStreetDirection(value);
    } else if (currentCategory === "Small house for rent") {
      setSmallHouseRentStreetDirection(value);
    } else if (currentCategory === "Building for rent") {
      setBuildingRentStreetDirection(value);
    } else if (currentCategory === "Land for rent") {
      setLandRentStreetDirection(value);
    }
    setShowStreetDirectionModal(false);
  };

  const handleStreetWidthSelect = (value: string) => {
    const currentCategory = category;
    if (currentCategory === "Villa for sale") {
      setStreetWidth(value);
    } else if (currentCategory === "Land for sale") {
      setLandStreetWidth(value);
    } else if (currentCategory === "Small house for sale") {
      setSmallHouseStreetWidth(value);
    } else if (currentCategory === "Building for sale") {
      setStreetWidth(value);
    } else if (currentCategory === "Lounge for sale") {
      setLoungeStreetWidth(value);
    } else if (currentCategory === "Store for sale") {
      setStoreStreetWidth(value);
    } else if (currentCategory === "Villa for rent") {
      setVillaRentStreetWidth(value);
    } else if (currentCategory === "Small house for rent") {
      setSmallHouseRentStreetWidth(value);
    } else if (currentCategory === "Store for rent") {
      setStoreRentStreetWidth(value);
    } else if (currentCategory === "Building for rent") {
      setBuildingRentStreetWidth(value);
    } else if (currentCategory === "Land for rent") {
      setLandRentStreetWidth(value);
    } else if (currentCategory === "Office for rent") {
      setOfficeRentStreetWidth(value);
    } else if (currentCategory === "Warehouse for rent") {
      setWarehouseRentStreetWidth(value);
    }
    setShowStreetWidthModal(false);
  };

  const handleLandRentTypePress = (value: string) => {
    if (selectedLandRentType === value) {
      setSelectedLandRentType(null);
    } else {
      setSelectedLandRentType(value);
    }
  };

  const handleBuildingRentTypePress = (value: string) => {
    if (selectedBuildingRentType === value) {
      setSelectedBuildingRentType(null);
    } else {
      setSelectedBuildingRentType(value);
    }
  };

  const handleBuildingRentStoresSelect = (value: string) => {
    setBuildingRentStores(value);
    setShowStoresModal(false);
  };

  const handleVillaRentRentPeriodPress = (period: "Yearly" | "Monthly") => {
    if (villaRentRentPeriod === period) {
      setVillaRentRentPeriod(null);
    } else {
      setVillaRentRentPeriod(period);
    }
  };

  const handleBigFlatRentPeriodPress = (period: "Yearly" | "Monthly") => {
    if (bigFlatRentPeriod === period) {
      setBigFlatRentPeriod(null);
    } else {
      setBigFlatRentPeriod(period);
    }
  };

  const handleLoungeRentRentPeriodPress = (period: "Yearly" | "Monthly") => {
    if (loungeRentRentPeriod === period) {
      setLoungeRentRentPeriod(null);
    } else {
      setLoungeRentRentPeriod(period);
    }
  };

  const handleRoomRentRentPeriodPress = (period: "Yearly" | "Monthly") => {
    if (roomRentRentPeriod === period) {
      setRoomRentRentPeriod(null);
    } else {
      setRoomRentRentPeriod(period);
    }
  };

  const handleTentRentRentPeriodPress = (period: "Yearly" | "Monthly") => {
    if (tentRentRentPeriod === period) {
      setTentRentRentPeriod(null);
    } else {
      setTentRentRentPeriod(period);
    }
  };

  const handleChaletRentRentPeriodPress = (period: "Yearly" | "Monthly") => {
    if (chaletRentRentPeriod === period) {
      setChaletRentRentPeriod(null);
    } else {
      setChaletRentRentPeriod(period);
    }
  };

  const handleLandTypePress = (value: string) => {
    if (selectedLandType === value) {
      setSelectedLandType(null);
    } else {
      setSelectedLandType(value);
    }
  };

  const handleBuildingTypePress = (value: string) => {
    if (selectedBuildingType === value) {
      setSelectedBuildingType(null);
    } else {
      setSelectedBuildingType(value);
    }
  };

  const handleStoresSelect = (value: string) => {
    setStores(value);
    setShowStoresModal(false);
  };

  const handleFloorSelect = (value: string) => {
    setFloor(value);
    setShowFloorModal(false);
  };

  const handleAgeSelect = (value: string) => {
    setAge(value);
    setShowAgeModal(false);
  };

  // ========== COMPUTED VALUES ==========
  const categoryChecks = useMemo(() => ({
    isApartmentForRent: category === "Apartment for rent",
    isVillaForSale: category === "Villa for sale",
    isLandForSale: category === "Land for sale",
    isApartmentForSale: category === "Apartment for sale",
    isBuildingForSale: category === "Building for sale",
    isSmallHouseForSale: category === "Small house for sale",
    isLoungeForSale: category === "Lounge for sale",
    isFarmForSale: category === "Farm for sale",
    isStoreForSale: category === "Store for sale",
    isFloorForSale: category === "Floor for sale",
    isVillaForRent: category === "Villa for rent",
    isBigFlatForRent: category === "Big flat for rent",
    isLoungeForRent: category === "Lounge for rent",
    isSmallHouseForRent: category === "Small house for rent",
    isStoreForRent: category === "Store for rent",
    isBuildingForRent: category === "Building for rent",
    isLandForRent: category === "Land for rent",
    isRoomForRent: category === "Room for rent",
    isOfficeForRent: category === "Office for rent",
    isTentForRent: category === "Tent for rent",
    isWarehouseForRent: category === "Warehouse for rent",
    isChaletForRent: category === "Chalet for rent",
    isOther: category === "Other",
  }), [category]);

  const apartmentForRentComputed = useMemo(() => {
    const showYearlyContent = rentPeriod === "Yearly";
    const showMonthlyContent = rentPeriod === "Monthly";
    const showPriceSection = (!rentPeriod || rentPeriod === "Monthly") && categoryChecks.isApartmentForRent;
    const showPaymentTypeTabBar = (!rentPeriod || rentPeriod === "Monthly") && categoryChecks.isApartmentForRent;
    const priceLabel = selectedPayment === "Monthly" && showYearlyContent ? "Price monthly" : "Annual Price";
    
    return {
      showYearlyContent,
      showMonthlyContent,
      showPriceSection,
      showPaymentTypeTabBar,
      priceLabel,
    };
  }, [rentPeriod, selectedPayment, categoryChecks.isApartmentForRent]);

  // ========== RETURN ALL STATE AND HANDLERS ==========
  return {
    // Category
    category,
    setCategory,
    showCategoryModal,
    setShowCategoryModal,
    handleCategorySelect,
    
    // Category checks
    ...categoryChecks,
    
    // Apartment for rent computed
    ...apartmentForRentComputed,
    
    // Apartment for rent
    rentPeriod,
    setRentPeriod,
    selectedPayment,
    setSelectedPayment,
    fromPrice,
    setFromPrice,
    toPrice,
    setToPrice,
    priceFrom,
    setPriceFrom,
    priceTo,
    setPriceTo,
    selectedPaymentType,
    setSelectedPaymentType,
    selectedBedroom,
    setSelectedBedroom,
    selectedLivingRoom,
    setSelectedLivingRoom,
    selectedWc,
    setSelectedWc,
    floor,
    setFloor,
    showFloorModal,
    setShowFloorModal,
    age,
    setAge,
    showAgeModal,
    setShowAgeModal,
    furnished,
    setFurnished,
    carEntrance,
    setCarEntrance,
    airConditioned,
    setAirConditioned,
    privateRoof,
    setPrivateRoof,
    apartmentInVilla,
    setApartmentInVilla,
    twoEntrances,
    setTwoEntrances,
    specialEntrances,
    setSpecialEntrances,
    handleRentPeriodPress,
    handlePaymentChipPress,
    handlePaymentTypePress,
    handleBedroomPress,
    handleLivingRoomPress,
    handleWcPress,
    handleFloorSelect,
    handleAgeSelect,
    
    // Villa for sale
    villaPriceFrom,
    setVillaPriceFrom,
    villaPriceTo,
    setVillaPriceTo,
    selectedApartment,
    setSelectedApartment,
    streetDirection,
    setStreetDirection,
    showStreetDirectionModal,
    setShowStreetDirectionModal,
    areaFrom,
    setAreaFrom,
    areaTo,
    setAreaTo,
    streetWidth,
    setStreetWidth,
    showStreetWidthModal,
    setShowStreetWidthModal,
    stairs,
    setStairs,
    selectedVillaType,
    setSelectedVillaType,
    driverRoom,
    setDriverRoom,
    maidRoom,
    setMaidRoom,
    pool,
    setPool,
    villaFurnished,
    setVillaFurnished,
    kitchen,
    setKitchen,
    villaCarEntrance,
    setVillaCarEntrance,
    basement,
    setBasement,
    nearBus,
    setNearBus,
    nearMetro,
    setNearMetro,
    handleApartmentPress,
    handleVillaTypePress,
    handleStreetDirectionSelect,
    handleStreetWidthSelect,
    
    // Land for sale
    landPriceFrom,
    setLandPriceFrom,
    landPriceTo,
    setLandPriceTo,
    selectedLandType,
    setSelectedLandType,
    landAreaFrom,
    setLandAreaFrom,
    landAreaTo,
    setLandAreaTo,
    landStreetDirection,
    setLandStreetDirection,
    landStreetWidth,
    setLandStreetWidth,
    handleLandTypePress,
    
    // Apartment for sale
    apartmentSalePriceFrom,
    setApartmentSalePriceFrom,
    apartmentSalePriceTo,
    setApartmentSalePriceTo,
    apartmentSaleAreaFrom,
    setApartmentSaleAreaFrom,
    apartmentSaleAreaTo,
    setApartmentSaleAreaTo,
    apartmentSaleCarEntrance,
    setApartmentSaleCarEntrance,
    apartmentSalePrivateRoof,
    setApartmentSalePrivateRoof,
    apartmentSaleInVilla,
    setApartmentSaleInVilla,
    apartmentSaleTwoEntrances,
    setApartmentSaleTwoEntrances,
    apartmentSaleSpecialEntrances,
    setApartmentSaleSpecialEntrances,
    
    // Building for sale
    buildingPriceFrom,
    setBuildingPriceFrom,
    buildingPriceTo,
    setBuildingPriceTo,
    buildingApartments,
    setBuildingApartments,
    selectedBuildingType,
    setSelectedBuildingType,
    buildingStreetDirection,
    setBuildingStreetDirection,
    stores,
    setStores,
    showStoresModal,
    setShowStoresModal,
    buildingAreaFrom,
    setBuildingAreaFrom,
    buildingAreaTo,
    setBuildingAreaTo,
    handleBuildingTypePress,
    handleStoresSelect,
    
    // Small house for sale
    smallHousePriceFrom,
    setSmallHousePriceFrom,
    smallHousePriceTo,
    setSmallHousePriceTo,
    smallHouseStreetDirection,
    setSmallHouseStreetDirection,
    smallHouseAreaFrom,
    setSmallHouseAreaFrom,
    smallHouseAreaTo,
    setSmallHouseAreaTo,
    smallHouseStreetWidth,
    setSmallHouseStreetWidth,
    smallHouseFurnished,
    setSmallHouseFurnished,
    tent,
    setTent,
    
    // Lounge for sale
    loungePriceFrom,
    setLoungePriceFrom,
    loungePriceTo,
    setLoungePriceTo,
    loungeAreaFrom,
    setLoungeAreaFrom,
    loungeAreaTo,
    setLoungeAreaTo,
    loungeStreetWidth,
    setLoungeStreetWidth,
    
    // Farm for sale
    farmPriceFrom,
    setFarmPriceFrom,
    farmPriceTo,
    setFarmPriceTo,
    farmAreaFrom,
    setFarmAreaFrom,
    farmAreaTo,
    setFarmAreaTo,
    
    // Store for sale
    storePriceFrom,
    setStorePriceFrom,
    storePriceTo,
    setStorePriceTo,
    storeAreaFrom,
    setStoreAreaFrom,
    storeAreaTo,
    setStoreAreaTo,
    storeStreetWidth,
    setStoreStreetWidth,
    
    // Floor for sale
    floorSalePriceFrom,
    setFloorSalePriceFrom,
    floorSalePriceTo,
    setFloorSalePriceTo,
    floorSaleAreaFrom,
    setFloorSaleAreaFrom,
    floorSaleAreaTo,
    setFloorSaleAreaTo,
    floorSaleCarEntrance,
    setFloorSaleCarEntrance,
    
    // Villa for rent
    villaRentPriceFrom,
    setVillaRentPriceFrom,
    villaRentPriceTo,
    setVillaRentPriceTo,
    villaRentStreetDirection,
    setVillaRentStreetDirection,
    villaRentAreaFrom,
    setVillaRentAreaFrom,
    villaRentAreaTo,
    setVillaRentAreaTo,
    villaRentStreetWidth,
    setVillaRentStreetWidth,
    villaRentStairs,
    setVillaRentStairs,
    villaRentAirConditioned,
    setVillaRentAirConditioned,
    villaRentRentPeriod,
    setVillaRentRentPeriod,
    handleVillaRentRentPeriodPress,
    
    // Big flat for rent
    bigFlatPriceFrom,
    setBigFlatPriceFrom,
    bigFlatPriceTo,
    setBigFlatPriceTo,
    bigFlatAreaFrom,
    setBigFlatAreaFrom,
    bigFlatAreaTo,
    setBigFlatAreaTo,
    bigFlatRentPeriod,
    setBigFlatRentPeriod,
    bigFlatCarEntrance,
    setBigFlatCarEntrance,
    bigFlatAirConditioned,
    setBigFlatAirConditioned,
    bigFlatInVilla,
    setBigFlatInVilla,
    bigFlatTwoEntrances,
    setBigFlatTwoEntrances,
    bigFlatSpecialEntrances,
    setBigFlatSpecialEntrances,
    handleBigFlatRentPeriodPress,
    
    // Lounge for rent
    loungeRentPriceFrom,
    setLoungeRentPriceFrom,
    loungeRentPriceTo,
    setLoungeRentPriceTo,
    loungeRentAreaFrom,
    setLoungeRentAreaFrom,
    loungeRentAreaTo,
    setLoungeRentAreaTo,
    loungeRentRentPeriod,
    setLoungeRentRentPeriod,
    loungeRentPool,
    setLoungeRentPool,
    footballPitch,
    setFootballPitch,
    volleyballCourt,
    setVolleyballCourt,
    loungeRentTent,
    setLoungeRentTent,
    loungeRentKitchen,
    setLoungeRentKitchen,
    playground,
    setPlayground,
    familySection,
    setFamilySection,
    handleLoungeRentRentPeriodPress,
    
    // Small house for rent
    smallHouseRentPriceFrom,
    setSmallHouseRentPriceFrom,
    smallHouseRentPriceTo,
    setSmallHouseRentPriceTo,
    smallHouseRentStreetDirection,
    setSmallHouseRentStreetDirection,
    smallHouseRentAreaFrom,
    setSmallHouseRentAreaFrom,
    smallHouseRentAreaTo,
    setSmallHouseRentAreaTo,
    smallHouseRentStreetWidth,
    setSmallHouseRentStreetWidth,
    smallHouseRentFurnished,
    setSmallHouseRentFurnished,
    smallHouseRentTent,
    setSmallHouseRentTent,
    smallHouseRentKitchen,
    setSmallHouseRentKitchen,
    
    // Store for rent
    storeRentPriceFrom,
    setStoreRentPriceFrom,
    storeRentPriceTo,
    setStoreRentPriceTo,
    storeRentAreaFrom,
    setStoreRentAreaFrom,
    storeRentAreaTo,
    setStoreRentAreaTo,
    storeRentStreetWidth,
    setStoreRentStreetWidth,
    
    // Building for rent
    buildingRentPriceFrom,
    setBuildingRentPriceFrom,
    buildingRentPriceTo,
    setBuildingRentPriceTo,
    buildingRentApartments,
    setBuildingRentApartments,
    selectedBuildingRentType,
    setSelectedBuildingRentType,
    buildingRentStreetDirection,
    setBuildingRentStreetDirection,
    buildingRentStores,
    setBuildingRentStores,
    buildingRentAreaFrom,
    setBuildingRentAreaFrom,
    buildingRentAreaTo,
    setBuildingRentAreaTo,
    buildingRentStreetWidth,
    setBuildingRentStreetWidth,
    handleBuildingRentTypePress,
    handleBuildingRentStoresSelect,
    
    // Land for rent
    landRentStreetDirection,
    setLandRentStreetDirection,
    landRentAreaFrom,
    setLandRentAreaFrom,
    landRentAreaTo,
    setLandRentAreaTo,
    landRentStreetWidth,
    setLandRentStreetWidth,
    selectedLandRentType,
    setSelectedLandRentType,
    handleLandRentTypePress,
    
    // Room for rent
    roomRentPriceFrom,
    setRoomRentPriceFrom,
    roomRentPriceTo,
    setRoomRentPriceTo,
    roomRentRentPeriod,
    setRoomRentRentPeriod,
    roomRentKitchen,
    setRoomRentKitchen,
    handleRoomRentRentPeriodPress,
    
    // Office for rent
    officeRentPriceFrom,
    setOfficeRentPriceFrom,
    officeRentPriceTo,
    setOfficeRentPriceTo,
    officeRentAreaFrom,
    setOfficeRentAreaFrom,
    officeRentAreaTo,
    setOfficeRentAreaTo,
    officeRentStreetWidth,
    setOfficeRentStreetWidth,
    officeRentFurnished,
    setOfficeRentFurnished,
    
    // Tent for rent
    tentRentRentPeriod,
    setTentRentRentPeriod,
    handleTentRentRentPeriodPress,
    
    // Warehouse for rent
    warehouseRentPriceFrom,
    setWarehouseRentPriceFrom,
    warehouseRentPriceTo,
    setWarehouseRentPriceTo,
    warehouseRentAreaFrom,
    setWarehouseRentAreaFrom,
    warehouseRentAreaTo,
    setWarehouseRentAreaTo,
    warehouseRentStreetWidth,
    setWarehouseRentStreetWidth,
    
    // Chalet for rent
    chaletRentPriceFrom,
    setChaletRentPriceFrom,
    chaletRentPriceTo,
    setChaletRentPriceTo,
    chaletRentAreaFrom,
    setChaletRentAreaFrom,
    chaletRentAreaTo,
    setChaletRentAreaTo,
    chaletRentRentPeriod,
    setChaletRentRentPeriod,
    chaletRentPool,
    setChaletRentPool,
    chaletFootballPitch,
    setChaletFootballPitch,
    chaletVolleyballCourt,
    setChaletVolleyballCourt,
    chaletRentTent,
    setChaletRentTent,
    chaletRentKitchen,
    setChaletRentKitchen,
    chaletPlayground,
    setChaletPlayground,
    handleChaletRentRentPeriodPress,
    
    // Other category
    otherPriceFrom,
    setOtherPriceFrom,
    otherPriceTo,
    setOtherPriceTo,
    otherAreaFrom,
    setOtherAreaFrom,
    otherAreaTo,
    setOtherAreaTo,
  };
}

