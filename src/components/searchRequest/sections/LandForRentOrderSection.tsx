import React, { memo } from "react";
import { TabBarSection, FieldWithModal, PriceInputSection, ToggleGroup } from "../../index";

type T = (key: string, options?: Record<string, string | number>) => string;

interface Props {
  t: T;
  translatedResidentialCommercialOptions: string[];
  selectedLandRentType: string | null;
  landRentStreetDirection: string | null;
  landRentAreaFrom: string;
  landRentAreaTo: string;
  areaRangeHint?: string;
  landRentStreetWidth: string | null;
  nearBus: boolean;
  nearMetro: boolean;
  getTranslatedPickerValue: (
    value: string | null,
    type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores"
  ) => string;
  onLandRentTypeSelect: (v: string) => void;
  onOpenStreetDirection: () => void;
  onAreaFromChange: (v: string) => void;
  onAreaToChange: (v: string) => void;
  onOpenStreetWidth: () => void;
  onNearBusChange: (v: boolean) => void;
  onNearMetroChange: (v: boolean) => void;
}

function Comp(p: Props): React.JSX.Element {
  return (
    <>
      <TabBarSection options={p.translatedResidentialCommercialOptions} selectedValue={p.selectedLandRentType} onSelect={p.onLandRentTypeSelect} />
      <FieldWithModal label={p.t("listings.streetDirection")} value={p.getTranslatedPickerValue(p.landRentStreetDirection, "streetDirection")} placeholder={p.t("listings.selectStreetDirection")} onPress={p.onOpenStreetDirection} backgroundColor="background" />
      <PriceInputSection
        label={p.t("listings.areaM2")}
        fromValue={p.landRentAreaFrom}
        toValue={p.landRentAreaTo}
        onFromChange={p.onAreaFromChange}
        onToChange={p.onAreaToChange}
        fromPlaceholder={p.t("listings.fromArea")}
        toPlaceholder={p.t("listings.toArea")}
        helperText={p.areaRangeHint}
      />
      <FieldWithModal label={p.t("listings.streetWidth")} value={p.getTranslatedPickerValue(p.landRentStreetWidth, "streetWidth")} placeholder={p.t("listings.selectStreetWidth")} onPress={p.onOpenStreetWidth} backgroundColor="background" />
      <ToggleGroup
        toggles={[
          { label: p.t("listings.nearBus"), value: p.nearBus, onValueChange: p.onNearBusChange },
          { label: p.t("listings.nearMetro"), value: p.nearMetro, onValueChange: p.onNearMetroChange },
        ]}
      />
    </>
  );
}

export const LandForRentOrderSection = memo(Comp);

