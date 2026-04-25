import React, { memo } from "react";
import {
  RentPaymentFrequencyChips,
  PriceInputSection,
  ToggleGroup,
} from "../../index";
import {
  getRentSearchPriceLabel,
  type RentPaymentFrequency,
  type RentPaymentFrequencyChoice,
} from "../../../constants/orderFormOptions";

type T = (key: string, options?: Record<string, string | number>) => string;
interface Props {
  t: T;
  tentRentRentPeriod: RentPaymentFrequency;
  tentRentPriceFrom: string;
  tentRentPriceTo: string;
  nearBus: boolean;
  nearMetro: boolean;
  familySection: boolean;
  onRentPeriodSelect: (v: RentPaymentFrequencyChoice) => void;
  onPriceFromChange: (v: string) => void;
  onPriceToChange: (v: string) => void;
  onNearBusChange: (v: boolean) => void;
  onNearMetroChange: (v: boolean) => void;
  onFamilySectionChange: (v: boolean) => void;
}

function Comp(p: Props): React.JSX.Element {
  return (
    <>
      <RentPaymentFrequencyChips
        selectedFrequency={p.tentRentRentPeriod}
        onSelect={p.onRentPeriodSelect}
      />
      {p.tentRentRentPeriod != null && (
        <PriceInputSection
          label={getRentSearchPriceLabel(p.tentRentRentPeriod, p.t)}
          fromValue={p.tentRentPriceFrom}
          toValue={p.tentRentPriceTo}
          onFromChange={p.onPriceFromChange}
          onToChange={p.onPriceToChange}
          fromPlaceholder={p.t("listings.fromPrice")}
          toPlaceholder={p.t("listings.toPrice")}
        />
      )}
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
          {
            label: p.t("listings.familySection"),
            value: p.familySection,
            onValueChange: p.onFamilySectionChange,
          },
        ]}
      />
    </>
  );
}

export const TentForRentOrderSection = memo(Comp);
