import React, { useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Keyboard,
  Platform,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useOrderForm } from "@/hooks/useOrderForm";
import { useLocalization } from "../../../../hooks/useLocalization";

import {
  ScreenHeader,
  ListingFooter,
  WheelPickerModal,
  PriceInputSection,
  TabBarSection,
  ToggleRow,
  FieldWithModal,
  RentPeriodTabBar,
  PaymentChips,
  ToggleGroup,
} from "../../../../components";
import { VillaForRentSection } from "../../../../components/orderForm/sections";
import { COLORS } from "@/constants";
import { ALL_CATEGORIES } from "@/constants/categories";
import {
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
  WC_OPTIONS,
  APARTMENT_OPTIONS,
  VILLA_TYPE_OPTIONS,
  RESIDENTIAL_COMMERCIAL_OPTIONS,
  FLOOR_OPTIONS,
  AGE_OPTIONS,
  STREET_DIRECTION_OPTIONS,
  STREET_WIDTH_OPTIONS,
  STORES_OPTIONS,
} from "@/constants/orderFormOptions";

type NavigationProp = NativeStackNavigationProp<any>;

// Category ID → translation key (outside component to avoid recreating every render)
const CATEGORY_TRANSLATION_KEYS: Record<string, string> = {
  "sale-1": "listings.propertyTypes.villaForSale",
  "sale-2": "listings.propertyTypes.landForSale",
  "sale-3": "listings.propertyTypes.apartmentForSale",
  "sale-4": "listings.propertyTypes.buildingForSale",
  "sale-5": "listings.propertyTypes.smallHouseForSale",
  "sale-6": "listings.propertyTypes.loungeForSale",
  "sale-7": "listings.propertyTypes.farmForSale",
  "sale-8": "listings.propertyTypes.storeForSale",
  "sale-9": "listings.propertyTypes.floorForSale",
  "rent-1": "listings.propertyTypes.apartmentForRent",
  "rent-2": "listings.propertyTypes.villaForRent",
  "rent-3": "listings.propertyTypes.bigFlatForRent",
  "rent-4": "listings.propertyTypes.loungeForRent",
  "rent-5": "listings.propertyTypes.smallHouseForRent",
  "rent-6": "listings.propertyTypes.storeForRent",
  "rent-7": "listings.propertyTypes.buildingForRent",
  "rent-8": "listings.propertyTypes.landForRent",
  "rent-9": "listings.propertyTypes.roomForRent",
  "rent-10": "listings.propertyTypes.officeForRent",
  "rent-11": "listings.propertyTypes.tentForRent",
  "rent-12": "listings.propertyTypes.warehouseForRent",
  "rent-13": "listings.propertyTypes.chaletForRent",
};

function getCategoryTranslationKey(categoryId: string): string {
  return CATEGORY_TRANSLATION_KEYS[categoryId] || "";
}

export default function NewOrderScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const { t } = useLocalization();
  
  const form = useOrderForm();

  // Category options with translation and mapping
  const categoryOptions = useMemo(() => {
    const translatedCategories = ALL_CATEGORIES.map((cat) => {
      const translationKey = getCategoryTranslationKey(cat.id);
      return translationKey ? t(translationKey) : cat.text;
    });
    return [...translatedCategories, t("listings.other")];
  }, [t]);

  // Create mapping from original to translated category names
  const categoryTranslationMap = useMemo(() => {
    const map: Record<string, string> = {};
    ALL_CATEGORIES.forEach((cat) => {
      const translationKey = getCategoryTranslationKey(cat.id);
      if (translationKey) {
        map[cat.text] = t(translationKey);
      } else {
        map[cat.text] = cat.text;
      }
    });
    map["Other"] = t("listings.other");
    return map;
  }, [t]);

  // Get translated category value for display
  const getTranslatedCategoryValue = useCallback((originalValue: string | null): string => {
    if (!originalValue) return "";
    return categoryTranslationMap[originalValue] || originalValue;
  }, [categoryTranslationMap]);

  // Helper function to translate option
  const translateOption = useCallback((opt: string, type: "streetDirection" | "floor" | "age" | "streetWidth"): string => {
    if (opt === "All") return t("listings.all");
    
    if (type === "streetDirection") {
      if (opt === "North") return t("listings.address.north");
      if (opt === "East") return t("listings.address.east");
      if (opt === "West") return t("listings.address.west");
      if (opt === "South") return t("listings.address.south");
      if (opt === "Northeast") return t("listings.address.northeast");
      if (opt === "Southeast") return t("listings.address.southeast");
      if (opt === "Southwest") return t("listings.address.southwest");
      if (opt === "Northwest") return t("listings.address.northwest");
      if (opt === "3 Streets") return t("listings.threeStreets");
      if (opt === "4 Streets") return t("listings.fourStreets");
    } else if (type === "floor") {
      if (opt === "First floor") return t("listings.firstFloor");
      if (opt === "Second floor") return t("listings.secondFloor");
    } else if (type === "age") {
      if (opt.startsWith("Less than")) {
        const years = opt.match(/\d+/)?.[0] || "";
        return t("listings.lessThanYears", { years });
      }
    } else if (type === "streetWidth") {
      if (opt.startsWith("More than")) {
        const width = opt.match(/\d+/)?.[0] || "";
        return t("listings.moreThan", { width });
      }
    }
    return opt;
  }, [t]);

  // Translated picker options
  const translatedStreetDirectionOptions = useMemo(
    () => STREET_DIRECTION_OPTIONS.map((opt) => translateOption(opt, "streetDirection")),
    [translateOption]
  );

  const translatedFloorOptions = useMemo(
    () => FLOOR_OPTIONS.map((opt) => translateOption(opt, "floor")),
    [translateOption]
  );

  const translatedAgeOptions = useMemo(
    () => AGE_OPTIONS.map((opt) => translateOption(opt, "age")),
    [translateOption]
  );

  const translatedStreetWidthOptions = useMemo(
    () => STREET_WIDTH_OPTIONS.map((opt) => translateOption(opt, "streetWidth")),
    [translateOption]
  );

  // Create reverse mapping for picker options (translated -> original)
  const createReverseMap = useCallback((originalOptions: string[], translatedOptions: string[]): Record<string, string> => {
    const map: Record<string, string> = {};
    originalOptions.forEach((original, index) => {
      map[translatedOptions[index]] = original;
    });
    return map;
  }, []);

  const streetDirectionReverseMap = useMemo(
    () => createReverseMap(STREET_DIRECTION_OPTIONS, translatedStreetDirectionOptions),
    [createReverseMap, translatedStreetDirectionOptions]
  );

  const floorReverseMap = useMemo(
    () => createReverseMap(FLOOR_OPTIONS, translatedFloorOptions),
    [createReverseMap, translatedFloorOptions]
  );

  const ageReverseMap = useMemo(
    () => createReverseMap(AGE_OPTIONS, translatedAgeOptions),
    [createReverseMap, translatedAgeOptions]
  );

  const streetWidthReverseMap = useMemo(
    () => createReverseMap(STREET_WIDTH_OPTIONS, translatedStreetWidthOptions),
    [createReverseMap, translatedStreetWidthOptions]
  );

  // Helper: get translated value for picker initialValue/display. Use originalOptions when provided so index is correct (Object.values order can be unreliable).
  const getTranslatedInitialValue = useCallback(
    (
      originalValue: string | null,
      reverseMap: Record<string, string>,
      translatedOptions: string[],
      originalOptions?: string[]
    ): string => {
      if (!originalValue) return "";
      const originalIndex =
        originalOptions && originalOptions.length === translatedOptions.length
          ? originalOptions.indexOf(originalValue)
          : Object.values(reverseMap).indexOf(originalValue);
      return originalIndex >= 0 ? translatedOptions[originalIndex] : originalValue;
    },
    []
  );

  // Helper function to translate picker values for display in FieldWithModal
  const getTranslatedPickerValue = useCallback((originalValue: string | null, type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores"): string => {
    if (!originalValue) return "";
    
    if (type === "floor") {
      return getTranslatedInitialValue(originalValue, floorReverseMap, translatedFloorOptions, FLOOR_OPTIONS);
    } else if (type === "age") {
      return getTranslatedInitialValue(originalValue, ageReverseMap, translatedAgeOptions, AGE_OPTIONS);
    } else if (type === "streetDirection") {
      return getTranslatedInitialValue(originalValue, streetDirectionReverseMap, translatedStreetDirectionOptions, STREET_DIRECTION_OPTIONS);
    } else if (type === "streetWidth") {
      return getTranslatedInitialValue(originalValue, streetWidthReverseMap, translatedStreetWidthOptions, STREET_WIDTH_OPTIONS);
    } else if (type === "stores") {
      // Stores options: ["All", "1", "2", "3", "4"]
      if (originalValue === "All") return t("listings.all");
      return originalValue; // Numbers don't need translation
    }
    
    return originalValue;
  }, [getTranslatedInitialValue, floorReverseMap, translatedFloorOptions, ageReverseMap, translatedAgeOptions, streetDirectionReverseMap, translatedStreetDirectionOptions, streetWidthReverseMap, translatedStreetWidthOptions, t]);

  // Translated tab bar options
  const translatedVillaTypeOptions = useMemo(
    () =>
      VILLA_TYPE_OPTIONS.map((opt) => {
        if (opt === "Standalone") return t("listings.standalone");
        if (opt === "Duplex") return t("listings.duplex");
        if (opt === "Townhouse") return t("listings.townhouse");
        return opt;
      }),
    [t]
  );

  const translatedResidentialCommercialOptions = useMemo(
    () =>
      RESIDENTIAL_COMMERCIAL_OPTIONS.map((opt) => {
        if (opt === "Residential") return t("listings.residential");
        if (opt === "Commercial") return t("listings.commercial");
        return opt;
      }),
    [t]
  );

  // Create reverse maps for tab bar options
  const villaTypeReverseMap = useMemo(
    () => createReverseMap(VILLA_TYPE_OPTIONS, translatedVillaTypeOptions),
    [createReverseMap, translatedVillaTypeOptions]
  );

  const residentialCommercialReverseMap = useMemo(
    () => createReverseMap(RESIDENTIAL_COMMERCIAL_OPTIONS, translatedResidentialCommercialOptions),
    [createReverseMap, translatedResidentialCommercialOptions]
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Stable modal openers so children don't re-render unnecessarily
  const openCategoryModal = useCallback(() => form.setShowCategoryModal(true), []);
  const openFloorModal = useCallback(() => form.setShowFloorModal(true), []);
  const openAgeModal = useCallback(() => form.setShowAgeModal(true), []);

  // When category is set, pre-select first option for all FieldWithModal pickers (no placeholders)
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

  // Listen to keyboard show/hide events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        // Set keyboard height to position footer just above keyboard
        Animated.timing(keyboardHeight, {
          toValue: event.endCoordinates.height,
          duration: event.duration || 250,
          useNativeDriver: false, // Can't use native driver for bottom positioning
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (event) => {
        // Reset keyboard height to 0 to bring footer back to original position
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: event.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardHeight]);

  const handleNextPress = () => {
    // Collect all form data - get all properties from form object
    const orderFormData: any = {
      category: form.category,
      // Common fields
      selectedBedroom: form.selectedBedroom,
      selectedLivingRoom: form.selectedLivingRoom,
      selectedWc: form.selectedWc,
      floor: form.floor,
      age: form.age,
      nearBus: form.nearBus,
      nearMetro: form.nearMetro,
    };

    // Category-specific fields
    if (form.isApartmentForRent) {
      Object.assign(orderFormData, {
        rentPeriod: form.rentPeriod,
        selectedPayment: form.selectedPayment,
        fromPrice: form.fromPrice,
        toPrice: form.toPrice,
        priceFrom: form.priceFrom,
        priceTo: form.priceTo,
        selectedPaymentType: form.selectedPaymentType,
        furnished: form.furnished,
        carEntrance: form.carEntrance,
        airConditioned: form.airConditioned,
        privateRoof: form.privateRoof,
        apartmentInVilla: form.apartmentInVilla,
        twoEntrances: form.twoEntrances,
        specialEntrances: form.specialEntrances,
      });
    } else if (form.isVillaForSale) {
      Object.assign(orderFormData, {
        villaPriceFrom: form.villaPriceFrom,
        villaPriceTo: form.villaPriceTo,
        selectedApartment: form.selectedApartment,
        streetDirection: form.streetDirection,
        areaFrom: form.areaFrom,
        areaTo: form.areaTo,
        streetWidth: form.streetWidth,
        stairs: form.stairs,
        selectedVillaType: form.selectedVillaType,
        driverRoom: form.driverRoom,
        maidRoom: form.maidRoom,
        pool: form.pool,
        villaFurnished: form.villaFurnished,
        kitchen: form.kitchen,
        villaCarEntrance: form.villaCarEntrance,
        basement: form.basement,
      });
    } else if (form.isLandForSale) {
      Object.assign(orderFormData, {
        landPriceFrom: form.landPriceFrom,
        landPriceTo: form.landPriceTo,
        selectedLandType: form.selectedLandType,
        landAreaFrom: form.landAreaFrom,
        landAreaTo: form.landAreaTo,
        landStreetDirection: form.landStreetDirection,
        landStreetWidth: form.landStreetWidth,
      });
    } else if (form.isApartmentForSale) {
      Object.assign(orderFormData, {
        apartmentSalePriceFrom: form.apartmentSalePriceFrom,
        apartmentSalePriceTo: form.apartmentSalePriceTo,
        apartmentSaleAreaFrom: form.apartmentSaleAreaFrom,
        apartmentSaleAreaTo: form.apartmentSaleAreaTo,
        apartmentSaleCarEntrance: form.apartmentSaleCarEntrance,
        apartmentSalePrivateRoof: form.apartmentSalePrivateRoof,
        apartmentSaleInVilla: form.apartmentSaleInVilla,
        apartmentSaleTwoEntrances: form.apartmentSaleTwoEntrances,
        apartmentSaleSpecialEntrances: form.apartmentSaleSpecialEntrances,
      });
    } else if (form.isBuildingForSale) {
      Object.assign(orderFormData, {
        buildingPriceFrom: form.buildingPriceFrom,
        buildingPriceTo: form.buildingPriceTo,
        buildingApartments: form.buildingApartments,
        selectedBuildingType: form.selectedBuildingType,
        buildingStreetDirection: form.buildingStreetDirection,
        stores: form.stores,
        buildingAreaFrom: form.buildingAreaFrom,
        buildingAreaTo: form.buildingAreaTo,
        streetWidth: form.streetWidth,
      });
    } else if (form.isSmallHouseForSale) {
      Object.assign(orderFormData, {
        smallHousePriceFrom: form.smallHousePriceFrom,
        smallHousePriceTo: form.smallHousePriceTo,
        smallHouseStreetDirection: form.smallHouseStreetDirection,
        smallHouseAreaFrom: form.smallHouseAreaFrom,
        smallHouseAreaTo: form.smallHouseAreaTo,
        smallHouseStreetWidth: form.smallHouseStreetWidth,
        smallHouseFurnished: form.smallHouseFurnished,
        tent: form.tent,
      });
    } else if (form.isLoungeForSale) {
      Object.assign(orderFormData, {
        loungePriceFrom: form.loungePriceFrom,
        loungePriceTo: form.loungePriceTo,
        loungeAreaFrom: form.loungeAreaFrom,
        loungeAreaTo: form.loungeAreaTo,
        loungeStreetWidth: form.loungeStreetWidth,
      });
    } else if (form.isFarmForSale) {
      Object.assign(orderFormData, {
        farmPriceFrom: form.farmPriceFrom,
        farmPriceTo: form.farmPriceTo,
        farmAreaFrom: form.farmAreaFrom,
        farmAreaTo: form.farmAreaTo,
      });
    } else if (form.isStoreForSale) {
      Object.assign(orderFormData, {
        storePriceFrom: form.storePriceFrom,
        storePriceTo: form.storePriceTo,
        storeAreaFrom: form.storeAreaFrom,
        storeAreaTo: form.storeAreaTo,
        storeStreetWidth: form.storeStreetWidth,
      });
    } else if (form.isFloorForSale) {
      Object.assign(orderFormData, {
        floorSalePriceFrom: form.floorSalePriceFrom,
        floorSalePriceTo: form.floorSalePriceTo,
        floorSaleAreaFrom: form.floorSaleAreaFrom,
        floorSaleAreaTo: form.floorSaleAreaTo,
        floorSaleCarEntrance: form.floorSaleCarEntrance,
      });
    } else if (form.isVillaForRent) {
      Object.assign(orderFormData, {
        villaRentRentPeriod: form.villaRentRentPeriod,
        villaRentPriceFrom: form.villaRentPriceFrom,
        villaRentPriceTo: form.villaRentPriceTo,
        villaRentStreetDirection: form.villaRentStreetDirection,
        villaRentAreaFrom: form.villaRentAreaFrom,
        villaRentAreaTo: form.villaRentAreaTo,
        villaRentStreetWidth: form.villaRentStreetWidth,
        villaRentStairs: form.villaRentStairs,
        villaRentAirConditioned: form.villaRentAirConditioned,
        selectedVillaType: form.selectedVillaType,
        driverRoom: form.driverRoom,
        maidRoom: form.maidRoom,
        pool: form.pool,
        villaFurnished: form.villaFurnished,
        kitchen: form.kitchen,
        villaCarEntrance: form.villaCarEntrance,
        basement: form.basement,
      });
    } else if (form.isBigFlatForRent) {
      Object.assign(orderFormData, {
        bigFlatRentPeriod: form.bigFlatRentPeriod,
        bigFlatPriceFrom: form.bigFlatPriceFrom,
        bigFlatPriceTo: form.bigFlatPriceTo,
        bigFlatAreaFrom: form.bigFlatAreaFrom,
        bigFlatAreaTo: form.bigFlatAreaTo,
        bigFlatCarEntrance: form.bigFlatCarEntrance,
        bigFlatAirConditioned: form.bigFlatAirConditioned,
        bigFlatInVilla: form.bigFlatInVilla,
        bigFlatTwoEntrances: form.bigFlatTwoEntrances,
        bigFlatSpecialEntrances: form.bigFlatSpecialEntrances,
      });
    } else if (form.isLoungeForRent) {
      Object.assign(orderFormData, {
        loungeRentRentPeriod: form.loungeRentRentPeriod,
        loungeRentPriceFrom: form.loungeRentPriceFrom,
        loungeRentPriceTo: form.loungeRentPriceTo,
        loungeRentAreaFrom: form.loungeRentAreaFrom,
        loungeRentAreaTo: form.loungeRentAreaTo,
        loungeRentPool: form.loungeRentPool,
        footballPitch: form.footballPitch,
        volleyballCourt: form.volleyballCourt,
        loungeRentTent: form.loungeRentTent,
        loungeRentKitchen: form.loungeRentKitchen,
        playground: form.playground,
        familySection: form.familySection,
      });
    } else if (form.isSmallHouseForRent) {
      Object.assign(orderFormData, {
        smallHouseRentPriceFrom: form.smallHouseRentPriceFrom,
        smallHouseRentPriceTo: form.smallHouseRentPriceTo,
        smallHouseRentStreetDirection: form.smallHouseRentStreetDirection,
        smallHouseRentAreaFrom: form.smallHouseRentAreaFrom,
        smallHouseRentAreaTo: form.smallHouseRentAreaTo,
        smallHouseRentStreetWidth: form.smallHouseRentStreetWidth,
        smallHouseRentFurnished: form.smallHouseRentFurnished,
        smallHouseRentTent: form.smallHouseRentTent,
        smallHouseRentKitchen: form.smallHouseRentKitchen,
      });
    } else if (form.isStoreForRent) {
      Object.assign(orderFormData, {
        storeRentPriceFrom: form.storeRentPriceFrom,
        storeRentPriceTo: form.storeRentPriceTo,
        storeRentAreaFrom: form.storeRentAreaFrom,
        storeRentAreaTo: form.storeRentAreaTo,
        storeRentStreetWidth: form.storeRentStreetWidth,
      });
    } else if (form.isBuildingForRent) {
      Object.assign(orderFormData, {
        buildingRentPriceFrom: form.buildingRentPriceFrom,
        buildingRentPriceTo: form.buildingRentPriceTo,
        buildingRentApartments: form.buildingRentApartments,
        selectedBuildingRentType: form.selectedBuildingRentType,
        buildingRentStreetDirection: form.buildingRentStreetDirection,
        buildingRentStores: form.buildingRentStores,
        buildingRentAreaFrom: form.buildingRentAreaFrom,
        buildingRentAreaTo: form.buildingRentAreaTo,
        buildingRentStreetWidth: form.buildingRentStreetWidth,
      });
    } else if (form.isLandForRent) {
      Object.assign(orderFormData, {
        selectedLandRentType: form.selectedLandRentType,
        landRentStreetDirection: form.landRentStreetDirection,
        landRentAreaFrom: form.landRentAreaFrom,
        landRentAreaTo: form.landRentAreaTo,
        landRentStreetWidth: form.landRentStreetWidth,
      });
    } else if (form.isRoomForRent) {
      Object.assign(orderFormData, {
        roomRentRentPeriod: form.roomRentRentPeriod,
        roomRentPriceFrom: form.roomRentPriceFrom,
        roomRentPriceTo: form.roomRentPriceTo,
        roomRentKitchen: form.roomRentKitchen,
      });
    } else if (form.isOfficeForRent) {
      Object.assign(orderFormData, {
        officeRentPriceFrom: form.officeRentPriceFrom,
        officeRentPriceTo: form.officeRentPriceTo,
        officeRentAreaFrom: form.officeRentAreaFrom,
        officeRentAreaTo: form.officeRentAreaTo,
        officeRentStreetWidth: form.officeRentStreetWidth,
        officeRentFurnished: form.officeRentFurnished,
      });
    } else if (form.isTentForRent) {
      Object.assign(orderFormData, {
        tentRentRentPeriod: form.tentRentRentPeriod,
        tentRentPriceFrom: form.tentRentPriceFrom,
        tentRentPriceTo: form.tentRentPriceTo,
        selectedPayment: form.selectedPayment,
        familySection: form.familySection,
      });
    } else if (form.isWarehouseForRent) {
      Object.assign(orderFormData, {
        warehouseRentPriceFrom: form.warehouseRentPriceFrom,
        warehouseRentPriceTo: form.warehouseRentPriceTo,
        warehouseRentAreaFrom: form.warehouseRentAreaFrom,
        warehouseRentAreaTo: form.warehouseRentAreaTo,
        warehouseRentStreetWidth: form.warehouseRentStreetWidth,
      });
    } else if (form.isChaletForRent) {
      Object.assign(orderFormData, {
        chaletRentRentPeriod: form.chaletRentRentPeriod,
        chaletRentPriceFrom: form.chaletRentPriceFrom,
        chaletRentPriceTo: form.chaletRentPriceTo,
        chaletRentAreaFrom: form.chaletRentAreaFrom,
        chaletRentAreaTo: form.chaletRentAreaTo,
        chaletRentPool: form.chaletRentPool,
        chaletFootballPitch: form.chaletFootballPitch,
        chaletVolleyballCourt: form.chaletVolleyballCourt,
        chaletRentTent: form.chaletRentTent,
        chaletRentKitchen: form.chaletRentKitchen,
        chaletPlayground: form.chaletPlayground,
        familySection: form.familySection,
      });
    } else if (form.isOther) {
      Object.assign(orderFormData, {
        otherPriceFrom: form.otherPriceFrom,
        otherPriceTo: form.otherPriceTo,
        otherAreaFrom: form.otherAreaFrom,
        otherAreaTo: form.otherAreaTo,
      });
    }

    navigation.navigate("ChooseLocation", { orderFormData });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <ScreenHeader
        title={t("listings.newOrder")}
        onBackPress={handleBackPress}
        fontWeightBold
        fontSize={wp(4.5)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category Field */}
        <FieldWithModal
          label={t("listings.category")}
          value={getTranslatedCategoryValue(form.category)}
          placeholder={t("listings.selectCategory")}
          onPress={openCategoryModal}
        />

        {/* Apartment for rent content */}
        {form.isApartmentForRent && (
          <>
            <RentPeriodTabBar
              selectedPeriod={form.rentPeriod}
              onSelect={form.handleRentPeriodPress}
            />

            {form.showYearlyContent && (
              <>
                <PaymentChips
                  label={t("listings.paymentOptions")}
                  selectedPayment={form.selectedPayment}
                  onSelect={form.handlePaymentChipPress}
                />

                <PriceInputSection
                  label={form.priceLabel}
                  fromValue={form.fromPrice}
                  toValue={form.toPrice}
                  onFromChange={form.setFromPrice}
                  onToChange={form.setToPrice}
                />
              </>
            )}

            {form.showPriceSection && (
              <PriceInputSection
                label={t("listings.price")}
                fromValue={form.priceFrom}
                toValue={form.priceTo}
                onFromChange={form.setPriceFrom}
                onToChange={form.setPriceTo}
              />
            )}

            {form.showPaymentTypeTabBar && (
              <TabBarSection
                options={["ALL", "+1"]}
                selectedValue={form.selectedPaymentType}
                onSelect={form.handlePaymentTypePress}
              />
            )}

            <TabBarSection
              label={t("listings.bedrooms")}
              options={BEDROOM_OPTIONS}
              selectedValue={form.selectedBedroom}
              onSelect={form.handleBedroomPress}
            />

            <TabBarSection
              label={t("listings.livingRooms")}
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <TabBarSection
              label={t("listings.wc")}
              options={WC_OPTIONS}
              selectedValue={form.selectedWc}
              onSelect={form.handleWcPress}
            />

            <FieldWithModal
              label={t("listings.floor")}
              value={getTranslatedPickerValue(form.floor, "floor")}
              placeholder={t("listings.selectFloor")}
              onPress={openFloorModal}
              backgroundColor="background"
            />

            <FieldWithModal
              label={t("listings.age")}
              value={getTranslatedPickerValue(form.age, "age")}
              placeholder={t("listings.selectAge")}
              onPress={openAgeModal}
              backgroundColor="background"
            />

            <View style={styles.section}>
              <ToggleRow
                label={t("listings.furnished")}
                value={form.furnished}
                onValueChange={form.setFurnished}
              />
              <ToggleRow
                label={t("listings.carEntrance")}
                value={form.carEntrance}
                onValueChange={form.setCarEntrance}
              />
              <ToggleRow
                label={t("listings.airConditioned")}
                value={form.airConditioned}
                onValueChange={form.setAirConditioned}
              />
              <ToggleRow
                label={t("listings.privateRoof")}
                value={form.privateRoof}
                onValueChange={form.setPrivateRoof}
              />
              <ToggleRow
                label={t("listings.apartmentInVilla")}
                value={form.apartmentInVilla}
                onValueChange={form.setApartmentInVilla}
              />
              <ToggleRow
                label={t("listings.twoEntrances")}
                value={form.twoEntrances}
                onValueChange={form.setTwoEntrances}
              />
              <ToggleRow
                label={t("listings.specialEntrances")}
                value={form.specialEntrances}
                onValueChange={form.setSpecialEntrances}
              />
            </View>
          </>
        )}

        {/* Villa for sale content */}
        {form.isVillaForSale && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.villaPriceFrom}
              toValue={form.villaPriceTo}
              onFromChange={form.setVillaPriceFrom}
              onToChange={form.setVillaPriceTo}
            />

            <TabBarSection
              label={t("listings.apartments")}
              options={APARTMENT_OPTIONS}
              selectedValue={form.selectedApartment}
              onSelect={form.handleApartmentPress}
            />

            <TabBarSection
              label={t("listings.bedrooms")}
              options={BEDROOM_OPTIONS}
              selectedValue={form.selectedBedroom}
              onSelect={form.handleBedroomPress}
            />

            <FieldWithModal
              label={t("listings.streetDirection")}
              value={getTranslatedPickerValue(form.streetDirection, "streetDirection")}
              placeholder={t("listings.selectStreetDirection")}
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <TabBarSection
              label={t("listings.livingRooms")}
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <TabBarSection
              label={t("listings.wc")}
              options={WC_OPTIONS}
              selectedValue={form.selectedWc}
              onSelect={form.handleWcPress}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.areaFrom}
              toValue={form.areaTo}
              onFromChange={form.setAreaFrom}
              onToChange={form.setAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.streetWidth")}
              value={getTranslatedPickerValue(form.streetWidth, "streetWidth")}
              placeholder={t("listings.selectStreetWidth")}
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <View style={styles.section}>
              <ToggleRow label={t("listings.stairs")} value={form.stairs} onValueChange={form.setStairs} />
            </View>

            <FieldWithModal
              label={t("listings.age")}
              value={getTranslatedPickerValue(form.age, "age")}
              placeholder={t("listings.selectAge")}
              onPress={openAgeModal}
              backgroundColor="background"
            />

            <View style={styles.section}>
              <ToggleRow
                label={t("listings.driverRoom")}
                value={form.driverRoom}
                onValueChange={form.setDriverRoom}
              />
              <ToggleRow label={t("listings.maidRoom")} value={form.maidRoom} onValueChange={form.setMaidRoom} />
              <ToggleRow label={t("listings.pool")} value={form.pool} onValueChange={form.setPool} />
              <ToggleRow
                label={t("listings.furnished")}
                value={form.villaFurnished}
                onValueChange={form.setVillaFurnished}
              />
              <ToggleRow label={t("listings.kitchen")} value={form.kitchen} onValueChange={form.setKitchen} />
              <ToggleRow
                label={t("listings.carEntrance")}
                value={form.villaCarEntrance}
                onValueChange={form.setVillaCarEntrance}
              />
              <ToggleRow label={t("listings.basement")} value={form.basement} onValueChange={form.setBasement} />
            </View>

            <TabBarSection
              label={t("listings.villaType")}
              options={translatedVillaTypeOptions}
              selectedValue={getTranslatedInitialValue(form.selectedVillaType, villaTypeReverseMap, translatedVillaTypeOptions)}
              onSelect={(translatedValue: string) => {
                const originalValue = villaTypeReverseMap[translatedValue] || translatedValue;
                form.handleVillaTypePress(originalValue);
              }}
            />

            <View style={styles.section}>
              <ToggleRow label={t("listings.nearBus")} value={form.nearBus} onValueChange={form.setNearBus} />
              <ToggleRow label={t("listings.nearMetro")} value={form.nearMetro} onValueChange={form.setNearMetro} />
            </View>
          </>
        )}

        {/* Land for sale content */}
        {form.isLandForSale && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.landPriceFrom}
              toValue={form.landPriceTo}
              onFromChange={form.setLandPriceFrom}
              onToChange={form.setLandPriceTo}
            />

            <TabBarSection
              options={translatedResidentialCommercialOptions}
              selectedValue={getTranslatedInitialValue(form.selectedLandType, residentialCommercialReverseMap, translatedResidentialCommercialOptions)}
              onSelect={(translatedValue: string) => {
                const originalValue = residentialCommercialReverseMap[translatedValue] || translatedValue;
                form.handleLandTypePress(originalValue);
              }}
            />

            <FieldWithModal
              label={t("listings.streetDirection")}
              value={getTranslatedPickerValue(form.landStreetDirection, "streetDirection")}
              placeholder={t("listings.selectStreetDirection")}
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.landAreaFrom}
              toValue={form.landAreaTo}
              onFromChange={form.setLandAreaFrom}
              onToChange={form.setLandAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.streetWidth")}
              value={getTranslatedPickerValue(form.landStreetWidth, "streetWidth")}
              placeholder={t("listings.selectStreetWidth")}
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Apartment for sale content */}
        {form.isApartmentForSale && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.apartmentSalePriceFrom}
              toValue={form.apartmentSalePriceTo}
              onFromChange={form.setApartmentSalePriceFrom}
              onToChange={form.setApartmentSalePriceTo}
            />

            <TabBarSection
              label={t("listings.bedrooms")}
              options={BEDROOM_OPTIONS}
              selectedValue={form.selectedBedroom}
              onSelect={form.handleBedroomPress}
            />

            <TabBarSection
              label={t("listings.livingRooms")}
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <TabBarSection
              label={t("listings.wc")}
              options={WC_OPTIONS}
              selectedValue={form.selectedWc}
              onSelect={form.handleWcPress}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.apartmentSaleAreaFrom}
              toValue={form.apartmentSaleAreaTo}
              onFromChange={form.setApartmentSaleAreaFrom}
              onToChange={form.setApartmentSaleAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.floor")}
              value={getTranslatedPickerValue(form.floor, "floor")}
              placeholder={t("listings.selectFloor")}
              onPress={openFloorModal}
              backgroundColor="background"
            />

            <FieldWithModal
              label={t("listings.age")}
              value={getTranslatedPickerValue(form.age, "age")}
              placeholder={t("listings.selectAge")}
              onPress={openAgeModal}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.carEntrance"), value: form.apartmentSaleCarEntrance, onValueChange: form.setApartmentSaleCarEntrance },
                { label: t("listings.privateRoof"), value: form.apartmentSalePrivateRoof, onValueChange: form.setApartmentSalePrivateRoof },
                { label: t("listings.apartmentInVilla"), value: form.apartmentSaleInVilla, onValueChange: form.setApartmentSaleInVilla },
                { label: t("listings.twoEntrances"), value: form.apartmentSaleTwoEntrances, onValueChange: form.setApartmentSaleTwoEntrances },
                { label: t("listings.specialEntrances"), value: form.apartmentSaleSpecialEntrances, onValueChange: form.setApartmentSaleSpecialEntrances },
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Building for sale content */}
        {form.isBuildingForSale && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.buildingPriceFrom}
              toValue={form.buildingPriceTo}
              onFromChange={form.setBuildingPriceFrom}
              onToChange={form.setBuildingPriceTo}
            />

            <TabBarSection
              label={t("listings.apartments")}
              options={APARTMENT_OPTIONS}
              selectedValue={form.buildingApartments}
              onSelect={form.handleBuildingApartmentsPress}
            />

            <TabBarSection
              options={translatedResidentialCommercialOptions}
              selectedValue={getTranslatedInitialValue(form.selectedBuildingType, residentialCommercialReverseMap, translatedResidentialCommercialOptions)}
              onSelect={(translatedValue: string) => {
                const originalValue = residentialCommercialReverseMap[translatedValue] || translatedValue;
                form.handleBuildingTypePress(originalValue);
              }}
            />

            <FieldWithModal
              label={t("listings.streetDirection")}
              value={getTranslatedPickerValue(form.buildingStreetDirection, "streetDirection")}
              placeholder={t("listings.selectStreetDirection")}
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label={t("listings.stores")}
              value={getTranslatedPickerValue(form.stores, "stores")}
              placeholder={t("listings.selectStores")}
              onPress={() => form.setShowStoresModal(true)}
              backgroundColor="background"
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.buildingAreaFrom}
              toValue={form.buildingAreaTo}
              onFromChange={form.setBuildingAreaFrom}
              onToChange={form.setBuildingAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.streetWidth")}
              value={getTranslatedPickerValue(form.streetWidth, "streetWidth")}
              placeholder={t("listings.selectStreetWidth")}
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label={t("listings.age")}
              value={getTranslatedPickerValue(form.age, "age")}
              placeholder={t("listings.selectAge")}
              onPress={openAgeModal}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Small house for sale content */}
        {form.isSmallHouseForSale && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.smallHousePriceFrom}
              toValue={form.smallHousePriceTo}
              onFromChange={form.setSmallHousePriceFrom}
              onToChange={form.setSmallHousePriceTo}
            />

            <TabBarSection
              label={t("listings.bedrooms")}
              options={BEDROOM_OPTIONS}
              selectedValue={form.selectedBedroom}
              onSelect={form.handleBedroomPress}
            />

            <FieldWithModal
              label={t("listings.streetDirection")}
              value={getTranslatedPickerValue(form.smallHouseStreetDirection, "streetDirection")}
              placeholder={t("listings.selectStreetDirection")}
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <TabBarSection
              label={t("listings.livingRoom")}
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.smallHouseAreaFrom}
              toValue={form.smallHouseAreaTo}
              onFromChange={form.setSmallHouseAreaFrom}
              onToChange={form.setSmallHouseAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.streetWidth")}
              value={getTranslatedPickerValue(form.smallHouseStreetWidth, "streetWidth")}
              placeholder={t("listings.selectStreetWidth")}
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label={t("listings.age")}
              value={getTranslatedPickerValue(form.age, "age")}
              placeholder={t("listings.selectAge")}
              onPress={openAgeModal}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.furnished"), value: form.smallHouseFurnished, onValueChange: form.setSmallHouseFurnished },
                { label: t("listings.tent"), value: form.tent, onValueChange: form.setTent },
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Lounge for sale content */}
        {form.isLoungeForSale && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.loungePriceFrom}
              toValue={form.loungePriceTo}
              onFromChange={form.setLoungePriceFrom}
              onToChange={form.setLoungePriceTo}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.loungeAreaFrom}
              toValue={form.loungeAreaTo}
              onFromChange={form.setLoungeAreaFrom}
              onToChange={form.setLoungeAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.streetWidth")}
              value={getTranslatedPickerValue(form.loungeStreetWidth, "streetWidth")}
              placeholder={t("listings.selectStreetWidth")}
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label={t("listings.age")}
              value={getTranslatedPickerValue(form.age, "age")}
              placeholder={t("listings.selectAge")}
              onPress={openAgeModal}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Farm for sale content */}
        {form.isFarmForSale && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.farmPriceFrom}
              toValue={form.farmPriceTo}
              onFromChange={form.setFarmPriceFrom}
              onToChange={form.setFarmPriceTo}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.farmAreaFrom}
              toValue={form.farmAreaTo}
              onFromChange={form.setFarmAreaFrom}
              onToChange={form.setFarmAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Store for sale content */}
        {form.isStoreForSale && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.storePriceFrom}
              toValue={form.storePriceTo}
              onFromChange={form.setStorePriceFrom}
              onToChange={form.setStorePriceTo}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.storeAreaFrom}
              toValue={form.storeAreaTo}
              onFromChange={form.setStoreAreaFrom}
              onToChange={form.setStoreAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.streetWidth")}
              value={getTranslatedPickerValue(form.storeStreetWidth, "streetWidth")}
              placeholder={t("listings.selectStreetWidth")}
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Floor for sale content */}
        {form.isFloorForSale && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.floorSalePriceFrom}
              toValue={form.floorSalePriceTo}
              onFromChange={form.setFloorSalePriceFrom}
              onToChange={form.setFloorSalePriceTo}
            />

            <TabBarSection
              label={t("listings.livingRooms")}
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.floorSaleAreaFrom}
              toValue={form.floorSaleAreaTo}
              onFromChange={form.setFloorSaleAreaFrom}
              onToChange={form.setFloorSaleAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.floor")}
              value={getTranslatedPickerValue(form.floor, "floor")}
              placeholder={t("listings.selectFloor")}
              onPress={openFloorModal}
              backgroundColor="background"
            />

            <FieldWithModal
              label={t("listings.age")}
              value={getTranslatedPickerValue(form.age, "age")}
              placeholder={t("listings.selectAge")}
              onPress={openAgeModal}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.carEntrance"), value: form.floorSaleCarEntrance, onValueChange: form.setFloorSaleCarEntrance },
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Villa for rent content */}
        {form.isVillaForRent && (
          <VillaForRentSection
            rentPeriod={form.villaRentRentPeriod}
            onRentPeriodChange={form.handleVillaRentRentPeriodPress}
            selectedPayment={form.selectedPayment}
            onPaymentChipSelect={form.handlePaymentChipPress}
            priceFrom={form.villaRentPriceFrom}
            priceTo={form.villaRentPriceTo}
            onPriceFromChange={form.setVillaRentPriceFrom}
            onPriceToChange={form.setVillaRentPriceTo}
            selectedBedroom={form.selectedBedroom}
            onBedroomChange={form.handleBedroomPress}
            streetDirection={getTranslatedPickerValue(form.villaRentStreetDirection, "streetDirection")}
            onStreetDirectionPress={() => form.setShowStreetDirectionModal(true)}
            selectedLivingRoom={form.selectedLivingRoom}
            onLivingRoomChange={form.handleLivingRoomPress}
            selectedWc={form.selectedWc}
            onWcChange={form.handleWcPress}
            areaFrom={form.villaRentAreaFrom}
            areaTo={form.villaRentAreaTo}
            onAreaFromChange={form.setVillaRentAreaFrom}
            onAreaToChange={form.setVillaRentAreaTo}
            streetWidth={getTranslatedPickerValue(form.villaRentStreetWidth, "streetWidth")}
            onStreetWidthPress={() => form.setShowStreetWidthModal(true)}
            stairs={form.villaRentStairs}
            onStairsChange={form.setVillaRentStairs}
            age={getTranslatedPickerValue(form.age, "age")}
            onAgePress={openAgeModal}
            driverRoom={form.driverRoom}
            onDriverRoomChange={form.setDriverRoom}
            maidRoom={form.maidRoom}
            onMaidRoomChange={form.setMaidRoom}
            pool={form.pool}
            onPoolChange={form.setPool}
            villaFurnished={form.villaFurnished}
            onVillaFurnishedChange={form.setVillaFurnished}
            kitchen={form.kitchen}
            onKitchenChange={form.setKitchen}
            villaCarEntrance={form.villaCarEntrance}
            onVillaCarEntranceChange={form.setVillaCarEntrance}
            basement={form.basement}
            onBasementChange={form.setBasement}
            selectedVillaType={form.selectedVillaType}
            onVillaTypeChange={form.handleVillaTypePress}
            airConditioned={form.villaRentAirConditioned}
            onAirConditionedChange={form.setVillaRentAirConditioned}
            nearBus={form.nearBus}
            onNearBusChange={form.setNearBus}
            nearMetro={form.nearMetro}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Big flat for rent content */}
        {form.isBigFlatForRent && (
          <>
            <RentPeriodTabBar
              selectedPeriod={form.bigFlatRentPeriod}
              onSelect={form.handleBigFlatRentPeriodPress}
            />

            {form.bigFlatRentPeriod === "Yearly" && (
              <PaymentChips
                label={t("listings.paymentOptions")}
                selectedPayment={form.selectedPayment}
                onSelect={form.handlePaymentChipPress}
              />
            )}

            <PriceInputSection
              label={
                form.bigFlatRentPeriod === "Yearly"
                  ? form.selectedPayment === "Monthly"
                    ? t("listings.priceMonthly")
                    : t("listings.annualPrice")
                  : t("listings.price")
              }
              fromValue={form.bigFlatPriceFrom}
              toValue={form.bigFlatPriceTo}
              onFromChange={form.setBigFlatPriceFrom}
              onToChange={form.setBigFlatPriceTo}
            />

            <TabBarSection
              label={t("listings.bedrooms")}
              options={BEDROOM_OPTIONS}
              selectedValue={form.selectedBedroom}
              onSelect={form.handleBedroomPress}
            />

            <TabBarSection
              label={t("listings.livingRooms")}
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <TabBarSection
              label={t("listings.wc")}
              options={WC_OPTIONS}
              selectedValue={form.selectedWc}
              onSelect={form.handleWcPress}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.bigFlatAreaFrom}
              toValue={form.bigFlatAreaTo}
              onFromChange={form.setBigFlatAreaFrom}
              onToChange={form.setBigFlatAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.floor")}
              value={getTranslatedPickerValue(form.floor, "floor")}
              placeholder={t("listings.selectFloor")}
              onPress={openFloorModal}
              backgroundColor="background"
            />

            <FieldWithModal
              label={t("listings.age")}
              value={getTranslatedPickerValue(form.age, "age")}
              placeholder={t("listings.selectAge")}
              onPress={openAgeModal}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.carEntrance"), value: form.bigFlatCarEntrance, onValueChange: form.setBigFlatCarEntrance },
                { label: t("listings.airConditioned"), value: form.bigFlatAirConditioned, onValueChange: form.setBigFlatAirConditioned },
                { label: t("listings.apartmentInVilla"), value: form.bigFlatInVilla, onValueChange: form.setBigFlatInVilla },
                { label: t("listings.twoEntrances"), value: form.bigFlatTwoEntrances, onValueChange: form.setBigFlatTwoEntrances },
                { label: t("listings.specialEntrances"), value: form.bigFlatSpecialEntrances, onValueChange: form.setBigFlatSpecialEntrances },
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Lounge for rent content */}
        {form.isLoungeForRent && (
          <>
            <RentPeriodTabBar
              selectedPeriod={form.loungeRentRentPeriod}
              onSelect={form.handleLoungeRentRentPeriodPress}
            />

            {form.loungeRentRentPeriod === "Yearly" && (
              <PaymentChips
                label={t("listings.paymentOptions")}
                selectedPayment={form.selectedPayment}
                onSelect={form.handlePaymentChipPress}
              />
            )}

            <PriceInputSection
              label={
                form.loungeRentRentPeriod === "Yearly"
                  ? form.selectedPayment === "Monthly"
                    ? t("listings.priceMonthly")
                    : t("listings.annualPrice")
                  : t("listings.price")
              }
              fromValue={form.loungeRentPriceFrom}
              toValue={form.loungeRentPriceTo}
              onFromChange={form.setLoungeRentPriceFrom}
              onToChange={form.setLoungeRentPriceTo}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.loungeRentAreaFrom}
              toValue={form.loungeRentAreaTo}
              onFromChange={form.setLoungeRentAreaFrom}
              onToChange={form.setLoungeRentAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.pool"), value: form.loungeRentPool, onValueChange: form.setLoungeRentPool },
                { label: t("listings.footballPitch"), value: form.footballPitch, onValueChange: form.setFootballPitch },
                { label: t("listings.volleyballCourt"), value: form.volleyballCourt, onValueChange: form.setVolleyballCourt },
                { label: t("listings.tent"), value: form.loungeRentTent, onValueChange: form.setLoungeRentTent },
                { label: t("listings.kitchen"), value: form.loungeRentKitchen, onValueChange: form.setLoungeRentKitchen },
                { label: t("listings.playground"), value: form.playground, onValueChange: form.setPlayground },
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
                { label: t("listings.familySection"), value: form.familySection, onValueChange: form.setFamilySection },
              ]}
            />
          </>
        )}

        {/* Small house for rent content */}
        {form.isSmallHouseForRent && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.smallHouseRentPriceFrom}
              toValue={form.smallHouseRentPriceTo}
              onFromChange={form.setSmallHouseRentPriceFrom}
              onToChange={form.setSmallHouseRentPriceTo}
            />

            <TabBarSection
              label={t("listings.bedrooms")}
              options={BEDROOM_OPTIONS}
              selectedValue={form.selectedBedroom}
              onSelect={form.handleBedroomPress}
            />

            <FieldWithModal
              label={t("listings.streetDirection")}
              value={getTranslatedPickerValue(form.smallHouseRentStreetDirection, "streetDirection")}
              placeholder={t("listings.selectStreetDirection")}
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <TabBarSection
              label={t("listings.livingRoom")}
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.smallHouseRentAreaFrom}
              toValue={form.smallHouseRentAreaTo}
              onFromChange={form.setSmallHouseRentAreaFrom}
              onToChange={form.setSmallHouseRentAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.streetWidth")}
              value={getTranslatedPickerValue(form.smallHouseRentStreetWidth, "streetWidth")}
              placeholder={t("listings.selectStreetWidth")}
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label={t("listings.age")}
              value={getTranslatedPickerValue(form.age, "age")}
              placeholder={t("listings.selectAge")}
              onPress={openAgeModal}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.furnished"), value: form.smallHouseRentFurnished, onValueChange: form.setSmallHouseRentFurnished },
                { label: t("listings.tent"), value: form.smallHouseRentTent, onValueChange: form.setSmallHouseRentTent },
                { label: t("listings.kitchen"), value: form.smallHouseRentKitchen, onValueChange: form.setSmallHouseRentKitchen },
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Store for rent content */}
        {form.isStoreForRent && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.storeRentPriceFrom}
              toValue={form.storeRentPriceTo}
              onFromChange={form.setStoreRentPriceFrom}
              onToChange={form.setStoreRentPriceTo}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.storeRentAreaFrom}
              toValue={form.storeRentAreaTo}
              onFromChange={form.setStoreRentAreaFrom}
              onToChange={form.setStoreRentAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.streetWidth")}
              value={getTranslatedPickerValue(form.storeRentStreetWidth, "streetWidth")}
              placeholder={t("listings.selectStreetWidth")}
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Building for rent content */}
        {form.isBuildingForRent && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.buildingRentPriceFrom}
              toValue={form.buildingRentPriceTo}
              onFromChange={form.setBuildingRentPriceFrom}
              onToChange={form.setBuildingRentPriceTo}
            />

            <TabBarSection
              label={t("listings.apartments")}
              options={APARTMENT_OPTIONS}
              selectedValue={form.buildingRentApartments}
              onSelect={form.handleBuildingRentApartmentsPress}
            />

            <TabBarSection
              options={translatedResidentialCommercialOptions}
              selectedValue={getTranslatedInitialValue(form.selectedBuildingRentType, residentialCommercialReverseMap, translatedResidentialCommercialOptions)}
              onSelect={(translatedValue: string) => {
                const originalValue = residentialCommercialReverseMap[translatedValue] || translatedValue;
                form.handleBuildingRentTypePress(originalValue);
              }}
            />

            <FieldWithModal
              label={t("listings.streetDirection")}
              value={getTranslatedPickerValue(form.buildingRentStreetDirection, "streetDirection")}
              placeholder={t("listings.selectStreetDirection")}
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label={t("listings.stores")}
              value={getTranslatedPickerValue(form.buildingRentStores, "stores")}
              placeholder={t("listings.selectStores")}
              onPress={() => form.setShowStoresModal(true)}
              backgroundColor="background"
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.buildingRentAreaFrom}
              toValue={form.buildingRentAreaTo}
              onFromChange={form.setBuildingRentAreaFrom}
              onToChange={form.setBuildingRentAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.streetWidth")}
              value={getTranslatedPickerValue(form.buildingRentStreetWidth, "streetWidth")}
              placeholder={t("listings.selectStreetWidth")}
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label={t("listings.age")}
              value={getTranslatedPickerValue(form.age, "age")}
              placeholder={t("listings.selectAge")}
              onPress={openAgeModal}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Land for rent content */}
        {form.isLandForRent && (
          <>
            <TabBarSection
              options={translatedResidentialCommercialOptions}
              selectedValue={getTranslatedInitialValue(form.selectedLandRentType, residentialCommercialReverseMap, translatedResidentialCommercialOptions)}
              onSelect={(translatedValue: string) => {
                const originalValue = residentialCommercialReverseMap[translatedValue] || translatedValue;
                form.handleLandRentTypePress(originalValue);
              }}
            />

            <FieldWithModal
              label={t("listings.streetDirection")}
              value={getTranslatedPickerValue(form.landRentStreetDirection, "streetDirection")}
              placeholder={t("listings.selectStreetDirection")}
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.landRentAreaFrom}
              toValue={form.landRentAreaTo}
              onFromChange={form.setLandRentAreaFrom}
              onToChange={form.setLandRentAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.streetWidth")}
              value={getTranslatedPickerValue(form.landRentStreetWidth, "streetWidth")}
              placeholder={t("listings.selectStreetWidth")}
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Room for rent content */}
        {form.isRoomForRent && (
          <>
            <RentPeriodTabBar
              selectedPeriod={form.roomRentRentPeriod}
              onSelect={form.handleRoomRentRentPeriodPress}
            />

            {form.roomRentRentPeriod === "Yearly" && (
              <PaymentChips
                label={t("listings.paymentOptions")}
                selectedPayment={form.selectedPayment}
                onSelect={form.handlePaymentChipPress}
              />
            )}

            <PriceInputSection
              label={
                form.roomRentRentPeriod === "Yearly"
                  ? form.selectedPayment === "Monthly"
                    ? t("listings.priceMonthly")
                    : t("listings.annualPrice")
                  : t("listings.price")
              }
              fromValue={form.roomRentPriceFrom}
              toValue={form.roomRentPriceTo}
              onFromChange={form.setRoomRentPriceFrom}
              onToChange={form.setRoomRentPriceTo}
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.kitchen"), value: form.roomRentKitchen, onValueChange: form.setRoomRentKitchen },
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Office for rent content */}
        {form.isOfficeForRent && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.officeRentPriceFrom}
              toValue={form.officeRentPriceTo}
              onFromChange={form.setOfficeRentPriceFrom}
              onToChange={form.setOfficeRentPriceTo}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.officeRentAreaFrom}
              toValue={form.officeRentAreaTo}
              onFromChange={form.setOfficeRentAreaFrom}
              onToChange={form.setOfficeRentAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.streetWidth")}
              value={getTranslatedPickerValue(form.officeRentStreetWidth, "streetWidth")}
              placeholder={t("listings.selectStreetWidth")}
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.furnished"), value: form.officeRentFurnished, onValueChange: form.setOfficeRentFurnished },
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Tent for rent content */}
        {form.isTentForRent && (
          <>
            <RentPeriodTabBar
              selectedPeriod={form.tentRentRentPeriod}
              onSelect={form.handleTentRentRentPeriodPress}
            />

            {form.tentRentRentPeriod === "Yearly" && (
              <>
                <PaymentChips
                  label={t("listings.paymentOptions")}
                  selectedPayment={form.selectedPayment}
                  onSelect={form.handlePaymentChipPress}
                />
                {form.selectedPayment && form.selectedPayment !== "1 Payment" && (
                  <PriceInputSection
                    label={
                      form.selectedPayment === "Monthly"
                        ? t("listings.priceMonthly")
                        : t("listings.annualPrice")
                    }
                    fromValue={form.tentRentPriceFrom}
                    toValue={form.tentRentPriceTo}
                    onFromChange={form.setTentRentPriceFrom}
                    onToChange={form.setTentRentPriceTo}
                    fromPlaceholder={t("listings.fromPrice")}
                    toPlaceholder={t("listings.toPrice")}
                  />
                )}
              </>
            )}

            <ToggleGroup
              toggles={[
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
                { label: t("listings.familySection"), value: form.familySection, onValueChange: form.setFamilySection },
              ]}
            />
          </>
        )}

        {/* Warehouse for rent content */}
        {form.isWarehouseForRent && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.warehouseRentPriceFrom}
              toValue={form.warehouseRentPriceTo}
              onFromChange={form.setWarehouseRentPriceFrom}
              onToChange={form.setWarehouseRentPriceTo}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.warehouseRentAreaFrom}
              toValue={form.warehouseRentAreaTo}
              onFromChange={form.setWarehouseRentAreaFrom}
              onToChange={form.setWarehouseRentAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <FieldWithModal
              label={t("listings.streetWidth")}
              value={getTranslatedPickerValue(form.warehouseRentStreetWidth, "streetWidth")}
              placeholder={t("listings.selectStreetWidth")}
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Chalet for rent content */}
        {form.isChaletForRent && (
          <>
            <RentPeriodTabBar
              selectedPeriod={form.chaletRentRentPeriod}
              onSelect={form.handleChaletRentRentPeriodPress}
            />

            {form.chaletRentRentPeriod === "Yearly" && (
              <PaymentChips
                label={t("listings.paymentOptions")}
                selectedPayment={form.selectedPayment}
                onSelect={form.handlePaymentChipPress}
              />
            )}

            <PriceInputSection
              label={
                form.chaletRentRentPeriod === "Yearly"
                  ? form.selectedPayment === "Monthly"
                    ? t("listings.priceMonthly")
                    : t("listings.annualPrice")
                  : t("listings.price")
              }
              fromValue={form.chaletRentPriceFrom}
              toValue={form.chaletRentPriceTo}
              onFromChange={form.setChaletRentPriceFrom}
              onToChange={form.setChaletRentPriceTo}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.chaletRentAreaFrom}
              toValue={form.chaletRentAreaTo}
              onFromChange={form.setChaletRentAreaFrom}
              onToChange={form.setChaletRentAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.pool"), value: form.chaletRentPool, onValueChange: form.setChaletRentPool },
                { label: t("listings.footballPitch"), value: form.chaletFootballPitch, onValueChange: form.setChaletFootballPitch },
                { label: t("listings.volleyballCourt"), value: form.chaletVolleyballCourt, onValueChange: form.setChaletVolleyballCourt },
                { label: t("listings.tent"), value: form.chaletRentTent, onValueChange: form.setChaletRentTent },
                { label: t("listings.kitchen"), value: form.chaletRentKitchen, onValueChange: form.setChaletRentKitchen },
                { label: t("listings.playground"), value: form.chaletPlayground, onValueChange: form.setChaletPlayground },
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
                { label: t("listings.familySection"), value: form.familySection, onValueChange: form.setFamilySection },
              ]}
            />
          </>
        )}

        {/* Other category content */}
        {form.isOther && (
          <>
            <PriceInputSection
              label={t("listings.price")}
              fromValue={form.otherPriceFrom}
              toValue={form.otherPriceTo}
              onFromChange={form.setOtherPriceFrom}
              onToChange={form.setOtherPriceTo}
            />

            <PriceInputSection
              label={t("listings.areaM2")}
              fromValue={form.otherAreaFrom}
              toValue={form.otherAreaTo}
              onFromChange={form.setOtherAreaFrom}
              onToChange={form.setOtherAreaTo}
              fromPlaceholder={t("listings.fromArea")}
              toPlaceholder={t("listings.toArea")}
            />

            <ToggleGroup
              toggles={[
                { label: t("listings.nearBus"), value: form.nearBus, onValueChange: form.setNearBus },
                { label: t("listings.nearMetro"), value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <Animated.View
        style={[
          styles.footerContainer,
          {
            bottom: keyboardHeight,
          },
        ]}
      >
        <ListingFooter
          currentStep={1}
          totalSteps={3}
          onBackPress={handleBackPress}
          onNextPress={handleNextPress}
          showBack={true}
          showNext={true}
          backText={t("common.back")}
          nextText={t("common.next")}
        />
      </Animated.View>

      {/* Modals */}
      <WheelPickerModal
        visible={form.showCategoryModal}
        onClose={() => form.setShowCategoryModal(false)}
        onSelect={(translatedValue: string) => {
          // Find original value from translated value
          const originalValue = Object.keys(categoryTranslationMap).find(
            (key) => categoryTranslationMap[key] === translatedValue
          ) || translatedValue;
          form.handleCategorySelect(originalValue);
        }}
        title={t("listings.selectCategory")}
        options={categoryOptions}
        initialValue={getTranslatedCategoryValue(form.category)}
      />

      <WheelPickerModal
        key={`floor-${form.category}`}
        visible={form.showFloorModal}
        onClose={() => form.setShowFloorModal(false)}
        onSelect={(translatedValue: string) => {
          const originalValue = floorReverseMap[translatedValue] || translatedValue;
          form.handleFloorSelect(originalValue);
        }}
        title={t("listings.selectFloor")}
        options={translatedFloorOptions}
        initialValue={getTranslatedInitialValue(form.floor, floorReverseMap, translatedFloorOptions, FLOOR_OPTIONS)}
      />

      <WheelPickerModal
        key={`age-${form.category}`}
        visible={form.showAgeModal}
        onClose={() => form.setShowAgeModal(false)}
        onSelect={(translatedValue: string) => {
          const originalValue = ageReverseMap[translatedValue] || translatedValue;
          form.handleAgeSelect(originalValue);
        }}
        title={t("listings.selectAge")}
        options={translatedAgeOptions}
        initialValue={getTranslatedInitialValue(form.age, ageReverseMap, translatedAgeOptions, AGE_OPTIONS)}
      />

      <WheelPickerModal
        key={`streetDirection-${form.category}`}
        visible={form.showStreetDirectionModal}
        onClose={() => form.setShowStreetDirectionModal(false)}
        onSelect={(translatedValue: string) => {
          const originalValue = streetDirectionReverseMap[translatedValue] || translatedValue;
          form.handleStreetDirectionSelect(originalValue);
        }}
        title={t("listings.selectStreetDirection")}
        options={translatedStreetDirectionOptions}
        initialValue={getTranslatedInitialValue(
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
          streetDirectionReverseMap,
          translatedStreetDirectionOptions
        )}
      />

      <WheelPickerModal
        key={`streetWidth-${form.category}`}
        visible={form.showStreetWidthModal}
        onClose={() => form.setShowStreetWidthModal(false)}
        onSelect={(translatedValue: string) => {
          const originalValue = streetWidthReverseMap[translatedValue] || translatedValue;
          form.handleStreetWidthSelect(originalValue);
        }}
        title={t("listings.selectStreetWidth")}
        options={translatedStreetWidthOptions}
        initialValue={getTranslatedInitialValue(
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
          streetWidthReverseMap,
          translatedStreetWidthOptions
        )}
      />

      <WheelPickerModal
        key={`stores-${form.category}`}
        visible={form.showStoresModal}
        onClose={() => form.setShowStoresModal(false)}
        onSelect={(value: string) => {
          if (form.isBuildingForSale) {
            form.handleStoresSelect(value);
          } else if (form.isBuildingForRent) {
            form.handleBuildingRentStoresSelect(value);
          }
        }}
        title={t("listings.selectStores")}
        options={STORES_OPTIONS}
        initialValue={form.isBuildingForSale ? form.stores : form.buildingRentStores}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(12), // Extra padding for footer
  },
  footerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  section: {
    marginBottom: hp(2.5),
  },
  label: {
    fontSize: wp(4),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(1),
  },
  field: {
    backgroundColor: COLORS.white,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldBackground: {
    backgroundColor: COLORS.background,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldText: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    flex: 1,
  },
});
