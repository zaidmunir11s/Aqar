import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { PAYMENT_CHIPS } from "../../constants/orderFormOptions";

export interface PaymentChipsProps {
  selectedPayment: string | null;
  onSelect: (payment: string) => void;
}

/**
 * Payment chips component (horizontally scrollable)
 */
const PaymentChips = memo<PaymentChipsProps>(({ selectedPayment, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
    >
      {PAYMENT_CHIPS.map((payment) => (
        <TouchableOpacity
          key={payment}
          style={[
            styles.chip,
            selectedPayment === payment && styles.chipActive,
          ]}
          onPress={() => onSelect(payment)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              selectedPayment === payment && styles.chipTextActive,
            ]}
          >
            {payment}
          </Text>
        </TouchableOpacity>
      ))}
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

