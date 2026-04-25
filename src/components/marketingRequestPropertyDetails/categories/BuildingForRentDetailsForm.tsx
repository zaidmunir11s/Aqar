import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import ToggleRow from "../../orderForm/ToggleRow";
import OptionChips from "../shared/OptionChips";
import SliderWithInput from "../shared/SliderWithInput";
import InlineWheelPickerField from "../shared/InlineWheelPickerField";
import SegmentedControl from "../../common/SegmentedControl";
import { useLocalization } from "@/hooks/useLocalization";
import { CategoryFormProps } from "../shared/CategoryFormProps";
import {
  APARTMENT_PICKER_OPTIONS,
  AGE_PICKER_OPTIONS,
  STREET_DIRECTION_OPTIONS,
  buildAgePickerDisplayOptions,
  getDirectionLabel,
  formatRealEstateAgeLabel,
} from "../shared/propertyDetailsOptions";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);

export default function BuildingForRentDetailsForm({
  submitAttempted = false,
  onValidityChange,
  onFormDataChange,
}: CategoryFormProps): React.JSX.Element {
  const { t } = useLocalization();
  const ageDisplayOptions = useMemo(() => buildAgePickerDisplayOptions(t), [t]);
  const [rooms, setRooms] = useState(1);
  const [streetDirection, setStreetDirection] = useState("Not Defined");
  const [tabIndex, setTabIndex] = useState(0);
  const [streetWidth, setStreetWidth] = useState(1);
  const [apartments, setApartments] = useState("0");
  const [ageLessThan, setAgeLessThan] = useState("New");
  const [stores, setStores] = useState(1);
  const streetDirectionOptions = useMemo(
    () => STREET_DIRECTION_OPTIONS.map((o) => getDirectionLabel(o, t)),
    [t],
  );
  const tabOptions = useMemo(
    () => [
      t("listings.residential"),
      t("listings.commercial"),
      t("listings.residentialAndCommercial"),
    ],
    [t],
  );

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    furnished: false,
    basement: false,
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
        icon: "business",
        label: t("listings.rooms"),
        value: String(rooms),
      },
      {
        type: "value",
        icon: "navigate",
        label: t("listings.streetDirection"),
        value: getDirectionLabel(streetDirection, t),
      },
      {
        type: "value",
        label: t("listings.landType"),
        value: tabOptions[tabIndex] ?? "",
      },
      {
        type: "value",
        icon: "swap-horizontal",
        label: t("listings.streetWidth"),
        value: String(streetWidth),
      },
      {
        type: "value",
        icon: "business",
        label: t("listings.apartments"),
        value: apartments,
      },
      {
        type: "value",
        icon: "time",
        label: t("listings.realEstateAge"),
        value: formatRealEstateAgeLabel(ageLessThan, t),
      },
      {
        type: "value",
        icon: "business",
        label: t("listings.stores"),
        value: String(stores),
      },
      {
        type: "toggle",
        label: t("listings.furnished"),
        enabled: toggles.furnished,
      },
      {
        type: "toggle",
        label: t("listings.basement"),
        enabled: toggles.basement,
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
    apartments,
    onFormDataChange,
    rooms,
    streetDirection,
    streetWidth,
    stores,
    t,
    tabIndex,
    tabOptions,
    toggles.basement,
    toggles.drainageAvailability,
    toggles.electricity,
    toggles.furnished,
    toggles.water,
  ]);

  return (
    <>
      <SliderWithInput
        label={t("listings.rooms")}
        value={rooms}
        onChangeValue={setRooms}
        max={5}
      />
      <OptionChips
        label={t("listings.streetDirection")}
        options={streetDirectionOptions}
        selectedValue={getDirectionLabel(streetDirection, t)}
        onSelect={(value) => {
          const original = STREET_DIRECTION_OPTIONS.find(
            (o) => getDirectionLabel(o, t) === value,
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
          options={tabOptions}
          selectedIndex={tabIndex}
          onSelect={setTabIndex}
        />
      </View>
      <SliderWithInput
        label={t("listings.streetWidth")}
        value={streetWidth}
        onChangeValue={setStreetWidth}
        max={100}
      />
      <InlineWheelPickerField
        label={t("listings.apartments")}
        value={apartments}
        options={APARTMENT_PICKER_OPTIONS}
        modalTitle={t("listings.apartments")}
        onChangeValue={setApartments}
      />
      <InlineWheelPickerField
        label={t("listings.ageLessThan")}
        value={ageLessThan}
        options={ageDisplayOptions}
        canonicalValues={AGE_PICKER_OPTIONS}
        modalTitle={t("listings.ageLessThan")}
        onChangeValue={setAgeLessThan}
      />
      <SliderWithInput
        label={t("listings.stores")}
        value={stores}
        onChangeValue={setStores}
        max={50}
      />
      {[
        "furnished",
        "basement",
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
