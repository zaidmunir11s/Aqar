import React, { memo } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

export interface BackButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

/**
 * Reusable back button component
 */
const BackButton = memo<BackButtonProps>(
  ({ onPress, color = "#0e856a", size = wp(7) }) => {
    return (
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Ionicons name="arrow-back" size={size} color={color} />
      </TouchableOpacity>
    );
  }
);

BackButton.displayName = "BackButton";

const styles = StyleSheet.create({
  button: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
  },
});

export default BackButton;
