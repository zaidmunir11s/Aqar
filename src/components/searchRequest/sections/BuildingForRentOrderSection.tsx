import React, { memo } from "react";
import { PriceInputSection, TabBarSection, FieldWithModal, ToggleGroup } from "../../index";
import { APARTMENT_OPTIONS } from "../../../constants/orderFormOptions";

type Translate = (key: string, options?: Record<string, string | number>) => string;

interface BuildingForRentOrderSectionProps {
  t: Translate;
  translatedResidentialCommercialOptions: string[];
  buildingRentPriceFrom: string;
  buildingRentPriceTo: string;
  buildingRentApartments: string | null;
  selectedBuildingRentType: string | null;
  buildingRentStreetDirection: string | null;
  buildingRentStores: string | null;
  buildingRentAreaFrom: string;
  buildingRentAreaTo: string;
  buildingRentStreetWidth: string | null;
  age: string | null;
  nearBus: boolean;
  nearMetro: boolean;
  getTranslatedPickerValue: (
    originalValue: string | null,
    type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores"
  ) => string;
  onPriceFromChange: (value: string) => void;
  onPriceToChange: (value: string) => void;
  onApartmentsSelect: (value: string) => void;
  onTypeSelect: (value: string) => void;
  onOpenStreetDirection: () => void;
  onOpenStores: () => void;
  onAreaFromChange: (value: string) => void;
  onAreaToChange: (value: string) => void;
  onOpenStreetWidth: () => void;
  onOpenAge: () => void;
  onNearBusChange: (value: boolean) => void;
  onNearMetroChange: (value: boolean) => void;
}

function BuildingForRentOrderSectionComponent(
  props: BuildingForRentOrderSectionProps
): React.JSX.Element {
  const {
    t,
    translatedResidentialCommercialOptions,
    buildingRentPriceFrom,
    buildingRentPriceTo,
    buildingRentApartments,
    selectedBuildingRentType,
    buildingRentStreetDirection,
    buildingRentStores,
    buildingRentAreaFrom,
    buildingRentAreaTo,
    buildingRentStreetWidth,
    age,
    nearBus,
    nearMetro,
    getTranslatedPickerValue,
    onPriceFromChange,
    onPriceToChange,
    onApartmentsSelect,
    onTypeSelect,
    onOpenStreetDirection,
    onOpenStores,
    onAreaFromChange,
    onAreaToChange,
    onOpenStreetWidth,
    onOpenAge,
    onNearBusChange,
    onNearMetroChange,
  } = props;

  return (
    <>
      <PriceInputSection
        label={t("listings.price")}
        fromValue={buildingRentPriceFrom}
        toValue={buildingRentPriceTo}
        onFromChange={onPriceFromChange}
        onToChange={onPriceToChange}
      />
      <TabBarSection
        label={t("listings.apartments")}
        options={APARTMENT_OPTIONS}
        selectedValue={buildingRentApartments}
        onSelect={onApartmentsSelect}
      />
      <TabBarSection
        options={translatedResidentialCommercialOptions}
        selectedValue={selectedBuildingRentType}
        onSelect={onTypeSelect}
      />
      <FieldWithModal
        label={t("listings.streetDirection")}
        value={getTranslatedPickerValue(buildingRentStreetDirection, "streetDirection")}
        placeholder={t("listings.selectStreetDirection")}
        onPress={onOpenStreetDirection}
        backgroundColor="background"
      />
      <FieldWithModal
        label={t("listings.stores")}
        value={getTranslatedPickerValue(buildingRentStores, "stores")}
        placeholder={t("listings.selectStores")}
        onPress={onOpenStores}
        backgroundColor="background"
      />
      <PriceInputSection
        label={t("listings.areaM2")}
        fromValue={buildingRentAreaFrom}
        toValue={buildingRentAreaTo}
        onFromChange={onAreaFromChange}
        onToChange={onAreaToChange}
        fromPlaceholder={t("listings.fromArea")}
        toPlaceholder={t("listings.toArea")}
      />
      <FieldWithModal
        label={t("listings.streetWidth")}
        value={getTranslatedPickerValue(buildingRentStreetWidth, "streetWidth")}
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
          { label: t("listings.nearBus"), value: nearBus, onValueChange: onNearBusChange },
          { label: t("listings.nearMetro"), value: nearMetro, onValueChange: onNearMetroChange },
        ]}
      />
    </>
  );
}

export const BuildingForRentOrderSection = memo(BuildingForRentOrderSectionComponent);

