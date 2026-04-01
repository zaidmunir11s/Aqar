import React, { useEffect, useMemo, useState } from "react";
import ToggleRow from "../../orderForm/ToggleRow";
import OptionChips from "../shared/OptionChips";
import SliderWithInput from "../shared/SliderWithInput";
import InlineWheelPickerField from "../shared/InlineWheelPickerField";
import { useLocalization } from "@/hooks/useLocalization";
import { CategoryFormProps } from "../shared/CategoryFormProps";
import {
  AGE_PICKER_OPTIONS,
  STREET_DIRECTION_OPTIONS,
  buildAgePickerDisplayOptions,
  getDirectionLabel,
  formatRealEstateAgeLabel,
} from "../shared/propertyDetailsOptions";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);

export default function StoreForRentDetailsForm({
  submitAttempted = false,
  onValidityChange,
  onFormDataChange,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useLocalization();
  const ageDisplayOptions = useMemo(() => buildAgePickerDisplayOptions(t), [t]);
  const [streetDirection, setStreetDirection] = useState("Not Defined");
  const [streetWidth, setStreetWidth] = useState(1);
  const [ageLessThan, setAgeLessThan] = useState("New");
  const streetDirectionOptions = useMemo(() => STREET_DIRECTION_OPTIONS.map((o) => getDirectionLabel(o, t)), [t]);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
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
      { type: "value", icon: "navigate", label: t("listings.streetDirection"), value: getDirectionLabel(streetDirection, t) },
      { type: "value", icon: "swap-horizontal", label: t("listings.streetWidth"), value: String(streetWidth) },
      { type: "value", icon: "time", label: t("listings.realEstateAge"), value: formatRealEstateAgeLabel(ageLessThan, t) },
      { type: "toggle", label: t("listings.water"), enabled: toggles.water },
      { type: "toggle", label: t("listings.electricity"), enabled: toggles.electricity },
      { type: "toggle", label: t("listings.drainageAvailability"), enabled: toggles.drainageAvailability },
    ]);
  }, [
    ageLessThan,
    onFormDataChange,
    streetDirection,
    streetWidth,
    t,
    toggles.drainageAvailability,
    toggles.electricity,
    toggles.water,
  ]);

  return (
    <>
      <OptionChips label={t("listings.streetDirection")} options={streetDirectionOptions} selectedValue={getDirectionLabel(streetDirection, t)} onSelect={(value)=>{ const original=STREET_DIRECTION_OPTIONS.find((o)=>getDirectionLabel(o,t)===value); setStreetDirection(original ?? "Not Defined"); }} scrollable errorText={submitAttempted && !isStreetDirectionValid ? t("listings.pleaseSelectStreetDirection") : undefined} />
      <SliderWithInput label={t("listings.streetWidth")} value={streetWidth} onChangeValue={setStreetWidth} max={100} />
      <InlineWheelPickerField
        label={t("listings.ageLessThan")}
        value={ageLessThan}
        options={ageDisplayOptions}
        canonicalValues={AGE_PICKER_OPTIONS}
        modalTitle={t("listings.ageLessThan")}
        onChangeValue={setAgeLessThan}
      />
      {["water","electricity","drainageAvailability"].map((k) => (
        <ToggleRow key={k} label={t(`listings.${k}`)} value={toggles[k]} onValueChange={(v)=>setToggles((p)=>({...p,[k]:v}))} trackWidth={TOGGLE_TRACK_WIDTH} trackHeight={TOGGLE_TRACK_HEIGHT} thumbSize={TOGGLE_THUMB_SIZE} />
      ))}
    </>
  );
}

