import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useOrderForm } from "@/hooks/useOrderForm";

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

// Category options - use from constants and add "Other"
const CATEGORY_OPTIONS = [
  ...ALL_CATEGORIES.map((cat) => cat.text),
  "Other",
];

export default function NewOrderScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  
  // Get all state, handlers, and computed values from the hook
  const form = useOrderForm();

  const handleBackPress = () => {
    navigation.goBack();
  };

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
        title="New Order"
        onBackPress={handleBackPress}
        fontWeightBold
        fontSize={wp(4.5)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Field */}
        <FieldWithModal
          label="Category"
          value={form.category}
          placeholder="Select category"
          onPress={() => form.setShowCategoryModal(true)}
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
                <View style={styles.section}>
                  <Text style={styles.label}>Payment options</Text>
                  <PaymentChips
                    selectedPayment={form.selectedPayment}
                    onSelect={form.handlePaymentChipPress}
                  />
                </View>

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
                label="Price"
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
              label="Bedrooms"
              options={BEDROOM_OPTIONS}
              selectedValue={form.selectedBedroom}
              onSelect={form.handleBedroomPress}
            />

            <TabBarSection
              label="Living Rooms"
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <TabBarSection
              label="WC"
              options={WC_OPTIONS}
              selectedValue={form.selectedWc}
              onSelect={form.handleWcPress}
            />

            <FieldWithModal
              label="Floor"
              value={form.floor}
              placeholder="Select floor"
              onPress={() => form.setShowFloorModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label="Age"
              value={form.age}
              placeholder="Select age"
              onPress={() => form.setShowAgeModal(true)}
              backgroundColor="background"
            />

            <View style={styles.section}>
              <ToggleRow
                label="Furnished"
                value={form.furnished}
                onValueChange={form.setFurnished}
              />
              <ToggleRow
                label="Car entrance"
                value={form.carEntrance}
                onValueChange={form.setCarEntrance}
              />
              <ToggleRow
                label="Air conditioned"
                value={form.airConditioned}
                onValueChange={form.setAirConditioned}
              />
              <ToggleRow
                label="Private roof"
                value={form.privateRoof}
                onValueChange={form.setPrivateRoof}
              />
              <ToggleRow
                label="Apartment in villa"
                value={form.apartmentInVilla}
                onValueChange={form.setApartmentInVilla}
              />
              <ToggleRow
                label="Two entrances"
                value={form.twoEntrances}
                onValueChange={form.setTwoEntrances}
              />
              <ToggleRow
                label="Special entrances"
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
              label="Price"
              fromValue={form.villaPriceFrom}
              toValue={form.villaPriceTo}
              onFromChange={form.setVillaPriceFrom}
              onToChange={form.setVillaPriceTo}
            />

            <TabBarSection
              label="Apartments"
              options={APARTMENT_OPTIONS}
              selectedValue={form.selectedApartment}
              onSelect={form.handleApartmentPress}
            />

            <TabBarSection
              label="Bedrooms"
              options={BEDROOM_OPTIONS}
              selectedValue={form.selectedBedroom}
              onSelect={form.handleBedroomPress}
            />

            <FieldWithModal
              label="Street Direction"
              value={form.streetDirection}
              placeholder="Select street direction"
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <TabBarSection
              label="Living Rooms"
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <TabBarSection
              label="WC"
              options={WC_OPTIONS}
              selectedValue={form.selectedWc}
              onSelect={form.handleWcPress}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.areaFrom}
              toValue={form.areaTo}
              onFromChange={form.setAreaFrom}
              onToChange={form.setAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Street Width"
              value={form.streetWidth}
              placeholder="Select street width"
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <View style={styles.section}>
              <ToggleRow label="Stairs" value={form.stairs} onValueChange={form.setStairs} />
            </View>

            <FieldWithModal
              label="Age"
              value={form.age}
              placeholder="Select age"
              onPress={() => form.setShowAgeModal(true)}
              backgroundColor="background"
            />

            <View style={styles.section}>
              <ToggleRow
                label="Driver room"
                value={form.driverRoom}
                onValueChange={form.setDriverRoom}
              />
              <ToggleRow label="Maid room" value={form.maidRoom} onValueChange={form.setMaidRoom} />
              <ToggleRow label="Pool" value={form.pool} onValueChange={form.setPool} />
              <ToggleRow
                label="Furnished"
                value={form.villaFurnished}
                onValueChange={form.setVillaFurnished}
              />
              <ToggleRow label="Kitchen" value={form.kitchen} onValueChange={form.setKitchen} />
              <ToggleRow
                label="Car entrance"
                value={form.villaCarEntrance}
                onValueChange={form.setVillaCarEntrance}
              />
              <ToggleRow label="Basement" value={form.basement} onValueChange={form.setBasement} />
            </View>

            <TabBarSection
              label="Villa Type"
              options={VILLA_TYPE_OPTIONS}
              selectedValue={form.selectedVillaType}
              onSelect={form.handleVillaTypePress}
            />

            <View style={styles.section}>
              <ToggleRow label="Near bus" value={form.nearBus} onValueChange={form.setNearBus} />
              <ToggleRow label="Near metro" value={form.nearMetro} onValueChange={form.setNearMetro} />
            </View>
          </>
        )}

        {/* Land for sale content */}
        {form.isLandForSale && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.landPriceFrom}
              toValue={form.landPriceTo}
              onFromChange={form.setLandPriceFrom}
              onToChange={form.setLandPriceTo}
            />

            <TabBarSection
              options={RESIDENTIAL_COMMERCIAL_OPTIONS}
              selectedValue={form.selectedLandType}
              onSelect={form.handleLandTypePress}
            />

            <FieldWithModal
              label="Street Direction"
              value={form.landStreetDirection}
              placeholder="Select street direction"
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.landAreaFrom}
              toValue={form.landAreaTo}
              onFromChange={form.setLandAreaFrom}
              onToChange={form.setLandAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Street Width"
              value={form.landStreetWidth}
              placeholder="Select street width"
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Apartment for sale content */}
        {form.isApartmentForSale && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.apartmentSalePriceFrom}
              toValue={form.apartmentSalePriceTo}
              onFromChange={form.setApartmentSalePriceFrom}
              onToChange={form.setApartmentSalePriceTo}
            />

            <TabBarSection
              label="Bedrooms"
              options={BEDROOM_OPTIONS}
              selectedValue={form.selectedBedroom}
              onSelect={form.handleBedroomPress}
            />

            <TabBarSection
              label="Living Rooms"
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <TabBarSection
              label="WC"
              options={WC_OPTIONS}
              selectedValue={form.selectedWc}
              onSelect={form.handleWcPress}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.apartmentSaleAreaFrom}
              toValue={form.apartmentSaleAreaTo}
              onFromChange={form.setApartmentSaleAreaFrom}
              onToChange={form.setApartmentSaleAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Floor"
              value={form.floor}
              placeholder="Select floor"
              onPress={() => form.setShowFloorModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label="Age"
              value={form.age}
              placeholder="Select age"
              onPress={() => form.setShowAgeModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Car entrance", value: form.apartmentSaleCarEntrance, onValueChange: form.setApartmentSaleCarEntrance },
                { label: "Private roof", value: form.apartmentSalePrivateRoof, onValueChange: form.setApartmentSalePrivateRoof },
                { label: "Apartment in villa", value: form.apartmentSaleInVilla, onValueChange: form.setApartmentSaleInVilla },
                { label: "Two entrances", value: form.apartmentSaleTwoEntrances, onValueChange: form.setApartmentSaleTwoEntrances },
                { label: "Special entrances", value: form.apartmentSaleSpecialEntrances, onValueChange: form.setApartmentSaleSpecialEntrances },
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Building for sale content */}
        {form.isBuildingForSale && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.buildingPriceFrom}
              toValue={form.buildingPriceTo}
              onFromChange={form.setBuildingPriceFrom}
              onToChange={form.setBuildingPriceTo}
            />

            <TabBarSection
              label="Apartments"
              options={APARTMENT_OPTIONS}
              selectedValue={form.buildingApartments}
              onSelect={form.handleApartmentPress}
            />

            <TabBarSection
              options={RESIDENTIAL_COMMERCIAL_OPTIONS}
              selectedValue={form.selectedBuildingType}
              onSelect={form.handleBuildingTypePress}
            />

            <FieldWithModal
              label="Street Direction"
              value={form.buildingStreetDirection}
              placeholder="Select street direction"
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label="Stores"
              value={form.stores}
              placeholder="Select stores"
              onPress={() => form.setShowStoresModal(true)}
              backgroundColor="background"
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.buildingAreaFrom}
              toValue={form.buildingAreaTo}
              onFromChange={form.setBuildingAreaFrom}
              onToChange={form.setBuildingAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Street Width"
              value={form.streetWidth}
              placeholder="Select street width"
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label="Age"
              value={form.age}
              placeholder="Select age"
              onPress={() => form.setShowAgeModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Small house for sale content */}
        {form.isSmallHouseForSale && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.smallHousePriceFrom}
              toValue={form.smallHousePriceTo}
              onFromChange={form.setSmallHousePriceFrom}
              onToChange={form.setSmallHousePriceTo}
            />

            <TabBarSection
              label="Bedrooms"
              options={BEDROOM_OPTIONS}
              selectedValue={form.selectedBedroom}
              onSelect={form.handleBedroomPress}
            />

            <FieldWithModal
              label="Street Direction"
              value={form.smallHouseStreetDirection}
              placeholder="Select street direction"
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <TabBarSection
              label="Living room"
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.smallHouseAreaFrom}
              toValue={form.smallHouseAreaTo}
              onFromChange={form.setSmallHouseAreaFrom}
              onToChange={form.setSmallHouseAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Street Width"
              value={form.smallHouseStreetWidth}
              placeholder="Select street width"
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label="Age"
              value={form.age}
              placeholder="Select age"
              onPress={() => form.setShowAgeModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Furnished", value: form.smallHouseFurnished, onValueChange: form.setSmallHouseFurnished },
                { label: "Tent", value: form.tent, onValueChange: form.setTent },
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Lounge for sale content */}
        {form.isLoungeForSale && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.loungePriceFrom}
              toValue={form.loungePriceTo}
              onFromChange={form.setLoungePriceFrom}
              onToChange={form.setLoungePriceTo}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.loungeAreaFrom}
              toValue={form.loungeAreaTo}
              onFromChange={form.setLoungeAreaFrom}
              onToChange={form.setLoungeAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Street Width"
              value={form.loungeStreetWidth}
              placeholder="Select street width"
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label="Age"
              value={form.age}
              placeholder="Select age"
              onPress={() => form.setShowAgeModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Farm for sale content */}
        {form.isFarmForSale && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.farmPriceFrom}
              toValue={form.farmPriceTo}
              onFromChange={form.setFarmPriceFrom}
              onToChange={form.setFarmPriceTo}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.farmAreaFrom}
              toValue={form.farmAreaTo}
              onFromChange={form.setFarmAreaFrom}
              onToChange={form.setFarmAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <ToggleGroup
              toggles={[
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Store for sale content */}
        {form.isStoreForSale && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.storePriceFrom}
              toValue={form.storePriceTo}
              onFromChange={form.setStorePriceFrom}
              onToChange={form.setStorePriceTo}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.storeAreaFrom}
              toValue={form.storeAreaTo}
              onFromChange={form.setStoreAreaFrom}
              onToChange={form.setStoreAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Street Width"
              value={form.storeStreetWidth}
              placeholder="Select street width"
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Floor for sale content */}
        {form.isFloorForSale && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.floorSalePriceFrom}
              toValue={form.floorSalePriceTo}
              onFromChange={form.setFloorSalePriceFrom}
              onToChange={form.setFloorSalePriceTo}
            />

            <TabBarSection
              label="Living rooms"
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.floorSaleAreaFrom}
              toValue={form.floorSaleAreaTo}
              onFromChange={form.setFloorSaleAreaFrom}
              onToChange={form.setFloorSaleAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Floor"
              value={form.floor}
              placeholder="Select floor"
              onPress={() => form.setShowFloorModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label="Age"
              value={form.age}
              placeholder="Select age"
              onPress={() => form.setShowAgeModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Car entrance", value: form.floorSaleCarEntrance, onValueChange: form.setFloorSaleCarEntrance },
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Villa for rent content */}
        {form.isVillaForRent && (
          <VillaForRentSection
            rentPeriod={form.villaRentRentPeriod}
            onRentPeriodChange={form.handleVillaRentRentPeriodPress}
            priceFrom={form.villaRentPriceFrom}
            priceTo={form.villaRentPriceTo}
            onPriceFromChange={form.setVillaRentPriceFrom}
            onPriceToChange={form.setVillaRentPriceTo}
            selectedBedroom={form.selectedBedroom}
            onBedroomChange={form.handleBedroomPress}
            streetDirection={form.villaRentStreetDirection}
            onStreetDirectionPress={() => form.setShowStreetDirectionModal(true)}
            selectedLivingRoom={form.selectedLivingRoom}
            onLivingRoomChange={form.handleLivingRoomPress}
            selectedWc={form.selectedWc}
            onWcChange={form.handleWcPress}
            areaFrom={form.villaRentAreaFrom}
            areaTo={form.villaRentAreaTo}
            onAreaFromChange={form.setVillaRentAreaFrom}
            onAreaToChange={form.setVillaRentAreaTo}
            streetWidth={form.villaRentStreetWidth}
            onStreetWidthPress={() => form.setShowStreetWidthModal(true)}
            stairs={form.villaRentStairs}
            onStairsChange={form.setVillaRentStairs}
            age={form.age}
            onAgePress={() => form.setShowAgeModal(true)}
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

            <PriceInputSection
              label="Price"
              fromValue={form.bigFlatPriceFrom}
              toValue={form.bigFlatPriceTo}
              onFromChange={form.setBigFlatPriceFrom}
              onToChange={form.setBigFlatPriceTo}
            />

            <TabBarSection
              label="Bedrooms"
              options={BEDROOM_OPTIONS}
              selectedValue={form.selectedBedroom}
              onSelect={form.handleBedroomPress}
            />

            <TabBarSection
              label="Living Rooms"
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <TabBarSection
              label="WC"
              options={WC_OPTIONS}
              selectedValue={form.selectedWc}
              onSelect={form.handleWcPress}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.bigFlatAreaFrom}
              toValue={form.bigFlatAreaTo}
              onFromChange={form.setBigFlatAreaFrom}
              onToChange={form.setBigFlatAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Floor"
              value={form.floor}
              placeholder="Select floor"
              onPress={() => form.setShowFloorModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label="Age"
              value={form.age}
              placeholder="Select age"
              onPress={() => form.setShowAgeModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Car entrance", value: form.bigFlatCarEntrance, onValueChange: form.setBigFlatCarEntrance },
                { label: "Air conditioned", value: form.bigFlatAirConditioned, onValueChange: form.setBigFlatAirConditioned },
                { label: "Apartment in villa", value: form.bigFlatInVilla, onValueChange: form.setBigFlatInVilla },
                { label: "Two entrances", value: form.bigFlatTwoEntrances, onValueChange: form.setBigFlatTwoEntrances },
                { label: "Special entrances", value: form.bigFlatSpecialEntrances, onValueChange: form.setBigFlatSpecialEntrances },
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
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

            <PriceInputSection
              label="Price"
              fromValue={form.loungeRentPriceFrom}
              toValue={form.loungeRentPriceTo}
              onFromChange={form.setLoungeRentPriceFrom}
              onToChange={form.setLoungeRentPriceTo}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.loungeRentAreaFrom}
              toValue={form.loungeRentAreaTo}
              onFromChange={form.setLoungeRentAreaFrom}
              onToChange={form.setLoungeRentAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <ToggleGroup
              toggles={[
                { label: "Pool", value: form.loungeRentPool, onValueChange: form.setLoungeRentPool },
                { label: "Football pitch", value: form.footballPitch, onValueChange: form.setFootballPitch },
                { label: "Volleyball Court", value: form.volleyballCourt, onValueChange: form.setVolleyballCourt },
                { label: "Tent", value: form.loungeRentTent, onValueChange: form.setLoungeRentTent },
                { label: "Kitchen", value: form.loungeRentKitchen, onValueChange: form.setLoungeRentKitchen },
                { label: "Playground", value: form.playground, onValueChange: form.setPlayground },
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
                { label: "Family section", value: form.familySection, onValueChange: form.setFamilySection },
              ]}
            />
          </>
        )}

        {/* Small house for rent content */}
        {form.isSmallHouseForRent && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.smallHouseRentPriceFrom}
              toValue={form.smallHouseRentPriceTo}
              onFromChange={form.setSmallHouseRentPriceFrom}
              onToChange={form.setSmallHouseRentPriceTo}
            />

            <TabBarSection
              label="Bedrooms"
              options={BEDROOM_OPTIONS}
              selectedValue={form.selectedBedroom}
              onSelect={form.handleBedroomPress}
            />

            <FieldWithModal
              label="Street Direction"
              value={form.smallHouseRentStreetDirection}
              placeholder="Select street direction"
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <TabBarSection
              label="Living room"
              options={LIVING_ROOM_OPTIONS}
              selectedValue={form.selectedLivingRoom}
              onSelect={form.handleLivingRoomPress}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.smallHouseRentAreaFrom}
              toValue={form.smallHouseRentAreaTo}
              onFromChange={form.setSmallHouseRentAreaFrom}
              onToChange={form.setSmallHouseRentAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Street Width"
              value={form.smallHouseRentStreetWidth}
              placeholder="Select street width"
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label="Age"
              value={form.age}
              placeholder="Select age"
              onPress={() => form.setShowAgeModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Furnished", value: form.smallHouseRentFurnished, onValueChange: form.setSmallHouseRentFurnished },
                { label: "Tent", value: form.smallHouseRentTent, onValueChange: form.setSmallHouseRentTent },
                { label: "Kitchen", value: form.smallHouseRentKitchen, onValueChange: form.setSmallHouseRentKitchen },
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Store for rent content */}
        {form.isStoreForRent && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.storeRentPriceFrom}
              toValue={form.storeRentPriceTo}
              onFromChange={form.setStoreRentPriceFrom}
              onToChange={form.setStoreRentPriceTo}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.storeRentAreaFrom}
              toValue={form.storeRentAreaTo}
              onFromChange={form.setStoreRentAreaFrom}
              onToChange={form.setStoreRentAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Street Width"
              value={form.storeRentStreetWidth}
              placeholder="Select street width"
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Building for rent content */}
        {form.isBuildingForRent && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.buildingRentPriceFrom}
              toValue={form.buildingRentPriceTo}
              onFromChange={form.setBuildingRentPriceFrom}
              onToChange={form.setBuildingRentPriceTo}
            />

            <TabBarSection
              label="Apartments"
              options={APARTMENT_OPTIONS}
              selectedValue={form.buildingRentApartments}
              onSelect={form.handleApartmentPress}
            />

            <TabBarSection
              options={RESIDENTIAL_COMMERCIAL_OPTIONS}
              selectedValue={form.selectedBuildingRentType}
              onSelect={form.handleBuildingRentTypePress}
            />

            <FieldWithModal
              label="Street Direction"
              value={form.buildingRentStreetDirection}
              placeholder="Select street direction"
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label="Stores"
              value={form.buildingRentStores}
              placeholder="Select stores"
              onPress={() => form.setShowStoresModal(true)}
              backgroundColor="background"
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.buildingRentAreaFrom}
              toValue={form.buildingRentAreaTo}
              onFromChange={form.setBuildingRentAreaFrom}
              onToChange={form.setBuildingRentAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Street Width"
              value={form.buildingRentStreetWidth}
              placeholder="Select street width"
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <FieldWithModal
              label="Age"
              value={form.age}
              placeholder="Select age"
              onPress={() => form.setShowAgeModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Land for rent content */}
        {form.isLandForRent && (
          <>
            <TabBarSection
              options={RESIDENTIAL_COMMERCIAL_OPTIONS}
              selectedValue={form.selectedLandRentType}
              onSelect={form.handleLandRentTypePress}
            />

            <FieldWithModal
              label="Street Direction"
              value={form.landRentStreetDirection}
              placeholder="Select street direction"
              onPress={() => form.setShowStreetDirectionModal(true)}
              backgroundColor="background"
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.landRentAreaFrom}
              toValue={form.landRentAreaTo}
              onFromChange={form.setLandRentAreaFrom}
              onToChange={form.setLandRentAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Street Width"
              value={form.landRentStreetWidth}
              placeholder="Select street width"
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
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

            <PriceInputSection
              label="Price"
              fromValue={form.roomRentPriceFrom}
              toValue={form.roomRentPriceTo}
              onFromChange={form.setRoomRentPriceFrom}
              onToChange={form.setRoomRentPriceTo}
            />

            <ToggleGroup
              toggles={[
                { label: "Kitchen", value: form.roomRentKitchen, onValueChange: form.setRoomRentKitchen },
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}

        {/* Office for rent content */}
        {form.isOfficeForRent && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.officeRentPriceFrom}
              toValue={form.officeRentPriceTo}
              onFromChange={form.setOfficeRentPriceFrom}
              onToChange={form.setOfficeRentPriceTo}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.officeRentAreaFrom}
              toValue={form.officeRentAreaTo}
              onFromChange={form.setOfficeRentAreaFrom}
              onToChange={form.setOfficeRentAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Street Width"
              value={form.officeRentStreetWidth}
              placeholder="Select street width"
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Furnished", value: form.officeRentFurnished, onValueChange: form.setOfficeRentFurnished },
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
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

            <ToggleGroup
              toggles={[
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
                { label: "Family section", value: form.familySection, onValueChange: form.setFamilySection },
              ]}
            />
          </>
        )}

        {/* Warehouse for rent content */}
        {form.isWarehouseForRent && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.warehouseRentPriceFrom}
              toValue={form.warehouseRentPriceTo}
              onFromChange={form.setWarehouseRentPriceFrom}
              onToChange={form.setWarehouseRentPriceTo}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.warehouseRentAreaFrom}
              toValue={form.warehouseRentAreaTo}
              onFromChange={form.setWarehouseRentAreaFrom}
              onToChange={form.setWarehouseRentAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <FieldWithModal
              label="Street Width"
              value={form.warehouseRentStreetWidth}
              placeholder="Select street width"
              onPress={() => form.setShowStreetWidthModal(true)}
              backgroundColor="background"
            />

            <ToggleGroup
              toggles={[
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
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

            <PriceInputSection
              label="Price"
              fromValue={form.chaletRentPriceFrom}
              toValue={form.chaletRentPriceTo}
              onFromChange={form.setChaletRentPriceFrom}
              onToChange={form.setChaletRentPriceTo}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.chaletRentAreaFrom}
              toValue={form.chaletRentAreaTo}
              onFromChange={form.setChaletRentAreaFrom}
              onToChange={form.setChaletRentAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <ToggleGroup
              toggles={[
                { label: "Pool", value: form.chaletRentPool, onValueChange: form.setChaletRentPool },
                { label: "Football pitch", value: form.chaletFootballPitch, onValueChange: form.setChaletFootballPitch },
                { label: "Volleyball Court", value: form.chaletVolleyballCourt, onValueChange: form.setChaletVolleyballCourt },
                { label: "Tent", value: form.chaletRentTent, onValueChange: form.setChaletRentTent },
                { label: "Kitchen", value: form.chaletRentKitchen, onValueChange: form.setChaletRentKitchen },
                { label: "Playground", value: form.chaletPlayground, onValueChange: form.setChaletPlayground },
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
                { label: "Family section", value: form.familySection, onValueChange: form.setFamilySection },
              ]}
            />
          </>
        )}

        {/* Other category content */}
        {form.isOther && (
          <>
            <PriceInputSection
              label="Price"
              fromValue={form.otherPriceFrom}
              toValue={form.otherPriceTo}
              onFromChange={form.setOtherPriceFrom}
              onToChange={form.setOtherPriceTo}
            />

            <PriceInputSection
              label="Area (m²)"
              fromValue={form.otherAreaFrom}
              toValue={form.otherAreaTo}
              onFromChange={form.setOtherAreaFrom}
              onToChange={form.setOtherAreaTo}
              fromPlaceholder="From area"
              toPlaceholder="To area"
            />

            <ToggleGroup
              toggles={[
                { label: "Near bus", value: form.nearBus, onValueChange: form.setNearBus },
                { label: "Near metro", value: form.nearMetro, onValueChange: form.setNearMetro },
              ]}
            />
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <ListingFooter
        currentStep={1}
        totalSteps={3}
        onBackPress={handleBackPress}
        onNextPress={handleNextPress}
        showBack={true}
        showNext={true}
      />

      {/* Modals */}
      <WheelPickerModal
        visible={form.showCategoryModal}
        onClose={() => form.setShowCategoryModal(false)}
        onSelect={form.handleCategorySelect}
        title="Select Category"
        options={CATEGORY_OPTIONS}
        initialValue={form.category}
      />

      <WheelPickerModal
        visible={form.showFloorModal}
        onClose={() => form.setShowFloorModal(false)}
        onSelect={form.handleFloorSelect}
        title="Select Floor"
        options={FLOOR_OPTIONS}
        initialValue={form.floor}
      />

      <WheelPickerModal
        visible={form.showAgeModal}
        onClose={() => form.setShowAgeModal(false)}
        onSelect={form.handleAgeSelect}
        title="Select Age"
        options={AGE_OPTIONS}
        initialValue={form.age}
      />

      <WheelPickerModal
        visible={form.showStreetDirectionModal}
        onClose={() => form.setShowStreetDirectionModal(false)}
        onSelect={form.handleStreetDirectionSelect}
        title="Select Street Direction"
        options={STREET_DIRECTION_OPTIONS}
        initialValue={
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
            : ""
        }
      />

      <WheelPickerModal
        visible={form.showStreetWidthModal}
        onClose={() => form.setShowStreetWidthModal(false)}
        onSelect={form.handleStreetWidthSelect}
        title="Select Street Width"
        options={STREET_WIDTH_OPTIONS}
        initialValue={
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
            : ""
        }
      />

      <WheelPickerModal
        visible={form.showStoresModal}
        onClose={() => form.setShowStoresModal(false)}
        onSelect={(value: string) => {
          if (form.isBuildingForSale) {
            form.handleStoresSelect(value);
          } else if (form.isBuildingForRent) {
            form.handleBuildingRentStoresSelect(value);
          }
        }}
        title="Select Stores"
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
    // paddingBottom: hp(15),
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
