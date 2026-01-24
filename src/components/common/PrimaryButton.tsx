import React, { memo, useMemo } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface PrimaryButtonProps {
  onPress: () => void;
  text: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showArrow?: boolean;
}

/**
 * Reusable primary button component
 */
const PrimaryButton = memo<PrimaryButtonProps>(
  ({ onPress, text, disabled = false, style, textStyle, showArrow = false }) => {
    const { isRTL } = useLocalization();
    
    const rtlStyles = useMemo(
      () => ({
        arrowContainer: {
          right: isRTL ? undefined : wp(1),
          left: isRTL ? wp(1) : undefined,
        },
      }),
      [isRTL]
    );
    
    return (
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled, style]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Text style={[
          styles.buttonText, 
          disabled && styles.buttonTextDisabled,
          textStyle
        ]}>{text}</Text>
        {showArrow && (
          <View style={[styles.arrowContainer, rtlStyles.arrowContainer]}>
            <Ionicons 
              name={isRTL ? "arrow-back" : "arrow-forward"} 
              size={wp(5)} 
              color={disabled ? "#9ca3af" : COLORS.primary} 
            />
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(6),
    height: hp(6),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(4),
    position: "relative",
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabledButton,
    opacity: 1,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: { elevation: 0 },
    }),
  },
  buttonText: {
    fontSize: wp(4.5),
    fontWeight: "500",
    color: COLORS.white,
  },
  buttonTextDisabled: {
    color: COLORS.textDisabled,
  },
  arrowContainer: {
    position: "absolute",
    right: wp(1),
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PrimaryButton;
