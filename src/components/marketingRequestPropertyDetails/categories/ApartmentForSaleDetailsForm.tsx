import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import ToggleRow from "../../orderForm/ToggleRow";
import OptionChips from "../shared/OptionChips";
import SliderWithInput from "../shared/SliderWithInput";
import InlineWheelPickerField from "../shared/InlineWheelPickerField";
import { COLORS } from "@/constants";
import { useLocalization } from "@/hooks/useLocalization";
import { CategoryFormProps } from "../shared/CategoryFormProps";
import {
  AGE_PICKER_OPTIONS,
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
  WC_OPTIONS,
  STREET_DIRECTION_OPTIONS,
  buildAgePickerDisplayOptions,
  getDirectionLabel,
  buildFloorPickerOptions,
  formatRealEstateAgeLabel,
} from "../shared/propertyDetailsOptions";

const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);

export default function ApartmentForSaleDetailsForm({
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

  const [floorValue, setFloorValue] = useState<string>("");
  const floorOptions = useMemo(() => buildFloorPickerOptions(t), [t]);
  React.useEffect(() => {
    if (!floorValue && floorOptions.length > 0) setFloorValue(floorOptions[0]);
  }, [floorOptions, floorValue]);

  const [ageLessThan, setAgeLessThan] = useState("New");

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    furnished: false,
    kitchen: true,
    extraUnit: false,
    carEntrance: false,
    lift: false,
    water: true,
    electricity: true,
    privateRoof: false,
    apartmentInVilla: false,
    twoEntrances: false,
    specialEntrance: false,
    drainageAvailability: false,
  });

  const isStreetDirectionValid = streetDirection !== "Not Defined";

  useEffect(() => {
    onValidityChange?.(isStreetDirectionValid);
  }, [isStreetDirectionValid, onValidityChange]);

  useEffect(() => {
    onFormDataChange?.([
      { type: "value", icon: "bed", label: t("listings.bedrooms"), value: bedrooms },
      { type: "value", icon: "home", label: t("listings.livingRooms"), value: livingRooms },
      { type: "value", icon: "navigate", label: t("listings.streetDirection"), value: getDirectionLabel(streetDirection, t) },
      { type: "value", icon: "water", label: t("listings.restrooms"), value: wc },
      { type: "value", icon: "swap-horizontal", label: t("listings.streetWidth"), value: String(streetWidth) },
      { type: "value", icon: "business", label: t("listings.floor"), value: floorValue || (floorOptions[0] ?? "") },
      { type: "value", icon: "time", label: t("listings.realEstateAge"), value: formatRealEstateAgeLabel(ageLessThan, t) },
      { type: "toggle", label: t("listings.furnished"), enabled: toggles.furnished },
      { type: "toggle", label: t("listings.kitchen"), enabled: toggles.kitchen },
      { type: "toggle", label: t("listings.extraUnit"), enabled: toggles.extraUnit },
      { type: "toggle", label: t("listings.carEntrance"), enabled: toggles.carEntrance },
      { type: "toggle", label: t("listings.lift"), enabled: toggles.lift },
      { type: "toggle", label: t("listings.water"), enabled: toggles.water },
      { type: "toggle", label: t("listings.electricity"), enabled: toggles.electricity },
      { type: "toggle", label: t("listings.privateRoof"), enabled: toggles.privateRoof },
      { type: "toggle", label: t("listings.apartmentInVilla"), enabled: toggles.apartmentInVilla },
      { type: "toggle", label: t("listings.twoEntrances"), enabled: toggles.twoEntrances },
      { type: "toggle", label: t("listings.specialEntrance"), enabled: toggles.specialEntrance },
      { type: "toggle", label: t("listings.drainageAvailability"), enabled: toggles.drainageAvailability },
    ]);
  }, [
    ageLessThan,
    bedrooms,
    floorOptions,
    floorValue,
    livingRooms,
    onFormDataChange,
    streetDirection,
    streetWidth,
    t,
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
      <OptionChips label={t("listings.bedrooms")} options={BEDROOM_OPTIONS} selectedValue={bedrooms} onSelect={setBedrooms} />
      <OptionChips label={t("listings.livingRooms")} options={LIVING_ROOM_OPTIONS} selectedValue={livingRooms} onSelect={setLivingRooms} />
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
      <OptionChips label={t("listings.wc")} options={WC_OPTIONS} selectedValue={wc} onSelect={setWc} />

      <SliderWithInput label={t("listings.streetWidth")} value={streetWidth} onChangeValue={setStreetWidth} max={100} />

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

      <ToggleRow
        label={t("listings.furnished")}
        value={toggles.furnished}
        onValueChange={(v) => setToggles((prev) => ({ ...prev, furnished: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.kitchen")}
        value={toggles.kitchen}
        onValueChange={(v) => setToggles((prev) => ({ ...prev, kitchen: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.extraUnit")}
        value={toggles.extraUnit}
        onValueChange={(v) => setToggles((prev) => ({ ...prev, extraUnit: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.carEntrance")}
        value={toggles.carEntrance}
        onValueChange={(v) => setToggles((prev) => ({ ...prev, carEntrance: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.lift")}
        value={toggles.lift}
        onValueChange={(v) => setToggles((prev) => ({ ...prev, lift: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.water")}
        value={toggles.water}
        onValueChange={(v) => setToggles((prev) => ({ ...prev, water: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.electricity")}
        value={toggles.electricity}
        onValueChange={(v) => setToggles((prev) => ({ ...prev, electricity: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.privateRoof")}
        value={toggles.privateRoof}
        onValueChange={(v) => setToggles((prev) => ({ ...prev, privateRoof: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.apartmentInVilla")}
        value={toggles.apartmentInVilla}
        onValueChange={(v) => setToggles((prev) => ({ ...prev, apartmentInVilla: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.twoEntrances")}
        value={toggles.twoEntrances}
        onValueChange={(v) => setToggles((prev) => ({ ...prev, twoEntrances: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.specialEntrance")}
        value={toggles.specialEntrance}
        onValueChange={(v) => setToggles((prev) => ({ ...prev, specialEntrance: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.drainageAvailability")}
        value={toggles.drainageAvailability}
        onValueChange={(v) => setToggles((prev) => ({ ...prev, drainageAvailability: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // currently unused; kept for future category extensions
  container: { backgroundColor: COLORS.background },
});

