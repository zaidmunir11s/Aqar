import React, { memo } from "react";
import { PriceInputSection, ToggleGroup } from "../../index";

type T = (key: string, options?: Record<string, string | number>) => string;
interface Props {
  t: T;
  farmPriceFrom: string;
  farmPriceTo: string;
  farmAreaFrom: string;
  farmAreaTo: string;
  nearBus: boolean;
  nearMetro: boolean;
  onPriceFromChange: (v: string) => void;
  onPriceToChange: (v: string) => void;
  onAreaFromChange: (v: string) => void;
  onAreaToChange: (v: string) => void;
  onNearBusChange: (v: boolean) => void;
  onNearMetroChange: (v: boolean) => void;
}

function Comp(p: Props): React.JSX.Element {
  return <>
    <PriceInputSection label={p.t("listings.price")} fromValue={p.farmPriceFrom} toValue={p.farmPriceTo} onFromChange={p.onPriceFromChange} onToChange={p.onPriceToChange} />
    <PriceInputSection label={p.t("listings.areaM2")} fromValue={p.farmAreaFrom} toValue={p.farmAreaTo} onFromChange={p.onAreaFromChange} onToChange={p.onAreaToChange} fromPlaceholder={p.t("listings.fromArea")} toPlaceholder={p.t("listings.toArea")} />
    <ToggleGroup toggles={[
      { label: p.t("listings.nearBus"), value: p.nearBus, onValueChange: p.onNearBusChange },
      { label: p.t("listings.nearMetro"), value: p.nearMetro, onValueChange: p.onNearMetroChange },
    ]} />
  </>;
}

export const FarmForSaleOrderSection = memo(Comp);

