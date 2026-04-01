import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SegmentedControl from "../../common/SegmentedControl";
import ToggleRow from "../../orderForm/ToggleRow";
import { useLocalization } from "@/hooks/useLocalization";
import OptionChips from "../shared/OptionChips";
import SliderWithInput from "../shared/SliderWithInput";
import { getDirectionLabel } from "../shared/propertyDetailsOptions";
import { CategoryFormProps } from "../shared/CategoryFormProps";

const STREET_DIRECTION_OPTIONS = [
  "Not Defined",
  "North",
  "East",
  "West",
  "South",
  "Northeast",
  "Southeast",
  "Southwest",
  "Northwest",
  "3 Streets",
  "4 Streets",
];

// Keep consistent with Villa-for-sale toggle styling
const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);
const SEGMENT_HEIGHT = hp(5);

export default function LandForSaleDetailsForm({
  submitAttempted = false,
  onValidityChange,
  onFormDataChange,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useLocalization();
  const [streetDirection, setStreetDirection] = useState("Not Defined");
  const [landTypeIndex, setLandTypeIndex] = useState(0);
  const [streetWidth, setStreetWidth] = useState(1);
  const [water, setWater] = useState(true);
  const [electricity, setElectricity] = useState(true);
  const [drainageAvailability, setDrainageAvailability] = useState(false);

  const landTypeOptions = useMemo(
    () => [
      t("listings.residential"),
      t("listings.commercial"),
      t("listings.residentialAndCommercial"),
    ],
    [t]
  );

  const isStreetDirectionValid = streetDirection !== "Not Defined";

  useEffect(() => {
    onValidityChange?.(isStreetDirectionValid);
  }, [isStreetDirectionValid, onValidityChange]);

  useEffect(() => {
    onFormDataChange?.([
      { type: "value", icon: "navigate", label: t("listings.streetDirection"), value: getDirectionLabel(streetDirection, t) },
      { type: "value", label: t("listings.landType"), value: landTypeOptions[landTypeIndex] ?? "" },
      { type: "value", icon: "swap-horizontal", label: t("listings.streetWidth"), value: String(streetWidth) },
      { type: "toggle", label: t("listings.water"), enabled: water },
      { type: "toggle", label: t("listings.electricity"), enabled: electricity },
      { type: "toggle", label: t("listings.drainageAvailability"), enabled: drainageAvailability },
    ]);
  }, [
    drainageAvailability,
    electricity,
    landTypeIndex,
    landTypeOptions,
    onFormDataChange,
    streetDirection,
    streetWidth,
    t,
    water,
  ]);

  return (
    <>
      <OptionChips
        label={t("listings.streetDirection")}
        options={STREET_DIRECTION_OPTIONS.map((opt) => getDirectionLabel(opt, t))}
        selectedValue={getDirectionLabel(streetDirection, t)}
        onSelect={(value) => {
          const original = STREET_DIRECTION_OPTIONS.find((opt) => getDirectionLabel(opt, t) === value);
          setStreetDirection(original ?? "Not Defined");
        }}
        scrollable
        errorText={
          submitAttempted && !isStreetDirectionValid
            ? t("listings.pleaseSelectStreetDirection")
            : undefined
        }
      />

      <View style={styles.section}>
        <View style={styles.segmentWrap}>
          <SegmentedControl
            variant="large"
            segmentHeight={SEGMENT_HEIGHT}
            options={landTypeOptions}
            selectedIndex={landTypeIndex}
            onSelect={setLandTypeIndex}
          />
        </View>
      </View>

      <SliderWithInput
        label={t("listings.streetWidth")}
        value={streetWidth}
        onChangeValue={setStreetWidth}
        max={100}
      />

      <ToggleRow label={t("listings.water")} value={water} onValueChange={setWater} trackWidth={TOGGLE_TRACK_WIDTH} trackHeight={TOGGLE_TRACK_HEIGHT} thumbSize={TOGGLE_THUMB_SIZE} />
      <ToggleRow label={t("listings.electricity")} value={electricity} onValueChange={setElectricity} trackWidth={TOGGLE_TRACK_WIDTH} trackHeight={TOGGLE_TRACK_HEIGHT} thumbSize={TOGGLE_THUMB_SIZE} />
      <ToggleRow label={t("listings.drainageAvailability")} value={drainageAvailability} onValueChange={setDrainageAvailability} trackWidth={TOGGLE_TRACK_WIDTH} trackHeight={TOGGLE_TRACK_HEIGHT} thumbSize={TOGGLE_THUMB_SIZE} />
    </>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: hp(2) },
  segmentWrap: {
    borderRadius: wp(2),
    overflow: "hidden",
  },
});
