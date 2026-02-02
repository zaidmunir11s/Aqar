import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BackButton, PrimaryButton, TextInput } from "../../components";
import { COLORS } from "../../constants";
import { Entypo } from "@expo/vector-icons";
import { useLocalization } from "../../hooks/useLocalization";
import { getSaudiPhoneValidationError } from "../../utils/validation";

type NavigationProp = NativeStackNavigationProp<any>;

export default function ForgotPasswordScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneErrorShown, setPhoneErrorShown] = useState<boolean>(false);

  const phoneErrorKey = getSaudiPhoneValidationError(phoneNumber);
  const phoneError = phoneErrorKey ? t(phoneErrorKey) : "";
  const isFormValid =
    phoneNumber.trim().length > 0 && phoneErrorKey === "";

  const handlePhoneChange = useCallback((text: string) => {
    setPhoneNumber(text.replace(/[^0-9]/g, ""));
    setPhoneErrorShown(false);
  }, []);

  const handleContinue = useCallback(() => {
    if (phoneErrorKey) {
      setPhoneErrorShown(true);
      return;
    }
    if (!isFormValid) return;
    console.log("Continue with phone number:", phoneNumber);
    // TODO: Navigate to verification code screen or handle password reset
  }, [isFormValid, phoneNumber, phoneErrorKey]);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Listings");
    }
  }, [navigation]);

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      backButtonContainer: {
        alignItems: (isRTL ? "flex-end" : "flex-start") as "flex-start" | "flex-end",
      },
      title: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      subtitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      phoneInput: {
        textAlign: "left" as "left", // Always left-aligned so cursor starts from left (after prefix)
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
      >
        <View style={rtlStyles.backButtonContainer}>
          <BackButton onPress={handleBackPress} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, rtlStyles.title]}>{t("auth.forgotPassword")}</Text>
          <Text style={[styles.subtitle, rtlStyles.subtitle]}>
            {t("auth.enterMobileNumber")}
          </Text>
        </View>

        {/* Phone Number Input */}
        <TextInput
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          label={t("auth.phoneNumber")}
          error={phoneErrorShown ? phoneError : ""}
          touched={phoneErrorShown}
          labelIcon={{
            name: "mobile",
            library: "Entypo",
            color: COLORS.numberLabel,
          }}
          prefix="+966"
          placeholder=""
          keyboardType="phone-pad"
          showFocusStates={true}
          inputStyle={rtlStyles.phoneInput}
        />

        {/* Continue Button */}
        <PrimaryButton
          text={t("auth.continue")}
          onPress={handleContinue}
          disabled={!isFormValid}
          style={styles.continueButton}
          showArrow={true}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(4),
    paddingBottom: hp(3),
  },
  header: {
    marginBottom: hp(4),
    marginTop: hp(4),
  },
  title: {
    fontSize: wp(7.5),
    fontWeight: "bold",
    marginBottom: hp(1.5),
  },
  subtitle: {
    fontSize: wp(4),
    color: "#666",
    lineHeight: hp(3),
  },
  continueButton: {
    marginTop: hp(2),
  },
});

