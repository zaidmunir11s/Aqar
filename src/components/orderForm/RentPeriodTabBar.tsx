import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface RentPeriodTabBarProps {
  selectedPeriod: "Yearly" | "Monthly" | null;
  onSelect: (period: "Yearly" | "Monthly") => void;
}

/**
 * Rent period tab bar component (Yearly/Monthly)
 */
const RentPeriodTabBar = memo<RentPeriodTabBarProps>(
  ({ selectedPeriod, onSelect }) => {
    const { t, isRTL } = useLocalization();

    // RTL-aware styles (only apply RTL-specific changes, preserve LTR styling)
    const rtlStyles = useMemo(
      () => ({
        label: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        rentPeriodContainer: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        rentPeriodSegment: {
          borderRightWidth: isRTL ? 0 : 1,
          borderLeftWidth: isRTL ? 1 : 0,
          borderRightColor: isRTL ? "transparent" : "#e5e7eb",
          borderLeftColor: isRTL ? "#e5e7eb" : "transparent",
        },
        firstSegment: {
          borderTopLeftRadius: isRTL ? 0 : wp(1.5),
          borderBottomLeftRadius: isRTL ? 0 : wp(1.5),
          borderTopRightRadius: isRTL ? wp(1.5) : 0,
          borderBottomRightRadius: isRTL ? wp(1.5) : 0,
        },
        lastSegment: {
          borderTopRightRadius: isRTL ? 0 : wp(1.5),
          borderBottomRightRadius: isRTL ? 0 : wp(1.5),
          borderTopLeftRadius: isRTL ? wp(1.5) : 0,
          borderBottomLeftRadius: isRTL ? wp(1.5) : 0,
          borderRightWidth: isRTL ? 1 : 0,
          borderLeftWidth: isRTL ? 0 : 0,
        },
      }),
      [isRTL]
    );

    return (
      <View style={styles.section}>
        <Text style={[styles.label, rtlStyles.label]}>{t("listings.rentPeriod")}</Text>
        <View style={[styles.rentPeriodContainer, rtlStyles.rentPeriodContainer]}>
          <TouchableOpacity
            style={[
              styles.rentPeriodSegment,
              rtlStyles.rentPeriodSegment,
              styles.firstSegment,
              rtlStyles.firstSegment,
              selectedPeriod === "Yearly" && styles.rentPeriodSegmentActive,
            ]}
            onPress={() => onSelect("Yearly")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.rentPeriodText,
                selectedPeriod === "Yearly" && styles.rentPeriodTextActive,
              ]}
            >
              {t("listings.yearly")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rentPeriodSegment,
              rtlStyles.rentPeriodSegment,
              styles.lastSegment,
              rtlStyles.lastSegment,
              selectedPeriod === "Monthly" && styles.rentPeriodSegmentActive,
            ]}
            onPress={() => onSelect("Monthly")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.rentPeriodText,
                selectedPeriod === "Monthly" && styles.rentPeriodTextActive,
              ]}
            >
              {t("listings.monthly")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

RentPeriodTabBar.displayName = "RentPeriodTabBar";

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
  rentPeriodContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: wp(2),
    padding: wp(0.5),
    borderWidth: 1.8,
    borderColor: COLORS.border,
    alignItems: "stretch",
  },
  rentPeriodSegment: {
    flex: 1,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(2),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp(1.5),
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    minHeight: hp(5),
  },
  firstSegment: {
    borderTopLeftRadius: wp(1.5),
    borderBottomLeftRadius: wp(1.5),
  },
  lastSegment: {
    borderTopRightRadius: wp(1.5),
    borderBottomRightRadius: wp(1.5),
    borderRightWidth: 0,
  },
  rentPeriodSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  rentPeriodText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: "#6b7280",
    textAlign: "center",
  },
  rentPeriodTextActive: {
    color: "#fff",
    fontWeight: "500",
  },
});

export default RentPeriodTabBar;

