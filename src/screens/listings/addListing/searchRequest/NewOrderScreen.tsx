import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
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
  PriceInputSection,
  TabBarSection,
  ToggleRow,
  FieldWithModal,
  ToggleGroup,
} from "../../../../components";
import { VillaForRentSection } from "../../../../components/orderForm/sections";
import { ApartmentForRentOrderSection } from "../../../../components/searchRequest/sections/ApartmentForRentOrderSection";
import { VillaForSaleOrderSection } from "../../../../components/searchRequest/sections/VillaForSaleOrderSection";
import { LandForSaleOrderSection } from "../../../../components/searchRequest/sections/LandForSaleOrderSection";
import { ApartmentForSaleOrderSection } from "../../../../components/searchRequest/sections/ApartmentForSaleOrderSection";
import { BuildingForSaleOrderSection } from "../../../../components/searchRequest/sections/BuildingForSaleOrderSection";
import { BigFlatForRentOrderSection } from "../../../../components/searchRequest/sections/BigFlatForRentOrderSection";
import { LoungeForRentOrderSection } from "../../../../components/searchRequest/sections/LoungeForRentOrderSection";
import { SmallHouseForSaleOrderSection } from "../../../../components/searchRequest/sections/SmallHouseForSaleOrderSection";
import { StoreForRentOrderSection } from "../../../../components/searchRequest/sections/StoreForRentOrderSection";
import { LandForRentOrderSection } from "../../../../components/searchRequest/sections/LandForRentOrderSection";
import { LoungeForSaleOrderSection } from "../../../../components/searchRequest/sections/LoungeForSaleOrderSection";
import { FarmForSaleOrderSection } from "../../../../components/searchRequest/sections/FarmForSaleOrderSection";
import { StoreForSaleOrderSection } from "../../../../components/searchRequest/sections/StoreForSaleOrderSection";
import { FloorForSaleOrderSection } from "../../../../components/searchRequest/sections/FloorForSaleOrderSection";
import { RoomForRentOrderSection } from "../../../../components/searchRequest/sections/RoomForRentOrderSection";
import { OfficeForRentOrderSection } from "../../../../components/searchRequest/sections/OfficeForRentOrderSection";
import { TentForRentOrderSection } from "../../../../components/searchRequest/sections/TentForRentOrderSection";
import { WarehouseForRentOrderSection } from "../../../../components/searchRequest/sections/WarehouseForRentOrderSection";
import { SmallHouseForRentOrderSection } from "../../../../components/searchRequest/sections/SmallHouseForRentOrderSection";
import { BuildingForRentOrderSection } from "../../../../components/searchRequest/sections/BuildingForRentOrderSection";
import { ChaletForRentOrderSection } from "../../../../components/searchRequest/sections/ChaletForRentOrderSection";
import SearchRequestOrderModals from "../../../../components/searchRequest/SearchRequestOrderModals";
import { COLORS } from "@/constants";
import {
} from "@/constants/categories";
import {
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
  WC_OPTIONS,
} from "@/constants/orderFormOptions";
import { buildSearchRequestOrderFormData } from "@/utils/searchRequestOrderFormData";
import { useSearchRequestOrderTranslations } from "./useSearchRequestOrderTranslations";
import { useSearchRequestOrderContainer } from "./useSearchRequestOrderContainer";

type NavigationProp = NativeStackNavigationProp<any>;

export default function NewOrderScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLocalization();
  
  const form = useOrderForm();

  const {
    categoryOptions,
    categoryTranslationMap,
    getTranslatedCategoryValue,
    translatedStreetDirectionOptions,
    translatedFloorOptions,
    translatedAgeOptions,
    translatedStreetWidthOptions,
    streetDirectionReverseMap,
    floorReverseMap,
    ageReverseMap,
    streetWidthReverseMap,
    getTranslatedInitialValue,
    getTranslatedPickerValue,
    translatedVillaTypeOptions,
    villaTypeReverseMap,
    translatedResidentialCommercialOptions,
    residentialCommercialReverseMap,
  } = useSearchRequestOrderTranslations(t);
  const {
    openCategoryModal,
    openFloorModal,
    openAgeModal,
    openStreetDirectionModal,
    openStreetWidthModal,
    openStoresModal,
    streetDirectionModalValue,
    streetWidthModalValue,
  } = useSearchRequestOrderContainer({ form });

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNextPress = () => {
    const orderFormData = buildSearchRequestOrderFormData(form);
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
          <ApartmentForRentOrderSection
            t={t}
            rentPeriod={form.rentPeriod}
            apartmentRentTenant={form.apartmentRentTenant}
            selectedBedroom={form.selectedBedroom}
            selectedLivingRoom={form.selectedLivingRoom}
            selectedWc={form.selectedWc}
            floor={form.floor}
            age={form.age}
            furnished={form.furnished}
            carEntrance={form.carEntrance}
            airConditioned={form.airConditioned}
            privateRoof={form.privateRoof}
            apartmentInVilla={form.apartmentInVilla}
            twoEntrances={form.twoEntrances}
            specialEntrances={form.specialEntrances}
            fromPrice={form.fromPrice}
            toPrice={form.toPrice}
            priceFrom={form.priceFrom}
            priceTo={form.priceTo}
            showYearlyContent={form.showYearlyContent}
            showPriceSection={form.showPriceSection}
            priceLabel={form.priceLabel}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onRentPeriodSelect={form.handleRentPeriodPress}
            onApartmentRentTenantSelect={form.handleApartmentRentTenantPress}
            onFromPriceChange={form.setFromPrice}
            onToPriceChange={form.setToPrice}
            onPriceFromChange={form.setPriceFrom}
            onPriceToChange={form.setPriceTo}
            onBedroomSelect={form.handleBedroomPress}
            onLivingRoomSelect={form.handleLivingRoomPress}
            onWcSelect={form.handleWcPress}
            onOpenFloor={openFloorModal}
            onOpenAge={openAgeModal}
            onFurnishedChange={form.setFurnished}
            onCarEntranceChange={form.setCarEntrance}
            onAirConditionedChange={form.setAirConditioned}
            onPrivateRoofChange={form.setPrivateRoof}
            onApartmentInVillaChange={form.setApartmentInVilla}
            onTwoEntrancesChange={form.setTwoEntrances}
            onSpecialEntrancesChange={form.setSpecialEntrances}
          />
        )}

        {/* Villa for sale content */}
        {form.isVillaForSale && (
          <VillaForSaleOrderSection
            t={t}
            translatedVillaTypeOptions={translatedVillaTypeOptions}
            selectedVillaType={getTranslatedInitialValue(form.selectedVillaType, villaTypeReverseMap, translatedVillaTypeOptions)}
            selectedApartment={form.selectedApartment}
            selectedBedroom={form.selectedBedroom}
            selectedLivingRoom={form.selectedLivingRoom}
            selectedWc={form.selectedWc}
            streetDirection={form.streetDirection}
            streetWidth={form.streetWidth}
            age={form.age}
            areaFrom={form.areaFrom}
            areaTo={form.areaTo}
            priceFrom={form.villaPriceFrom}
            priceTo={form.villaPriceTo}
            stairs={form.stairs}
            driverRoom={form.driverRoom}
            maidRoom={form.maidRoom}
            pool={form.pool}
            villaFurnished={form.villaFurnished}
            kitchen={form.kitchen}
            villaCarEntrance={form.villaCarEntrance}
            basement={form.basement}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onApartmentSelect={form.handleApartmentPress}
            onBedroomSelect={form.handleBedroomPress}
            onLivingRoomSelect={form.handleLivingRoomPress}
            onWcSelect={form.handleWcPress}
            onOpenStreetDirection={openStreetDirectionModal}
            onOpenStreetWidth={openStreetWidthModal}
            onOpenAge={openAgeModal}
            onPriceFromChange={form.setVillaPriceFrom}
            onPriceToChange={form.setVillaPriceTo}
            onAreaFromChange={form.setAreaFrom}
            onAreaToChange={form.setAreaTo}
            onVillaTypeSelect={(translatedValue: string) => {
                const originalValue = villaTypeReverseMap[translatedValue] || translatedValue;
                form.handleVillaTypePress(originalValue);
              }}
            onStairsChange={form.setStairs}
            onDriverRoomChange={form.setDriverRoom}
            onMaidRoomChange={form.setMaidRoom}
            onPoolChange={form.setPool}
            onVillaFurnishedChange={form.setVillaFurnished}
            onKitchenChange={form.setKitchen}
            onVillaCarEntranceChange={form.setVillaCarEntrance}
            onBasementChange={form.setBasement}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Land for sale content */}
        {form.isLandForSale && (
          <LandForSaleOrderSection
            t={t}
            translatedResidentialCommercialOptions={translatedResidentialCommercialOptions}
            selectedLandType={getTranslatedInitialValue(
              form.selectedLandType,
              residentialCommercialReverseMap,
              translatedResidentialCommercialOptions
            )}
            getTranslatedPickerValue={getTranslatedPickerValue}
            landStreetDirection={form.landStreetDirection}
            landStreetWidth={form.landStreetWidth}
            landPriceFrom={form.landPriceFrom}
            landPriceTo={form.landPriceTo}
            landAreaFrom={form.landAreaFrom}
            landAreaTo={form.landAreaTo}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            onLandTypeSelect={(translatedValue: string) => {
              const originalValue =
                residentialCommercialReverseMap[translatedValue] || translatedValue;
                form.handleLandTypePress(originalValue);
              }}
            onOpenStreetDirection={openStreetDirectionModal}
            onOpenStreetWidth={openStreetWidthModal}
            onLandPriceFromChange={form.setLandPriceFrom}
            onLandPriceToChange={form.setLandPriceTo}
            onLandAreaFromChange={form.setLandAreaFrom}
            onLandAreaToChange={form.setLandAreaTo}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Apartment for sale content */}
        {form.isApartmentForSale && (
          <ApartmentForSaleOrderSection
            t={t}
            selectedBedroom={form.selectedBedroom}
            selectedLivingRoom={form.selectedLivingRoom}
            selectedWc={form.selectedWc}
            floor={form.floor}
            age={form.age}
            priceFrom={form.apartmentSalePriceFrom}
            priceTo={form.apartmentSalePriceTo}
            areaFrom={form.apartmentSaleAreaFrom}
            areaTo={form.apartmentSaleAreaTo}
            carEntrance={form.apartmentSaleCarEntrance}
            privateRoof={form.apartmentSalePrivateRoof}
            apartmentInVilla={form.apartmentSaleInVilla}
            twoEntrances={form.apartmentSaleTwoEntrances}
            specialEntrances={form.apartmentSaleSpecialEntrances}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onBedroomSelect={form.handleBedroomPress}
            onLivingRoomSelect={form.handleLivingRoomPress}
            onWcSelect={form.handleWcPress}
            onOpenFloor={openFloorModal}
            onOpenAge={openAgeModal}
            onPriceFromChange={form.setApartmentSalePriceFrom}
            onPriceToChange={form.setApartmentSalePriceTo}
            onAreaFromChange={form.setApartmentSaleAreaFrom}
            onAreaToChange={form.setApartmentSaleAreaTo}
            onCarEntranceChange={form.setApartmentSaleCarEntrance}
            onPrivateRoofChange={form.setApartmentSalePrivateRoof}
            onApartmentInVillaChange={form.setApartmentSaleInVilla}
            onTwoEntrancesChange={form.setApartmentSaleTwoEntrances}
            onSpecialEntrancesChange={form.setApartmentSaleSpecialEntrances}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Building for sale content */}
        {form.isBuildingForSale && (
          <BuildingForSaleOrderSection
            t={t}
            translatedResidentialCommercialOptions={translatedResidentialCommercialOptions}
            buildingPriceFrom={form.buildingPriceFrom}
            buildingPriceTo={form.buildingPriceTo}
            buildingApartments={form.buildingApartments}
            selectedBuildingType={getTranslatedInitialValue(
              form.selectedBuildingType,
              residentialCommercialReverseMap,
              translatedResidentialCommercialOptions
            )}
            buildingStreetDirection={form.buildingStreetDirection}
            stores={form.stores}
            buildingAreaFrom={form.buildingAreaFrom}
            buildingAreaTo={form.buildingAreaTo}
            streetWidth={form.streetWidth}
            age={form.age}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onBuildingPriceFromChange={form.setBuildingPriceFrom}
            onBuildingPriceToChange={form.setBuildingPriceTo}
            onBuildingApartmentsSelect={form.handleBuildingApartmentsPress}
            onBuildingTypeSelect={(translatedValue: string) => {
              const originalValue =
                residentialCommercialReverseMap[translatedValue] || translatedValue;
                form.handleBuildingTypePress(originalValue);
              }}
            onOpenStreetDirection={openStreetDirectionModal}
            onOpenStores={openStoresModal}
            onBuildingAreaFromChange={form.setBuildingAreaFrom}
            onBuildingAreaToChange={form.setBuildingAreaTo}
            onOpenStreetWidth={openStreetWidthModal}
            onOpenAge={openAgeModal}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Small house for sale content */}
        {form.isSmallHouseForSale && (
          <SmallHouseForSaleOrderSection
            t={t}
            selectedBedroom={form.selectedBedroom}
            selectedLivingRoom={form.selectedLivingRoom}
            smallHouseStreetDirection={form.smallHouseStreetDirection}
            smallHouseStreetWidth={form.smallHouseStreetWidth}
            age={form.age}
            smallHousePriceFrom={form.smallHousePriceFrom}
            smallHousePriceTo={form.smallHousePriceTo}
            smallHouseAreaFrom={form.smallHouseAreaFrom}
            smallHouseAreaTo={form.smallHouseAreaTo}
            smallHouseFurnished={form.smallHouseFurnished}
            tent={form.tent}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onBedroomSelect={form.handleBedroomPress}
            onLivingRoomSelect={form.handleLivingRoomPress}
            onOpenStreetDirection={openStreetDirectionModal}
            onOpenStreetWidth={openStreetWidthModal}
            onOpenAge={openAgeModal}
            onPriceFromChange={form.setSmallHousePriceFrom}
            onPriceToChange={form.setSmallHousePriceTo}
            onAreaFromChange={form.setSmallHouseAreaFrom}
            onAreaToChange={form.setSmallHouseAreaTo}
            onFurnishedChange={form.setSmallHouseFurnished}
            onTentChange={form.setTent}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Lounge for sale content */}
        {form.isLoungeForSale && (
          <LoungeForSaleOrderSection
            t={t}
            loungePriceFrom={form.loungePriceFrom}
            loungePriceTo={form.loungePriceTo}
            loungeAreaFrom={form.loungeAreaFrom}
            loungeAreaTo={form.loungeAreaTo}
            loungeStreetWidth={form.loungeStreetWidth}
            age={form.age}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onPriceFromChange={form.setLoungePriceFrom}
            onPriceToChange={form.setLoungePriceTo}
            onAreaFromChange={form.setLoungeAreaFrom}
            onAreaToChange={form.setLoungeAreaTo}
            onOpenStreetWidth={openStreetWidthModal}
            onOpenAge={openAgeModal}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Farm for sale content */}
        {form.isFarmForSale && (
          <FarmForSaleOrderSection
            t={t}
            farmPriceFrom={form.farmPriceFrom}
            farmPriceTo={form.farmPriceTo}
            farmAreaFrom={form.farmAreaFrom}
            farmAreaTo={form.farmAreaTo}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            onPriceFromChange={form.setFarmPriceFrom}
            onPriceToChange={form.setFarmPriceTo}
            onAreaFromChange={form.setFarmAreaFrom}
            onAreaToChange={form.setFarmAreaTo}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Store for sale content */}
        {form.isStoreForSale && (
          <StoreForSaleOrderSection
            t={t}
            storePriceFrom={form.storePriceFrom}
            storePriceTo={form.storePriceTo}
            storeAreaFrom={form.storeAreaFrom}
            storeAreaTo={form.storeAreaTo}
            storeStreetWidth={form.storeStreetWidth}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onPriceFromChange={form.setStorePriceFrom}
            onPriceToChange={form.setStorePriceTo}
            onAreaFromChange={form.setStoreAreaFrom}
            onAreaToChange={form.setStoreAreaTo}
            onOpenStreetWidth={openStreetWidthModal}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Floor for sale content */}
        {form.isFloorForSale && (
          <FloorForSaleOrderSection
            t={t}
            selectedLivingRoom={form.selectedLivingRoom}
            floor={form.floor}
            age={form.age}
            floorSalePriceFrom={form.floorSalePriceFrom}
            floorSalePriceTo={form.floorSalePriceTo}
            floorSaleAreaFrom={form.floorSaleAreaFrom}
            floorSaleAreaTo={form.floorSaleAreaTo}
            floorSaleCarEntrance={form.floorSaleCarEntrance}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onLivingRoomSelect={form.handleLivingRoomPress}
            onOpenFloor={openFloorModal}
            onOpenAge={openAgeModal}
            onPriceFromChange={form.setFloorSalePriceFrom}
            onPriceToChange={form.setFloorSalePriceTo}
            onAreaFromChange={form.setFloorSaleAreaFrom}
            onAreaToChange={form.setFloorSaleAreaTo}
            onCarEntranceChange={form.setFloorSaleCarEntrance}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
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
            streetDirection={getTranslatedPickerValue(form.villaRentStreetDirection, "streetDirection")}
            onStreetDirectionPress={openStreetDirectionModal}
            selectedLivingRoom={form.selectedLivingRoom}
            onLivingRoomChange={form.handleLivingRoomPress}
            selectedWc={form.selectedWc}
            onWcChange={form.handleWcPress}
            areaFrom={form.villaRentAreaFrom}
            areaTo={form.villaRentAreaTo}
            onAreaFromChange={form.setVillaRentAreaFrom}
            onAreaToChange={form.setVillaRentAreaTo}
            streetWidth={getTranslatedPickerValue(form.villaRentStreetWidth, "streetWidth")}
            onStreetWidthPress={openStreetWidthModal}
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
          <BigFlatForRentOrderSection
            t={t}
            rentPeriod={form.bigFlatRentPeriod}
            selectedBedroom={form.selectedBedroom}
            selectedLivingRoom={form.selectedLivingRoom}
            selectedWc={form.selectedWc}
            floor={form.floor}
            age={form.age}
            priceFrom={form.bigFlatPriceFrom}
            priceTo={form.bigFlatPriceTo}
            areaFrom={form.bigFlatAreaFrom}
            areaTo={form.bigFlatAreaTo}
            carEntrance={form.bigFlatCarEntrance}
            airConditioned={form.bigFlatAirConditioned}
            apartmentInVilla={form.bigFlatInVilla}
            twoEntrances={form.bigFlatTwoEntrances}
            specialEntrances={form.bigFlatSpecialEntrances}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onRentPeriodSelect={form.handleBigFlatRentPeriodPress}
            onBedroomSelect={form.handleBedroomPress}
            onLivingRoomSelect={form.handleLivingRoomPress}
            onWcSelect={form.handleWcPress}
            onOpenFloor={openFloorModal}
            onOpenAge={openAgeModal}
            onPriceFromChange={form.setBigFlatPriceFrom}
            onPriceToChange={form.setBigFlatPriceTo}
            onAreaFromChange={form.setBigFlatAreaFrom}
            onAreaToChange={form.setBigFlatAreaTo}
            onCarEntranceChange={form.setBigFlatCarEntrance}
            onAirConditionedChange={form.setBigFlatAirConditioned}
            onApartmentInVillaChange={form.setBigFlatInVilla}
            onTwoEntrancesChange={form.setBigFlatTwoEntrances}
            onSpecialEntrancesChange={form.setBigFlatSpecialEntrances}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Lounge for rent content */}
        {form.isLoungeForRent && (
          <LoungeForRentOrderSection
            t={t}
            rentPeriod={form.loungeRentRentPeriod}
            priceFrom={form.loungeRentPriceFrom}
            priceTo={form.loungeRentPriceTo}
            areaFrom={form.loungeRentAreaFrom}
            areaTo={form.loungeRentAreaTo}
            pool={form.loungeRentPool}
            footballPitch={form.footballPitch}
            volleyballCourt={form.volleyballCourt}
            tent={form.loungeRentTent}
            kitchen={form.loungeRentKitchen}
            playground={form.playground}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            familySection={form.familySection}
            onRentPeriodSelect={form.handleLoungeRentRentPeriodPress}
            onPriceFromChange={form.setLoungeRentPriceFrom}
            onPriceToChange={form.setLoungeRentPriceTo}
            onAreaFromChange={form.setLoungeRentAreaFrom}
            onAreaToChange={form.setLoungeRentAreaTo}
            onPoolChange={form.setLoungeRentPool}
            onFootballPitchChange={form.setFootballPitch}
            onVolleyballCourtChange={form.setVolleyballCourt}
            onTentChange={form.setLoungeRentTent}
            onKitchenChange={form.setLoungeRentKitchen}
            onPlaygroundChange={form.setPlayground}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
            onFamilySectionChange={form.setFamilySection}
          />
        )}

        {/* Small house for rent content */}
        {form.isSmallHouseForRent && (
          <SmallHouseForRentOrderSection
            t={t}
            selectedBedroom={form.selectedBedroom}
            selectedLivingRoom={form.selectedLivingRoom}
            smallHouseRentStreetDirection={form.smallHouseRentStreetDirection}
            smallHouseRentStreetWidth={form.smallHouseRentStreetWidth}
            age={form.age}
            smallHouseRentPriceFrom={form.smallHouseRentPriceFrom}
            smallHouseRentPriceTo={form.smallHouseRentPriceTo}
            smallHouseRentAreaFrom={form.smallHouseRentAreaFrom}
            smallHouseRentAreaTo={form.smallHouseRentAreaTo}
            smallHouseRentFurnished={form.smallHouseRentFurnished}
            smallHouseRentTent={form.smallHouseRentTent}
            smallHouseRentKitchen={form.smallHouseRentKitchen}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onBedroomSelect={form.handleBedroomPress}
            onLivingRoomSelect={form.handleLivingRoomPress}
            onOpenStreetDirection={openStreetDirectionModal}
            onOpenStreetWidth={openStreetWidthModal}
            onOpenAge={openAgeModal}
            onPriceFromChange={form.setSmallHouseRentPriceFrom}
            onPriceToChange={form.setSmallHouseRentPriceTo}
            onAreaFromChange={form.setSmallHouseRentAreaFrom}
            onAreaToChange={form.setSmallHouseRentAreaTo}
            onFurnishedChange={form.setSmallHouseRentFurnished}
            onTentChange={form.setSmallHouseRentTent}
            onKitchenChange={form.setSmallHouseRentKitchen}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Store for rent content */}
        {form.isStoreForRent && (
          <StoreForRentOrderSection
            t={t}
            storeRentPriceFrom={form.storeRentPriceFrom}
            storeRentPriceTo={form.storeRentPriceTo}
            storeRentAreaFrom={form.storeRentAreaFrom}
            storeRentAreaTo={form.storeRentAreaTo}
            storeRentStreetWidth={form.storeRentStreetWidth}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onPriceFromChange={form.setStoreRentPriceFrom}
            onPriceToChange={form.setStoreRentPriceTo}
            onAreaFromChange={form.setStoreRentAreaFrom}
            onAreaToChange={form.setStoreRentAreaTo}
            onOpenStreetWidth={openStreetWidthModal}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Building for rent content */}
        {form.isBuildingForRent && (
          <BuildingForRentOrderSection
            t={t}
            translatedResidentialCommercialOptions={translatedResidentialCommercialOptions}
            buildingRentPriceFrom={form.buildingRentPriceFrom}
            buildingRentPriceTo={form.buildingRentPriceTo}
            buildingRentApartments={form.buildingRentApartments}
            selectedBuildingRentType={getTranslatedInitialValue(
              form.selectedBuildingRentType,
              residentialCommercialReverseMap,
              translatedResidentialCommercialOptions
            )}
            buildingRentStreetDirection={form.buildingRentStreetDirection}
            buildingRentStores={form.buildingRentStores}
            buildingRentAreaFrom={form.buildingRentAreaFrom}
            buildingRentAreaTo={form.buildingRentAreaTo}
            buildingRentStreetWidth={form.buildingRentStreetWidth}
            age={form.age}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onPriceFromChange={form.setBuildingRentPriceFrom}
            onPriceToChange={form.setBuildingRentPriceTo}
            onApartmentsSelect={form.handleBuildingRentApartmentsPress}
            onTypeSelect={(translatedValue: string) => {
              const originalValue =
                residentialCommercialReverseMap[translatedValue] || translatedValue;
                form.handleBuildingRentTypePress(originalValue);
              }}
            onOpenStreetDirection={openStreetDirectionModal}
            onOpenStores={openStoresModal}
            onAreaFromChange={form.setBuildingRentAreaFrom}
            onAreaToChange={form.setBuildingRentAreaTo}
            onOpenStreetWidth={openStreetWidthModal}
            onOpenAge={openAgeModal}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Land for rent content */}
        {form.isLandForRent && (
          <LandForRentOrderSection
            t={t}
            translatedResidentialCommercialOptions={translatedResidentialCommercialOptions}
            selectedLandRentType={getTranslatedInitialValue(form.selectedLandRentType, residentialCommercialReverseMap, translatedResidentialCommercialOptions)}
            landRentStreetDirection={form.landRentStreetDirection}
            landRentAreaFrom={form.landRentAreaFrom}
            landRentAreaTo={form.landRentAreaTo}
            landRentStreetWidth={form.landRentStreetWidth}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onLandRentTypeSelect={(translatedValue: string) => {
                const originalValue = residentialCommercialReverseMap[translatedValue] || translatedValue;
                form.handleLandRentTypePress(originalValue);
              }}
            onOpenStreetDirection={openStreetDirectionModal}
            onAreaFromChange={form.setLandRentAreaFrom}
            onAreaToChange={form.setLandRentAreaTo}
            onOpenStreetWidth={openStreetWidthModal}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Room for rent content */}
        {form.isRoomForRent && (
          <RoomForRentOrderSection
            t={t}
            roomRentRentPeriod={form.roomRentRentPeriod}
            roomRentPriceFrom={form.roomRentPriceFrom}
            roomRentPriceTo={form.roomRentPriceTo}
            roomRentKitchen={form.roomRentKitchen}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            onRentPeriodSelect={form.handleRoomRentRentPeriodPress}
            onPriceFromChange={form.setRoomRentPriceFrom}
            onPriceToChange={form.setRoomRentPriceTo}
            onKitchenChange={form.setRoomRentKitchen}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Office for rent content */}
        {form.isOfficeForRent && (
          <OfficeForRentOrderSection
            t={t}
            officeRentPriceFrom={form.officeRentPriceFrom}
            officeRentPriceTo={form.officeRentPriceTo}
            officeRentAreaFrom={form.officeRentAreaFrom}
            officeRentAreaTo={form.officeRentAreaTo}
            officeRentStreetWidth={form.officeRentStreetWidth}
            officeRentFurnished={form.officeRentFurnished}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onPriceFromChange={form.setOfficeRentPriceFrom}
            onPriceToChange={form.setOfficeRentPriceTo}
            onAreaFromChange={form.setOfficeRentAreaFrom}
            onAreaToChange={form.setOfficeRentAreaTo}
            onOpenStreetWidth={openStreetWidthModal}
            onFurnishedChange={form.setOfficeRentFurnished}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Tent for rent content */}
        {form.isTentForRent && (
          <TentForRentOrderSection
            t={t}
            tentRentRentPeriod={form.tentRentRentPeriod}
            tentRentPriceFrom={form.tentRentPriceFrom}
            tentRentPriceTo={form.tentRentPriceTo}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            familySection={form.familySection}
            onRentPeriodSelect={form.handleTentRentRentPeriodPress}
            onPriceFromChange={form.setTentRentPriceFrom}
            onPriceToChange={form.setTentRentPriceTo}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
            onFamilySectionChange={form.setFamilySection}
          />
        )}

        {/* Warehouse for rent content */}
        {form.isWarehouseForRent && (
          <WarehouseForRentOrderSection
            t={t}
            warehouseRentPriceFrom={form.warehouseRentPriceFrom}
            warehouseRentPriceTo={form.warehouseRentPriceTo}
            warehouseRentAreaFrom={form.warehouseRentAreaFrom}
            warehouseRentAreaTo={form.warehouseRentAreaTo}
            warehouseRentStreetWidth={form.warehouseRentStreetWidth}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            getTranslatedPickerValue={getTranslatedPickerValue}
            onPriceFromChange={form.setWarehouseRentPriceFrom}
            onPriceToChange={form.setWarehouseRentPriceTo}
            onAreaFromChange={form.setWarehouseRentAreaFrom}
            onAreaToChange={form.setWarehouseRentAreaTo}
            onOpenStreetWidth={openStreetWidthModal}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
          />
        )}

        {/* Chalet for rent content */}
        {form.isChaletForRent && (
          <ChaletForRentOrderSection
            t={t}
            chaletRentRentPeriod={form.chaletRentRentPeriod}
            chaletRentPriceFrom={form.chaletRentPriceFrom}
            chaletRentPriceTo={form.chaletRentPriceTo}
            chaletRentAreaFrom={form.chaletRentAreaFrom}
            chaletRentAreaTo={form.chaletRentAreaTo}
            chaletRentPool={form.chaletRentPool}
            chaletFootballPitch={form.chaletFootballPitch}
            chaletVolleyballCourt={form.chaletVolleyballCourt}
            chaletRentTent={form.chaletRentTent}
            chaletRentKitchen={form.chaletRentKitchen}
            chaletPlayground={form.chaletPlayground}
            nearBus={form.nearBus}
            nearMetro={form.nearMetro}
            familySection={form.familySection}
            onRentPeriodSelect={form.handleChaletRentRentPeriodPress}
            onPriceFromChange={form.setChaletRentPriceFrom}
            onPriceToChange={form.setChaletRentPriceTo}
            onAreaFromChange={form.setChaletRentAreaFrom}
            onAreaToChange={form.setChaletRentAreaTo}
            onPoolChange={form.setChaletRentPool}
            onFootballPitchChange={form.setChaletFootballPitch}
            onVolleyballCourtChange={form.setChaletVolleyballCourt}
            onTentChange={form.setChaletRentTent}
            onKitchenChange={form.setChaletRentKitchen}
            onPlaygroundChange={form.setChaletPlayground}
            onNearBusChange={form.setNearBus}
            onNearMetroChange={form.setNearMetro}
            onFamilySectionChange={form.setFamilySection}
          />
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

      <SearchRequestOrderModals
        form={form}
        t={t}
        categoryOptions={categoryOptions}
        translatedFloorOptions={translatedFloorOptions}
        translatedAgeOptions={translatedAgeOptions}
        translatedStreetDirectionOptions={translatedStreetDirectionOptions}
        translatedStreetWidthOptions={translatedStreetWidthOptions}
        floorReverseMap={floorReverseMap}
        ageReverseMap={ageReverseMap}
        streetDirectionReverseMap={streetDirectionReverseMap}
        streetWidthReverseMap={streetWidthReverseMap}
        categoryTranslationMap={categoryTranslationMap}
        getTranslatedCategoryValue={getTranslatedCategoryValue}
        getTranslatedInitialValue={getTranslatedInitialValue}
        streetDirectionModalValue={streetDirectionModalValue}
        streetWidthModalValue={streetWidthModalValue}
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
