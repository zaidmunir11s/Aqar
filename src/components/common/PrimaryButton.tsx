import React, { memo } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";

export interface PrimaryButtonProps {
  onPress: () => void;
  text: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Reusable primary button component
 */
const PrimaryButton = memo<PrimaryButtonProps>(
  ({ onPress, text, disabled = false, style, textStyle }) => {
    return (
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled, style]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, textStyle]}>{text}</Text>
      </TouchableOpacity>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(3),
    height: hp(7),
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
  buttonDisabled: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.6,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: { elevation: 0 },
    }),
  },
  buttonText: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#fff",
  },
});

export default PrimaryButton;
