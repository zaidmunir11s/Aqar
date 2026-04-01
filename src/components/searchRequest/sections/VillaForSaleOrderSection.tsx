import React, { memo } from "react";
import {
  PriceInputSection,
  TabBarSection,
  FieldWithModal,
  ToggleGroup,
} from "../../index";
import {
  APARTMENT_OPTIONS,
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
  WC_OPTIONS,
} from "../../../constants/orderFormOptions";

type Translate = (key: string, options?: Record<string, string | number>) => string;

interface Props {
  t: Translate;
  translatedVillaTypeOptions: string[];
  selectedVillaType: string | null;
  selectedApartment: string | null;
  selectedBedroom: string | null;
  selectedLivingRoom: string | null;
  selectedWc: string | null;
  streetDirection: string | null;
  streetWidth: string | null;
  age: string | null;
  areaFrom: string;
  areaTo: string;
  priceFrom: string;
  priceTo: string;
  stairs: boolean;
  driverRoom: boolean;
  maidRoom: boolean;
  pool: boolean;
  villaFurnished: boolean;
  kitchen: boolean;
  villaCarEntrance: boolean;
  basement: boolean;
  nearBus: boolean;
  nearMetro: boolean;
  getTranslatedPickerValue: (
    originalValue: string | null,
    type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores"
  ) => string;
  onApartmentSelect: (v: string) => void;
  onBedroomSelect: (v: string) => void;
  onLivingRoomSelect: (v: string) => void;
  onWcSelect: (v: string) => void;
  onOpenStreetDirection: () => void;
  onOpenStreetWidth: () => void;
  onOpenAge: () => void;
  onPriceFromChange: (v: string) => void;
  onPriceToChange: (v: string) => void;
  onAreaFromChange: (v: string) => void;
  onAreaToChange: (v: string) => void;
  onVillaTypeSelect: (v: string) => void;
  onStairsChange: (v: boolean) => void;
  onDriverRoomChange: (v: boolean) => void;
  onMaidRoomChange: (v: boolean) => void;
  onPoolChange: (v: boolean) => void;
  onVillaFurnishedChange: (v: boolean) => void;
  onKitchenChange: (v: boolean) => void;
  onVillaCarEntranceChange: (v: boolean) => void;
  onBasementChange: (v: boolean) => void;
  onNearBusChange: (v: boolean) => void;
  onNearMetroChange: (v: boolean) => void;
}

function Comp(p: Props): React.JSX.Element {
  return (
    <>
      <PriceInputSection label={p.t("listings.price")} fromValue={p.priceFrom} toValue={p.priceTo} onFromChange={p.onPriceFromChange} onToChange={p.onPriceToChange} />
      <TabBarSection label={p.t("listings.apartments")} options={APARTMENT_OPTIONS} selectedValue={p.selectedApartment} onSelect={p.onApartmentSelect} />
      <TabBarSection label={p.t("listings.bedrooms")} options={BEDROOM_OPTIONS} selectedValue={p.selectedBedroom} onSelect={p.onBedroomSelect} />
      <FieldWithModal label={p.t("listings.streetDirection")} value={p.getTranslatedPickerValue(p.streetDirection, "streetDirection")} placeholder={p.t("listings.selectStreetDirection")} onPress={p.onOpenStreetDirection} backgroundColor="background" />
      <TabBarSection label={p.t("listings.livingRooms")} options={LIVING_ROOM_OPTIONS} selectedValue={p.selectedLivingRoom} onSelect={p.onLivingRoomSelect} />
      <TabBarSection label={p.t("listings.wc")} options={WC_OPTIONS} selectedValue={p.selectedWc} onSelect={p.onWcSelect} />
      <PriceInputSection label={p.t("listings.areaM2")} fromValue={p.areaFrom} toValue={p.areaTo} onFromChange={p.onAreaFromChange} onToChange={p.onAreaToChange} fromPlaceholder={p.t("listings.fromArea")} toPlaceholder={p.t("listings.toArea")} />
      <FieldWithModal label={p.t("listings.streetWidth")} value={p.getTranslatedPickerValue(p.streetWidth, "streetWidth")} placeholder={p.t("listings.selectStreetWidth")} onPress={p.onOpenStreetWidth} backgroundColor="background" />
      <ToggleGroup toggles={[{ label: p.t("listings.stairs"), value: p.stairs, onValueChange: p.onStairsChange }]} />
      <FieldWithModal label={p.t("listings.age")} value={p.getTranslatedPickerValue(p.age, "age")} placeholder={p.t("listings.selectAge")} onPress={p.onOpenAge} backgroundColor="background" />
      <ToggleGroup toggles={[
        { label: p.t("listings.driverRoom"), value: p.driverRoom, onValueChange: p.onDriverRoomChange },
        { label: p.t("listings.maidRoom"), value: p.maidRoom, onValueChange: p.onMaidRoomChange },
        { label: p.t("listings.pool"), value: p.pool, onValueChange: p.onPoolChange },
        { label: p.t("listings.furnished"), value: p.villaFurnished, onValueChange: p.onVillaFurnishedChange },
        { label: p.t("listings.kitchen"), value: p.kitchen, onValueChange: p.onKitchenChange },
        { label: p.t("listings.carEntrance"), value: p.villaCarEntrance, onValueChange: p.onVillaCarEntranceChange },
        { label: p.t("listings.basement"), value: p.basement, onValueChange: p.onBasementChange },
      ]} />
      <TabBarSection label={p.t("listings.villaType")} options={p.translatedVillaTypeOptions} selectedValue={p.selectedVillaType} onSelect={p.onVillaTypeSelect} />
      <ToggleGroup toggles={[
        { label: p.t("listings.nearBus"), value: p.nearBus, onValueChange: p.onNearBusChange },
        { label: p.t("listings.nearMetro"), value: p.nearMetro, onValueChange: p.onNearMetroChange },
      ]} />
    </>
  );
}

export const VillaForSaleOrderSection = memo(Comp);

