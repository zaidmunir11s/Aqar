import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  useNavigation,
  useRoute,
  CommonActions,
  useFocusEffect,
} from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OtpInput, type OtpInputRef } from "react-native-otp-entry";
import { secureSet } from "@/utils/secureStore";
import {
  Header,
  PrimaryButton,
  TextInput as CustomTextInput,
} from "../../components";
import { COLORS, STORAGE_KEYS } from "../../constants";
import {
  setLoggedInPhoneNumber,
  setLoggedInDisplayName,
  setLoggedInProfileImageUri,
} from "../../utils/loggedInPhoneStorage";
import {
  syncAccountProfileMetaOnAuth,
  touchLastActiveAt,
} from "../../utils/accountActivityStorage";
import { useLocalization, useKeyboardHeight } from "../../hooks";
import { useAuthContext } from "../../context/auth-context";
import { useVerifyOtpMutation } from "@/redux/api";
import type { AuthStackParamList } from "../../navigation/types";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type VerifyPhoneRouteProp = RouteProp<AuthStackParamList, "VerifyPhoneNumber">;

export default function VerifyPhoneNumberScreen(): React.JSX.Element {
  const route = useRoute<VerifyPhoneRouteProp>();
  const params = route.params;
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const { setHasBackendSession } = useAuthContext();
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const { phoneNumber: initialPhoneNumber, otp: initialOtp } = params || {};

  const [phoneNumber, setPhoneNumber] = useState<string>(
    initialPhoneNumber || "",
  );
  const [otp, setOtp] = useState<string>(initialOtp || "");
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const otpInputRef = useRef<OtpInputRef>(null);
  const { keyboardHeight } = useKeyboardHeight();

  // Focus OTP when ready. Pre-fill only in __DEV__ when a dev OTP was passed (never in production).
  useEffect(() => {
    const timer = setTimeout(() => {
      if (__DEV__ && initialOtp && initialOtp.length <= 6) {
        otpInputRef.current?.setValue?.(initialOtp);
        setOtp(initialOtp);
      }
      otpInputRef.current?.focus?.();
    }, 150);
    return () => clearTimeout(timer);
  }, [initialOtp]);

  // Keep profile phone in sync as soon as user reaches verify (post-signup session + after verify success).
  useFocusEffect(
    useCallback(() => {
      const digits = phoneNumber.replace(/\D/g, "");
      if (digits.length > 0) {
        void setLoggedInPhoneNumber(phoneNumber);
      }
    }, [phoneNumber]),
  );

  // Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft]);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handlePhoneChange = useCallback((text: string) => {
    // Filter to only allow numbers
    const filteredText = text.replace(/[^0-9]/g, "");
    setPhoneNumber(filteredText);
  }, []);

  const handleOtpChange = useCallback((text: string) => {
    setOtp(text);
  }, []);

  const handleResendCode = useCallback(() => {
    setTimeLeft(120);
    setIsTimerActive(true);
    setOtp("");
    otpInputRef.current?.clear?.();
    otpInputRef.current?.focus?.();
    // TODO: Call backend resend-OTP endpoint when available.
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const isOtpComplete = otp.length === 6;

  const performVerify = useCallback(
    async (otpValue: string) => {
      if (isLoading) return;
      const trimmedOtp = otpValue.trim();
      if (!phoneNumber || trimmedOtp.length !== 6) return;
      try {
        const result = await verifyOtp({
          phoneNumber,
          otp: trimmedOtp,
        }).unwrap();
        if (result.data?.token) {
          await secureSet(STORAGE_KEYS.authToken, result.data.token);
          if (result.data.refreshToken) {
            await secureSet(
              STORAGE_KEYS.refreshToken,
              result.data.refreshToken,
            );
          }
          await setLoggedInPhoneNumber(phoneNumber);
          await syncAccountProfileMetaOnAuth(phoneNumber);
          await touchLastActiveAt();
          const u = result.data?.user;
          const resolvedName =
            u?.name?.trim() ||
            [u?.firstName, u?.lastName]
              .filter(Boolean)
              .map((s) => String(s).trim())
              .join(" ")
              .trim();
          if (resolvedName) {
            await setLoggedInDisplayName(resolvedName);
          }
          if (u?.profileImageUrl?.trim()) {
            await setLoggedInProfileImageUri(u.profileImageUrl.trim());
          }
        }
        setHasBackendSession(true);
        Alert.alert(
          t("common.success"),
          result.message ||
            (t("auth.verifiedSuccessfully") ?? "Phone verified successfully"),
          [
            {
              text: "OK",
              onPress: () => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "ProfileDetail" }],
                  }),
                );
              },
            },
          ],
        );
      } catch (error: unknown) {
        const err = error as {
          data?: { message?: string };
          message?: string;
        };
        const errorMessage =
          err?.data?.message ??
          err?.message ??
          t("auth.failedToVerify") ??
          "Failed to verify. Please try again.";
        Alert.alert(t("common.error"), errorMessage);
      }
    },
    [phoneNumber, verifyOtp, navigation, t, isLoading, setHasBackendSession],
  );

  const handleVerify = useCallback(async () => {
    if (!isOtpComplete) return;
    await performVerify(otp);
  }, [isOtpComplete, otp, performVerify]);

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      title: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      descriptionText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      label: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      phoneInput: {
        textAlign: "left" as "left", // Always left-aligned so cursor starts from left (after prefix)
      },
      timerContainer: {
        alignItems: (isRTL ? "flex-end" : "center") as "center" | "flex-end",
      },
      timerText: {
        textAlign: (isRTL ? "right" : "center") as "center" | "right",
      },
      resendText: {
        textAlign: (isRTL ? "right" : "center") as "center" | "right",
      },
    }),
    [isRTL],
  );

  const scrollContentStyle = useMemo(
    () => [styles.scrollContent, { paddingBottom: hp(3) + keyboardHeight }],
    [keyboardHeight],
  );

  return (
    <View style={styles.container}>
      <Header onBackPress={handleBackPress} />
      <ScrollView
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        scrollEnabled={true}
        nestedScrollEnabled={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, rtlStyles.title]}>
            {t("auth.verifyPhoneNumber")}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={[styles.descriptionText, rtlStyles.descriptionText]}>
            {t("auth.enterMobileNumber")}
          </Text>
        </View>

        {/* Phone Number Input */}
        <View style={styles.phoneSection} pointerEvents="none">
          <Text style={[styles.label, rtlStyles.label]}>
            {t("auth.phoneNumber")}
          </Text>
          <CustomTextInput
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            placeholder={t("auth.phoneNumber")}
            prefix="+966"
            keyboardType="phone-pad"
            showFocusStates={true}
            editable={false}
            inputStyle={rtlStyles.phoneInput}
          />
        </View>

        {/* Verification Code Section */}
        <View style={styles.otpSection}>
          <Text style={[styles.label, rtlStyles.label]}>
            {t("auth.verificationCode")}
          </Text>
          <OtpInput
            ref={otpInputRef}
            numberOfDigits={6}
            autoFocus={true}
            onTextChange={handleOtpChange}
            focusColor={COLORS.primary}
            type="numeric"
            theme={{
              containerStyle: styles.otpContainer,
              pinCodeContainerStyle: styles.otpInput,
              pinCodeTextStyle: styles.otpInputText,
              focusedPinCodeContainerStyle: styles.otpInputFocused,
            }}
          />
        </View>

        {/* Verify Button */}
        <PrimaryButton
          text={
            isLoading
              ? (t("auth.verifying") ?? "Verifying...")
              : (t("auth.verify") ?? "Verify")
          }
          onPress={handleVerify}
          disabled={!isOtpComplete || isLoading}
          style={styles.verifyButton}
          showArrow={!isLoading}
        />

        {/* Timer */}
        <View style={[styles.timerContainer, rtlStyles.timerContainer]}>
          {isTimerActive ? (
            <Text style={[styles.timerText, rtlStyles.timerText]}>
              {t("auth.resendCodeIn")} {formatTime(timeLeft)}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendCode} activeOpacity={0.7}>
              <Text style={[styles.resendText, rtlStyles.resendText]}>
                {t("auth.resendCode")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(6),
    paddingTop: Platform.OS === "ios" ? hp(2) : hp(1),
  },
  header: {
    marginBottom: hp(4),
    marginTop: hp(2),
  },
  title: {
    fontSize: wp(6.5),
    fontWeight: "bold",
    color: "#111827",
  },
  descriptionContainer: {
    paddingBottom: hp(3),
  },
  descriptionText: {
    fontSize: wp(3.8),
    color: COLORS.textSecondary,
    lineHeight: hp(2.5),
  },
  phoneSection: {
    paddingBottom: hp(4),
  },
  label: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#111827",
    marginBottom: hp(1.5),
  },
  otpSection: {
    paddingBottom: hp(3),
  },
  verifyButton: {
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  otpContainer: {
    gap: wp(2),
  },
  otpInput: {
    width: wp(12),
    height: wp(12),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    backgroundColor: COLORS.background,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  otpInputText: {
    fontSize: wp(5),
    fontWeight: "600",
    color: "#111827",
  },
  otpInputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  timerContainer: {
    alignItems: "center",
  },
  timerText: {
    fontSize: wp(3.8),
    color: COLORS.textSecondary,
  },
  resendText: {
    fontSize: wp(3.8),
    color: COLORS.primary,
    fontWeight: "600",
  },
});
