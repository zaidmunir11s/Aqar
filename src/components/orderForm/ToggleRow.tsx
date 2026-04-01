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
  trackWidth?: number;
  trackHeight?: number;
  thumbSize?: number;
}

/**
 * Reusable toggle row component
 */
const ToggleRow = memo<ToggleRowProps>(({ label, value, onValueChange, trackWidth, trackHeight, thumbSize }) => {
  const { isRTL } = useLocalization();

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      toggleRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      toggleLabel: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
    }),
    [isRTL]
  );

  return (
    <View style={[styles.toggleRow, rtlStyles.toggleRow]}>
      <Text style={[styles.toggleLabel, rtlStyles.toggleLabel]}>{label}</Text>
      <ToggleSwitch value={value} onValueChange={onValueChange} trackWidth={trackWidth} trackHeight={trackHeight} thumbSize={thumbSize} />
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

