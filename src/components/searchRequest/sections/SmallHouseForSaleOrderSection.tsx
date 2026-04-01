import React, { memo } from "react";
import { PriceInputSection, TabBarSection, FieldWithModal, ToggleGroup } from "../../index";
import { BEDROOM_OPTIONS, LIVING_ROOM_OPTIONS } from "../../../constants/orderFormOptions";

type T = (key: string, options?: Record<string, string | number>) => string;

interface Props {
  t: T;
  selectedBedroom: string | null;
  selectedLivingRoom: string | null;
  smallHouseStreetDirection: string | null;
  smallHouseStreetWidth: string | null;
  age: string | null;
  smallHousePriceFrom: string;
  smallHousePriceTo: string;
  smallHouseAreaFrom: string;
  smallHouseAreaTo: string;
  smallHouseFurnished: boolean;
  tent: boolean;
  nearBus: boolean;
  nearMetro: boolean;
  getTranslatedPickerValue: (
    value: string | null,
    type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores"
  ) => string;
  onBedroomSelect: (v: string) => void;
  onLivingRoomSelect: (v: string) => void;
  onOpenStreetDirection: () => void;
  onOpenStreetWidth: () => void;
  onOpenAge: () => void;
  onPriceFromChange: (v: string) => void;
  onPriceToChange: (v: string) => void;
  onAreaFromChange: (v: string) => void;
  onAreaToChange: (v: string) => void;
  onFurnishedChange: (v: boolean) => void;
  onTentChange: (v: boolean) => void;
  onNearBusChange: (v: boolean) => void;
  onNearMetroChange: (v: boolean) => void;
}

function Comp(p: Props): React.JSX.Element {
  return (
    <>
      <PriceInputSection label={p.t("listings.price")} fromValue={p.smallHousePriceFrom} toValue={p.smallHousePriceTo} onFromChange={p.onPriceFromChange} onToChange={p.onPriceToChange} />
      <TabBarSection label={p.t("listings.bedrooms")} options={BEDROOM_OPTIONS} selectedValue={p.selectedBedroom} onSelect={p.onBedroomSelect} />
      <FieldWithModal label={p.t("listings.streetDirection")} value={p.getTranslatedPickerValue(p.smallHouseStreetDirection, "streetDirection")} placeholder={p.t("listings.selectStreetDirection")} onPress={p.onOpenStreetDirection} backgroundColor="background" />
      <TabBarSection label={p.t("listings.livingRoom")} options={LIVING_ROOM_OPTIONS} selectedValue={p.selectedLivingRoom} onSelect={p.onLivingRoomSelect} />
      <PriceInputSection label={p.t("listings.areaM2")} fromValue={p.smallHouseAreaFrom} toValue={p.smallHouseAreaTo} onFromChange={p.onAreaFromChange} onToChange={p.onAreaToChange} fromPlaceholder={p.t("listings.fromArea")} toPlaceholder={p.t("listings.toArea")} />
      <FieldWithModal label={p.t("listings.streetWidth")} value={p.getTranslatedPickerValue(p.smallHouseStreetWidth, "streetWidth")} placeholder={p.t("listings.selectStreetWidth")} onPress={p.onOpenStreetWidth} backgroundColor="background" />
      <FieldWithModal label={p.t("listings.age")} value={p.getTranslatedPickerValue(p.age, "age")} placeholder={p.t("listings.selectAge")} onPress={p.onOpenAge} backgroundColor="background" />
      <ToggleGroup
        toggles={[
          { label: p.t("listings.furnished"), value: p.smallHouseFurnished, onValueChange: p.onFurnishedChange },
          { label: p.t("listings.tent"), value: p.tent, onValueChange: p.onTentChange },
          { label: p.t("listings.nearBus"), value: p.nearBus, onValueChange: p.onNearBusChange },
          { label: p.t("listings.nearMetro"), value: p.nearMetro, onValueChange: p.onNearMetroChange },
        ]}
      />
    </>
  );
}

export const SmallHouseForSaleOrderSection = memo(Comp);

