import React, { memo } from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useLocalization } from "@/hooks";

export interface BackButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle;
}

/**
 * Reusable back button component with RTL support
 */
const BackButton = memo<BackButtonProps>(
  ({ onPress, color = "#0e856a", size = wp(7), style }) => {
    const { isRTL } = useLocalization();
    
    // Determine arrow direction based on RTL
    const arrowIcon: keyof typeof Ionicons.glyphMap = isRTL ? "arrow-forward" : "arrow-back";

    return (
      <TouchableOpacity 
        style={[styles.button, style]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name={arrowIcon} size={size} color={color} />
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
    alignItems: "center",
  },
});

export default BackButton;
