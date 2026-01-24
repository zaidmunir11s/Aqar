import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { TextInput } from "../input";
import { useLocalization } from "../../hooks/useLocalization";

export interface PriceInputSectionProps {
  label: string;
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  fromPlaceholder?: string;
  toPlaceholder?: string;
}

/**
 * Reusable price/area input section with From and To fields
 */
const PriceInputSection = memo<PriceInputSectionProps>(
  ({
    label,
    fromValue,
    toValue,
    onFromChange,
    onToChange,
    fromPlaceholder,
    toPlaceholder,
  }) => {
    const { t, isRTL } = useLocalization();
    
    // Use translated defaults if placeholders not provided
    const defaultFromPlaceholder = fromPlaceholder || t("listings.fromPrice");
    const defaultToPlaceholder = toPlaceholder || t("listings.toPrice");

    // RTL-aware styles (only apply RTL-specific changes, preserve LTR styling)
    const rtlStyles = useMemo(
      () => ({
        label: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        priceRow: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
      }),
      [isRTL]
    );

    return (
      <View style={styles.section}>
        <Text style={[styles.label, rtlStyles.label]}>{label}</Text>
        <View style={[styles.priceRow, rtlStyles.priceRow]}>
          <TextInput
            value={fromValue}
            onChangeText={onFromChange}
            placeholder={defaultFromPlaceholder}
            keyboardType="numeric"
            containerStyle={styles.priceInputContainer}
            inputWrapperStyle={styles.priceInput}
            showFocusStates={true}
          />
          <Text style={styles.priceSeparator}>-</Text>
          <TextInput
            value={toValue}
            onChangeText={onToChange}
            placeholder={defaultToPlaceholder}
            keyboardType="numeric"
            containerStyle={styles.priceInputContainer}
            inputWrapperStyle={styles.priceInput}
            showFocusStates={true}
          />
        </View>
      </View>
    );
  }
);

PriceInputSection.displayName = "PriceInputSection";

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
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  priceInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  priceInput: {
    backgroundColor: COLORS.white,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    // paddingVertical: hp(0.1),
    borderWidth: 1.2,
    borderColor: "#ccc",
  },
  priceSeparator: {
    fontSize: wp(4),
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});

export default PriceInputSection;

