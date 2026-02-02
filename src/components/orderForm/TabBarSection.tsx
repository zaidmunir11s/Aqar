import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

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
    const { isRTL, t } = useLocalization();

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        label: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        segmentedTabBar: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        segmentedTab: {
          // Base border styles - will be overridden by firstSegment/lastSegment
        },
        firstSegment: {
          // In LTR: first segment (left side) has left border radius
          // In RTL: first segment in array appears on right, so needs right border radius
          borderTopLeftRadius: isRTL ? 0 : wp(1.5),
          borderBottomLeftRadius: isRTL ? 0 : wp(1.5),
          borderTopRightRadius: isRTL ? wp(1.5) : 0,
          borderBottomRightRadius: isRTL ? wp(1.5) : 0,
        },
        lastSegment: {
          // In LTR: last segment (right side) has right border radius and no right border
          // In RTL: last segment in array appears on left, so needs left border radius and no left border
          borderTopRightRadius: isRTL ? 0 : wp(1.5),
          borderBottomRightRadius: isRTL ? 0 : wp(1.5),
          borderTopLeftRadius: isRTL ? wp(1.5) : 0,
          borderBottomLeftRadius: isRTL ? wp(1.5) : 0,
          borderRightWidth: 0,
          borderLeftWidth: 0,
        },
        segmentedTabText: {
          textAlign: "center" as const,
          writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
        },
      }),
      [isRTL]
    );

    const handlePress = (option: string) => {
      // Always call onSelect with the option value
      // The parent component will handle the logic for toggling/unselecting
      onSelect(option);
    };

    // Helper function to translate "All" / "ALL" option for LTR/RTL
    const getDisplayText = (option: string): string => {
      if (option === "All" || option === "ALL") {
        return t("listings.all");
      }
      return option;
    };

    return (
      <View style={styles.section}>
        {label && <Text style={[styles.label, rtlStyles.label]}>{label}</Text>}
        <View style={[styles.segmentedTabBar, rtlStyles.segmentedTabBar, backgroundColor && { backgroundColor }]}>
          {options.map((option, index) => {
            const isLast = index === options.length - 1;
            const isFirst = index === 0;
            
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.segmentedTab,
                  // Apply borders between segments (not on last segment)
                  // In LTR: add right border to all tabs except last (including first "All" tab)
                  // In RTL: add left border to all tabs except last (including first "All" tab)
                  !isRTL && !isLast && {
                    borderRightWidth: 1,
                    borderRightColor: COLORS.border,
                  },
                  isRTL && !isLast && {
                    borderLeftWidth: 1,
                    borderLeftColor: COLORS.border,
                  },
                  isFirst && [styles.firstSegment, rtlStyles.firstSegment],
                  isLast && [styles.lastSegment, rtlStyles.lastSegment],
                  selectedValue === option && styles.segmentedTabActive,
                ]}
                onPress={() => handlePress(option)}
                activeOpacity={0.7}
              >
              <Text
                style={[
                  styles.segmentedTabText,
                  rtlStyles.segmentedTabText,
                  selectedValue === option && styles.segmentedTabTextActive,
                ]}
              >
                {getDisplayText(option)}
              </Text>
            </TouchableOpacity>
            );
          })}
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

