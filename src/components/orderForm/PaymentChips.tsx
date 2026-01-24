import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { PAYMENT_CHIPS } from "../../constants/orderFormOptions";
import { useLocalization } from "../../hooks/useLocalization";

export interface PaymentChipsProps {
  selectedPayment: string | null;
  onSelect: (payment: string) => void;
}

/**
 * Payment chips component (horizontally scrollable)
 */
const PaymentChips = memo<PaymentChipsProps>(({ selectedPayment, onSelect }) => {
  const { t, isRTL } = useLocalization();

  // Translate payment options and create mapping
  const translatedPaymentOptions = useMemo(() => {
    return PAYMENT_CHIPS.map((payment) => {
      if (payment === "1 Payment") return t("listings.onePayment");
      if (payment === "2 Payment") return t("listings.twoPayment");
      if (payment === "4 Payment") return t("listings.fourPayment");
      if (payment === "Monthly") return t("listings.monthly");
      return payment;
    });
  }, [t]);

  // Create reverse mapping (translated -> original)
  const paymentReverseMap = useMemo(() => {
    const map: Record<string, string> = {};
    PAYMENT_CHIPS.forEach((original, index) => {
      map[translatedPaymentOptions[index]] = original;
    });
    return map;
  }, [translatedPaymentOptions]);

  // RTL-aware styles (only apply RTL-specific changes, preserve LTR styling)
  const rtlStyles = useMemo(
    () => ({
      chipsContainer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
    }),
    [isRTL]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.chipsContainer, rtlStyles.chipsContainer]}
    >
      {translatedPaymentOptions.map((translatedPayment, index) => {
        const originalPayment = PAYMENT_CHIPS[index];
        const isSelected = selectedPayment === originalPayment;
        return (
          <TouchableOpacity
            key={originalPayment}
            style={[
              styles.chip,
              isSelected && styles.chipActive,
            ]}
            onPress={() => onSelect(originalPayment)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                isSelected && styles.chipTextActive,
              ]}
            >
              {translatedPayment}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

PaymentChips.displayName = "PaymentChips";

const styles = StyleSheet.create({
  chipsContainer: {
    flexDirection: "row",
    gap: wp(2),
    marginTop: hp(1),
    paddingRight: wp(4),
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

export default PaymentChips;

