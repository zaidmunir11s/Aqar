import React, { memo } from "react";
import {
  PriceInputSection,
  TabBarSection,
  FieldWithModal,
  ToggleGroup,
} from "../../index";
import { LIVING_ROOM_OPTIONS } from "../../../constants/orderFormOptions";

type T = (key: string, options?: Record<string, string | number>) => string;
interface Props {
  t: T;
  selectedLivingRoom: string | null;
  floor: string | null;
  age: string | null;
  floorSalePriceFrom: string;
  floorSalePriceTo: string;
  floorSaleAreaFrom: string;
  floorSaleAreaTo: string;
  floorSaleCarEntrance: boolean;
  nearBus: boolean;
  nearMetro: boolean;
  getTranslatedPickerValue: (
    value: string | null,
    type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores",
  ) => string;
  onLivingRoomSelect: (v: string) => void;
  onOpenFloor: () => void;
  onOpenAge: () => void;
  onPriceFromChange: (v: string) => void;
  onPriceToChange: (v: string) => void;
  onAreaFromChange: (v: string) => void;
  onAreaToChange: (v: string) => void;
  onCarEntranceChange: (v: boolean) => void;
  onNearBusChange: (v: boolean) => void;
  onNearMetroChange: (v: boolean) => void;
}

function Comp(p: Props): React.JSX.Element {
  return (
    <>
      <PriceInputSection
        label={p.t("listings.price")}
        fromValue={p.floorSalePriceFrom}
        toValue={p.floorSalePriceTo}
        onFromChange={p.onPriceFromChange}
        onToChange={p.onPriceToChange}
      />
      <TabBarSection
        label={p.t("listings.livingRooms")}
        options={LIVING_ROOM_OPTIONS}
        selectedValue={p.selectedLivingRoom}
        onSelect={p.onLivingRoomSelect}
      />
      <PriceInputSection
        label={p.t("listings.areaM2")}
        fromValue={p.floorSaleAreaFrom}
        toValue={p.floorSaleAreaTo}
        onFromChange={p.onAreaFromChange}
        onToChange={p.onAreaToChange}
        fromPlaceholder={p.t("listings.fromArea")}
        toPlaceholder={p.t("listings.toArea")}
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
            value: p.floorSaleCarEntrance,
            onValueChange: p.onCarEntranceChange,
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

export const FloorForSaleOrderSection = memo(Comp);
