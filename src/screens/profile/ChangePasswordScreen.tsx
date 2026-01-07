import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { ScreenHeader, TextInput } from "../../components";

type NavigationProp = NativeStackNavigationProp<any>;

export default function ChangePasswordScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [oldPasswordTouched, setOldPasswordTouched] = useState<boolean>(false);
  const [newPasswordTouched, setNewPasswordTouched] = useState<boolean>(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState<boolean>(false);
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  // Validation functions
  const validatePassword = (pwd: string): string => {
    if (pwd.trim().length === 0) {
      return "Password is required";
    }
    return "";
  };

  const validateConfirmPassword = (pwd: string, newPwd: string): string => {
    if (pwd.trim().length === 0) {
      return "Please confirm your password";
    }
    if (pwd !== newPwd) {
      return "Passwords do not match";
    }
    return "";
  };

  const oldPasswordError = validatePassword(oldPassword);
  const newPasswordError = validatePassword(newPassword);
  const confirmPasswordError = validateConfirmPassword(confirmPassword, newPassword);

  // Check if all fields have input
  const isFormValid = 
    oldPassword.trim().length > 0 && 
    newPassword.trim().length > 0 && 
    confirmPassword.trim().length > 0;

  // Listen to keyboard show/hide events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        setIsKeyboardVisible(true);
        // Set keyboard height to position footer just above keyboard
        Animated.timing(keyboardHeight, {
          toValue: event.endCoordinates.height,
          duration: event.duration || 250,
          useNativeDriver: false, // Can't use native driver for bottom positioning
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (event) => {
        setIsKeyboardVisible(false);
        // Reset keyboard height to 0 to bring footer back to original position
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: event.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardHeight]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSave = useCallback(() => {
    // Mark all fields as touched
    setOldPasswordTouched(true);
    setNewPasswordTouched(true);
    setConfirmPasswordTouched(true);

    // Validate all fields
    const oldPwdErr = validatePassword(oldPassword);
    const newPwdErr = validatePassword(newPassword);
    const confirmPwdErr = validateConfirmPassword(confirmPassword, newPassword);

    if (oldPwdErr !== "" || newPwdErr !== "" || confirmPwdErr !== "") {
      // Validation failed, return early
      return;
    }

    // All validations passed
    console.log("Change password:", { oldPassword, newPassword });
    // TODO: Implement change password functionality
  }, [oldPassword, newPassword, confirmPassword]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Change Password"
        onBackPress={handleBackPress}
        fontWeightBold={true}
      />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            !isKeyboardVisible && styles.scrollContentNoKeyboard,
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={isKeyboardVisible}
          keyboardShouldPersistTaps="handled"
        >
          {/* Old Password Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Old password</Text>
            <TextInput
              value={oldPassword}
              onChangeText={setOldPassword}
              onBlur={() => setOldPasswordTouched(true)}
              placeholder="Enter old password"
              isPassword={true}
              showFocusStates={true}
              containerStyle={styles.inputContainer}
              error={oldPasswordTouched ? oldPasswordError : ""}
              touched={oldPasswordTouched}
            />
          </View>

          {/* New Password Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>New password</Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              onBlur={() => setNewPasswordTouched(true)}
              placeholder="Enter new password"
              isPassword={true}
              showFocusStates={true}
              containerStyle={styles.inputContainer}
              error={newPasswordTouched ? newPasswordError : ""}
              touched={newPasswordTouched}
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onBlur={() => setConfirmPasswordTouched(true)}
              placeholder="Confirm new password"
              isPassword={true}
              showFocusStates={true}
              containerStyle={styles.inputContainer}
              error={confirmPasswordTouched ? confirmPasswordError : ""}
              touched={confirmPasswordTouched}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Footer with Save Button */}
      <Animated.View
        style={[
          styles.footer,
          {
            bottom: keyboardHeight,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.saveButton,
            !isFormValid && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={!isFormValid}
        >
          <Text style={[
            styles.saveButtonText,
            !isFormValid && styles.saveButtonTextDisabled
          ]}>Save</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgGray,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
    paddingBottom: hp(12), // Extra padding for footer (hp(6) button + hp(4) padding)
  },
  scrollContentNoKeyboard: {
    flexGrow: 1,
  },
  inputSection: {
    marginBottom: hp(3),
  },
  label: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: hp(1.2),
  },
  inputContainer: {
    marginBottom: 0,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(1),
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(2),
    height: hp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.white,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.primaryDark,
    opacity: 0.6,
  },
  saveButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
});

