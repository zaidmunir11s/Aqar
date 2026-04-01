import React, { memo, useMemo, useCallback } from "react";
import {
  PriceInputSection,
  TabBarSection,
  FieldWithModal,
  ToggleGroup,
  RentPaymentFrequencyChips,
} from "../index";
import {
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
  WC_OPTIONS,
  VILLA_TYPE_OPTIONS,
  getRentSearchPriceLabel,
  type RentPaymentFrequency,
  type RentPaymentFrequencyChoice,
} from "../../../constants/orderFormOptions";
import { useLocalization } from "../../../hooks/useLocalization";

export interface VillaForRentSectionProps {
  rentPeriod: RentPaymentFrequency;
  onRentPeriodChange: (period: RentPaymentFrequencyChoice) => void;
  priceFrom: string;
  priceTo: string;
  onPriceFromChange: (value: string) => void;
  onPriceToChange: (value: string) => void;
  selectedBedroom: string | null;
  onBedroomChange: (value: string) => void;
  streetDirection: string;
  onStreetDirectionPress: () => void;
  selectedLivingRoom: string | null;
  onLivingRoomChange: (value: string) => void;
  selectedWc: string | null;
  onWcChange: (value: string) => void;
  areaFrom: string;
  areaTo: string;
  onAreaFromChange: (value: string) => void;
  onAreaToChange: (value: string) => void;
  streetWidth: string;
  onStreetWidthPress: () => void;
  stairs: boolean;
  onStairsChange: (value: boolean) => void;
  age: string;
  onAgePress: () => void;
  driverRoom: boolean;
  onDriverRoomChange: (value: boolean) => void;
  maidRoom: boolean;
  onMaidRoomChange: (value: boolean) => void;
  pool: boolean;
  onPoolChange: (value: boolean) => void;
  villaFurnished: boolean;
  onVillaFurnishedChange: (value: boolean) => void;
  kitchen: boolean;
  onKitchenChange: (value: boolean) => void;
  villaCarEntrance: boolean;
  onVillaCarEntranceChange: (value: boolean) => void;
  basement: boolean;
  onBasementChange: (value: boolean) => void;
  selectedVillaType: string | null;
  onVillaTypeChange: (value: string) => void;
  airConditioned: boolean;
  onAirConditionedChange: (value: boolean) => void;
  nearBus: boolean;
  onNearBusChange: (value: boolean) => void;
  nearMetro: boolean;
  onNearMetroChange: (value: boolean) => void;
}

const VillaForRentSection = memo<VillaForRentSectionProps>(
  ({
    rentPeriod,
    onRentPeriodChange,
    priceFrom,
    priceTo,
    onPriceFromChange,
    onPriceToChange,
    selectedBedroom,
    onBedroomChange,
    streetDirection,
    onStreetDirectionPress,
    selectedLivingRoom,
    onLivingRoomChange,
    selectedWc,
    onWcChange,
    areaFrom,
    areaTo,
    onAreaFromChange,
    onAreaToChange,
    streetWidth,
    onStreetWidthPress,
    stairs,
    onStairsChange,
    age,
    onAgePress,
    driverRoom,
    onDriverRoomChange,
    maidRoom,
    onMaidRoomChange,
    pool,
    onPoolChange,
    villaFurnished,
    onVillaFurnishedChange,
    kitchen,
    onKitchenChange,
    villaCarEntrance,
    onVillaCarEntranceChange,
    basement,
    onBasementChange,
    selectedVillaType,
    onVillaTypeChange,
    airConditioned,
    onAirConditionedChange,
    nearBus,
    onNearBusChange,
    nearMetro,
    onNearMetroChange,
  }) => {
    const { t, isRTL } = useLocalization();

    // Translated villa type options
    const translatedVillaTypeOptions = useMemo(
      () =>
        VILLA_TYPE_OPTIONS.map((opt) => {
          if (opt === "Standalone") return t("listings.standalone");
          if (opt === "Duplex") return t("listings.duplex");
          if (opt === "Townhouse") return t("listings.townhouse");
          return opt;
        }),
      [t]
    );

    // Create reverse map for villa type
    const createReverseMap = useCallback((original: string[], translated: string[]) => {
      const map: Record<string, string> = {};
      original.forEach((orig, index) => {
        map[translated[index]] = orig;
      });
      return map;
    }, []);

    const villaTypeReverseMap = useMemo(
      () => createReverseMap(VILLA_TYPE_OPTIONS, translatedVillaTypeOptions),
      [createReverseMap, translatedVillaTypeOptions]
    );

    // Get translated initial value
    const getTranslatedInitialValue = useCallback((originalValue: string | null): string => {
      if (!originalValue) return "";
      const originalIndex = Object.values(villaTypeReverseMap).indexOf(originalValue);
      return originalIndex >= 0 ? translatedVillaTypeOptions[originalIndex] : originalValue;
    }, [villaTypeReverseMap, translatedVillaTypeOptions]);

    return (
      <>
        <RentPaymentFrequencyChips selectedFrequency={rentPeriod} onSelect={onRentPeriodChange} />

        <PriceInputSection
          label={getRentSearchPriceLabel(rentPeriod, t)}
          fromValue={priceFrom}
          toValue={priceTo}
          onFromChange={onPriceFromChange}
          onToChange={onPriceToChange}
        />

        <TabBarSection
          label={t("listings.bedrooms")}
          options={BEDROOM_OPTIONS}
          selectedValue={selectedBedroom}
          onSelect={onBedroomChange}
        />

        <FieldWithModal
          label={t("listings.streetDirection")}
          value={streetDirection}
          placeholder={t("listings.selectStreetDirection")}
          onPress={onStreetDirectionPress}
          backgroundColor="background"
        />

        <TabBarSection
          label={t("listings.livingRooms")}
          options={LIVING_ROOM_OPTIONS}
          selectedValue={selectedLivingRoom}
          onSelect={onLivingRoomChange}
        />

        <TabBarSection
          label={t("listings.wc")}
          options={WC_OPTIONS}
          selectedValue={selectedWc}
          onSelect={onWcChange}
        />

        <PriceInputSection
          label={t("listings.areaM2")}
          fromValue={areaFrom}
          toValue={areaTo}
          onFromChange={onAreaFromChange}
          onToChange={onAreaToChange}
          fromPlaceholder={t("listings.fromArea")}
          toPlaceholder={t("listings.toArea")}
        />

        <FieldWithModal
          label={t("listings.streetWidth")}
          value={streetWidth}
          placeholder={t("listings.selectStreetWidth")}
          onPress={onStreetWidthPress}
          backgroundColor="background"
        />

        <ToggleGroup
          toggles={[{ label: t("listings.stairs"), value: stairs, onValueChange: onStairsChange }]}
        />

        <FieldWithModal
          label={t("listings.age")}
          value={age}
          placeholder={t("listings.selectAge")}
          onPress={onAgePress}
          backgroundColor="background"
        />

        <ToggleGroup
          toggles={[
            { label: t("listings.driverRoom"), value: driverRoom, onValueChange: onDriverRoomChange },
            { label: t("listings.maidRoom"), value: maidRoom, onValueChange: onMaidRoomChange },
            { label: t("listings.pool"), value: pool, onValueChange: onPoolChange },
            { label: t("listings.furnished"), value: villaFurnished, onValueChange: onVillaFurnishedChange },
            { label: t("listings.kitchen"), value: kitchen, onValueChange: onKitchenChange },
            { label: t("listings.carEntrance"), value: villaCarEntrance, onValueChange: onVillaCarEntranceChange },
            { label: t("listings.basement"), value: basement, onValueChange: onBasementChange },
          ]}
        />

        <TabBarSection
          label={t("listings.villaType")}
          options={translatedVillaTypeOptions}
          selectedValue={getTranslatedInitialValue(selectedVillaType)}
          onSelect={(translatedValue: string) => {
            const originalValue = villaTypeReverseMap[translatedValue] || translatedValue;
            onVillaTypeChange(originalValue);
          }}
        />

        <ToggleGroup
          toggles={[
            { label: t("listings.airConditioned"), value: airConditioned, onValueChange: onAirConditionedChange },
            { label: t("listings.nearBus"), value: nearBus, onValueChange: onNearBusChange },
            { label: t("listings.nearMetro"), value: nearMetro, onValueChange: onNearMetroChange },
          ]}
        />
      </>
    );
  }
);

VillaForRentSection.displayName = "VillaForRentSection";

export default VillaForRentSection;

