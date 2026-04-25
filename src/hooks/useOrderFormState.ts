import { useState } from "react";
import type {
  ApartmentRentTenant,
  RentPaymentFrequency,
} from "../constants/orderFormOptions";

/**
 * Centralized state management for order form
 * This hook manages all form state for all categories
 */
export function useOrderFormState() {
  // Category
  const [category, setCategory] = useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Apartment for rent
  const [rentPeriod, setRentPeriod] = useState<RentPaymentFrequency>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [fromPrice, setFromPrice] = useState("");
  const [toPrice, setToPrice] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [apartmentRentTenant, setApartmentRentTenant] =
    useState<ApartmentRentTenant>(null);
  const [selectedBedroom, setSelectedBedroom] = useState<string | null>(null);
  const [selectedLivingRoom, setSelectedLivingRoom] = useState<string | null>(
    null,
  );
  const [selectedWc, setSelectedWc] = useState<string | null>(null);
  const [floor, setFloor] = useState<string>("");
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [age, setAge] = useState<string>("");
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [furnished, setFurnished] = useState(true);
  const [carEntrance, setCarEntrance] = useState(true);
  const [airConditioned, setAirConditioned] = useState(true);
  const [privateRoof, setPrivateRoof] = useState(true);
  const [apartmentInVilla, setApartmentInVilla] = useState(true);
  const [twoEntrances, setTwoEntrances] = useState(true);
  const [specialEntrances, setSpecialEntrances] = useState(true);

  // Villa for sale
  const [villaPriceFrom, setVillaPriceFrom] = useState("");
  const [villaPriceTo, setVillaPriceTo] = useState("");
  const [selectedApartment, setSelectedApartment] = useState<string | null>(
    null,
  );
  const [streetDirection, setStreetDirection] = useState<string>("");
  const [showStreetDirectionModal, setShowStreetDirectionModal] =
    useState(false);
  const [areaFrom, setAreaFrom] = useState("");
  const [areaTo, setAreaTo] = useState("");
  const [streetWidth, setStreetWidth] = useState<string>("");
  const [showStreetWidthModal, setShowStreetWidthModal] = useState(false);
  const [stairs, setStairs] = useState(true);
  const [selectedVillaType, setSelectedVillaType] = useState<string | null>(
    null,
  );
  const [driverRoom, setDriverRoom] = useState(true);
  const [maidRoom, setMaidRoom] = useState(true);
  const [pool, setPool] = useState(true);
  const [villaFurnished, setVillaFurnished] = useState(true);
  const [kitchen, setKitchen] = useState(true);
  const [villaCarEntrance, setVillaCarEntrance] = useState(true);
  const [basement, setBasement] = useState(true);
  const [nearBus, setNearBus] = useState(true);
  const [nearMetro, setNearMetro] = useState(true);

  // Land for sale
  const [landPriceFrom, setLandPriceFrom] = useState("");
  const [landPriceTo, setLandPriceTo] = useState("");
  const [selectedLandType, setSelectedLandType] = useState<string | null>(null);
  const [landStreetDirection, setLandStreetDirection] = useState<string>("");
  const [landAreaFrom, setLandAreaFrom] = useState("");
  const [landAreaTo, setLandAreaTo] = useState("");
  const [landStreetWidth, setLandStreetWidth] = useState<string>("");

  // Apartment for sale
  const [apartmentSalePriceFrom, setApartmentSalePriceFrom] = useState("");
  const [apartmentSalePriceTo, setApartmentSalePriceTo] = useState("");
  const [apartmentSaleAreaFrom, setApartmentSaleAreaFrom] = useState("");
  const [apartmentSaleAreaTo, setApartmentSaleAreaTo] = useState("");
  const [apartmentSaleCarEntrance, setApartmentSaleCarEntrance] =
    useState(true);
  const [apartmentSaleAirConditioned, setApartmentSaleAirConditioned] =
    useState(true);
  const [apartmentSaleInVilla, setApartmentSaleInVilla] = useState(true);
  const [apartmentSaleTwoEntrances, setApartmentSaleTwoEntrances] =
    useState(true);
  const [apartmentSaleSpecialEntrances, setApartmentSaleSpecialEntrances] =
    useState(true);

  // Building for sale
  const [buildingPriceFrom, setBuildingPriceFrom] = useState("");
  const [buildingPriceTo, setBuildingPriceTo] = useState("");
  const [buildingApartments, setBuildingApartments] = useState<string | null>(
    null,
  );
  const [selectedBuildingType, setSelectedBuildingType] = useState<
    string | null
  >(null);
  const [buildingStreetDirection, setBuildingStreetDirection] =
    useState<string>("");
  const [stores, setStores] = useState<string>("");
  const [showStoresModal, setShowStoresModal] = useState(false);
  const [buildingAreaFrom, setBuildingAreaFrom] = useState("");
  const [buildingAreaTo, setBuildingAreaTo] = useState("");

  // Small house for sale
  const [smallHousePriceFrom, setSmallHousePriceFrom] = useState("");
  const [smallHousePriceTo, setSmallHousePriceTo] = useState("");
  const [smallHouseStreetDirection, setSmallHouseStreetDirection] =
    useState<string>("");
  const [smallHouseAreaFrom, setSmallHouseAreaFrom] = useState("");
  const [smallHouseAreaTo, setSmallHouseAreaTo] = useState("");
  const [smallHouseStreetWidth, setSmallHouseStreetWidth] =
    useState<string>("");
  const [smallHouseFurnished, setSmallHouseFurnished] = useState(true);
  const [smallHouseTent, setSmallHouseTent] = useState(true);

  // Lounge for sale
  const [loungeSalePriceFrom, setLoungeSalePriceFrom] = useState("");
  const [loungeSalePriceTo, setLoungeSalePriceTo] = useState("");
  const [loungeSaleAreaFrom, setLoungeSaleAreaFrom] = useState("");
  const [loungeSaleAreaTo, setLoungeSaleAreaTo] = useState("");
  const [loungeSaleStreetWidth, setLoungeSaleStreetWidth] =
    useState<string>("");

  // Farm for sale
  const [farmPriceFrom, setFarmPriceFrom] = useState("");
  const [farmPriceTo, setFarmPriceTo] = useState("");
  const [farmAreaFrom, setFarmAreaFrom] = useState("");
  const [farmAreaTo, setFarmAreaTo] = useState("");

  // Store for sale
  const [storeSalePriceFrom, setStoreSalePriceFrom] = useState("");
  const [storeSalePriceTo, setStoreSalePriceTo] = useState("");
  const [storeSaleAreaFrom, setStoreSaleAreaFrom] = useState("");
  const [storeSaleAreaTo, setStoreSaleAreaTo] = useState("");
  const [storeSaleStreetWidth, setStoreSaleStreetWidth] = useState<string>("");

  // Floor for sale
  const [floorSalePriceFrom, setFloorSalePriceFrom] = useState("");
  const [floorSalePriceTo, setFloorSalePriceTo] = useState("");
  const [floorSaleAreaFrom, setFloorSaleAreaFrom] = useState("");
  const [floorSaleAreaTo, setFloorSaleAreaTo] = useState("");

  // Villa for rent
  const [villaRentRentPeriod, setVillaRentRentPeriod] =
    useState<RentPaymentFrequency>(null);
  const [villaRentPriceFrom, setVillaRentPriceFrom] = useState("");
  const [villaRentPriceTo, setVillaRentPriceTo] = useState("");
  const [villaRentStreetDirection, setVillaRentStreetDirection] =
    useState<string>("");
  const [villaRentAreaFrom, setVillaRentAreaFrom] = useState("");
  const [villaRentAreaTo, setVillaRentAreaTo] = useState("");
  const [villaRentStreetWidth, setVillaRentStreetWidth] = useState<string>("");
  const [villaRentStairs, setVillaRentStairs] = useState(true);
  const [villaRentDriverRoom, setVillaRentDriverRoom] = useState(true);
  const [villaRentMaidRoom, setVillaRentMaidRoom] = useState(true);
  const [villaRentPool, setVillaRentPool] = useState(true);
  const [villaRentFurnished, setVillaRentFurnished] = useState(true);
  const [villaRentKitchen, setVillaRentKitchen] = useState(true);
  const [villaRentCarEntrance, setVillaRentCarEntrance] = useState(true);
  const [villaRentBasement, setVillaRentBasement] = useState(true);
  const [villaRentVillaType, setVillaRentVillaType] = useState<string | null>(
    null,
  );
  const [villaRentAirConditioned, setVillaRentAirConditioned] = useState(true);

  // Big flat for rent
  const [bigFlatRentPeriod, setBigFlatRentPeriod] =
    useState<RentPaymentFrequency>(null);
  const [bigFlatPriceFrom, setBigFlatPriceFrom] = useState("");
  const [bigFlatPriceTo, setBigFlatPriceTo] = useState("");
  const [bigFlatAreaFrom, setBigFlatAreaFrom] = useState("");
  const [bigFlatAreaTo, setBigFlatAreaTo] = useState("");
  const [bigFlatCarEntrance, setBigFlatCarEntrance] = useState(true);
  const [bigFlatAirConditioned, setBigFlatAirConditioned] = useState(true);
  const [bigFlatInVilla, setBigFlatInVilla] = useState(true);
  const [bigFlatTwoEntrances, setBigFlatTwoEntrances] = useState(true);
  const [bigFlatSpecialEntrances, setBigFlatSpecialEntrances] = useState(true);

  // Lounge for rent
  const [loungeRentRentPeriod, setLoungeRentRentPeriod] =
    useState<RentPaymentFrequency>(null);
  const [loungeRentPriceFrom, setLoungeRentPriceFrom] = useState("");
  const [loungeRentPriceTo, setLoungeRentPriceTo] = useState("");
  const [loungeRentAreaFrom, setLoungeRentAreaFrom] = useState("");
  const [loungeRentAreaTo, setLoungeRentAreaTo] = useState("");
  const [loungeRentPool, setLoungeRentPool] = useState(true);
  const [loungeRentFootballPitch, setLoungeRentFootballPitch] = useState(true);
  const [loungeRentVolleyballCourt, setLoungeRentVolleyballCourt] =
    useState(true);
  const [loungeRentTent, setLoungeRentTent] = useState(true);
  const [loungeRentKitchen, setLoungeRentKitchen] = useState(true);
  const [loungeRentPlayground, setLoungeRentPlayground] = useState(true);
  const [loungeRentFamilySection, setLoungeRentFamilySection] = useState(true);

  // Small house for rent
  const [smallHouseRentPriceFrom, setSmallHouseRentPriceFrom] = useState("");
  const [smallHouseRentPriceTo, setSmallHouseRentPriceTo] = useState("");
  const [smallHouseRentStreetDirection, setSmallHouseRentStreetDirection] =
    useState<string>("");
  const [smallHouseRentAreaFrom, setSmallHouseRentAreaFrom] = useState("");
  const [smallHouseRentAreaTo, setSmallHouseRentAreaTo] = useState("");
  const [smallHouseRentStreetWidth, setSmallHouseRentStreetWidth] =
    useState<string>("");
  const [smallHouseRentFurnished, setSmallHouseRentFurnished] = useState(true);
  const [smallHouseRentTent, setSmallHouseRentTent] = useState(true);
  const [smallHouseRentKitchen, setSmallHouseRentKitchen] = useState(true);

  // Store for rent
  const [storeRentPriceFrom, setStoreRentPriceFrom] = useState("");
  const [storeRentPriceTo, setStoreRentPriceTo] = useState("");
  const [storeRentAreaFrom, setStoreRentAreaFrom] = useState("");
  const [storeRentAreaTo, setStoreRentAreaTo] = useState("");
  const [storeRentStreetWidth, setStoreRentStreetWidth] = useState<string>("");

  // Building for rent
  const [buildingRentPriceFrom, setBuildingRentPriceFrom] = useState("");
  const [buildingRentPriceTo, setBuildingRentPriceTo] = useState("");
  const [buildingRentApartments, setBuildingRentApartments] = useState<
    string | null
  >(null);
  const [selectedBuildingRentType, setSelectedBuildingRentType] = useState<
    string | null
  >(null);
  const [buildingRentStreetDirection, setBuildingRentStreetDirection] =
    useState<string>("");
  const [buildingRentStores, setBuildingRentStores] = useState<string>("");
  const [buildingRentAreaFrom, setBuildingRentAreaFrom] = useState("");
  const [buildingRentAreaTo, setBuildingRentAreaTo] = useState("");
  const [buildingRentStreetWidth, setBuildingRentStreetWidth] =
    useState<string>("");

  // Land for rent
  const [selectedLandRentType, setSelectedLandRentType] = useState<
    string | null
  >(null);
  const [landRentStreetDirection, setLandRentStreetDirection] =
    useState<string>("");
  const [landRentAreaFrom, setLandRentAreaFrom] = useState("");
  const [landRentAreaTo, setLandRentAreaTo] = useState("");
  const [landRentStreetWidth, setLandRentStreetWidth] = useState<string>("");

  // Room for rent
  const [roomRentRentPeriod, setRoomRentRentPeriod] =
    useState<RentPaymentFrequency>(null);
  const [roomRentPriceFrom, setRoomRentPriceFrom] = useState("");
  const [roomRentPriceTo, setRoomRentPriceTo] = useState("");
  const [roomRentKitchen, setRoomRentKitchen] = useState(true);

  // Office for rent
  const [officeRentPriceFrom, setOfficeRentPriceFrom] = useState("");
  const [officeRentPriceTo, setOfficeRentPriceTo] = useState("");
  const [officeRentAreaFrom, setOfficeRentAreaFrom] = useState("");
  const [officeRentAreaTo, setOfficeRentAreaTo] = useState("");
  const [officeRentStreetWidth, setOfficeRentStreetWidth] =
    useState<string>("");
  const [officeRentFurnished, setOfficeRentFurnished] = useState(true);

  // Tent for rent
  const [tentRentRentPeriod, setTentRentRentPeriod] =
    useState<RentPaymentFrequency>(null);
  const [tentRentFamilySection, setTentRentFamilySection] = useState(true);

  // Warehouse for rent
  const [warehouseRentPriceFrom, setWarehouseRentPriceFrom] = useState("");
  const [warehouseRentPriceTo, setWarehouseRentPriceTo] = useState("");
  const [warehouseRentAreaFrom, setWarehouseRentAreaFrom] = useState("");
  const [warehouseRentAreaTo, setWarehouseRentAreaTo] = useState("");
  const [warehouseRentStreetWidth, setWarehouseRentStreetWidth] =
    useState<string>("");

  // Chalet for rent
  const [chaletRentRentPeriod, setChaletRentRentPeriod] =
    useState<RentPaymentFrequency>(null);
  const [chaletRentPriceFrom, setChaletRentPriceFrom] = useState("");
  const [chaletRentPriceTo, setChaletRentPriceTo] = useState("");
  const [chaletRentAreaFrom, setChaletRentAreaFrom] = useState("");
  const [chaletRentAreaTo, setChaletRentAreaTo] = useState("");
  const [chaletRentPool, setChaletRentPool] = useState(true);
  const [chaletRentFootballPitch, setChaletRentFootballPitch] = useState(true);
  const [chaletRentVolleyballCourt, setChaletRentVolleyballCourt] =
    useState(true);
  const [chaletRentTent, setChaletRentTent] = useState(true);
  const [chaletRentKitchen, setChaletRentKitchen] = useState(true);
  const [chaletRentPlayground, setChaletRentPlayground] = useState(true);
  const [chaletRentFamilySection, setChaletRentFamilySection] = useState(true);

  // Other
  const [otherPriceFrom, setOtherPriceFrom] = useState("");
  const [otherPriceTo, setOtherPriceTo] = useState("");
  const [otherAreaFrom, setOtherAreaFrom] = useState("");
  const [otherAreaTo, setOtherAreaTo] = useState("");

  return {
    // Category
    category,
    setCategory,
    showCategoryModal,
    setShowCategoryModal,
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
    apartmentRentTenant,
    setApartmentRentTenant,
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
    // Land for sale
    landPriceFrom,
    setLandPriceFrom,
    landPriceTo,
    setLandPriceTo,
    selectedLandType,
    setSelectedLandType,
    landStreetDirection,
    setLandStreetDirection,
    landAreaFrom,
    setLandAreaFrom,
    landAreaTo,
    setLandAreaTo,
    landStreetWidth,
    setLandStreetWidth,
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
    apartmentSaleAirConditioned,
    setApartmentSaleAirConditioned,
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
    smallHouseTent,
    setSmallHouseTent,
    // Lounge for sale
    loungeSalePriceFrom,
    setLoungeSalePriceFrom,
    loungeSalePriceTo,
    setLoungeSalePriceTo,
    loungeSaleAreaFrom,
    setLoungeSaleAreaFrom,
    loungeSaleAreaTo,
    setLoungeSaleAreaTo,
    loungeSaleStreetWidth,
    setLoungeSaleStreetWidth,
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
    storeSalePriceFrom,
    setStoreSalePriceFrom,
    storeSalePriceTo,
    setStoreSalePriceTo,
    storeSaleAreaFrom,
    setStoreSaleAreaFrom,
    storeSaleAreaTo,
    setStoreSaleAreaTo,
    storeSaleStreetWidth,
    setStoreSaleStreetWidth,
    // Floor for sale
    floorSalePriceFrom,
    setFloorSalePriceFrom,
    floorSalePriceTo,
    setFloorSalePriceTo,
    floorSaleAreaFrom,
    setFloorSaleAreaFrom,
    floorSaleAreaTo,
    setFloorSaleAreaTo,
    // Villa for rent
    villaRentRentPeriod,
    setVillaRentRentPeriod,
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
    villaRentDriverRoom,
    setVillaRentDriverRoom,
    villaRentMaidRoom,
    setVillaRentMaidRoom,
    villaRentPool,
    setVillaRentPool,
    villaRentFurnished,
    setVillaRentFurnished,
    villaRentKitchen,
    setVillaRentKitchen,
    villaRentCarEntrance,
    setVillaRentCarEntrance,
    villaRentBasement,
    setVillaRentBasement,
    villaRentVillaType,
    setVillaRentVillaType,
    villaRentAirConditioned,
    setVillaRentAirConditioned,
    // Big flat for rent
    bigFlatRentPeriod,
    setBigFlatRentPeriod,
    bigFlatPriceFrom,
    setBigFlatPriceFrom,
    bigFlatPriceTo,
    setBigFlatPriceTo,
    bigFlatAreaFrom,
    setBigFlatAreaFrom,
    bigFlatAreaTo,
    setBigFlatAreaTo,
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
    // Lounge for rent
    loungeRentRentPeriod,
    setLoungeRentRentPeriod,
    loungeRentPriceFrom,
    setLoungeRentPriceFrom,
    loungeRentPriceTo,
    setLoungeRentPriceTo,
    loungeRentAreaFrom,
    setLoungeRentAreaFrom,
    loungeRentAreaTo,
    setLoungeRentAreaTo,
    loungeRentPool,
    setLoungeRentPool,
    loungeRentFootballPitch,
    setLoungeRentFootballPitch,
    loungeRentVolleyballCourt,
    setLoungeRentVolleyballCourt,
    loungeRentTent,
    setLoungeRentTent,
    loungeRentKitchen,
    setLoungeRentKitchen,
    loungeRentPlayground,
    setLoungeRentPlayground,
    loungeRentFamilySection,
    setLoungeRentFamilySection,
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
    // Land for rent
    selectedLandRentType,
    setSelectedLandRentType,
    landRentStreetDirection,
    setLandRentStreetDirection,
    landRentAreaFrom,
    setLandRentAreaFrom,
    landRentAreaTo,
    setLandRentAreaTo,
    landRentStreetWidth,
    setLandRentStreetWidth,
    // Room for rent
    roomRentRentPeriod,
    setRoomRentRentPeriod,
    roomRentPriceFrom,
    setRoomRentPriceFrom,
    roomRentPriceTo,
    setRoomRentPriceTo,
    roomRentKitchen,
    setRoomRentKitchen,
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
    tentRentFamilySection,
    setTentRentFamilySection,
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
    chaletRentRentPeriod,
    setChaletRentRentPeriod,
    chaletRentPriceFrom,
    setChaletRentPriceFrom,
    chaletRentPriceTo,
    setChaletRentPriceTo,
    chaletRentAreaFrom,
    setChaletRentAreaFrom,
    chaletRentAreaTo,
    setChaletRentAreaTo,
    chaletRentPool,
    setChaletRentPool,
    chaletRentFootballPitch,
    setChaletRentFootballPitch,
    chaletRentVolleyballCourt,
    setChaletRentVolleyballCourt,
    chaletRentTent,
    setChaletRentTent,
    chaletRentKitchen,
    setChaletRentKitchen,
    chaletRentPlayground,
    setChaletRentPlayground,
    chaletRentFamilySection,
    setChaletRentFamilySection,
    // Other
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
