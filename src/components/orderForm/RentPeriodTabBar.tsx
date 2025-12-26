import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";

export interface RentPeriodTabBarProps {
  selectedPeriod: "Yearly" | "Monthly" | null;
  onSelect: (period: "Yearly" | "Monthly") => void;
}

/**
 * Rent period tab bar component (Yearly/Monthly)
 */
const RentPeriodTabBar = memo<RentPeriodTabBarProps>(
  ({ selectedPeriod, onSelect }) => {
    return (
      <View style={styles.section}>
        <Text style={styles.label}>Rent Period</Text>
        <View style={styles.rentPeriodContainer}>
          <TouchableOpacity
            style={[
              styles.rentPeriodSegment,
              styles.firstSegment,
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
              Yearly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rentPeriodSegment,
              styles.lastSegment,
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
              Monthly
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

