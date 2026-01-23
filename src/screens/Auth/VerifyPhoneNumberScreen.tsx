import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OtpInput } from "react-native-otp-entry";
import { BackButton, TextInput as CustomTextInput } from "../../components";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  phoneNumber: string;
}

export default function VerifyPhoneNumberScreen(): React.JSX.Element {
  const route = useRoute();
  const params = route.params as RouteParams;
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const { phoneNumber: initialPhoneNumber } = params || {};

  const [phoneNumber, setPhoneNumber] = useState<string>(initialPhoneNumber || "");
  const [otp, setOtp] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);

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
    // TODO: Resend OTP code
    console.log("Resend OTP code");
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const isOtpComplete = otp.length === 6;

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      backButtonContainer: {
        alignItems: (isRTL ? "flex-end" : "flex-start") as "flex-start" | "flex-end",
      },
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
    [isRTL]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={rtlStyles.backButtonContainer}>
          <BackButton onPress={handleBackPress} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, rtlStyles.title]}>{t("auth.verifyPhoneNumber")}</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={[styles.descriptionText, rtlStyles.descriptionText]}>
            {t("auth.enterMobileNumber")}
          </Text>
        </View>

        {/* Phone Number Input */}
        <View style={styles.phoneSection} pointerEvents="none">
          <Text style={[styles.label, rtlStyles.label]}>{t("auth.phoneNumber")}</Text>
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
          <Text style={[styles.label, rtlStyles.label]}>{t("auth.verificationCode")}</Text>
          <OtpInput
            numberOfDigits={6}
            onTextChange={handleOtpChange}
            focusColor={COLORS.primary}
            theme={{
              containerStyle: styles.otpContainer,
              pinCodeContainerStyle: styles.otpInput,
              pinCodeTextStyle: styles.otpInputText,
              focusedPinCodeContainerStyle: styles.otpInputFocused,
            }}
          />
        </View>

        {/* Timer */}
        <View style={[styles.timerContainer, rtlStyles.timerContainer]}>
          {isTimerActive ? (
            <Text style={[styles.timerText, rtlStyles.timerText]}>
              {t("auth.resendCodeIn")} {formatTime(timeLeft)}
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleResendCode}
              activeOpacity={0.7}
            >
              <Text style={[styles.resendText, rtlStyles.resendText]}>{t("auth.resendCode")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: hp(3),
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

