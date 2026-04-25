import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
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
  /** Optional header label (e.g. "Payment options"); when provided, section and label use RTL-aware layout */
  label?: string;
}

/**
 * Payment chips component (horizontally scrollable). Supports RTL for layout and text.
 */
const PaymentChips = memo<PaymentChipsProps>(
  ({ selectedPayment, onSelect, label }) => {
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

    // RTL-aware styles for LTR ↔ RTL
    const rtlStyles = useMemo(
      () => ({
        section: {
          alignItems: (isRTL ? "flex-end" : "flex-start") as
            | "flex-start"
            | "flex-end",
        },
        label: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
          writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
        },
        chipsContainer: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
          paddingRight: isRTL ? 0 : wp(4),
          paddingLeft: isRTL ? wp(4) : 0,
        },
        chipText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
          writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
        },
      }),
      [isRTL],
    );

    const chipsContent = (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.chipsContainer,
          rtlStyles.chipsContainer,
        ]}
      >
        {translatedPaymentOptions.map((translatedPayment, index) => {
          const originalPayment = PAYMENT_CHIPS[index];
          const isSelected = selectedPayment === originalPayment;
          return (
            <TouchableOpacity
              key={originalPayment}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => onSelect(originalPayment)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  rtlStyles.chipText,
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

    if (label) {
      return (
        <View style={[styles.section, rtlStyles.section]}>
          <Text style={[styles.label, rtlStyles.label]}>{label}</Text>
          {chipsContent}
        </View>
      );
    }

    return chipsContent;
  },
);

PaymentChips.displayName = "PaymentChips";

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

export default PaymentChips;
