import React, { memo } from "react";
import { PriceInputSection, RentPaymentFrequencyChips, ToggleGroup } from "../../index";
import {
  getRentSearchPriceLabel,
  type RentPaymentFrequency,
  type RentPaymentFrequencyChoice,
} from "../../../constants/orderFormOptions";

type Translate = (key: string, options?: Record<string, string | number>) => string;

interface ChaletForRentOrderSectionProps {
  t: Translate;
  chaletRentRentPeriod: RentPaymentFrequency;
  chaletRentPriceFrom: string;
  chaletRentPriceTo: string;
  chaletRentAreaFrom: string;
  chaletRentAreaTo: string;
  chaletRentPool: boolean;
  chaletFootballPitch: boolean;
  chaletVolleyballCourt: boolean;
  chaletRentTent: boolean;
  chaletRentKitchen: boolean;
  chaletPlayground: boolean;
  nearBus: boolean;
  nearMetro: boolean;
  familySection: boolean;
  onRentPeriodSelect: (period: RentPaymentFrequencyChoice) => void;
  onPriceFromChange: (value: string) => void;
  onPriceToChange: (value: string) => void;
  onAreaFromChange: (value: string) => void;
  onAreaToChange: (value: string) => void;
  onPoolChange: (value: boolean) => void;
  onFootballPitchChange: (value: boolean) => void;
  onVolleyballCourtChange: (value: boolean) => void;
  onTentChange: (value: boolean) => void;
  onKitchenChange: (value: boolean) => void;
  onPlaygroundChange: (value: boolean) => void;
  onNearBusChange: (value: boolean) => void;
  onNearMetroChange: (value: boolean) => void;
  onFamilySectionChange: (value: boolean) => void;
}

function ChaletForRentOrderSectionComponent(
  props: ChaletForRentOrderSectionProps
): React.JSX.Element {
  const {
    t,
    chaletRentRentPeriod,
    chaletRentPriceFrom,
    chaletRentPriceTo,
    chaletRentAreaFrom,
    chaletRentAreaTo,
    chaletRentPool,
    chaletFootballPitch,
    chaletVolleyballCourt,
    chaletRentTent,
    chaletRentKitchen,
    chaletPlayground,
    nearBus,
    nearMetro,
    familySection,
    onRentPeriodSelect,
    onPriceFromChange,
    onPriceToChange,
    onAreaFromChange,
    onAreaToChange,
    onPoolChange,
    onFootballPitchChange,
    onVolleyballCourtChange,
    onTentChange,
    onKitchenChange,
    onPlaygroundChange,
    onNearBusChange,
    onNearMetroChange,
    onFamilySectionChange,
  } = props;

  return (
    <>
      <RentPaymentFrequencyChips selectedFrequency={chaletRentRentPeriod} onSelect={onRentPeriodSelect} />

      <PriceInputSection
        label={getRentSearchPriceLabel(chaletRentRentPeriod, t)}
        fromValue={chaletRentPriceFrom}
        toValue={chaletRentPriceTo}
        onFromChange={onPriceFromChange}
        onToChange={onPriceToChange}
      />

      <PriceInputSection
        label={t("listings.areaM2")}
        fromValue={chaletRentAreaFrom}
        toValue={chaletRentAreaTo}
        onFromChange={onAreaFromChange}
        onToChange={onAreaToChange}
        fromPlaceholder={t("listings.fromArea")}
        toPlaceholder={t("listings.toArea")}
      />

      <ToggleGroup
        toggles={[
          { label: t("listings.pool"), value: chaletRentPool, onValueChange: onPoolChange },
          { label: t("listings.footballPitch"), value: chaletFootballPitch, onValueChange: onFootballPitchChange },
          { label: t("listings.volleyballCourt"), value: chaletVolleyballCourt, onValueChange: onVolleyballCourtChange },
          { label: t("listings.tent"), value: chaletRentTent, onValueChange: onTentChange },
          { label: t("listings.kitchen"), value: chaletRentKitchen, onValueChange: onKitchenChange },
          { label: t("listings.playground"), value: chaletPlayground, onValueChange: onPlaygroundChange },
          { label: t("listings.nearBus"), value: nearBus, onValueChange: onNearBusChange },
          { label: t("listings.nearMetro"), value: nearMetro, onValueChange: onNearMetroChange },
          { label: t("listings.familySection"), value: familySection, onValueChange: onFamilySectionChange },
        ]}
      />
    </>
  );
}

export const ChaletForRentOrderSection = memo(ChaletForRentOrderSectionComponent);
