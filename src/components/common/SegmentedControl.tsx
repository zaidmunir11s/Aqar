import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";

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
    return (
      <View style={styles.container}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.segment,
              index === selectedIndex && styles.segmentActive,
              index === 0 && styles.firstSegment,
              index === options.length - 1 && styles.lastSegment,
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
    borderWidth: 1.8,
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
