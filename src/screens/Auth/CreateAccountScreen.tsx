import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BackButton, PrimaryButton, TextInput } from "../../components";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";
import { useSignupMutation } from "@/redux/api";
import { getSaudiPhoneValidationError } from "../../utils/validation";

type NavigationProp = NativeStackNavigationProp<any>;

export default function CreateAccountScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const [signup, { isLoading }] = useSignupMutation();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
  const [phoneErrorShown, setPhoneErrorShown] = useState<boolean>(false);

  // Check for pending image picker results (in case app restarted during cropping)
  useEffect(() => {
    const checkPendingResult = async () => {
      try {
        const result = await ImagePicker.getPendingResultAsync();
        if (result && "assets" in result && result.assets && result.assets[0]) {
          setProfileImage(result.assets[0].uri);
        }
      } catch (error) {
        // Silently fail if no pending result
        console.log("No pending image picker result");
      }
    };
    checkPendingResult();
  }, []);

  // Validation functions (Saudi Arabia: 9 digits, must start with 5)
  const validatePhoneNumber = useCallback((phone: string): string => {
    const key = getSaudiPhoneValidationError(phone);
    return key ? t(key) : "";
  }, [t]);

  const validatePassword = (pwd: string): string => {
    if (pwd.trim().length === 0) {
      return t("auth.passwordRequired");
    }
    if (pwd.length < 8) {
      return t("auth.passwordMinLength");
    }
    if (!/[A-Z]/.test(pwd)) {
      return t("auth.passwordUppercase");
    }
    if (!/[a-z]/.test(pwd)) {
      return t("auth.passwordLowercase");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      return t("auth.passwordSpecialChar");
    }
    return "";
  };

  const phoneError = validatePhoneNumber(phoneNumber);
  const passwordError = validatePassword(password);

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    password.trim().length > 0 &&
    phoneError === "" &&
    passwordError === "";

  const handlePhoneChange = useCallback((text: string) => {
    // Filter to only allow numbers
    const filteredText = text.replace(/[^0-9]/g, "");
    setPhoneNumber(filteredText);
    setPhoneErrorShown(false);
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setPasswordTouched(true);
  }, []);

  const handleAgreeAndContinue = useCallback(async () => {
    if (!isFormValid) {
      if (phoneError !== "") {
        setPhoneErrorShown(true);
      }
      if (passwordError !== "") {
        setPasswordTouched(true);
      }
      return;
    }

    try {
      const result = await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber,
        password,
        profileImage: profileImage || undefined,
      }).unwrap();

      if (result.data?.token) {
        await AsyncStorage.setItem("auth_token", result.data.token);
        if (result.data.refreshToken) {
          await AsyncStorage.setItem(
            "refresh_token",
            result.data.refreshToken
          );
        }
      }

      const otp =
        result.data?.otp ||
        result.data?.verificationCode ||
        result.otp ||
        result.verificationCode;

      const alertMessage = otp
        ? `${result.message || (t("auth.accountCreatedSuccessfully") ?? "Account created successfully")}\n\n${t("auth.yourOTP") ?? "Your OTP"}: ${otp}`
        : result.message || (t("auth.accountCreatedSuccessfully") ?? "Account created successfully");

      Alert.alert(t("common.success"), alertMessage, [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("VerifyPhoneNumber", {
              phoneNumber,
              otp,
            });
          },
        },
      ]);
    } catch (error: unknown) {
      const err = error as {
        data?: { message?: string };
        message?: string;
      };
      const errorMessage =
        err?.data?.message ??
        err?.message ??
        (t("auth.failedToCreateAccount") ?? "Failed to create account. Please try again.");
      Alert.alert(t("common.error"), errorMessage);
    }
  }, [
    isFormValid,
    firstName,
    lastName,
    phoneNumber,
    password,
    profileImage,
    phoneError,
    passwordError,
    signup,
    navigation,
    t,
  ]);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Listings");
    }
  }, [navigation]);

  const handleTermsPress = useCallback(() => {
    console.log("Terms and Conditions pressed");
    // TODO: Navigate to Terms screen
  }, []);

  const handlePrivacyPress = useCallback(() => {
    console.log("Privacy Policy pressed");
    // TODO: Navigate to Privacy screen
  }, []);

  const handleImagePicker = useCallback(async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("auth.permissionRequired"),
          t("auth.photoAccessRequired")
        );
        return;
      }

      // Launch image picker with safer options
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7, // Reduced quality to prevent memory issues
        exif: false, // Disable EXIF to reduce memory usage
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(t("common.error"), t("auth.failedToPickImage"));
    }
  }, [t]);

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      title: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      label: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      firstNameInput: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      lastNameInput: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      phoneInput: {
        textAlign: "left" as "left", // Always left-aligned so cursor starts from left (after prefix)
      },
      passwordInput: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      legalContainer: {
        alignItems: (isRTL ? "flex-end" : "center") as "center" | "flex-end",
      },
      legalText: {
        textAlign: (isRTL ? "right" : "center") as "center" | "right",
      },
      linksInline: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        justifyContent: (isRTL ? "flex-end" : "center") as "center" | "flex-end",
      },
      editIconContainer: {
        right: isRTL ? undefined : 0,
        left: isRTL ? 0 : undefined,
      },
      backButtonContainer: {
        alignItems: (isRTL ? "flex-end" : "flex-start") as "flex-start" | "flex-end",
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
          <Text style={[styles.title, rtlStyles.title]}>{t("auth.finishingSignUp")}</Text>
        </View>

        {/* Profile Picture Section */}
        <View style={styles.section}>
          <View style={styles.imagePickerContainer}>
            <TouchableOpacity
              onPress={handleImagePicker}
              style={styles.imagePickerButton}
              activeOpacity={0.8}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons
                    name="camera-outline"
                    size={wp(8)}
                    color={COLORS.textSecondary}
                  />
                </View>
              )}
              <View style={[styles.editIconContainer, rtlStyles.editIconContainer]}>
                <Ionicons
                  name={profileImage ? "pencil" : "camera"}
                  size={wp(4)}
                  color={COLORS.white}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Full Name Section */}
        <View style={styles.nameSection}>
          <Text style={[styles.label, rtlStyles.label]}>{t("auth.fullName")}</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t("auth.firstName")}
            showFocusStates={true}
            containerStyle={styles.nameInputContainer}
            inputWrapperStyle={styles.inputWrapperNoBottomRadius}
            inputStyle={rtlStyles.firstNameInput}
          />
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder={t("auth.lastName")}
            showFocusStates={true}
            hideTopBorder={true}
            inputStyle={rtlStyles.lastNameInput}
          />
        </View>

        {/* Phone Number Section */}
        <View style={styles.section}>
          <Text style={[styles.label, rtlStyles.label]}>{t("auth.phoneNumber")}</Text>
          <TextInput
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            placeholder={t("auth.phoneNumber")}
            prefix="+966"
            keyboardType="phone-pad"
            showFocusStates={true}
            inputStyle={rtlStyles.phoneInput}
            error={phoneErrorShown ? phoneError : ""}
            touched={phoneErrorShown}
          />
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <Text style={[styles.label, rtlStyles.label]}>{t("auth.password")}</Text>
          <TextInput
            value={password}
            onChangeText={handlePasswordChange}
            onBlur={() => setPasswordTouched(true)}
            placeholder={t("auth.password")}
            isPassword={true}
            showPasswordToggle={true}
            showFocusStates={true}
            inputStyle={rtlStyles.passwordInput}
            error={passwordTouched ? passwordError : ""}
            touched={passwordTouched}
          />
        </View>

        {/* Legal Text */}
        <View style={[styles.legalContainer, rtlStyles.legalContainer]}>
          <Text style={[styles.legalText, rtlStyles.legalText]}>
            {t("auth.agreeToTerms")}{" "}
          </Text>
          <View style={[styles.linksInline, rtlStyles.linksInline]}>
            <TouchableOpacity onPress={handleTermsPress} activeOpacity={0.7}>
              <Text style={styles.legalLink}>{t("auth.termsAndConditions")}</Text>
            </TouchableOpacity>
            <Text style={[styles.legalText, rtlStyles.legalText]}> {t("auth.and")} </Text>
            <TouchableOpacity onPress={handlePrivacyPress} activeOpacity={0.7}>
              <Text style={styles.legalLink}>{t("auth.privacyPolicy")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Agree & Continue Button */}
        <PrimaryButton
          text={
            isLoading
              ? (t("auth.creatingAccount") ?? "Creating account...")
              : t("auth.agreeAndContinue")
          }
          onPress={handleAgreeAndContinue}
          disabled={!isFormValid || isLoading}
          style={styles.continueButton}
          showArrow={!isLoading}
        />
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
  section: {
    // marginBottom: hp(1),
  },
  nameSection: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#111827",
    marginBottom: hp(1.5),
  },
  nameInputContainer: {
    marginBottom: 0,
  },
  inputWrapperNoBottomRadius: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  legalContainer: {
    marginTop: hp(1),
    marginBottom: hp(2),
    alignItems: "center",
  },
  legalText: {
    fontSize: wp(3.2),
    color: "#6b7280",
    lineHeight: hp(2),
  },
  linksInline: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  legalLink: {
    fontSize: wp(3.2),
    color: COLORS.primary,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  continueButton: {
    // marginTop: hp(3),
  },
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: hp(2),
  },
  imagePickerButton: {
    position: "relative",
  },
  profileImage: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: COLORS.borderLight,
  },
  placeholderContainer: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
});
