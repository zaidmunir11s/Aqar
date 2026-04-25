import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

interface DistrictFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function DistrictField({
  label,
  value,
  placeholder,
  disabled = false,
  onPress,
}: DistrictFieldProps): React.JSX.Element {
  const { isRTL } = useLocalization();

  const rtlStyles = useMemo(
    () => ({
      label: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      fieldRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      value: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
    }),
    [isRTL],
  );

  return (
    <View style={styles.block}>
      <Text style={[styles.label, rtlStyles.label]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.field,
          rtlStyles.fieldRow,
          disabled && styles.fieldDisabled,
        ]}
        disabled={disabled}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Text
          style={[
            styles.value,
            rtlStyles.value,
            !value && styles.placeholder,
            disabled && styles.disabledText,
          ]}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={wp(5)}
          color={disabled ? COLORS.textTertiary : COLORS.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: hp(2.1),
  },
  label: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    fontWeight: "500",
    marginBottom: hp(0.8),
  },
  field: {
    minHeight: hp(5),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    backgroundColor: COLORS.white,
    justifyContent: "space-between",
    alignItems: "center",
  },
  value: {
    flex: 1,
    fontSize: wp(4),
    color: COLORS.textPrimary,
  },
  placeholder: {
    color: COLORS.textTertiary,
  },
  fieldDisabled: {
    opacity: 0.65,
  },
  disabledText: {
    color: COLORS.textTertiary,
  },
});
