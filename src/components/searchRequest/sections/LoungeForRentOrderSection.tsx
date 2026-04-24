import React, { memo } from "react";
import { PriceInputSection, RentPaymentFrequencyChips, ToggleGroup } from "../../index";
import {
  getRentSearchPriceLabel,
  type RentPaymentFrequency,
  type RentPaymentFrequencyChoice,
} from "../../../constants/orderFormOptions";

type T = (key: string, options?: Record<string, string | number>) => string;
interface Props {
  t: T;
  rentPeriod: RentPaymentFrequency;
  priceFrom: string; priceTo: string; areaFrom: string; areaTo: string;
  areaRangeHint?: string;
  pool: boolean; footballPitch: boolean; volleyballCourt: boolean; tent: boolean; kitchen: boolean; playground: boolean; nearBus: boolean; nearMetro: boolean; familySection: boolean;
  onRentPeriodSelect: (v: RentPaymentFrequencyChoice) => void;
  onPriceFromChange: (v: string) => void; onPriceToChange: (v: string) => void; onAreaFromChange: (v: string) => void; onAreaToChange: (v: string) => void;
  onPoolChange: (v: boolean) => void; onFootballPitchChange: (v: boolean) => void; onVolleyballCourtChange: (v: boolean) => void; onTentChange: (v: boolean) => void; onKitchenChange: (v: boolean) => void; onPlaygroundChange: (v: boolean) => void; onNearBusChange: (v: boolean) => void; onNearMetroChange: (v: boolean) => void; onFamilySectionChange: (v: boolean) => void;
}
function Comp(p: Props): React.JSX.Element {
  return <>
    <RentPaymentFrequencyChips selectedFrequency={p.rentPeriod} onSelect={p.onRentPeriodSelect} />
    <PriceInputSection label={getRentSearchPriceLabel(p.rentPeriod, p.t)} fromValue={p.priceFrom} toValue={p.priceTo} onFromChange={p.onPriceFromChange} onToChange={p.onPriceToChange} />
    <PriceInputSection
      label={p.t("listings.areaM2")}
      fromValue={p.areaFrom}
      toValue={p.areaTo}
      onFromChange={p.onAreaFromChange}
      onToChange={p.onAreaToChange}
      fromPlaceholder={p.t("listings.fromArea")}
      toPlaceholder={p.t("listings.toArea")}
      helperText={p.areaRangeHint}
    />
    <ToggleGroup toggles={[
      { label: p.t("listings.pool"), value: p.pool, onValueChange: p.onPoolChange },
      { label: p.t("listings.footballPitch"), value: p.footballPitch, onValueChange: p.onFootballPitchChange },
      { label: p.t("listings.volleyballCourt"), value: p.volleyballCourt, onValueChange: p.onVolleyballCourtChange },
      { label: p.t("listings.tent"), value: p.tent, onValueChange: p.onTentChange },
      { label: p.t("listings.kitchen"), value: p.kitchen, onValueChange: p.onKitchenChange },
      { label: p.t("listings.playground"), value: p.playground, onValueChange: p.onPlaygroundChange },
      { label: p.t("listings.nearBus"), value: p.nearBus, onValueChange: p.onNearBusChange },
      { label: p.t("listings.nearMetro"), value: p.nearMetro, onValueChange: p.onNearMetroChange },
      { label: p.t("listings.familySection"), value: p.familySection, onValueChange: p.onFamilySectionChange },
    ]} />
  </>;
}
export const LoungeForRentOrderSection = memo(Comp);
