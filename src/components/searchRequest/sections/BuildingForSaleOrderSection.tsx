import React, { memo } from "react";
import { PriceInputSection, TabBarSection, FieldWithModal, ToggleGroup } from "../../index";
import { APARTMENT_OPTIONS } from "../../../constants/orderFormOptions";

type Translate = (key: string, options?: Record<string, string | number>) => string;

interface BuildingForSaleOrderSectionProps {
  t: Translate;
  translatedResidentialCommercialOptions: string[];
  buildingPriceFrom: string;
  buildingPriceTo: string;
  buildingApartments: string | null;
  selectedBuildingType: string | null;
  buildingStreetDirection: string | null;
  stores: string | null;
  buildingAreaFrom: string;
  buildingAreaTo: string;
  streetWidth: string | null;
  age: string | null;
  nearBus: boolean;
  nearMetro: boolean;
  getTranslatedPickerValue: (
    originalValue: string | null,
    type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores"
  ) => string;
  onBuildingPriceFromChange: (value: string) => void;
  onBuildingPriceToChange: (value: string) => void;
  onBuildingApartmentsSelect: (value: string) => void;
  onBuildingTypeSelect: (translatedValue: string) => void;
  onOpenStreetDirection: () => void;
  onOpenStores: () => void;
  onBuildingAreaFromChange: (value: string) => void;
  onBuildingAreaToChange: (value: string) => void;
  onOpenStreetWidth: () => void;
  onOpenAge: () => void;
  onNearBusChange: (value: boolean) => void;
  onNearMetroChange: (value: boolean) => void;
}

function BuildingForSaleOrderSectionComponent(
  props: BuildingForSaleOrderSectionProps
): React.JSX.Element {
  const {
    t,
    translatedResidentialCommercialOptions,
    buildingPriceFrom,
    buildingPriceTo,
    buildingApartments,
    selectedBuildingType,
    buildingStreetDirection,
    stores,
    buildingAreaFrom,
    buildingAreaTo,
    streetWidth,
    age,
    nearBus,
    nearMetro,
    getTranslatedPickerValue,
    onBuildingPriceFromChange,
    onBuildingPriceToChange,
    onBuildingApartmentsSelect,
    onBuildingTypeSelect,
    onOpenStreetDirection,
    onOpenStores,
    onBuildingAreaFromChange,
    onBuildingAreaToChange,
    onOpenStreetWidth,
    onOpenAge,
    onNearBusChange,
    onNearMetroChange,
  } = props;

  return (
    <>
      <PriceInputSection
        label={t("listings.price")}
        fromValue={buildingPriceFrom}
        toValue={buildingPriceTo}
        onFromChange={onBuildingPriceFromChange}
        onToChange={onBuildingPriceToChange}
      />
      <TabBarSection
        label={t("listings.apartments")}
        options={APARTMENT_OPTIONS}
        selectedValue={buildingApartments}
        onSelect={onBuildingApartmentsSelect}
      />
      <TabBarSection
        options={translatedResidentialCommercialOptions}
        selectedValue={selectedBuildingType}
        onSelect={onBuildingTypeSelect}
      />
      <FieldWithModal
        label={t("listings.streetDirection")}
        value={getTranslatedPickerValue(buildingStreetDirection, "streetDirection")}
        placeholder={t("listings.selectStreetDirection")}
        onPress={onOpenStreetDirection}
        backgroundColor="background"
      />
      <FieldWithModal
        label={t("listings.stores")}
        value={getTranslatedPickerValue(stores, "stores")}
        placeholder={t("listings.selectStores")}
        onPress={onOpenStores}
        backgroundColor="background"
      />
      <PriceInputSection
        label={t("listings.areaM2")}
        fromValue={buildingAreaFrom}
        toValue={buildingAreaTo}
        onFromChange={onBuildingAreaFromChange}
        onToChange={onBuildingAreaToChange}
        fromPlaceholder={t("listings.fromArea")}
        toPlaceholder={t("listings.toArea")}
      />
      <FieldWithModal
        label={t("listings.streetWidth")}
        value={getTranslatedPickerValue(streetWidth, "streetWidth")}
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

export const BuildingForSaleOrderSection = memo(BuildingForSaleOrderSectionComponent);

