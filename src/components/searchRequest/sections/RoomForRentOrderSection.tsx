import React, { memo } from "react";
import { RentPaymentFrequencyChips, PriceInputSection, ToggleGroup } from "../../index";
import {
  getRentSearchPriceLabel,
  type RentPaymentFrequency,
  type RentPaymentFrequencyChoice,
} from "../../../constants/orderFormOptions";

type T = (key: string, options?: Record<string, string | number>) => string;
interface Props {
  t: T;
  roomRentRentPeriod: RentPaymentFrequency;
  roomRentPriceFrom: string;
  roomRentPriceTo: string;
  roomRentKitchen: boolean;
  nearBus: boolean;
  nearMetro: boolean;
  onRentPeriodSelect: (v: RentPaymentFrequencyChoice) => void;
  onPriceFromChange: (v: string) => void;
  onPriceToChange: (v: string) => void;
  onKitchenChange: (v: boolean) => void;
  onNearBusChange: (v: boolean) => void;
  onNearMetroChange: (v: boolean) => void;
}

function Comp(p: Props): React.JSX.Element {
  return <>
    <RentPaymentFrequencyChips selectedFrequency={p.roomRentRentPeriod} onSelect={p.onRentPeriodSelect} />
    <PriceInputSection label={getRentSearchPriceLabel(p.roomRentRentPeriod, p.t)} fromValue={p.roomRentPriceFrom} toValue={p.roomRentPriceTo} onFromChange={p.onPriceFromChange} onToChange={p.onPriceToChange} />
    <ToggleGroup toggles={[
      { label: p.t("listings.kitchen"), value: p.roomRentKitchen, onValueChange: p.onKitchenChange },
      { label: p.t("listings.nearBus"), value: p.nearBus, onValueChange: p.onNearBusChange },
      { label: p.t("listings.nearMetro"), value: p.nearMetro, onValueChange: p.onNearMetroChange },
    ]} />
  </>;
}

export const RoomForRentOrderSection = memo(Comp);
