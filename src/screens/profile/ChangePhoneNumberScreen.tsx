import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
import { useConfirmPhoneChangeMutation, useGetMeQuery, useRequestPhoneChangeOtpMutation } from "@/redux/api/userApi";
import { getSaudiPhoneValidationError } from "@/utils/validation";
import { setLoggedInPhoneNumber } from "@/utils/loggedInPhoneStorage";

type NavigationProp = NativeStackNavigationProp<any>;

export default function ChangePhoneNumberScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const { data: meData } = useGetMeQuery();
  const [requestOtp, { isLoading: isRequesting }] = useRequestPhoneChangeOtpMutation();
  const [confirmChange, { isLoading: isConfirming }] = useConfirmPhoneChangeMutation();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [phoneTouched, setPhoneTouched] = useState<boolean>(false);
  const [otpTouched, setOtpTouched] = useState<boolean>(false);
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  const rtlStyles = useMemo(
    () => ({
      label: { textAlign: isRTL ? "right" : "left" },
    }),
    [isRTL]
  );

  // Match Auth behavior: Saudi national 9 digits starting with 5, with +966 shown as prefix.
  const phoneErrorKey = getSaudiPhoneValidationError(phoneNumber);
  const phoneError = phoneErrorKey ? t(phoneErrorKey) : "";
  const validateOtp = (v: string): string => {
    const digits = v.replace(/\D/g, "");
    if (!isOtpSent) return "";
    if (digits.length !== 6) return t("auth.otpMustBe6Digits", { defaultValue: "OTP must be 6 digits" });
    return "";
  };
  const otpError = validateOtp(otpCode);
  
  // Check if phone number is valid
  const isFormValid =
    phoneError === "" &&
    phoneNumber.trim().length > 0 &&
    (!isOtpSent || (otpError === "" && otpCode.trim().length > 0));

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

  const handlePhoneChange = useCallback((text: string) => {
    // Filter to only allow numbers
    const filteredText = text.replace(/[^0-9]/g, "");
    setPhoneNumber(filteredText);
  }, []);

  const handleContinue = useCallback(async () => {
    setPhoneTouched(true);

    if (!meData?.user?.hasPassword && meData?.user?.isSso && !meData?.user?.hasPhoneNumber) {
      // Still allow adding phone for SSO accounts, just proceed.
    }

    if (phoneError !== "") return;

    if (!isOtpSent) {
      try {
        const resp = await requestOtp({ phoneNumber }).unwrap();
        setIsOtpSent(true);
        if (__DEV__ && resp?.otp) {
          Alert.alert("DEV OTP", String(resp.otp));
        } else {
          Alert.alert(
            t("auth.otpSent", { defaultValue: "OTP sent" }),
            t("auth.checkMessages", { defaultValue: "Please check your messages for the code." })
          );
        }
      } catch (e: any) {
        const msg =
          e?.data?.message ||
          e?.data?.error ||
          e?.error ||
          e?.message ||
          t("profile.phoneOtpRequestFailed", { defaultValue: "Failed to request OTP." });
        Alert.alert(
          t("common.error", { defaultValue: "Error" }),
          msg
        );
      }
      return;
    }

    setOtpTouched(true);
    const oe = validateOtp(otpCode);
    if (oe) return;

    try {
      await confirmChange({
        phoneNumber,
        code: otpCode.replace(/\D/g, ""),
      }).unwrap();
      await setLoggedInPhoneNumber(phoneNumber);
      Alert.alert(
        t("common.success", { defaultValue: "Success" }),
        t("profile.phoneUpdated", { defaultValue: "Phone number updated" })
      );
      navigation.goBack();
    } catch (e: any) {
      const msg =
        e?.data?.message ||
        e?.data?.error ||
        e?.error ||
        e?.message ||
        t("profile.phoneUpdateFailed", { defaultValue: "Failed to update phone number." });
      Alert.alert(
        t("common.error", { defaultValue: "Error" }),
        msg
      );
    }
  }, [phoneNumber, otpCode, isOtpSent, requestOtp, confirmChange, navigation, t, meData, phoneError]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("profile.changePhoneNumber", { defaultValue: "Change Phone Number" })}
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
          {/* Phone Number Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, rtlStyles.label as TextStyle]}>{t("profile.newPhoneNumber", { defaultValue: "New phone number" })}</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              onBlur={() => setPhoneTouched(true)}
              keyboardType="phone-pad"
              prefix="+966"
              showFocusStates={true}
              containerStyle={styles.inputContainer}
              error={phoneTouched ? phoneError : ""}
              touched={phoneTouched}
            />
          </View>

          {isOtpSent ? (
            <View style={styles.inputSection}>
              <Text style={[styles.label, rtlStyles.label as TextStyle]}>
                {t("auth.otpCode", { defaultValue: "OTP code" })}
              </Text>
              <TextInput
                value={otpCode}
                onChangeText={(v) => setOtpCode(v.replace(/[^0-9]/g, ""))}
                onBlur={() => setOtpTouched(true)}
                keyboardType="number-pad"
                showFocusStates={true}
                containerStyle={styles.inputContainer}
                error={otpTouched ? otpError : ""}
                touched={otpTouched}
              />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Animated.View style={[styles.footerWrapper, { bottom: keyboardHeight }]}>
        <SingleButtonFooter
          fixed={false}
          label={t("auth.continue", { defaultValue: "Continue" })}
          onPress={handleContinue}
          disabled={!isFormValid || isRequesting || isConfirming}
          icon={
            isRequesting || isConfirming ? (
              <ActivityIndicator color={COLORS.white} />
            ) : undefined
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

