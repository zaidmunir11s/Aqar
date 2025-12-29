import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";

export interface TabBarSectionProps {
  label?: string;
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  backgroundColor?: string;
}

/**
 * Reusable tab bar section with selectable tabs
 */
const TabBarSection = memo<TabBarSectionProps>(
  ({ label, options, selectedValue, onSelect, backgroundColor }) => {
    const handlePress = (option: string) => {
      // Always call onSelect with the option value
      // The parent component will handle the logic for toggling/unselecting
      onSelect(option);
    };

    return (
      <View style={styles.section}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={[styles.segmentedTabBar, backgroundColor && { backgroundColor }]}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.segmentedTab,
                index === 0 && styles.firstSegment,
                index === options.length - 1 && styles.lastSegment,
                selectedValue === option && styles.segmentedTabActive,
              ]}
              onPress={() => handlePress(option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentedTabText,
                  selectedValue === option && styles.segmentedTabTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
);

TabBarSection.displayName = "TabBarSection";

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
  segmentedTabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: wp(2),
    padding: wp(0.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "stretch",
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(2),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp(0.5),
    borderRightWidth: 1,
    borderRightColor: "#d0d5d9",
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
  segmentedTabActive: {
    backgroundColor: COLORS.primary,
  },
  segmentedTabText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  segmentedTabTextActive: {
    color: COLORS.white,
  },
});

export default TabBarSection;

