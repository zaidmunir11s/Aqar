import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ToggleRow from "../../orderForm/ToggleRow";
import WheelPickerModal from "../../common/WheelPickerModal";
import { COLORS } from "@/constants";
import { useLocalization } from "@/hooks/useLocalization";
import OptionChips from "../shared/OptionChips";
import SliderWithInput from "../shared/SliderWithInput";
import { CategoryFormProps } from "../shared/CategoryFormProps";
import {
  agePickerRowLabel,
  buildAgePickerDisplayOptions,
  buildVillaTypeDisplayOptions,
  canonicalAgeFromDisplayLabel,
  canonicalVillaTypeFromDisplayLabel,
  formatRealEstateAgeLabel,
  getDirectionLabel,
  villaTypeRowLabel,
} from "../shared/propertyDetailsOptions";

const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5+"];
const LIVING_ROOM_OPTIONS = ["0", "1", "2", "3", "4", "5+"];
const WC_OPTIONS = ["1", "2", "3", "4", "5+"];
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
const APARTMENT_PICKER_OPTIONS = [
  ...Array.from({ length: 30 }, (_, i) => `${i}`),
  "30+",
];

const TOGGLE_TRACK_WIDTH = wp(9);
const TOGGLE_TRACK_HEIGHT = hp(1.5);
const TOGGLE_THUMB_SIZE = wp(5.5);

export default function VillaForSaleDetailsForm({
  submitAttempted = false,
  onValidityChange,
  onFormDataChange,
}: CategoryFormProps): React.JSX.Element {
  const { t, isRTL } = useLocalization();
  const [bedrooms, setBedrooms] = useState("1");
  const [livingRooms, setLivingRooms] = useState("0");
  const [streetDirection, setStreetDirection] = useState("Not Defined");
  const [wc, setWc] = useState("1");
  const [streetWidth, setStreetWidth] = useState(1);
  const [apartments, setApartments] = useState("0");
  const [ageLessThan, setAgeLessThan] = useState("New");
  const [villaType, setVillaType] = useState("");
  const [showApartmentsModal, setShowApartmentsModal] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [stairs, setStairs] = useState(false);
  const [driverRoom, setDriverRoom] = useState(false);
  const [maidRoom, setMaidRoom] = useState(false);
  const [pool, setPool] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [tent, setTent] = useState(false);
  const [backyard, setBackyard] = useState(false);
  const [kitchen, setKitchen] = useState(true);
  const [extraUnit, setExtraUnit] = useState(false);
  const [carEntrance, setCarEntrance] = useState(false);
  const [basement, setBasement] = useState(false);
  const [lift, setLift] = useState(false);
  const [water, setWater] = useState(true);
  const [electricity, setElectricity] = useState(true);
  const [drainageAvailability, setDrainageAvailability] = useState(false);

  const ageDisplayOptions = useMemo(() => buildAgePickerDisplayOptions(t), [t]);
  const villaTypeDisplayOptions = useMemo(
    () => buildVillaTypeDisplayOptions(t),
    [t],
  );

  const villaRtl = useMemo(
    () => ({
      inlineRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      inlineRowLabel: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      inlineField: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      inlineFieldText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
    }),
    [isRTL],
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
        icon: "bed",
        label: t("listings.bedrooms"),
        value: bedrooms,
      },
      {
        type: "value",
        icon: "business",
        label: t("listings.apartments"),
        value: apartments,
      },
      {
        type: "value",
        icon: "home",
        label: t("listings.livingRooms"),
        value: livingRooms,
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
      { type: "toggle", label: t("listings.stairs"), enabled: stairs },
      {
        type: "value",
        icon: "business",
        label: t("listings.realEstateAge"),
        value: formatRealEstateAgeLabel(ageLessThan, t),
      },
      { type: "toggle", label: t("listings.driverRoom"), enabled: driverRoom },
      { type: "toggle", label: t("listings.maidRoom"), enabled: maidRoom },
      { type: "toggle", label: t("listings.pool"), enabled: pool },
      { type: "toggle", label: t("listings.furnished"), enabled: furnished },
      { type: "toggle", label: t("listings.tent"), enabled: tent },
      { type: "toggle", label: t("listings.backyard"), enabled: backyard },
      { type: "toggle", label: t("listings.kitchen"), enabled: kitchen },
      { type: "toggle", label: t("listings.extraUnit"), enabled: extraUnit },
      {
        type: "toggle",
        label: t("listings.carEntrance"),
        enabled: carEntrance,
      },
      { type: "toggle", label: t("listings.basement"), enabled: basement },
      { type: "toggle", label: t("listings.lift"), enabled: lift },
      {
        type: "value",
        icon: "home",
        label: t("listings.villaType"),
        value: villaType ? villaTypeRowLabel(villaType, t) : "---",
      },
      { type: "toggle", label: t("listings.water"), enabled: water },
      {
        type: "toggle",
        label: t("listings.electricity"),
        enabled: electricity,
      },
      {
        type: "toggle",
        label: t("listings.drainageAvailability"),
        enabled: drainageAvailability,
      },
    ]);
  }, [
    ageLessThan,
    apartments,
    backyard,
    bedrooms,
    carEntrance,
    drainageAvailability,
    driverRoom,
    electricity,
    extraUnit,
    furnished,
    kitchen,
    lift,
    livingRooms,
    maidRoom,
    onFormDataChange,
    pool,
    stairs,
    streetDirection,
    streetWidth,
    t,
    tent,
    villaType,
    water,
    wc,
    basement,
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
        options={STREET_DIRECTION_OPTIONS.map((opt) =>
          getDirectionLabel(opt, t),
        )}
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

      <ToggleRow
        label={t("listings.stairs")}
        value={stairs}
        onValueChange={setStairs}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <View style={[styles.inlineRow, villaRtl.inlineRow]}>
        <Text style={[styles.inlineRowLabel, villaRtl.inlineRowLabel]}>
          {t("listings.apartments")}
        </Text>
        <TouchableOpacity
          style={[styles.inlineField, villaRtl.inlineField]}
          onPress={() => setShowApartmentsModal(true)}
        >
          <Text style={[styles.inlineFieldText, villaRtl.inlineFieldText]}>
            {apartments}
          </Text>
          <Ionicons name="chevron-down" size={wp(4.8)} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <View style={[styles.inlineRow, villaRtl.inlineRow]}>
        <Text style={[styles.inlineRowLabel, villaRtl.inlineRowLabel]}>
          {t("listings.ageLessThan")}
        </Text>
        <TouchableOpacity
          style={[styles.inlineField, villaRtl.inlineField]}
          onPress={() => setShowAgeModal(true)}
        >
          <Text style={[styles.inlineFieldText, villaRtl.inlineFieldText]}>
            {agePickerRowLabel(ageLessThan, t)}
          </Text>
          <Ionicons name="chevron-down" size={wp(4.8)} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <ToggleRow
        label={t("listings.driverRoom")}
        value={driverRoom}
        onValueChange={setDriverRoom}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.maidRoom")}
        value={maidRoom}
        onValueChange={setMaidRoom}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.pool")}
        value={pool}
        onValueChange={setPool}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.furnished")}
        value={furnished}
        onValueChange={setFurnished}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.tent")}
        value={tent}
        onValueChange={setTent}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.backyard")}
        value={backyard}
        onValueChange={setBackyard}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.kitchen")}
        value={kitchen}
        onValueChange={setKitchen}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.extraUnit")}
        value={extraUnit}
        onValueChange={setExtraUnit}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.carEntrance")}
        value={carEntrance}
        onValueChange={setCarEntrance}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.basement")}
        value={basement}
        onValueChange={setBasement}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.lift")}
        value={lift}
        onValueChange={setLift}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <OptionChips
        label={t("listings.villaType")}
        options={villaTypeDisplayOptions}
        selectedValue={villaType ? villaTypeRowLabel(villaType, t) : ""}
        onSelect={(label) =>
          setVillaType(canonicalVillaTypeFromDisplayLabel(label, t))
        }
      />
      <ToggleRow
        label={t("listings.water")}
        value={water}
        onValueChange={setWater}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.electricity")}
        value={electricity}
        onValueChange={setElectricity}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />
      <ToggleRow
        label={t("listings.drainageAvailability")}
        value={drainageAvailability}
        onValueChange={setDrainageAvailability}
        trackWidth={TOGGLE_TRACK_WIDTH}
        trackHeight={TOGGLE_TRACK_HEIGHT}
        thumbSize={TOGGLE_THUMB_SIZE}
      />

      <WheelPickerModal
        visible={showApartmentsModal}
        onClose={() => setShowApartmentsModal(false)}
        onSelect={setApartments}
        title={t("listings.apartments")}
        options={APARTMENT_PICKER_OPTIONS}
        initialValue={apartments}
      />
      <WheelPickerModal
        visible={showAgeModal}
        onClose={() => setShowAgeModal(false)}
        onSelect={(picked) =>
          setAgeLessThan(canonicalAgeFromDisplayLabel(picked, t))
        }
        title={t("listings.ageLessThan")}
        options={ageDisplayOptions}
        initialValue={agePickerRowLabel(ageLessThan, t)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  inlineRow: {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(1.8),
  },
  inlineRowLabel: {
    fontSize: wp(3.8),
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  inlineField: {
    minWidth: wp(40),
    height: hp(5),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(1.5),
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(3),
  },
  inlineFieldText: { fontSize: wp(3.8), color: COLORS.textPrimary },
});
