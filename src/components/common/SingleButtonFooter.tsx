import React, { memo, useMemo, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useLocalization } from "@/hooks";
import { COLORS } from "../../constants";

export interface SingleButtonFooterProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Optional icon (e.g. <Ionicons name="call" ... />). Shown before label; direction flips in RTL. */
  icon?: ReactNode;
  /** When true (default), footer is position absolute at bottom. When false, in-flow (e.g. DeveloperProfile). */
  fixed?: boolean;
  /** Optional bottom offset in px (e.g. keyboard height). Use with fixed={false} inside an Animated.View for keyboard. */
  bottomOffset?: number;
  containerStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

/**
 * Reusable single-button footer for screens (Reserve, ContactHost, DeveloperProfile, AqarResidentialStats).
 * Supports safe area, optional icon (with RTL), disabled state, and fixed or in-flow layout.
 */
const SingleButtonFooter = memo<SingleButtonFooterProps>(
  ({
    label,
    onPress,
    disabled = false,
    icon,
    fixed = true,
    bottomOffset,
    containerStyle,
    buttonStyle,
    labelStyle,
  }) => {
    const insets = useSafeAreaInsets();
    const { isRTL } = useLocalization();

    const wrapperStyle = useMemo(() => {
      const base: ViewStyle = {
        backgroundColor: COLORS.white,
        paddingHorizontal: wp(4),
        paddingTop: hp(1),
        paddingBottom: Math.max(insets.bottom, hp(1)),
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        ...Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: -2 },
          },
          android: { elevation: 8 },
        }),
      };
      if (fixed) {
        return {
          ...base,
          position: "absolute" as const,
          left: 0,
          right: 0,
          bottom: bottomOffset ?? 0,
        };
      }
      return base;
    }, [fixed, bottomOffset, insets.bottom]);

    const buttonContentDirection = useMemo(
      (): ViewStyle => ({
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      }),
      [isRTL],
    );

    return (
      <View style={[wrapperStyle, containerStyle]}>
        <TouchableOpacity
          style={[
            styles.button,
            disabled && styles.buttonDisabled,
            buttonContentDirection,
            buttonStyle,
          ]}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          {icon != null && <View style={styles.iconWrap}>{icon}</View>}
          <Text
            style={[styles.label, disabled && styles.labelDisabled, labelStyle]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

SingleButtonFooter.displayName = "SingleButtonFooter";

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
  },
  buttonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: COLORS.white,
  },
  labelDisabled: {
    color: COLORS.textDisabled,
  },
});

export default SingleButtonFooter;
