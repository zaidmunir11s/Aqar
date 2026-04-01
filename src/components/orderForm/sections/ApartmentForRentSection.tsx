import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import {
  PriceInputSection,
  TabBarSection,
  FieldWithModal,
  ToggleRow,
  RentPaymentFrequencyChips,
} from "../index";
import { COLORS } from "../../../constants";
import {
  APARTMENT_RENT_TENANT_OPTIONS,
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
  WC_OPTIONS,
  isRentAnnualPriceFrequency,
  type ApartmentRentTenant,
  type RentPaymentFrequency,
  type RentPaymentFrequencyChoice,
} from "../../../constants/orderFormOptions";
import { useLocalization } from "../../../hooks/useLocalization";

export type RentPeriod = RentPaymentFrequency;

export interface ApartmentForRentSectionProps {
  rentPeriod: RentPaymentFrequency;
  onRentPeriodChange: (period: RentPaymentFrequencyChoice) => void;
  fromPrice: string;
  toPrice: string;
  onFromPriceChange: (value: string) => void;
  onToPriceChange: (value: string) => void;
  priceFrom: string;
  priceTo: string;
  onPriceFromChange: (value: string) => void;
  onPriceToChange: (value: string) => void;
  apartmentRentTenant: ApartmentRentTenant;
  onApartmentRentTenantSelect: (value: string) => void;
  selectedBedroom: string | null;
  onBedroomChange: (value: string) => void;
  selectedLivingRoom: string | null;
  onLivingRoomChange: (value: string) => void;
  selectedWc: string | null;
  onWcChange: (value: string) => void;
  floor: string;
  onFloorPress: () => void;
  age: string;
  onAgePress: () => void;
  furnished: boolean;
  onFurnishedChange: (value: boolean) => void;
  carEntrance: boolean;
  onCarEntranceChange: (value: boolean) => void;
  airConditioned: boolean;
  onAirConditionedChange: (value: boolean) => void;
  privateRoof: boolean;
  onPrivateRoofChange: (value: boolean) => void;
  apartmentInVilla: boolean;
  onApartmentInVillaChange: (value: boolean) => void;
  twoEntrances: boolean;
  onTwoEntrancesChange: (value: boolean) => void;
  specialEntrances: boolean;
  onSpecialEntrancesChange: (value: boolean) => void;
}

const ApartmentForRentSection = memo<ApartmentForRentSectionProps>(
  ({
    rentPeriod,
    onRentPeriodChange,
    fromPrice,
    toPrice,
    onFromPriceChange,
    onToPriceChange,
    priceFrom,
    priceTo,
    onPriceFromChange,
    onPriceToChange,
    apartmentRentTenant,
    onApartmentRentTenantSelect,
    selectedBedroom,
    onBedroomChange,
    selectedLivingRoom,
    onLivingRoomChange,
    selectedWc,
    onWcChange,
    floor,
    onFloorPress,
    age,
    onAgePress,
    furnished,
    onFurnishedChange,
    carEntrance,
    onCarEntranceChange,
    airConditioned,
    onAirConditionedChange,
    privateRoof,
    onPrivateRoofChange,
    apartmentInVilla,
    onApartmentInVillaChange,
    twoEntrances,
    onTwoEntrancesChange,
    specialEntrances,
    onSpecialEntrancesChange,
  }) => {
    const { t } = useLocalization();
    const showAnnualPriceBlock = rentPeriod != null && isRentAnnualPriceFrequency(rentPeriod);
    const isMonthly = rentPeriod === "Monthly";
    const showPriceSection = !rentPeriod;
    const priceLabel = isMonthly ? t("listings.priceMonthly") : t("listings.annualPrice");

    return (
      <>
        <RentPaymentFrequencyChips selectedFrequency={rentPeriod} onSelect={onRentPeriodChange} />

        {showAnnualPriceBlock && (
          <PriceInputSection
            label={priceLabel}
            fromValue={fromPrice}
            toValue={toPrice}
            onFromChange={onFromPriceChange}
            onToChange={onToPriceChange}
            fromPlaceholder="From price"
            toPlaceholder="To price"
          />
        )}

        {showPriceSection && (
          <PriceInputSection
            label="Price"
            fromValue={priceFrom}
            toValue={priceTo}
            onFromChange={onPriceFromChange}
            onToChange={onPriceToChange}
            fromPlaceholder="From price"
            toPlaceholder="To price"
          />
        )}

        <TabBarSection
          options={[...APARTMENT_RENT_TENANT_OPTIONS]}
          selectedValue={apartmentRentTenant}
          onSelect={onApartmentRentTenantSelect}
        />

        <TabBarSection
          label="Bedrooms"
          options={BEDROOM_OPTIONS}
          selectedValue={selectedBedroom}
          onSelect={onBedroomChange}
        />

        <TabBarSection
          label="Living Rooms"
          options={LIVING_ROOM_OPTIONS}
          selectedValue={selectedLivingRoom}
          onSelect={onLivingRoomChange}
        />

        <TabBarSection
          label="WC"
          options={WC_OPTIONS}
          selectedValue={selectedWc}
          onSelect={onWcChange}
        />

        <FieldWithModal
          label="Floor"
          value={floor}
          placeholder="Select floor"
          onPress={onFloorPress}
          backgroundColor="background"
        />

        <FieldWithModal
          label="Age"
          value={age}
          placeholder="Select age"
          onPress={onAgePress}
          backgroundColor="background"
        />

        <View style={styles.section}>
          <ToggleRow
            label="Furnished"
            value={furnished}
            onValueChange={onFurnishedChange}
          />
          <ToggleRow
            label="Car entrance"
            value={carEntrance}
            onValueChange={onCarEntranceChange}
          />
          <ToggleRow
            label="Air conditioned"
            value={airConditioned}
            onValueChange={onAirConditionedChange}
          />
          <ToggleRow
            label="Private roof"
            value={privateRoof}
            onValueChange={onPrivateRoofChange}
          />
          <ToggleRow
            label="Apartment in villa"
            value={apartmentInVilla}
            onValueChange={onApartmentInVillaChange}
          />
          <ToggleRow
            label="Two entrances"
            value={twoEntrances}
            onValueChange={onTwoEntrancesChange}
          />
          <ToggleRow
            label="Special entrances"
            value={specialEntrances}
            onValueChange={onSpecialEntrancesChange}
          />
        </View>
      </>
    );
  }
);

ApartmentForRentSection.displayName = "ApartmentForRentSection";

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(2.5),
  },
});

export default ApartmentForRentSection;
