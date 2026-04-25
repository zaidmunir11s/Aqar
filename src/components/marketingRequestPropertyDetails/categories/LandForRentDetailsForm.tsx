import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ToggleRow from "../../orderForm/ToggleRow";
import OptionChips from "../shared/OptionChips";
import SliderWithInput from "../shared/SliderWithInput";
import SegmentedControl from "../../common/SegmentedControl";
import { useLocalization } from "@/hooks/useLocalization";
import {
  STREET_DIRECTION_OPTIONS,
  getDirectionLabel,
} from "../shared/propertyDetailsOptions";
import { CategoryFormProps } from "../shared/CategoryFormProps";

const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);

export default function LandForRentDetailsForm({
  submitAttempted = false,
  onValidityChange,
  onFormDataChange,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useLocalization();
  const [streetDirection, setStreetDirection] = useState("Not Defined");
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [streetWidth, setStreetWidth] = useState(1);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    water: true,
    electricity: true,
    drainageAvailability: false,
  });

  const directionOptions = useMemo(
    () => STREET_DIRECTION_OPTIONS.map((opt) => getDirectionLabel(opt, t)),
    [t],
  );
  const typeOptions = useMemo(
    () => [
      t("listings.residential"),
      t("listings.commercial"),
      t("listings.residentialAndCommercial"),
    ],
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
        icon: "navigate",
        label: t("listings.streetDirection"),
        value: getDirectionLabel(streetDirection, t),
      },
      {
        type: "value",
        label: t("listings.landType"),
        value: typeOptions[segmentIndex] ?? "",
      },
      {
        type: "value",
        icon: "swap-horizontal",
        label: t("listings.streetWidth"),
        value: String(streetWidth),
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
    onFormDataChange,
    segmentIndex,
    streetDirection,
    streetWidth,
    t,
    toggles.drainageAvailability,
    toggles.electricity,
    toggles.water,
    typeOptions,
  ]);

  return (
    <>
      <OptionChips
        label={t("listings.streetDirection")}
        options={directionOptions}
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

      <View style={{ marginBottom: hp(2) }}>
        <SegmentedControl
          variant="large"
          options={typeOptions}
          selectedIndex={segmentIndex}
          onSelect={setSegmentIndex}
        />
      </View>

      <SliderWithInput
        label={t("listings.streetWidth")}
        value={streetWidth}
        onChangeValue={setStreetWidth}
        max={100}
      />

      {["water", "electricity", "drainageAvailability"].map((k) => (
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
