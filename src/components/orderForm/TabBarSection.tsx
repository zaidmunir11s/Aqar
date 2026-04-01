import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

/** Matches `SegmentedControl` large variant segment height (new order & listing forms). */
export const TAB_BAR_SEGMENT_HEIGHT = hp(4.2);

export interface TabBarSectionProps {
  label?: string;
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  /** Outer track fill; defaults to app screen background (e.g. New Order scroll area). */
  backgroundColor?: string;
}

/**
 * Reusable tab bar — same outer track, segment height, radii, separators, and selection fill as SegmentedControl (large).
 */
const TabBarSection = memo<TabBarSectionProps>(
  ({ label, options, selectedValue, onSelect, backgroundColor }) => {
    const { isRTL, t } = useLocalization();

    const trackBackground = backgroundColor ?? COLORS.background;

    const rtlStyles = useMemo(
      () => ({
        label: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        segmentedTabBar: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        segmentedTabText: {
          textAlign: "center" as const,
          writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
        },
      }),
      [isRTL]
    );

    const handlePress = (option: string) => {
      onSelect(option);
    };

    const getDisplayText = (option: string): string => {
      if (option === "All" || option === "ALL") {
        return t("listings.all");
      }
      if (option === "Singles") return t("listings.singles");
      if (option === "Families") return t("listings.families");
      return option;
    };

    return (
      <View style={styles.section}>
        {label ? <Text style={[styles.label, rtlStyles.label]}>{label}</Text> : null}
        <View
          style={[
            styles.segmentedTabBar,
            rtlStyles.segmentedTabBar,
            { backgroundColor: trackBackground },
          ]}
        >
          {options.map((option, index) => (
            <React.Fragment key={option}>
              <TouchableOpacity
                style={[
                  styles.segmentedTab,
                  selectedValue === option && styles.segmentedTabActive,
                ]}
                onPress={() => handlePress(option)}
                activeOpacity={0.85}
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
              {index < options.length - 1 ? <View style={styles.separator} /> : null}
            </React.Fragment>
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
    borderRadius: wp(2),
    padding: wp(0.45),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "stretch",
    minHeight: TAB_BAR_SEGMENT_HEIGHT + wp(0.45) * 2,
  },
  segmentedTab: {
    flex: 1,
    minHeight: TAB_BAR_SEGMENT_HEIGHT,
    paddingHorizontal: wp(2),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp(2),
  },
  separator: {
    width: 1,
    alignSelf: "center",
    height: TAB_BAR_SEGMENT_HEIGHT * 0.68,
    backgroundColor: COLORS.border,
    opacity: 0.9,
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
    fontWeight: "500",
  },
});

export default TabBarSection;
