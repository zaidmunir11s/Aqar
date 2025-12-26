import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import {
  PriceInputSection,
  TabBarSection,
  FieldWithModal,
  ToggleRow,
} from "../index";
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
    return (
      <>
        <PriceInputSection
          label="Price"
          fromValue={priceFrom}
          toValue={priceTo}
          onFromChange={onPriceFromChange}
          onToChange={onPriceToChange}
        />

        <TabBarSection
          label="Apartments"
          options={APARTMENT_OPTIONS}
          selectedValue={selectedApartment}
          onSelect={onApartmentChange}
        />

        <TabBarSection
          label="Bedrooms"
          options={BEDROOM_OPTIONS}
          selectedValue={selectedBedroom}
          onSelect={onBedroomChange}
        />

        <FieldWithModal
          label="Street Direction"
          value={streetDirection}
          placeholder="Select street direction"
          onPress={onStreetDirectionPress}
          backgroundColor="background"
        />

        <TabBarSection
          label="Living Rooms"
          options={LIVING_ROOM_OPTIONS}
          selectedValue={selectedLivingRoom}
          onSelect={onLivingRoomChange}
        />

        <TabBarSection
          label="WC"
          options={WC_OPTIONS}
          selectedValue={selectedWc}
          onSelect={onWcChange}
        />

        <PriceInputSection
          label="Area (m²)"
          fromValue={areaFrom}
          toValue={areaTo}
          onFromChange={onAreaFromChange}
          onToChange={onAreaToChange}
          fromPlaceholder="From area"
          toPlaceholder="To area"
        />

        <FieldWithModal
          label="Street Width"
          value={streetWidth}
          placeholder="Select street width"
          onPress={onStreetWidthPress}
          backgroundColor="background"
        />

        <View style={styles.section}>
          <ToggleRow label="Stairs" value={stairs} onValueChange={onStairsChange} />
        </View>

        <FieldWithModal
          label="Age"
          value={age}
          placeholder="Select age"
          onPress={onAgePress}
          backgroundColor="background"
        />

        <View style={styles.section}>
          <ToggleRow
            label="Driver room"
            value={driverRoom}
            onValueChange={onDriverRoomChange}
          />
          <ToggleRow
            label="Maid room"
            value={maidRoom}
            onValueChange={onMaidRoomChange}
          />
          <ToggleRow label="Pool" value={pool} onValueChange={onPoolChange} />
          <ToggleRow
            label="Furnished"
            value={furnished}
            onValueChange={onFurnishedChange}
          />
          <ToggleRow
            label="Kitchen"
            value={kitchen}
            onValueChange={onKitchenChange}
          />
          <ToggleRow
            label="Car entrance"
            value={carEntrance}
            onValueChange={onCarEntranceChange}
          />
          <ToggleRow
            label="Basement"
            value={basement}
            onValueChange={onBasementChange}
          />
        </View>

        <TabBarSection
          label="Villa Type"
          options={VILLA_TYPE_OPTIONS}
          selectedValue={selectedVillaType}
          onSelect={onVillaTypeChange}
        />

        <View style={styles.section}>
          <ToggleRow
            label="Air Conditioned"
            value={airConditioned}
            onValueChange={onAirConditionedChange}
          />
          <ToggleRow label="Near bus" value={nearBus} onValueChange={onNearBusChange} />
          <ToggleRow
            label="Near metro"
            value={nearMetro}
            onValueChange={onNearMetroChange}
          />
        </View>
      </>
    );
  }
);

VillaForSaleSection.displayName = "VillaForSaleSection";

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(2.5),
  },
});

export default VillaForSaleSection;

