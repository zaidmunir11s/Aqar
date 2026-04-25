import React, { memo } from "react";
import {
  PriceInputSection,
  TabBarSection,
  FieldWithModal,
  RentPaymentFrequencyChips,
  ToggleGroup,
} from "../../index";
import {
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
  WC_OPTIONS,
  getRentSearchPriceLabel,
  type RentPaymentFrequency,
  type RentPaymentFrequencyChoice,
} from "../../../constants/orderFormOptions";

type T = (key: string, options?: Record<string, string | number>) => string;
interface Props {
  t: T;
  rentPeriod: RentPaymentFrequency;
  selectedBedroom: string | null;
  selectedLivingRoom: string | null;
  selectedWc: string | null;
  floor: string | null;
  age: string | null;
  priceFrom: string;
  priceTo: string;
  areaFrom: string;
  areaTo: string;
  areaRangeHint?: string;
  carEntrance: boolean;
  airConditioned: boolean;
  apartmentInVilla: boolean;
  twoEntrances: boolean;
  specialEntrances: boolean;
  nearBus: boolean;
  nearMetro: boolean;
  getTranslatedPickerValue: (
    v: string | null,
    type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores",
  ) => string;
  onRentPeriodSelect: (v: RentPaymentFrequencyChoice) => void;
  onBedroomSelect: (v: string) => void;
  onLivingRoomSelect: (v: string) => void;
  onWcSelect: (v: string) => void;
  onOpenFloor: () => void;
  onOpenAge: () => void;
  onPriceFromChange: (v: string) => void;
  onPriceToChange: (v: string) => void;
  onAreaFromChange: (v: string) => void;
  onAreaToChange: (v: string) => void;
  onCarEntranceChange: (v: boolean) => void;
  onAirConditionedChange: (v: boolean) => void;
  onApartmentInVillaChange: (v: boolean) => void;
  onTwoEntrancesChange: (v: boolean) => void;
  onSpecialEntrancesChange: (v: boolean) => void;
  onNearBusChange: (v: boolean) => void;
  onNearMetroChange: (v: boolean) => void;
}

function Comp(p: Props): React.JSX.Element {
  return (
    <>
      <RentPaymentFrequencyChips
        selectedFrequency={p.rentPeriod}
        onSelect={p.onRentPeriodSelect}
      />
      <PriceInputSection
        label={getRentSearchPriceLabel(p.rentPeriod, p.t)}
        fromValue={p.priceFrom}
        toValue={p.priceTo}
        onFromChange={p.onPriceFromChange}
        onToChange={p.onPriceToChange}
      />
      <TabBarSection
        label={p.t("listings.bedrooms")}
        options={BEDROOM_OPTIONS}
        selectedValue={p.selectedBedroom}
        onSelect={p.onBedroomSelect}
      />
      <TabBarSection
        label={p.t("listings.livingRooms")}
        options={LIVING_ROOM_OPTIONS}
        selectedValue={p.selectedLivingRoom}
        onSelect={p.onLivingRoomSelect}
      />
      <TabBarSection
        label={p.t("listings.wc")}
        options={WC_OPTIONS}
        selectedValue={p.selectedWc}
        onSelect={p.onWcSelect}
      />
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
      <FieldWithModal
        label={p.t("listings.floor")}
        value={p.getTranslatedPickerValue(p.floor, "floor")}
        placeholder={p.t("listings.selectFloor")}
        onPress={p.onOpenFloor}
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
            label: p.t("listings.carEntrance"),
            value: p.carEntrance,
            onValueChange: p.onCarEntranceChange,
          },
          {
            label: p.t("listings.airConditioned"),
            value: p.airConditioned,
            onValueChange: p.onAirConditionedChange,
          },
          {
            label: p.t("listings.apartmentInVilla"),
            value: p.apartmentInVilla,
            onValueChange: p.onApartmentInVillaChange,
          },
          {
            label: p.t("listings.twoEntrances"),
            value: p.twoEntrances,
            onValueChange: p.onTwoEntrancesChange,
          },
          {
            label: p.t("listings.specialEntrances"),
            value: p.specialEntrances,
            onValueChange: p.onSpecialEntrancesChange,
          },
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

export const BigFlatForRentOrderSection = memo(Comp);
