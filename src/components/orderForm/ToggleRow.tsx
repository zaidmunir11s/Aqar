import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ToggleSwitch } from "../common";
import { COLORS } from "../../constants";

export interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/**
 * Reusable toggle row component
 */
const ToggleRow = memo<ToggleRowProps>(({ label, value, onValueChange }) => {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <ToggleSwitch value={value} onValueChange={onValueChange} />
    </View>
  );
});

ToggleRow.displayName = "ToggleRow";

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(1),
  },
  toggleLabel: {
    fontSize: wp(4),
    color: COLORS.black,
    fontWeight: "500",
  },
});

export default ToggleRow;

