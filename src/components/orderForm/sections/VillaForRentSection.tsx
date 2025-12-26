import React, { memo } from "react";
import {
  PriceInputSection,
  TabBarSection,
  FieldWithModal,
  ToggleGroup,
  RentPeriodTabBar,
} from "../index";
import {
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
  WC_OPTIONS,
  VILLA_TYPE_OPTIONS,
} from "../../../constants/orderFormOptions";

export interface VillaForRentSectionProps {
  rentPeriod: "Yearly" | "Monthly" | null;
  onRentPeriodChange: (period: "Yearly" | "Monthly") => void;
  priceFrom: string;
  priceTo: string;
  onPriceFromChange: (value: string) => void;
  onPriceToChange: (value: string) => void;
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
  villaFurnished: boolean;
  onVillaFurnishedChange: (value: boolean) => void;
  kitchen: boolean;
  onKitchenChange: (value: boolean) => void;
  villaCarEntrance: boolean;
  onVillaCarEntranceChange: (value: boolean) => void;
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

const VillaForRentSection = memo<VillaForRentSectionProps>(
  ({
    rentPeriod,
    onRentPeriodChange,
    priceFrom,
    priceTo,
    onPriceFromChange,
    onPriceToChange,
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
    villaFurnished,
    onVillaFurnishedChange,
    kitchen,
    onKitchenChange,
    villaCarEntrance,
    onVillaCarEntranceChange,
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
        <RentPeriodTabBar selectedPeriod={rentPeriod} onSelect={onRentPeriodChange} />

        <PriceInputSection
          label="Price"
          fromValue={priceFrom}
          toValue={priceTo}
          onFromChange={onPriceFromChange}
          onToChange={onPriceToChange}
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

        <ToggleGroup
          toggles={[{ label: "Stairs", value: stairs, onValueChange: onStairsChange }]}
        />

        <FieldWithModal
          label="Age"
          value={age}
          placeholder="Select age"
          onPress={onAgePress}
          backgroundColor="background"
        />

        <ToggleGroup
          toggles={[
            { label: "Driver room", value: driverRoom, onValueChange: onDriverRoomChange },
            { label: "Maid room", value: maidRoom, onValueChange: onMaidRoomChange },
            { label: "Pool", value: pool, onValueChange: onPoolChange },
            { label: "Furnished", value: villaFurnished, onValueChange: onVillaFurnishedChange },
            { label: "Kitchen", value: kitchen, onValueChange: onKitchenChange },
            { label: "Car entrance", value: villaCarEntrance, onValueChange: onVillaCarEntranceChange },
            { label: "Basement", value: basement, onValueChange: onBasementChange },
          ]}
        />

        <TabBarSection
          label="Villa Type"
          options={VILLA_TYPE_OPTIONS}
          selectedValue={selectedVillaType}
          onSelect={onVillaTypeChange}
        />

        <ToggleGroup
          toggles={[
            { label: "Air Conditioned", value: airConditioned, onValueChange: onAirConditionedChange },
            { label: "Near bus", value: nearBus, onValueChange: onNearBusChange },
            { label: "Near metro", value: nearMetro, onValueChange: onNearMetroChange },
          ]}
        />
      </>
    );
  }
);

VillaForRentSection.displayName = "VillaForRentSection";

export default VillaForRentSection;

