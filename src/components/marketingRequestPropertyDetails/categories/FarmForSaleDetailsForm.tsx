import React, { useEffect, useState } from "react";
import ToggleRow from "../../orderForm/ToggleRow";
import SliderWithInput from "../shared/SliderWithInput";
import { useLocalization } from "@/hooks/useLocalization";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { CategoryFormProps } from "../shared/CategoryFormProps";

const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);

export default function FarmForSaleDetailsForm({
  onFormDataChange,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useLocalization();

  const [streetWidth, setStreetWidth] = useState(1);
  const [tent, setTent] = useState(false);
  const [well, setWell] = useState(0);
  const [trees, setTrees] = useState(0);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    water: true,
    electricity: true,
    drainageAvailability: false,
  });

  useEffect(() => {
    onFormDataChange?.([
      {
        type: "value",
        icon: "swap-horizontal",
        label: t("listings.streetWidth"),
        value: String(streetWidth),
      },
      { type: "toggle", label: t("listings.tent"), enabled: tent },
      { type: "value", label: t("listings.well"), value: String(well) },
      { type: "value", label: t("listings.trees"), value: String(trees) },
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
    streetWidth,
    t,
    tent,
    toggles.drainageAvailability,
    toggles.electricity,
    toggles.water,
    trees,
    well,
  ]);

  return (
    <>
      <SliderWithInput
        label={t("listings.streetWidth")}
        value={streetWidth}
        onChangeValue={setStreetWidth}
        max={100}
      />

      <ToggleRow
        label={t("listings.tent")}
        value={tent}
        onValueChange={setTent}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />

      <SliderWithInput
        label={t("listings.well")}
        value={well}
        onChangeValue={setWell}
        max={10}
      />
      <SliderWithInput
        label={t("listings.trees")}
        value={trees}
        onChangeValue={setTrees}
        max={10}
      />

      <ToggleRow
        label={t("listings.water")}
        value={toggles.water}
        onValueChange={(v) => setToggles((p) => ({ ...p, water: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.electricity")}
        value={toggles.electricity}
        onValueChange={(v) => setToggles((p) => ({ ...p, electricity: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.drainageAvailability")}
        value={toggles.drainageAvailability}
        onValueChange={(v) =>
          setToggles((p) => ({ ...p, drainageAvailability: v }))
        }
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
    </>
  );
}
