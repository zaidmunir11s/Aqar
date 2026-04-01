import React, { memo } from "react";
import { PriceInputSection, TabBarSection, FieldWithModal, ToggleGroup } from "../../index";

type Translate = (key: string, options?: Record<string, string | number>) => string;

interface LandForSaleOrderSectionProps {
  t: Translate;
  translatedResidentialCommercialOptions: string[];
  selectedLandType: string | null;
  getTranslatedPickerValue: (
    originalValue: string | null,
    type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores"
  ) => string;
  landStreetDirection: string | null;
  landStreetWidth: string | null;
  landPriceFrom: string;
  landPriceTo: string;
  landAreaFrom: string;
  landAreaTo: string;
  nearBus: boolean;
  nearMetro: boolean;
  onLandTypeSelect: (translatedValue: string) => void;
  onOpenStreetDirection: () => void;
  onOpenStreetWidth: () => void;
  onLandPriceFromChange: (value: string) => void;
  onLandPriceToChange: (value: string) => void;
  onLandAreaFromChange: (value: string) => void;
  onLandAreaToChange: (value: string) => void;
  onNearBusChange: (value: boolean) => void;
  onNearMetroChange: (value: boolean) => void;
}

function LandForSaleOrderSectionComponent(
  props: LandForSaleOrderSectionProps
): React.JSX.Element {
  const {
    t,
    translatedResidentialCommercialOptions,
    selectedLandType,
    getTranslatedPickerValue,
    landStreetDirection,
    landStreetWidth,
    landPriceFrom,
    landPriceTo,
    landAreaFrom,
    landAreaTo,
    nearBus,
    nearMetro,
    onLandTypeSelect,
    onOpenStreetDirection,
    onOpenStreetWidth,
    onLandPriceFromChange,
    onLandPriceToChange,
    onLandAreaFromChange,
    onLandAreaToChange,
    onNearBusChange,
    onNearMetroChange,
  } = props;

  return (
    <>
      <PriceInputSection
        label={t("listings.price")}
        fromValue={landPriceFrom}
        toValue={landPriceTo}
        onFromChange={onLandPriceFromChange}
        onToChange={onLandPriceToChange}
      />
      <TabBarSection
        options={translatedResidentialCommercialOptions}
        selectedValue={selectedLandType}
        onSelect={onLandTypeSelect}
      />
      <FieldWithModal
        label={t("listings.streetDirection")}
        value={getTranslatedPickerValue(landStreetDirection, "streetDirection")}
        placeholder={t("listings.selectStreetDirection")}
        onPress={onOpenStreetDirection}
        backgroundColor="background"
      />
      <PriceInputSection
        label={t("listings.areaM2")}
        fromValue={landAreaFrom}
        toValue={landAreaTo}
        onFromChange={onLandAreaFromChange}
        onToChange={onLandAreaToChange}
        fromPlaceholder={t("listings.fromArea")}
        toPlaceholder={t("listings.toArea")}
      />
      <FieldWithModal
        label={t("listings.streetWidth")}
        value={getTranslatedPickerValue(landStreetWidth, "streetWidth")}
        placeholder={t("listings.selectStreetWidth")}
        onPress={onOpenStreetWidth}
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

export const LandForSaleOrderSection = memo(LandForSaleOrderSectionComponent);

