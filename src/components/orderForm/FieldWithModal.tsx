import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface FieldWithModalProps {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  backgroundColor?: "white" | "background";
}

/**
 * Reusable field component that opens a modal
 */
const FieldWithModal = memo<FieldWithModalProps>(
  ({ label, value, placeholder, onPress, backgroundColor = "white" }) => {
    const { isRTL } = useLocalization();

    // RTL-aware styles (only apply RTL-specific changes, preserve LTR styling)
    const rtlStyles = useMemo(
      () => ({
        label: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        field: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        fieldText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL]
    );

    return (
      <View style={styles.section}>
        <Text style={[styles.label, rtlStyles.label]}>{label}</Text>
        <TouchableOpacity
          style={[
            styles.field,
            rtlStyles.field,
            backgroundColor === "background" && styles.fieldBackground,
          ]}
          onPress={onPress}
        >
          <Text style={[styles.fieldText, rtlStyles.fieldText, !value && styles.placeholder]}>
            {value || placeholder}
          </Text>
          <Ionicons 
            name={isRTL ? "chevron-up" : "chevron-down"} 
            size={wp(5)} 
            color={COLORS.primary} 
          />
        </TouchableOpacity>
      </View>
    );
  }
);

FieldWithModal.displayName = "FieldWithModal";

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(2.5),
  },
  label: {
    fontSize: wp(4),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(1),
  },
  field: {
    backgroundColor: COLORS.white,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldBackground: {
    backgroundColor: COLORS.background,
  },
  fieldText: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    flex: 1,
  },
  placeholder: {
    color: COLORS.textSecondary,
  },
});

export default FieldWithModal;

