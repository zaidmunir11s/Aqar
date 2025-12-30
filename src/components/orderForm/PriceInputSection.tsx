import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { TextInput } from "../input";

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
    return (
      <View style={styles.section}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.priceRow}>
          <TextInput
            value={fromValue}
            onChangeText={onFromChange}
            placeholder={fromPlaceholder}
            keyboardType="numeric"
            containerStyle={styles.priceInputContainer}
            inputWrapperStyle={styles.priceInput}
            showFocusStates={true}
          />
          <Text style={styles.priceSeparator}>-</Text>
          <TextInput
            value={toValue}
            onChangeText={onToChange}
            placeholder={toPlaceholder}
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

