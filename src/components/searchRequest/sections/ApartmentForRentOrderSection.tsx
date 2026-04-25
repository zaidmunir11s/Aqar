import React, { memo } from "react";
import {
  PriceInputSection,
  TabBarSection,
  FieldWithModal,
  RentPaymentFrequencyChips,
  ToggleGroup,
} from "../../index";
import {
  APARTMENT_RENT_TENANT_OPTIONS,
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
  WC_OPTIONS,
  type ApartmentRentTenant,
  type RentPaymentFrequency,
  type RentPaymentFrequencyChoice,
} from "../../../constants/orderFormOptions";

type Translate = (
  key: string,
  options?: Record<string, string | number>,
) => string;

interface ApartmentForRentOrderSectionProps {
  t: Translate;
  rentPeriod: RentPaymentFrequency;
  apartmentRentTenant: ApartmentRentTenant;
  selectedBedroom: string | null;
  selectedLivingRoom: string | null;
  selectedWc: string | null;
  floor: string | null;
  age: string | null;
  furnished: boolean;
  carEntrance: boolean;
  airConditioned: boolean;
  privateRoof: boolean;
  apartmentInVilla: boolean;
  twoEntrances: boolean;
  specialEntrances: boolean;
  fromPrice: string;
  toPrice: string;
  priceFrom: string;
  priceTo: string;
  showYearlyContent: boolean;
  showPriceSection: boolean;
  priceLabel: string;
  getTranslatedPickerValue: (
    originalValue: string | null,
    type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores",
  ) => string;
  onRentPeriodSelect: (period: RentPaymentFrequencyChoice) => void;
  onFromPriceChange: (value: string) => void;
  onToPriceChange: (value: string) => void;
  onPriceFromChange: (value: string) => void;
  onPriceToChange: (value: string) => void;
  onApartmentRentTenantSelect: (value: string) => void;
  onBedroomSelect: (value: string) => void;
  onLivingRoomSelect: (value: string) => void;
  onWcSelect: (value: string) => void;
  onOpenFloor: () => void;
  onOpenAge: () => void;
  onFurnishedChange: (value: boolean) => void;
  onCarEntranceChange: (value: boolean) => void;
  onAirConditionedChange: (value: boolean) => void;
  onPrivateRoofChange: (value: boolean) => void;
  onApartmentInVillaChange: (value: boolean) => void;
  onTwoEntrancesChange: (value: boolean) => void;
  onSpecialEntrancesChange: (value: boolean) => void;
}

function ApartmentForRentOrderSectionComponent(
  props: ApartmentForRentOrderSectionProps,
): React.JSX.Element {
  const {
    t,
    rentPeriod,
    apartmentRentTenant,
    selectedBedroom,
    selectedLivingRoom,
    selectedWc,
    floor,
    age,
    furnished,
    carEntrance,
    airConditioned,
    privateRoof,
    apartmentInVilla,
    twoEntrances,
    specialEntrances,
    fromPrice,
    toPrice,
    priceFrom,
    priceTo,
    showYearlyContent,
    showPriceSection,
    priceLabel,
    getTranslatedPickerValue,
    onRentPeriodSelect,
    onFromPriceChange,
    onToPriceChange,
    onPriceFromChange,
    onPriceToChange,
    onApartmentRentTenantSelect,
    onBedroomSelect,
    onLivingRoomSelect,
    onWcSelect,
    onOpenFloor,
    onOpenAge,
    onFurnishedChange,
    onCarEntranceChange,
    onAirConditionedChange,
    onPrivateRoofChange,
    onApartmentInVillaChange,
    onTwoEntrancesChange,
    onSpecialEntrancesChange,
  } = props;

  return (
    <>
      <RentPaymentFrequencyChips
        selectedFrequency={rentPeriod}
        onSelect={onRentPeriodSelect}
      />

      {showYearlyContent && (
        <PriceInputSection
          label={priceLabel}
          fromValue={fromPrice}
          toValue={toPrice}
          onFromChange={onFromPriceChange}
          onToChange={onToPriceChange}
        />
      )}

      {showPriceSection && (
        <PriceInputSection
          label={t("listings.price")}
          fromValue={priceFrom}
          toValue={priceTo}
          onFromChange={onPriceFromChange}
          onToChange={onPriceToChange}
        />
      )}

      <TabBarSection
        options={[...APARTMENT_RENT_TENANT_OPTIONS]}
        selectedValue={apartmentRentTenant}
        onSelect={onApartmentRentTenantSelect}
      />

      <TabBarSection
        label={t("listings.bedrooms")}
        options={BEDROOM_OPTIONS}
        selectedValue={selectedBedroom}
        onSelect={onBedroomSelect}
      />
      <TabBarSection
        label={t("listings.livingRooms")}
        options={LIVING_ROOM_OPTIONS}
        selectedValue={selectedLivingRoom}
        onSelect={onLivingRoomSelect}
      />
      <TabBarSection
        label={t("listings.wc")}
        options={WC_OPTIONS}
        selectedValue={selectedWc}
        onSelect={onWcSelect}
      />

      <FieldWithModal
        label={t("listings.floor")}
        value={getTranslatedPickerValue(floor, "floor")}
        placeholder={t("listings.selectFloor")}
        onPress={onOpenFloor}
        backgroundColor="background"
      />
      <FieldWithModal
        label={t("listings.age")}
        value={getTranslatedPickerValue(age, "age")}
        placeholder={t("listings.selectAge")}
        onPress={onOpenAge}
        backgroundColor="background"
      />

      <ToggleGroup
        toggles={[
          {
            label: t("listings.furnished"),
            value: furnished,
            onValueChange: onFurnishedChange,
          },
          {
            label: t("listings.carEntrance"),
            value: carEntrance,
            onValueChange: onCarEntranceChange,
          },
          {
            label: t("listings.airConditioned"),
            value: airConditioned,
            onValueChange: onAirConditionedChange,
          },
          {
            label: t("listings.privateRoof"),
            value: privateRoof,
            onValueChange: onPrivateRoofChange,
          },
          {
            label: t("listings.apartmentInVilla"),
            value: apartmentInVilla,
            onValueChange: onApartmentInVillaChange,
          },
          {
            label: t("listings.twoEntrances"),
            value: twoEntrances,
            onValueChange: onTwoEntrancesChange,
          },
          {
            label: t("listings.specialEntrances"),
            value: specialEntrances,
            onValueChange: onSpecialEntrancesChange,
          },
        ]}
      />
    </>
  );
}

export const ApartmentForRentOrderSection = memo(
  ApartmentForRentOrderSectionComponent,
);
