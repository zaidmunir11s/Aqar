import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Reusable segmented control component for tab selection
 */
const SegmentedControl = memo<SegmentedControlProps>(
  ({ options, selectedIndex, onSelect }) => {
    const { isRTL } = useLocalization();

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        container: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        segment: {
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
      <View style={[styles.container, rtlStyles.container]}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.segment,
              rtlStyles.segment,
              index === selectedIndex && styles.segmentActive,
              index === 0 && [styles.firstSegment, rtlStyles.firstSegment],
              index === options.length - 1 && [styles.lastSegment, rtlStyles.lastSegment],
            ]}
            onPress={() => onSelect(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                index === selectedIndex && styles.segmentTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
);

SegmentedControl.displayName = "SegmentedControl";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: wp(2),
    padding: wp(0.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segment: {
    flex: 1,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(2),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp(1.5),
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
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
  segmentActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    // To change tab text size, modify fontSize value below
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: "#fff",
    fontWeight: "500",
  },
});

export default SegmentedControl;
