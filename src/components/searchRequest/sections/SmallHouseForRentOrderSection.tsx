import React, { memo } from "react";
import {
  PriceInputSection,
  TabBarSection,
  FieldWithModal,
  ToggleGroup,
} from "../../index";
import {
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
} from "../../../constants/orderFormOptions";

type Translate = (key: string, options?: Record<string, string | number>) => string;

interface SmallHouseForRentOrderSectionProps {
  t: Translate;
  selectedBedroom: string | null;
  selectedLivingRoom: string | null;
  smallHouseRentStreetDirection: string | null;
  smallHouseRentStreetWidth: string | null;
  age: string | null;
  smallHouseRentPriceFrom: string;
  smallHouseRentPriceTo: string;
  smallHouseRentAreaFrom: string;
  smallHouseRentAreaTo: string;
  smallHouseRentFurnished: boolean;
  smallHouseRentTent: boolean;
  smallHouseRentKitchen: boolean;
  nearBus: boolean;
  nearMetro: boolean;
  getTranslatedPickerValue: (
    originalValue: string | null,
    type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores"
  ) => string;
  onBedroomSelect: (value: string) => void;
  onLivingRoomSelect: (value: string) => void;
  onOpenStreetDirection: () => void;
  onOpenStreetWidth: () => void;
  onOpenAge: () => void;
  onPriceFromChange: (value: string) => void;
  onPriceToChange: (value: string) => void;
  onAreaFromChange: (value: string) => void;
  onAreaToChange: (value: string) => void;
  onFurnishedChange: (value: boolean) => void;
  onTentChange: (value: boolean) => void;
  onKitchenChange: (value: boolean) => void;
  onNearBusChange: (value: boolean) => void;
  onNearMetroChange: (value: boolean) => void;
}

function SmallHouseForRentOrderSectionComponent(
  props: SmallHouseForRentOrderSectionProps
): React.JSX.Element {
  const {
    t,
    selectedBedroom,
    selectedLivingRoom,
    smallHouseRentStreetDirection,
    smallHouseRentStreetWidth,
    age,
    smallHouseRentPriceFrom,
    smallHouseRentPriceTo,
    smallHouseRentAreaFrom,
    smallHouseRentAreaTo,
    smallHouseRentFurnished,
    smallHouseRentTent,
    smallHouseRentKitchen,
    nearBus,
    nearMetro,
    getTranslatedPickerValue,
    onBedroomSelect,
    onLivingRoomSelect,
    onOpenStreetDirection,
    onOpenStreetWidth,
    onOpenAge,
    onPriceFromChange,
    onPriceToChange,
    onAreaFromChange,
    onAreaToChange,
    onFurnishedChange,
    onTentChange,
    onKitchenChange,
    onNearBusChange,
    onNearMetroChange,
  } = props;

  return (
    <>
      <PriceInputSection
        label={t("listings.price")}
        fromValue={smallHouseRentPriceFrom}
        toValue={smallHouseRentPriceTo}
        onFromChange={onPriceFromChange}
        onToChange={onPriceToChange}
      />
      <TabBarSection
        label={t("listings.bedrooms")}
        options={BEDROOM_OPTIONS}
        selectedValue={selectedBedroom}
        onSelect={onBedroomSelect}
      />
      <FieldWithModal
        label={t("listings.streetDirection")}
        value={getTranslatedPickerValue(smallHouseRentStreetDirection, "streetDirection")}
        placeholder={t("listings.selectStreetDirection")}
        onPress={onOpenStreetDirection}
        backgroundColor="background"
      />
      <TabBarSection
        label={t("listings.livingRoom")}
        options={LIVING_ROOM_OPTIONS}
        selectedValue={selectedLivingRoom}
        onSelect={onLivingRoomSelect}
      />
      <PriceInputSection
        label={t("listings.areaM2")}
        fromValue={smallHouseRentAreaFrom}
        toValue={smallHouseRentAreaTo}
        onFromChange={onAreaFromChange}
        onToChange={onAreaToChange}
        fromPlaceholder={t("listings.fromArea")}
        toPlaceholder={t("listings.toArea")}
      />
      <FieldWithModal
        label={t("listings.streetWidth")}
        value={getTranslatedPickerValue(smallHouseRentStreetWidth, "streetWidth")}
        placeholder={t("listings.selectStreetWidth")}
        onPress={onOpenStreetWidth}
        backgroundColor="background"
      />
      <FieldWithModal
        label={t("listings.age")}
        value={getTranslatedPickerValue(age, "age")}
        placeholder={t("listings.selectAge")}
        onPress={onOpenAge}
        backgroundColor="background"
      />
      <ToggleGroup
        toggles={[
          { label: t("listings.furnished"), value: smallHouseRentFurnished, onValueChange: onFurnishedChange },
          { label: t("listings.tent"), value: smallHouseRentTent, onValueChange: onTentChange },
          { label: t("listings.kitchen"), value: smallHouseRentKitchen, onValueChange: onKitchenChange },
          { label: t("listings.nearBus"), value: nearBus, onValueChange: onNearBusChange },
          { label: t("listings.nearMetro"), value: nearMetro, onValueChange: onNearMetroChange },
        ]}
      />
    </>
  );
}

export const SmallHouseForRentOrderSection = memo(
  SmallHouseForRentOrderSectionComponent
);

