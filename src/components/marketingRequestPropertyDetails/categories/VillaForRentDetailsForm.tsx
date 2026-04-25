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
  buildVillaTypeDisplayOptions,
  canonicalVillaTypeFromDisplayLabel,
  getDirectionLabel,
  formatRealEstateAgeLabel,
  villaTypeRowLabel,
} from "../shared/propertyDetailsOptions";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);

export default function VillaForRentDetailsForm({
  submitAttempted = false,
  onValidityChange,
  onFormDataChange,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useLocalization();
  const ageDisplayOptions = useMemo(() => buildAgePickerDisplayOptions(t), [t]);
  const villaTypeDisplayOptions = useMemo(
    () => buildVillaTypeDisplayOptions(t),
    [t],
  );
  const [bedrooms, setBedrooms] = useState("1");
  const [livingRooms, setLivingRooms] = useState("0");
  const [streetDirection, setStreetDirection] = useState("Not Defined");
  const [wc, setWc] = useState("1");
  const [streetWidth, setStreetWidth] = useState(1);
  const [stairs, setStairs] = useState(false);
  const [ageLessThan, setAgeLessThan] = useState("New");
  const [villaType, setVillaType] = useState("");

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    driverRoom: false,
    maidRoom: false,
    pool: false,
    furnished: false,
    tent: false,
    backyard: false,
    kitchen: true,
    extraUnit: false,
    carEntrance: false,
    basement: false,
    lift: false,
    airConditioned: false,
    water: true,
    electricity: true,
    drainageAvailability: false,
  });

  const streetDirectionOptions = useMemo(
    () => STREET_DIRECTION_OPTIONS.map((opt) => getDirectionLabel(opt, t)),
    [t],
  );

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
      { type: "toggle", label: t("listings.stairs"), enabled: stairs },
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
      { type: "toggle", label: t("listings.pool"), enabled: toggles.pool },
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
      {
        type: "toggle",
        label: t("listings.basement"),
        enabled: toggles.basement,
      },
      { type: "toggle", label: t("listings.lift"), enabled: toggles.lift },
      {
        type: "value",
        icon: "home",
        label: t("listings.villaType"),
        value: villaType ? villaTypeRowLabel(villaType, t) : "---",
      },
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
        label: t("listings.drainageAvailability"),
        enabled: toggles.drainageAvailability,
      },
    ]);
  }, [
    ageLessThan,
    bedrooms,
    livingRooms,
    onFormDataChange,
    stairs,
    streetDirection,
    streetWidth,
    t,
    toggles.airConditioned,
    toggles.backyard,
    toggles.basement,
    toggles.carEntrance,
    toggles.drainageAvailability,
    toggles.driverRoom,
    toggles.electricity,
    toggles.extraUnit,
    toggles.furnished,
    toggles.kitchen,
    toggles.lift,
    toggles.maidRoom,
    toggles.pool,
    toggles.tent,
    toggles.water,
    villaType,
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
            (opt) => getDirectionLabel(opt, t) === value,
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
      <ToggleRow
        label={t("listings.stairs")}
        value={stairs}
        onValueChange={setStairs}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
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
        "pool",
        "furnished",
        "tent",
        "backyard",
        "kitchen",
        "extraUnit",
        "carEntrance",
        "basement",
        "lift",
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

      <OptionChips
        label={t("listings.villaType")}
        options={villaTypeDisplayOptions}
        selectedValue={villaType ? villaTypeRowLabel(villaType, t) : ""}
        onSelect={(label) =>
          setVillaType(canonicalVillaTypeFromDisplayLabel(label, t))
        }
      />

      {["airConditioned", "water", "electricity", "drainageAvailability"].map(
        (k) => (
          <ToggleRow
            key={k}
            label={t(`listings.${k}`)}
            value={toggles[k]}
            onValueChange={(v) => setToggles((p) => ({ ...p, [k]: v }))}
            trackWidth={TOGGLE_TRACK_WIDTH}
            trackHeight={TOGGLE_TRACK_HEIGHT}
            thumbSize={TOGGLE_THUMB_SIZE}
          />
        ),
      )}
    </>
  );
}
