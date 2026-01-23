import React, { memo, useState, ReactNode, useMemo } from "react";
import {
  View,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import { MaterialCommunityIcons, Entypo, Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface TextInputProps extends Omit<RNTextInputProps, "style"> {
  value: string;
  onChangeText: (text: string) => void;

  // Label
  label?: string;
  labelIcon?: {
    name: string;
    library?: "MaterialCommunityIcons" | "Entypo" | "Ionicons";
    color?: string;
    size?: number;
  };

  // Prefix (like country code)
  prefix?: string;
  prefixStyle?: TextStyle;

  // Suffix (like currency)
  suffix?: string;
  suffixStyle?: TextStyle;

  // Right action (like show/hide, forgot password)
  rightAction?: {
    type: "text" | "icon" | "custom";
    content?: string | ReactNode;
    iconName?: string;
    iconLibrary?: "MaterialCommunityIcons" | "Entypo" | "Ionicons";
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
  };

  // Password specific
  isPassword?: boolean;
  showPasswordToggle?: boolean;

  // Error handling
  error?: string;
  touched?: boolean;

  // Container styling
  containerStyle?: ViewStyle;
  inputWrapperStyle?: ViewStyle;
  inputStyle?: TextStyle;

  // Placeholder styling
  placeholderFontSize?: number;

  // Focus states
  showFocusStates?: boolean;
  focusedBorderColor?: string; // Defaults to COLORS.primary if not specified

  // Header layout (for password with forgot password)
  headerLayout?: "default" | "space-between";

  // Border control for grouped inputs
  hideTopBorder?: boolean; // Hide top border when input is part of a group (2nd, 3rd, etc.)
}

/**
 * Unified reusable text input component
 * Supports all input patterns: phone, password, text, numeric, multiline, etc.
 */
const TextInput = memo<TextInputProps>(
  ({
    value,
    onChangeText,
    label,
    labelIcon,
    prefix,
    prefixStyle,
    suffix,
    suffixStyle,
    rightAction,
    isPassword = false,
    showPasswordToggle = false,
    error,
    touched = false,
    containerStyle,
    inputWrapperStyle,
    inputStyle,
    placeholderFontSize,
    showFocusStates = true,
    focusedBorderColor,
    headerLayout = "default",
    hideTopBorder = false,
    placeholder,
    placeholderTextColor = COLORS.textSecondary,
    keyboardType,
    multiline = false,
    numberOfLines,
    secureTextEntry,
    ...restProps
  }) => {
    const { isRTL, t } = useLocalization();
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // Determine if we should show password toggle
    const shouldShowPasswordToggle = isPassword && showPasswordToggle;
    const actualSecureTextEntry = isPassword ? !showPassword : secureTextEntry;
    
    // RTL-aware styles - only apply to password inputs (for show/hide button)
    // Phone number inputs should stay LTR (prefix on left)
    const rtlStyles = useMemo(
      () => ({
        inputWrapper: {
          // Only reverse for password inputs with toggle
          flexDirection: (isRTL && shouldShowPasswordToggle ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        input: {
          // Shift cursor to right for RTL
          textAlign: (isRTL ? "right" : "left") as "left" | "right" | "center",
        },
        suffix: {
          marginLeft: isRTL ? 0 : wp(2),
          marginRight: isRTL ? wp(2) : 0,
        },
        showHideButton: {
          marginRight: isRTL ? 0 : 0,
          marginLeft: isRTL ? 0 : 0,
        },
        errorText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL, shouldShowPasswordToggle]
    );

    // Render label icon
    const renderLabelIcon = () => {
      if (!labelIcon) return null;

      const IconComponent =
        labelIcon.library === "Entypo"
          ? Entypo
          : labelIcon.library === "Ionicons"
            ? Ionicons
            : MaterialCommunityIcons;

      return (
        <IconComponent
          name={labelIcon.name as any}
          size={labelIcon.size || wp(6)}
          color={labelIcon.color || COLORS.primary}
        />
      );
    };

    // Render right action (only for input wrapper, not header)
    const renderRightAction = () => {
      if (shouldShowPasswordToggle) {
        return (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={[styles.showHideButton, rtlStyles.showHideButton]}
          >
            <Text style={styles.showHideText}>
              {showPassword ? t("auth.hide") : t("auth.show")}
            </Text>
          </TouchableOpacity>
        );
      }

      // Don't render text rightAction in input wrapper if it's in header
      if (
        rightAction &&
        headerLayout === "space-between" &&
        rightAction.type === "text"
      ) {
        return null;
      }

      if (rightAction) {
        if (rightAction.type === "icon") {
          const IconComponent =
            rightAction.iconLibrary === "Entypo"
              ? Entypo
              : rightAction.iconLibrary === "Ionicons"
                ? Ionicons
                : MaterialCommunityIcons;

          return (
            <TouchableOpacity
              onPress={rightAction.onPress}
              style={[styles.rightActionButton, rightAction.style]}
            >
              <IconComponent
                name={rightAction.iconName as any}
                size={wp(5)}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          );
        } else if (rightAction.type === "custom") {
          return (
            <TouchableOpacity
              onPress={rightAction.onPress}
              style={[styles.rightActionButton, rightAction.style]}
            >
              {rightAction.content as ReactNode}
            </TouchableOpacity>
          );
        }
      }

      return null;
    };

    const hasError = touched && error;
    const showFocusedState = showFocusStates && isFocused && !hasError;
    const actualFocusedBorderColor = focusedBorderColor || COLORS.primary;

    return (
      <View
        style={[
          styles.container,
          hideTopBorder && styles.containerNoMargin,
          containerStyle,
        ]}
      >
        {/* Label Section */}
        {(label || labelIcon) && (
          <View
            style={[
              styles.labelContainer,
              headerLayout === "space-between" &&
                styles.labelContainerSpaceBetween,
            ]}
          >
            <View style={styles.labelRow}>
              {labelIcon && renderLabelIcon()}
              {label && (
                <Text
                  style={[
                    styles.labelText,
                    labelIcon && styles.labelTextWithIcon,
                  ]}
                >
                  {label}
                </Text>
              )}
            </View>
            {rightAction &&
              rightAction.type === "text" &&
              headerLayout === "space-between" && (
                <TouchableOpacity onPress={rightAction.onPress}>
                  <Text style={styles.rightActionText}>
                    {rightAction.content}
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        )}

        {/* Input Wrapper */}
        <View
          style={[
            styles.inputWrapper,
            rtlStyles.inputWrapper,
            inputWrapperStyle,
            hasError && !isFocused && styles.inputWrapperError,
            isFocused &&
              showFocusStates && {
                borderColor: actualFocusedBorderColor,
              },
            hideTopBorder && styles.inputWrapperNoTopBorder,
          ]}
        >
          {/* Prefix */}
          {prefix && <Text style={[styles.prefix, prefixStyle]}>{prefix}</Text>}

          {/* Text Input */}
          <RNTextInput
            style={[
              styles.input,
              rtlStyles.input,
              multiline && styles.inputMultiline,
              !value && !placeholderFontSize && styles.inputPlaceholder,
              !value && placeholderFontSize
                ? { fontSize: placeholderFontSize }
                : null,
              inputStyle,
            ].filter(Boolean)}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            keyboardType={keyboardType}
            secureTextEntry={actualSecureTextEntry}
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? "top" : "center"}
            onFocus={(e) => {
              setIsFocused(true);
              restProps.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              restProps.onBlur?.(e);
            }}
            {...restProps}
          />

          {/* Suffix */}
          {suffix && <Text style={[styles.suffix, rtlStyles.suffix, suffixStyle]}>{suffix}</Text>}

          {/* Right Action */}
          {renderRightAction()}
        </View>

        {/* Error Message */}
        {hasError && <Text style={[styles.errorText, rtlStyles.errorText]}>{error}</Text>}
      </View>
    );
  }
);

TextInput.displayName = "TextInput";

const styles = StyleSheet.create({
  container: {
    marginBottom: hp(3),
  },
  containerNoMargin: {
    marginBottom: 0,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.2),
  },
  labelContainerSpaceBetween: {
    justifyContent: "space-between",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelText: {
    fontSize: wp(4.5),
    fontWeight: "500",
    color: "#1f2937",
  },
  labelTextWithIcon: {
    marginLeft: wp(2),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: wp(1.5),
    paddingHorizontal: wp(4),
    minHeight: hp(6),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  inputWrapperNoTopBorder: {
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  prefix: {
    fontSize: wp(4),
    color: COLORS.numberLabel,
    fontWeight: "400",
    marginRight: wp(2),
  },
  input: {
    flex: 1,
    fontSize: wp(4.5),
    color: "#1f2937",
    padding: 0,
    minHeight: hp(4),
  },
  inputPlaceholder: {
    fontSize: wp(3.5),
  },
  inputMultiline: {
    paddingTop: hp(1.5),
    paddingBottom: hp(1.5),
    minHeight: hp(15),
  },
  suffix: {
    fontSize: wp(4),
    color: COLORS.primary,
    fontWeight: "400",
    marginLeft: wp(2),
  },
  showHideButton: {
    padding: wp(2),
  },
  showHideText: {
    fontSize: wp(3.5),
    fontWeight: "400",
    color: COLORS.textPrimary,
  },
  rightActionButton: {
    padding: wp(2),
  },
  rightActionText: {
    fontSize: wp(4.2),
    color: COLORS.passwordLabel,
    fontWeight: "500",
  },
  errorText: {
    fontSize: wp(3.5),
    color: COLORS.error,
    marginTop: hp(0.5),
  },
});

export default TextInput;
