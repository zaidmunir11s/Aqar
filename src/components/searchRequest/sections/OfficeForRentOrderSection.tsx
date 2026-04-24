import React, { memo } from "react";
import { PriceInputSection, FieldWithModal, ToggleGroup } from "../../index";

type T = (key: string, options?: Record<string, string | number>) => string;
interface Props {
  t: T;
  officeRentPriceFrom: string;
  officeRentPriceTo: string;
  officeRentAreaFrom: string;
  officeRentAreaTo: string;
  areaRangeHint?: string;
  officeRentStreetWidth: string | null;
  officeRentFurnished: boolean;
  nearBus: boolean;
  nearMetro: boolean;
  getTranslatedPickerValue: (value: string | null, type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores") => string;
  onPriceFromChange: (v: string) => void;
  onPriceToChange: (v: string) => void;
  onAreaFromChange: (v: string) => void;
  onAreaToChange: (v: string) => void;
  onOpenStreetWidth: () => void;
  onFurnishedChange: (v: boolean) => void;
  onNearBusChange: (v: boolean) => void;
  onNearMetroChange: (v: boolean) => void;
}

function Comp(p: Props): React.JSX.Element {
  return <>
    <PriceInputSection label={p.t("listings.price")} fromValue={p.officeRentPriceFrom} toValue={p.officeRentPriceTo} onFromChange={p.onPriceFromChange} onToChange={p.onPriceToChange} />
    <PriceInputSection
      label={p.t("listings.areaM2")}
      fromValue={p.officeRentAreaFrom}
      toValue={p.officeRentAreaTo}
      onFromChange={p.onAreaFromChange}
      onToChange={p.onAreaToChange}
      fromPlaceholder={p.t("listings.fromArea")}
      toPlaceholder={p.t("listings.toArea")}
      helperText={p.areaRangeHint}
    />
    <FieldWithModal label={p.t("listings.streetWidth")} value={p.getTranslatedPickerValue(p.officeRentStreetWidth, "streetWidth")} placeholder={p.t("listings.selectStreetWidth")} onPress={p.onOpenStreetWidth} backgroundColor="background" />
    <ToggleGroup toggles={[
      { label: p.t("listings.furnished"), value: p.officeRentFurnished, onValueChange: p.onFurnishedChange },
      { label: p.t("listings.nearBus"), value: p.nearBus, onValueChange: p.onNearBusChange },
      { label: p.t("listings.nearMetro"), value: p.nearMetro, onValueChange: p.onNearMetroChange },
    ]} />
  </>;
}

export const OfficeForRentOrderSection = memo(Comp);

