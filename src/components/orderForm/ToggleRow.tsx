import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ToggleSwitch } from "../common";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/**
 * Reusable toggle row component
 */
const ToggleRow = memo<ToggleRowProps>(({ label, value, onValueChange }) => {
  const { isRTL } = useLocalization();

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      toggleRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      toggleLabel: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  return (
    <View style={[styles.toggleRow, rtlStyles.toggleRow]}>
      <Text style={[styles.toggleLabel, rtlStyles.toggleLabel]}>{label}</Text>
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

