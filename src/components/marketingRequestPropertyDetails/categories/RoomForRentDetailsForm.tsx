import React, { useEffect, useMemo, useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ToggleRow from "../../orderForm/ToggleRow";
import SliderWithInput from "../shared/SliderWithInput";
import InlineWheelPickerField from "../shared/InlineWheelPickerField";
import { useLocalization } from "@/hooks/useLocalization";
import {
  AGE_PICKER_OPTIONS,
  buildAgePickerDisplayOptions,
  formatRealEstateAgeLabel,
} from "../shared/propertyDetailsOptions";
import { CategoryFormProps } from "../shared/CategoryFormProps";

const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);

export default function RoomForRentDetailsForm({
  onFormDataChange,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useLocalization();
  const [streetWidth, setStreetWidth] = useState(1);
  const [ageLessThan, setAgeLessThan] = useState("New");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    furnished: false,
    kitchen: true,
    water: true,
    electricity: true,
    drainageAvailability: false,
  });

  const ageDisplayOptions = useMemo(() => buildAgePickerDisplayOptions(t), [t]);

  useEffect(() => {
    onFormDataChange?.([
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
        label: t("listings.furnished"),
        enabled: toggles.furnished,
      },
      {
        type: "toggle",
        label: t("listings.kitchen"),
        enabled: toggles.kitchen,
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
    onFormDataChange,
    streetWidth,
    t,
    toggles.drainageAvailability,
    toggles.furnished,
    toggles.kitchen,
    toggles.water,
    toggles.electricity,
  ]);

  return (
    <>
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
        "furnished",
        "kitchen",
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
