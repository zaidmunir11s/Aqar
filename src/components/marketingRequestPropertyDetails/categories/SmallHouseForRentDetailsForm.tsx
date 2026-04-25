import React, { useEffect, useMemo, useState } from "react";
import ToggleRow from "../../orderForm/ToggleRow";
import OptionChips from "../shared/OptionChips";
import SliderWithInput from "../shared/SliderWithInput";
import InlineWheelPickerField from "../shared/InlineWheelPickerField";
import { useLocalization } from "@/hooks/useLocalization";
import { CategoryFormProps } from "../shared/CategoryFormProps";
import {
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
  WC_OPTIONS,
  STREET_DIRECTION_OPTIONS,
  AGE_PICKER_OPTIONS,
  buildAgePickerDisplayOptions,
  getDirectionLabel,
  formatRealEstateAgeLabel,
} from "../shared/propertyDetailsOptions";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);

export default function SmallHouseForRentDetailsForm({
  submitAttempted = false,
  onValidityChange,
  onFormDataChange,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useLocalization();
  const ageDisplayOptions = useMemo(() => buildAgePickerDisplayOptions(t), [t]);
  const [bedrooms, setBedrooms] = useState("1");
  const [livingRooms, setLivingRooms] = useState("0");
  const [streetDirection, setStreetDirection] = useState("Not Defined");
  const [wc, setWc] = useState("1");
  const [streetWidth, setStreetWidth] = useState(1);
  const [ageLessThan, setAgeLessThan] = useState("New");
  const streetDirectionOptions = useMemo(
    () => STREET_DIRECTION_OPTIONS.map((o) => getDirectionLabel(o, t)),
    [t],
  );

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    driverRoom: false,
    maidRoom: false,
    furnished: false,
    tent: false,
    backyard: false,
    kitchen: true,
    extraUnit: false,
    carEntrance: false,
    water: true,
    electricity: true,
    drainageAvailability: false,
  });

  const isStreetDirectionValid = streetDirection !== "Not Defined";

  useEffect(() => {
    onValidityChange?.(isStreetDirectionValid);
  }, [isStreetDirectionValid, onValidityChange]);

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
        icon: "navigate",
        label: t("listings.streetDirection"),
        value: getDirectionLabel(streetDirection, t),
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
        icon: "time",
        label: t("listings.realEstateAge"),
        value: formatRealEstateAgeLabel(ageLessThan, t),
      },
      {
        type: "toggle",
        label: t("listings.driverRoom"),
        enabled: toggles.driverRoom,
      },
      {
        type: "toggle",
        label: t("listings.maidRoom"),
        enabled: toggles.maidRoom,
      },
      {
        type: "toggle",
        label: t("listings.furnished"),
        enabled: toggles.furnished,
      },
      { type: "toggle", label: t("listings.tent"), enabled: toggles.tent },
      {
        type: "toggle",
        label: t("listings.backyard"),
        enabled: toggles.backyard,
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
      { type: "toggle", label: t("listings.water"), enabled: toggles.water },
      {
        type: "toggle",
        label: t("listings.electricity"),
        enabled: toggles.electricity,
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
    livingRooms,
    onFormDataChange,
    streetDirection,
    streetWidth,
    t,
    toggles.backyard,
    toggles.carEntrance,
    toggles.drainageAvailability,
    toggles.driverRoom,
    toggles.electricity,
    toggles.extraUnit,
    toggles.furnished,
    toggles.kitchen,
    toggles.maidRoom,
    toggles.tent,
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
      <OptionChips
        label={t("listings.streetDirection")}
        options={streetDirectionOptions}
        selectedValue={getDirectionLabel(streetDirection, t)}
        onSelect={(value) => {
          const original = STREET_DIRECTION_OPTIONS.find(
            (o) => getDirectionLabel(o, t) === value,
          );
          setStreetDirection(original ?? "Not Defined");
        }}
        scrollable
        errorText={
          submitAttempted && !isStreetDirectionValid
            ? t("listings.pleaseSelectStreetDirection")
            : undefined
        }
      />
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
        label={t("listings.ageLessThan")}
        value={ageLessThan}
        options={ageDisplayOptions}
        canonicalValues={AGE_PICKER_OPTIONS}
        modalTitle={t("listings.ageLessThan")}
        onChangeValue={setAgeLessThan}
      />
      {[
        "driverRoom",
        "maidRoom",
        "furnished",
        "tent",
        "backyard",
        "kitchen",
        "extraUnit",
        "carEntrance",
        "water",
        "electricity",
        "drainageAvailability",
      ].map((k) => (
        <ToggleRow
          key={k}
          label={t(`listings.${k}`)}
          value={toggles[k]}
          onValueChange={(v) => setToggles((p) => ({ ...p, [k]: v }))}
          trackWidth={TOGGLE_TRACK_WIDTH}
          trackHeight={TOGGLE_TRACK_HEIGHT}
          thumbSize={TOGGLE_THUMB_SIZE}
        />
      ))}
    </>
  );
}
