import React, { memo } from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  trackOnColor?: string;
  trackOffColor?: string;
  thumbOnColor?: string;
  thumbOffColor?: string;
  trackWidth?: number;   // Track width
  trackHeight?: number;  // Track height
  thumbSize?: number;    // Thumb width/height (square)
}

const ToggleSwitch = memo<ToggleSwitchProps>(({
  value,
  onValueChange,
  trackOnColor = COLORS.buttonDisabled,
  trackOffColor = "#9ca3af",
  thumbOnColor = COLORS.primary,
  thumbOffColor = "#fff",
  trackWidth = wp(10),
  trackHeight = hp(1.6),
  thumbSize = wp(6.5),
}) => {
  const { isRTL } = useLocalization();
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  // Track color animation
  const trackColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [trackOffColor, trackOnColor],
  });

  // Dynamic thumb translation - reverse direction in RTL
  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: isRTL 
      ? [0, trackWidth - thumbSize] // RTL: moves from left to right
      : [trackWidth - thumbSize, 0], // LTR: moves from right to left
  });

  // Thumb color animation
  const thumbColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [thumbOffColor, thumbOnColor],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={styles.container}
    >
      <Animated.View
        style={{
          width: trackWidth,
          height: trackHeight,
          borderRadius: trackHeight / 2, // fully rounded track
          backgroundColor: trackColor,
          justifyContent: "center",
          padding: (trackHeight - thumbSize) / 2, // center thumb vertically
        }}
      >
        <Animated.View
          style={{
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2, // fully round thumb
            transform: [{ translateX: thumbTranslateX }],
            backgroundColor: thumbColor,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 3,
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
});

ToggleSwitch.displayName = "ToggleSwitch";

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ToggleSwitch;
