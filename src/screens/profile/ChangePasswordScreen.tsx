import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
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
  TextStyle,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { ScreenHeader, TextInput, SingleButtonFooter } from "../../components";
import { useLocalization } from "../../hooks/useLocalization";
import {
  useChangeMyPasswordMutation,
  useGetMeQuery,
} from "@/redux/api/userApi";

type NavigationProp = NativeStackNavigationProp<any>;

export default function ChangePasswordScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const { data: meData } = useGetMeQuery();
  const [changePassword, { isLoading }] = useChangeMyPasswordMutation();
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [oldPasswordTouched, setOldPasswordTouched] = useState<boolean>(false);
  const [newPasswordTouched, setNewPasswordTouched] = useState<boolean>(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] =
    useState<boolean>(false);
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  const rtlStyles = useMemo(
    () => ({
      label: { textAlign: isRTL ? "right" : "left" },
    }),
    [isRTL],
  );

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
  const confirmPasswordError = validateConfirmPassword(
    confirmPassword,
    newPassword,
  );

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
      },
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
      },
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

    if (!meData?.user?.hasPassword) {
      Alert.alert(
        t("common.error", { defaultValue: "Error" }),
        t("profile.passwordNotSet", {
          defaultValue: "This account does not have a password (SSO sign-in).",
        }),
      );
      return;
    }

    changePassword({ oldPassword, newPassword })
      .unwrap()
      .then(() => {
        Alert.alert(
          t("common.success", { defaultValue: "Success" }),
          t("profile.passwordUpdated", { defaultValue: "Password updated" }),
        );
        navigation.goBack();
      })
      .catch((e: any) => {
        Alert.alert(
          t("common.error", { defaultValue: "Error" }),
          e?.message ||
            t("profile.passwordUpdateFailed", {
              defaultValue: "Failed to update password.",
            }),
        );
      });
  }, [
    oldPassword,
    newPassword,
    confirmPassword,
    changePassword,
    navigation,
    t,
    meData,
  ]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("profile.changePassword", { defaultValue: "Change Password" })}
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
            <Text style={[styles.label, rtlStyles.label as TextStyle]}>
              {t("profile.oldPassword", { defaultValue: "Old password" })}
            </Text>
            <TextInput
              value={oldPassword}
              onChangeText={setOldPassword}
              onBlur={() => setOldPasswordTouched(true)}
              placeholder={t("profile.enterOldPassword", {
                defaultValue: "Enter old password",
              })}
              isPassword={true}
              showFocusStates={true}
              containerStyle={styles.inputContainer}
              error={oldPasswordTouched ? oldPasswordError : ""}
              touched={oldPasswordTouched}
            />
          </View>

          {/* New Password Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, rtlStyles.label as TextStyle]}>
              {t("profile.newPassword", { defaultValue: "New password" })}
            </Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              onBlur={() => setNewPasswordTouched(true)}
              placeholder={t("profile.enterNewPassword", {
                defaultValue: "Enter new password",
              })}
              isPassword={true}
              showFocusStates={true}
              containerStyle={styles.inputContainer}
              error={newPasswordTouched ? newPasswordError : ""}
              touched={newPasswordTouched}
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, rtlStyles.label as TextStyle]}>
              {t("profile.confirmPassword", {
                defaultValue: "Confirm password",
              })}
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onBlur={() => setConfirmPasswordTouched(true)}
              placeholder={t("profile.confirmNewPassword", {
                defaultValue: "Confirm new password",
              })}
              isPassword={true}
              showFocusStates={true}
              containerStyle={styles.inputContainer}
              error={confirmPasswordTouched ? confirmPasswordError : ""}
              touched={confirmPasswordTouched}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Animated.View style={[styles.footerWrapper, { bottom: keyboardHeight }]}>
        <SingleButtonFooter
          fixed={false}
          label={t("profile.save", { defaultValue: "Save" })}
          onPress={handleSave}
          disabled={!isFormValid || isLoading}
          icon={
            isLoading ? <ActivityIndicator color={COLORS.white} /> : undefined
          }
        />
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
  footerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
