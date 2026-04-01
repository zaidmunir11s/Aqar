import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import {
  RENT_PAYMENT_FREQUENCY_OPTIONS,
  type RentPaymentFrequency,
  type RentPaymentFrequencyChoice,
} from "../../constants/orderFormOptions";
import { useLocalization } from "../../hooks/useLocalization";

export interface RentPaymentFrequencyChipsProps {
  selectedFrequency: RentPaymentFrequency;
  onSelect: (frequency: RentPaymentFrequencyChoice) => void;
}

/**
 * Rent payment cadence: Yearly, Semi-annual, Quarterly, Monthly (replaces two-option rent period).
 */
const RentPaymentFrequencyChips = memo<RentPaymentFrequencyChipsProps>(
  ({ selectedFrequency, onSelect }) => {
    const { t, isRTL } = useLocalization();

    const translatedOptions = useMemo(
      () =>
        RENT_PAYMENT_FREQUENCY_OPTIONS.map((opt) => {
          if (opt === "Yearly") return t("listings.yearly");
          if (opt === "Semi Annual") return t("listings.semiAnnual");
          if (opt === "Quarterly") return t("listings.quarterly");
          return t("listings.monthly");
        }),
      [t]
    );

    const rtlStyles = useMemo(
      () => ({
        section: {
          alignItems: (isRTL ? "flex-end" : "flex-start") as "flex-start" | "flex-end",
        },
        label: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
          writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
        },
        chipsContainer: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
          paddingRight: isRTL ? 0 : wp(4),
          paddingLeft: isRTL ? wp(4) : 0,
        },
        chipText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
          writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
        },
      }),
      [isRTL]
    );

    return (
      <View style={[styles.section, rtlStyles.section]}>
        <Text style={[styles.label, rtlStyles.label]}>{t("listings.paymentOptions")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chipsContainer, rtlStyles.chipsContainer]}
        >
          {RENT_PAYMENT_FREQUENCY_OPTIONS.map((original, index) => {
            const isSelected = selectedFrequency === original;
            return (
              <TouchableOpacity
                key={original}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => onSelect(original)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    rtlStyles.chipText,
                    isSelected && styles.chipTextActive,
                  ]}
                >
                  {translatedOptions[index]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }
);

RentPaymentFrequencyChips.displayName = "RentPaymentFrequencyChips";

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: wp(4),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(1),
  },
  chipsContainer: {
    flexDirection: "row",
    gap: wp(2),
    marginTop: hp(1),
  },
  chip: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(6),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.activeChipBackground,
    borderColor: COLORS.activeChipBorder,
  },
  chipText: {
    fontSize: wp(3.8),
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.activeChipText,
    fontWeight: "600",
  },
});

export default RentPaymentFrequencyChips;
