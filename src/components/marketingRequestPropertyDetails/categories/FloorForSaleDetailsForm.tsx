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
  buildFloorPickerOptions,
  formatRealEstateAgeLabel,
} from "../shared/propertyDetailsOptions";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);

export default function FloorForSaleDetailsForm({
  submitAttempted = false,
  onValidityChange,
  onFormDataChange,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useLocalization();

  const [bedrooms, setBedrooms] = useState("1");
  const [livingRooms, setLivingRooms] = useState("0");
  const [streetDirection, setStreetDirection] = useState("Not Defined");
  const [wc, setWc] = useState("1");
  const [streetWidth, setStreetWidth] = useState(1);

  const floorOptions = useMemo(() => buildFloorPickerOptions(t), [t]);
  const [floorValue, setFloorValue] = useState<string>("");
  React.useEffect(() => {
    if (!floorValue && floorOptions.length > 0) setFloorValue(floorOptions[0]);
  }, [floorOptions, floorValue]);

  const [ageLessThan, setAgeLessThan] = useState("New");

  const streetDirectionOptions = useMemo(
    () => STREET_DIRECTION_OPTIONS.map((opt) => getDirectionLabel(opt, t)),
    [t]
  );

  const ageDisplayOptions = useMemo(() => buildAgePickerDisplayOptions(t), [t]);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    carEntrance: false,
    water: true,
    electricity: true,
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
      { type: "toggle", label: t("listings.carEntrance"), enabled: toggles.carEntrance },
      { type: "toggle", label: t("listings.water"), enabled: toggles.water },
      { type: "toggle", label: t("listings.electricity"), enabled: toggles.electricity },
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
        options={streetDirectionOptions}
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
        label={t("listings.carEntrance")}
        value={toggles.carEntrance}
        onValueChange={(v) => setToggles((p) => ({ ...p, carEntrance: v }))}
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
        label={t("listings.apartmentInVilla")}
        value={toggles.apartmentInVilla}
        onValueChange={(v) => setToggles((p) => ({ ...p, apartmentInVilla: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.twoEntrances")}
        value={toggles.twoEntrances}
        onValueChange={(v) => setToggles((p) => ({ ...p, twoEntrances: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.specialEntrance")}
        value={toggles.specialEntrance}
        onValueChange={(v) => setToggles((p) => ({ ...p, specialEntrance: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.drainageAvailability")}
        value={toggles.drainageAvailability}
        onValueChange={(v) => setToggles((p) => ({ ...p, drainageAvailability: v }))}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
    </>
  );
}

