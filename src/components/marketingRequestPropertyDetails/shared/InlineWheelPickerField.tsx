import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { COLORS } from "@/constants";
import WheelPickerModal from "../../common/WheelPickerModal";
import { useLocalization } from "@/hooks/useLocalization";

export interface InlineWheelPickerFieldProps {
  label: string;
  /** Stored value (canonical), e.g. age key `"New"`. */
  value: string;
  /** Wheel labels; if `canonicalValues` is set, same length and order. */
  options: string[];
  /** When set, `onChangeValue` receives the canonical entry at the selected index. */
  canonicalValues?: string[];
  modalTitle: string;
  onChangeValue: (value: string) => void;
}

export default function InlineWheelPickerField({
  label,
  value,
  options,
  canonicalValues,
  modalTitle,
  onChangeValue,
}: InlineWheelPickerFieldProps): React.JSX.Element {
  const { isRTL } = useLocalization();
  const [visible, setVisible] = useState(false);

  const displayValue = useMemo(() => {
    if (
      canonicalValues &&
      canonicalValues.length === options.length &&
      canonicalValues.length > 0
    ) {
      const i = canonicalValues.indexOf(value);
      return i >= 0 ? options[i] : value;
    }
    return value;
  }, [value, options, canonicalValues]);

  const rtlStyles = useMemo(
    () => ({
      row: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      label: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      fieldRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      fieldText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
    }),
    [isRTL]
  );

  return (
    <View style={[styles.inlineRow, rtlStyles.row]}>
      <Text style={[styles.inlineRowLabel, rtlStyles.label]}>{label}</Text>

      <TouchableOpacity
        style={[styles.inlineField, rtlStyles.fieldRow]}
        onPress={() => setVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={[styles.inlineFieldText, rtlStyles.fieldText]}>{displayValue}</Text>
        <Ionicons name="chevron-down" size={wp(4.8)} color={COLORS.primary} />
      </TouchableOpacity>

      <WheelPickerModal
        visible={visible}
        onClose={() => setVisible(false)}
        onSelect={(selected) => {
          if (
            canonicalValues &&
            canonicalValues.length === options.length &&
            canonicalValues.length > 0
          ) {
            const i = options.indexOf(selected);
            onChangeValue(i >= 0 ? canonicalValues[i] : selected);
          } else {
            onChangeValue(selected);
          }
          setVisible(false);
        }}
        title={modalTitle}
        options={options}
        initialValue={displayValue}
      />
    </View>
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
    minWidth: wp(30),
    height: hp(4.2),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(1.5),
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(3),
  },
  inlineFieldText: {
    fontSize: wp(3.8),
    color: COLORS.textPrimary,
  },
});

