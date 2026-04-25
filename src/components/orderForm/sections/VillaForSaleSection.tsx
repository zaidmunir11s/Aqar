import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import {
  PriceInputSection,
  TabBarSection,
  FieldWithModal,
  ToggleRow,
} from "../index";
import { useLocalization } from "../../../hooks/useLocalization";
import {
  APARTMENT_OPTIONS,
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
  WC_OPTIONS,
  VILLA_TYPE_OPTIONS,
} from "../../../constants/orderFormOptions";

export interface VillaForSaleSectionProps {
  priceFrom: string;
  priceTo: string;
  onPriceFromChange: (value: string) => void;
  onPriceToChange: (value: string) => void;
  selectedApartment: string | null;
  onApartmentChange: (value: string) => void;
  selectedBedroom: string | null;
  onBedroomChange: (value: string) => void;
  streetDirection: string;
  onStreetDirectionPress: () => void;
  selectedLivingRoom: string | null;
  onLivingRoomChange: (value: string) => void;
  selectedWc: string | null;
  onWcChange: (value: string) => void;
  areaFrom: string;
  areaTo: string;
  onAreaFromChange: (value: string) => void;
  onAreaToChange: (value: string) => void;
  streetWidth: string;
  onStreetWidthPress: () => void;
  stairs: boolean;
  onStairsChange: (value: boolean) => void;
  age: string;
  onAgePress: () => void;
  driverRoom: boolean;
  onDriverRoomChange: (value: boolean) => void;
  maidRoom: boolean;
  onMaidRoomChange: (value: boolean) => void;
  pool: boolean;
  onPoolChange: (value: boolean) => void;
  furnished: boolean;
  onFurnishedChange: (value: boolean) => void;
  kitchen: boolean;
  onKitchenChange: (value: boolean) => void;
  carEntrance: boolean;
  onCarEntranceChange: (value: boolean) => void;
  basement: boolean;
  onBasementChange: (value: boolean) => void;
  selectedVillaType: string | null;
  onVillaTypeChange: (value: string) => void;
  airConditioned: boolean;
  onAirConditionedChange: (value: boolean) => void;
  nearBus: boolean;
  onNearBusChange: (value: boolean) => void;
  nearMetro: boolean;
  onNearMetroChange: (value: boolean) => void;
}

const VillaForSaleSection = memo<VillaForSaleSectionProps>(
  ({
    priceFrom,
    priceTo,
    onPriceFromChange,
    onPriceToChange,
    selectedApartment,
    onApartmentChange,
    selectedBedroom,
    onBedroomChange,
    streetDirection,
    onStreetDirectionPress,
    selectedLivingRoom,
    onLivingRoomChange,
    selectedWc,
    onWcChange,
    areaFrom,
    areaTo,
    onAreaFromChange,
    onAreaToChange,
    streetWidth,
    onStreetWidthPress,
    stairs,
    onStairsChange,
    age,
    onAgePress,
    driverRoom,
    onDriverRoomChange,
    maidRoom,
    onMaidRoomChange,
    pool,
    onPoolChange,
    furnished,
    onFurnishedChange,
    kitchen,
    onKitchenChange,
    carEntrance,
    onCarEntranceChange,
    basement,
    onBasementChange,
    selectedVillaType,
    onVillaTypeChange,
    airConditioned,
    onAirConditionedChange,
    nearBus,
    onNearBusChange,
    nearMetro,
    onNearMetroChange,
  }) => {
    const { t } = useLocalization();
    return (
      <>
        <PriceInputSection
          label={t("listings.price")}
          fromValue={priceFrom}
          toValue={priceTo}
          onFromChange={onPriceFromChange}
          onToChange={onPriceToChange}
          fromPlaceholder={t("listings.fromPrice")}
          toPlaceholder={t("listings.toPrice")}
        />

        <TabBarSection
          label={t("listings.apartments")}
          options={APARTMENT_OPTIONS}
          selectedValue={selectedApartment}
          onSelect={onApartmentChange}
        />

        <TabBarSection
          label={t("listings.bedrooms")}
          options={BEDROOM_OPTIONS}
          selectedValue={selectedBedroom}
          onSelect={onBedroomChange}
        />

        <FieldWithModal
          label={t("listings.streetDirection")}
          value={streetDirection}
          placeholder={t("listings.selectStreetDirection")}
          onPress={onStreetDirectionPress}
          backgroundColor="background"
        />

        <TabBarSection
          label={t("listings.livingRooms")}
          options={LIVING_ROOM_OPTIONS}
          selectedValue={selectedLivingRoom}
          onSelect={onLivingRoomChange}
        />

        <TabBarSection
          label={t("listings.wc")}
          options={WC_OPTIONS}
          selectedValue={selectedWc}
          onSelect={onWcChange}
        />

        <PriceInputSection
          label={t("listings.areaM2")}
          fromValue={areaFrom}
          toValue={areaTo}
          onFromChange={onAreaFromChange}
          onToChange={onAreaToChange}
          fromPlaceholder={t("listings.fromArea")}
          toPlaceholder={t("listings.toArea")}
        />

        <FieldWithModal
          label={t("listings.streetWidth")}
          value={streetWidth}
          placeholder={t("listings.selectStreetWidth")}
          onPress={onStreetWidthPress}
          backgroundColor="background"
        />

        <View style={styles.section}>
          <ToggleRow
            label={t("listings.stairs")}
            value={stairs}
            onValueChange={onStairsChange}
          />
        </View>

        <FieldWithModal
          label={t("listings.age")}
          value={age}
          placeholder={t("listings.selectAge")}
          onPress={onAgePress}
          backgroundColor="background"
        />

        <View style={styles.section}>
          <ToggleRow
            label={t("listings.driverRoom")}
            value={driverRoom}
            onValueChange={onDriverRoomChange}
          />
          <ToggleRow
            label={t("listings.maidRoom")}
            value={maidRoom}
            onValueChange={onMaidRoomChange}
          />
          <ToggleRow
            label={t("listings.pool")}
            value={pool}
            onValueChange={onPoolChange}
          />
          <ToggleRow
            label={t("listings.furnished")}
            value={furnished}
            onValueChange={onFurnishedChange}
          />
          <ToggleRow
            label={t("listings.kitchen")}
            value={kitchen}
            onValueChange={onKitchenChange}
          />
          <ToggleRow
            label={t("listings.carEntrance")}
            value={carEntrance}
            onValueChange={onCarEntranceChange}
          />
          <ToggleRow
            label={t("listings.basement")}
            value={basement}
            onValueChange={onBasementChange}
          />
        </View>

        <TabBarSection
          label={t("listings.villaType")}
          options={VILLA_TYPE_OPTIONS}
          selectedValue={selectedVillaType}
          onSelect={onVillaTypeChange}
        />

        <View style={styles.section}>
          <ToggleRow
            label={t("listings.airConditioned")}
            value={airConditioned}
            onValueChange={onAirConditionedChange}
          />
          <ToggleRow
            label={t("listings.nearBus")}
            value={nearBus}
            onValueChange={onNearBusChange}
          />
          <ToggleRow
            label={t("listings.nearMetro")}
            value={nearMetro}
            onValueChange={onNearMetroChange}
          />
        </View>
      </>
    );
  },
);

VillaForSaleSection.displayName = "VillaForSaleSection";

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(2.5),
  },
});

export default VillaForSaleSection;
