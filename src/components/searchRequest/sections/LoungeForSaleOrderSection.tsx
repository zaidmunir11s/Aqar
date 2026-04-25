import React, { memo } from "react";
import { PriceInputSection, FieldWithModal, ToggleGroup } from "../../index";

type T = (key: string, options?: Record<string, string | number>) => string;

interface Props {
  t: T;
  loungePriceFrom: string;
  loungePriceTo: string;
  loungeAreaFrom: string;
  loungeAreaTo: string;
  loungeStreetWidth: string | null;
  age: string | null;
  nearBus: boolean;
  nearMetro: boolean;
  getTranslatedPickerValue: (
    value: string | null,
    type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores",
  ) => string;
  onPriceFromChange: (v: string) => void;
  onPriceToChange: (v: string) => void;
  onAreaFromChange: (v: string) => void;
  onAreaToChange: (v: string) => void;
  onOpenStreetWidth: () => void;
  onOpenAge: () => void;
  onNearBusChange: (v: boolean) => void;
  onNearMetroChange: (v: boolean) => void;
}

function Comp(p: Props): React.JSX.Element {
  return (
    <>
      <PriceInputSection
        label={p.t("listings.price")}
        fromValue={p.loungePriceFrom}
        toValue={p.loungePriceTo}
        onFromChange={p.onPriceFromChange}
        onToChange={p.onPriceToChange}
      />
      <PriceInputSection
        label={p.t("listings.areaM2")}
        fromValue={p.loungeAreaFrom}
        toValue={p.loungeAreaTo}
        onFromChange={p.onAreaFromChange}
        onToChange={p.onAreaToChange}
        fromPlaceholder={p.t("listings.fromArea")}
        toPlaceholder={p.t("listings.toArea")}
      />
      <FieldWithModal
        label={p.t("listings.streetWidth")}
        value={p.getTranslatedPickerValue(p.loungeStreetWidth, "streetWidth")}
        placeholder={p.t("listings.selectStreetWidth")}
        onPress={p.onOpenStreetWidth}
        backgroundColor="background"
      />
      <FieldWithModal
        label={p.t("listings.age")}
        value={p.getTranslatedPickerValue(p.age, "age")}
        placeholder={p.t("listings.selectAge")}
        onPress={p.onOpenAge}
        backgroundColor="background"
      />
      <ToggleGroup
        toggles={[
          {
            label: p.t("listings.nearBus"),
            value: p.nearBus,
            onValueChange: p.onNearBusChange,
          },
          {
            label: p.t("listings.nearMetro"),
            value: p.nearMetro,
            onValueChange: p.onNearMetroChange,
          },
        ]}
      />
    </>
  );
}

export const LoungeForSaleOrderSection = memo(Comp);
