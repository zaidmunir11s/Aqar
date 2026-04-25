import React, { useEffect, useMemo, useState } from "react";
import ToggleRow from "../../orderForm/ToggleRow";
import OptionChips from "../shared/OptionChips";
import SliderWithInput from "../shared/SliderWithInput";
import InlineWheelPickerField from "../shared/InlineWheelPickerField";
import { useLocalization } from "@/hooks/useLocalization";
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
import { CategoryFormProps } from "../shared/CategoryFormProps";

const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);

export default function LoungeForSaleDetailsForm({
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
    () => STREET_DIRECTION_OPTIONS.map((opt) => getDirectionLabel(opt, t)),
    [t],
  );

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    pool: false,
    footballPitch: false,
    volleyballCourt: false,
    tent: false,
    playground: false,
    familySection: false,
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
      { type: "toggle", label: t("listings.pool"), enabled: toggles.pool },
      {
        type: "toggle",
        label: t("listings.footballPitch"),
        enabled: toggles.footballPitch,
      },
      {
        type: "toggle",
        label: t("listings.volleyballCourt"),
        enabled: toggles.volleyballCourt,
      },
      { type: "toggle", label: t("listings.tent"), enabled: toggles.tent },
      {
        type: "toggle",
        label: t("listings.playground"),
        enabled: toggles.playground,
      },
      {
        type: "toggle",
        label: t("listings.familySection"),
        enabled: toggles.familySection,
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
    toggles.drainageAvailability,
    toggles.electricity,
    toggles.familySection,
    toggles.footballPitch,
    toggles.playground,
    toggles.pool,
    toggles.tent,
    toggles.volleyballCourt,
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

      <InlineWheelPickerField
        label={t("listings.ageLessThan")}
        value={ageLessThan}
        options={ageDisplayOptions}
        canonicalValues={AGE_PICKER_OPTIONS}
        modalTitle={t("listings.ageLessThan")}
        onChangeValue={setAgeLessThan}
      />

      <ToggleRow
        label={t("listings.pool")}
        value={toggles.pool}
        onValueChange={(v) => setToggles((p) => ({ ...p, pool: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.footballPitch")}
        value={toggles.footballPitch}
        onValueChange={(v) => setToggles((p) => ({ ...p, footballPitch: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.volleyballCourt")}
        value={toggles.volleyballCourt}
        onValueChange={(v) => setToggles((p) => ({ ...p, volleyballCourt: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.tent")}
        value={toggles.tent}
        onValueChange={(v) => setToggles((p) => ({ ...p, tent: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.playground")}
        value={toggles.playground}
        onValueChange={(v) => setToggles((p) => ({ ...p, playground: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.familySection")}
        value={toggles.familySection}
        onValueChange={(v) => setToggles((p) => ({ ...p, familySection: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
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
