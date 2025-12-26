import React, { memo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export interface SegmentedControlProps {
  options: string[];
  selectedIndex?: number;
  onValueChange?: (index: number) => void;
}

const SegmentedControl = memo<SegmentedControlProps>(
  ({ options = ["buy", "Rent"], selectedIndex, onValueChange }) => {
    const [selected, setSelected] = useState(selectedIndex ?? 0);

    const handlePress = (index: number) => {
      setSelected(index);
      onValueChange?.(index);
    };

    return (
      <View style={styles.container}>
        {options.map((option, index) => {
          const isSelected = index === selected;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.segment,
                isSelected && styles.segmentSelected,
                index === 0 && styles.firstSegment,
                index === options.length - 1 && styles.lastSegment,
              ]}
              onPress={() => handlePress(index)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentText,
                  isSelected && styles.segmentTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    borderWidth: 1,
    borderColor: "#e5e7eb",
    width: "100%",
    height: hp(6),
    alignItems: "center",
    justifyContent: "center",
  },
  segment: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    height: hp(5.5),
    width: "50%",
  },
  segmentSelected: {
    backgroundColor: "#0ab539",
    marginLeft: wp(1),
  },
  firstSegment: {
    borderRadius: wp(2),
  },
  lastSegment: {
    borderRadius: wp(2),
  },
  segmentText: {
    fontSize: wp(4),
    color: "#6b7280",
    fontWeight: "500",
  },
  segmentTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default SegmentedControl;
