import React, { memo, ReactNode } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export interface IconButtonProps {
  onPress: () => void;
  children: ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
  activeOpacity?: number;
}

/**
 * Reusable icon button component
 */
const IconButton = memo<IconButtonProps>(
  ({ onPress, children, style, disabled = false, activeOpacity = 0.7 }) => {
    return (
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={activeOpacity}
      >
        {children}
      </TouchableOpacity>
    );
  }
);

IconButton.displayName = "IconButton";

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fff",
    width: wp(11),
    height: wp(11),
    borderRadius: wp(5.5),
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: wp(1),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 4 },
    }),
  },
});

export default IconButton;
