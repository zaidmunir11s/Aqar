import React, { memo, useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";

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
    fromPlaceholder = "From price",
    toPlaceholder = "To price",
  }) => {
    const [fromFocused, setFromFocused] = useState(false);
    const [toFocused, setToFocused] = useState(false);

    return (
      <View style={styles.section}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.priceRow}>
          <TextInput
            style={[
              styles.priceInput,
              fromFocused && styles.priceInputActive,
            ]}
            placeholder={fromPlaceholder}
            placeholderTextColor={COLORS.textTertiary}
            value={fromValue}
            onChangeText={onFromChange}
            keyboardType="numeric"
            onFocus={() => setFromFocused(true)}
            onBlur={() => setFromFocused(false)}
          />
          <Text style={styles.priceSeparator}>-</Text>
          <TextInput
            style={[
              styles.priceInput,
              toFocused && styles.priceInputActive,
            ]}
            placeholder={toPlaceholder}
            placeholderTextColor={COLORS.textTertiary}
            value={toValue}
            onChangeText={onToChange}
            keyboardType="numeric"
            onFocus={() => setToFocused(true)}
            onBlur={() => setToFocused(false)}
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
  priceInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: wp(4),
    color: COLORS.textPrimary,
    borderWidth: 1.2,
    borderColor: "#ccc",
  },
  priceInputActive: {
    backgroundColor: "#e6fff6",
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  priceSeparator: {
    fontSize: wp(4),
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});

export default PriceInputSection;

