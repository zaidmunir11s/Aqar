import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import ToggleRow from "./ToggleRow";

export interface ToggleItem {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export interface ToggleGroupProps {
  toggles: ToggleItem[];
}

/**
 * Reusable toggle group component for multiple toggles
 */
const ToggleGroup = memo<ToggleGroupProps>(({ toggles }) => {
  return (
    <View style={styles.section}>
      {toggles.map((toggle, index) => (
        <ToggleRow
          key={index}
          label={toggle.label}
          value={toggle.value}
          onValueChange={toggle.onValueChange}
        />
      ))}
    </View>
  );
});

ToggleGroup.displayName = "ToggleGroup";

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(2.5),
  },
});

export default ToggleGroup;
