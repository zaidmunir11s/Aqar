import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ToggleRow from "../../orderForm/ToggleRow";
import OptionChips from "../shared/OptionChips";
import SliderWithInput from "../shared/SliderWithInput";
import InlineWheelPickerField from "../shared/InlineWheelPickerField";
import SegmentedControl from "../../common/SegmentedControl";
import { useLocalization } from "@/hooks/useLocalization";
import {
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
  WC_OPTIONS,
  AGE_PICKER_OPTIONS,
  buildAgePickerDisplayOptions,
  buildFloorPickerOptions,
  formatRealEstateAgeLabel,
} from "../shared/propertyDetailsOptions";
import { CategoryFormProps } from "../shared/CategoryFormProps";

const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);

export default function ApartmentForRentDetailsForm({
  onFormDataChange,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useLocalization();
  const ageDisplayOptions = useMemo(() => buildAgePickerDisplayOptions(t), [t]);
  const [bedrooms, setBedrooms] = useState("1");
  const [livingRooms, setLivingRooms] = useState("0");
  const [tabIndex, setTabIndex] = useState(0);
  const [wc, setWc] = useState("1");
  const [streetWidth, setStreetWidth] = useState(1);
  const floorOptions = useMemo(() => buildFloorPickerOptions(t), [t]);
  const [floorValue, setFloorValue] = useState<string>("");
  const [ageLessThan, setAgeLessThan] = useState("New");

  React.useEffect(() => {
    if (!floorValue && floorOptions.length > 0) setFloorValue(floorOptions[0]);
  }, [floorOptions, floorValue]);

  const options = useMemo(
    () => [t("listings.single"), t("listings.family")],
    [t],
  );

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    furnished: false,
    kitchen: true,
    extraUnit: false,
    carEntrance: false,
    lift: false,
    airConditioned: false,
    water: true,
    electricity: true,
    privateRoof: false,
    apartmentInVilla: false,
    twoEntrances: false,
    specialEntrance: false,
    drainageAvailability: false,
  });

  useEffect(() => {
    onFormDataChange?.([
      {
        type: "value",
        icon: "bed",
        label: t("listings.bedrooms"),
        value: bedrooms,
      },
      {
        type: "value",
        icon: "home",
        label: t("listings.livingRooms"),
        value: livingRooms,
      },
      {
        type: "value",
        label: t("listings.category"),
        value: options[tabIndex],
      },
      {
        type: "value",
        icon: "water",
        label: t("listings.restrooms"),
        value: wc,
      },
      {
        type: "value",
        icon: "swap-horizontal",
        label: t("listings.streetWidth"),
        value: String(streetWidth),
      },
      {
        type: "value",
        icon: "business",
        label: t("listings.floor"),
        value: floorValue || (floorOptions[0] ?? ""),
      },
      {
        type: "value",
        icon: "time",
        label: t("listings.realEstateAge"),
        value: formatRealEstateAgeLabel(ageLessThan, t),
      },
      {
        type: "toggle",
        label: t("listings.furnished"),
        enabled: toggles.furnished,
      },
      {
        type: "toggle",
        label: t("listings.kitchen"),
        enabled: toggles.kitchen,
      },
      {
        type: "toggle",
        label: t("listings.extraUnit"),
        enabled: toggles.extraUnit,
      },
      {
        type: "toggle",
        label: t("listings.carEntrance"),
        enabled: toggles.carEntrance,
      },
      { type: "toggle", label: t("listings.lift"), enabled: toggles.lift },
      {
        type: "toggle",
        label: t("listings.airConditioned"),
        enabled: toggles.airConditioned,
      },
      { type: "toggle", label: t("listings.water"), enabled: toggles.water },
      {
        type: "toggle",
        label: t("listings.electricity"),
        enabled: toggles.electricity,
      },
      {
        type: "toggle",
        label: t("listings.privateRoof"),
        enabled: toggles.privateRoof,
      },
      {
        type: "toggle",
        label: t("listings.apartmentInVilla"),
        enabled: toggles.apartmentInVilla,
      },
      {
        type: "toggle",
        label: t("listings.twoEntrances"),
        enabled: toggles.twoEntrances,
      },
      {
        type: "toggle",
        label: t("listings.specialEntrance"),
        enabled: toggles.specialEntrance,
      },
      {
        type: "toggle",
        label: t("listings.drainageAvailability"),
        enabled: toggles.drainageAvailability,
      },
    ]);
  }, [
    ageLessThan,
    bedrooms,
    floorOptions,
    floorValue,
    livingRooms,
    onFormDataChange,
    options,
    streetWidth,
    tabIndex,
    t,
    toggles.airConditioned,
    toggles.apartmentInVilla,
    toggles.carEntrance,
    toggles.drainageAvailability,
    toggles.electricity,
    toggles.extraUnit,
    toggles.furnished,
    toggles.kitchen,
    toggles.lift,
    toggles.privateRoof,
    toggles.specialEntrance,
    toggles.twoEntrances,
    toggles.water,
    wc,
  ]);

  return (
    <>
      <OptionChips
        label={t("listings.bedrooms")}
        options={BEDROOM_OPTIONS}
        selectedValue={bedrooms}
        onSelect={setBedrooms}
      />
      <OptionChips
        label={t("listings.livingRooms")}
        options={LIVING_ROOM_OPTIONS}
        selectedValue={livingRooms}
        onSelect={setLivingRooms}
      />
      <View style={{ marginBottom: hp(2) }}>
        <SegmentedControl
          variant="large"
          options={options}
          selectedIndex={tabIndex}
          onSelect={setTabIndex}
        />
      </View>
      <OptionChips
        label={t("listings.wc")}
        options={WC_OPTIONS}
        selectedValue={wc}
        onSelect={setWc}
      />
      <SliderWithInput
        label={t("listings.streetWidth")}
        value={streetWidth}
        onChangeValue={setStreetWidth}
        max={100}
      />
      <InlineWheelPickerField
        label={t("listings.floor")}
        value={floorValue || (floorOptions[0] ?? "")}
        options={floorOptions}
        modalTitle={t("listings.floor")}
        onChangeValue={setFloorValue}
      />
      <InlineWheelPickerField
        label={t("listings.ageLessThan")}
        value={ageLessThan}
        options={ageDisplayOptions}
        canonicalValues={AGE_PICKER_OPTIONS}
        modalTitle={t("listings.ageLessThan")}
        onChangeValue={setAgeLessThan}
      />

      {[
        ["furnished", "furnished"],
        ["kitchen", "kitchen"],
        ["extraUnit", "extraUnit"],
        ["carEntrance", "carEntrance"],
        ["lift", "lift"],
        ["airConditioned", "airConditioned"],
        ["water", "water"],
        ["electricity", "electricity"],
        ["privateRoof", "privateRoof"],
        ["apartmentInVilla", "apartmentInVilla"],
        ["twoEntrances", "twoEntrances"],
        ["specialEntrance", "specialEntrance"],
        ["drainageAvailability", "drainageAvailability"],
      ].map(([stateKey, i18nKey]) => (
        <ToggleRow
          key={stateKey}
          label={t(`listings.${i18nKey}`)}
          value={toggles[stateKey]}
          onValueChange={(v) =>
            setToggles((prev) => ({ ...prev, [stateKey]: v }))
          }
          trackWidth={TOGGLE_TRACK_WIDTH}
          trackHeight={TOGGLE_TRACK_HEIGHT}
          thumbSize={TOGGLE_THUMB_SIZE}
        />
      ))}
    </>
  );
}
