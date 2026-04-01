import React, { useEffect, useState } from "react";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import ToggleRow from "../../orderForm/ToggleRow";
import { useLocalization } from "@/hooks/useLocalization";
import { CategoryFormProps } from "../shared/CategoryFormProps";

const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);

export default function TentForRentDetailsForm({ onFormDataChange }: CategoryFormProps): React.JSX.Element {
  const { t } = useLocalization();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    familySection: false,
    water: true,
    electricity: true,
    drainageAvailability: false,
  });

  useEffect(() => {
    onFormDataChange?.([
      { type: "toggle", label: t("listings.familySection"), enabled: toggles.familySection },
      { type: "toggle", label: t("listings.water"), enabled: toggles.water },
      { type: "toggle", label: t("listings.electricity"), enabled: toggles.electricity },
      { type: "toggle", label: t("listings.drainageAvailability"), enabled: toggles.drainageAvailability },
    ]);
  }, [onFormDataChange, t, toggles.drainageAvailability, toggles.electricity, toggles.familySection, toggles.water]);

  return (
    <>
      {["familySection", "water", "electricity", "drainageAvailability"].map((k) => (
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
