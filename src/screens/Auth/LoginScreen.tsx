import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  ViewStyle,
  Image,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useFocusEffect, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSSO, useAuth } from "@clerk/clerk-expo";
import { useAuthContext, useIsAuthenticated } from "../../context/auth-context";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Header, PrimaryButton, TextInput } from "../../components";
import { COLORS, STORAGE_KEYS } from "../../constants";
import { useLocalization, useKeyboardHeight, useTabNavigation } from "../../hooks";
import { useLoginMutation } from "@/redux/api";
import {
  getPasswordValidationError,
  getSaudiPhoneValidationError,
} from "../../utils/validation";
import {
  setLoggedInPhoneNumber,
  setLoggedInDisplayName,
  setLoggedInProfileImageUri,
} from "../../utils/loggedInPhoneStorage";
import { syncAccountProfileMetaOnAuth, touchLastActiveAt } from "../../utils/accountActivityStorage";
import type { AuthStackParamList } from "../../navigation/types";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { navigateToListings } = useTabNavigation();
  const { t, isRTL } = useLocalization();
  const { isSignedIn } = useAuth();
  const { isAuthenticated, isLoaded } = useIsAuthenticated();
  const { setHasBackendSession } = useAuthContext();
  const { startSSOFlow } = useSSO();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoadingGoogle, setIsLoadingGoogle] = useState<boolean>(false);
  const [cachedProfileImageUri, setCachedProfileImageUri] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (isLoaded && isAuthenticated) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "ProfileDetail" }],
          })
        );
      }
    }, [isLoaded, isAuthenticated, navigation])
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const uri = await AsyncStorage.getItem(STORAGE_KEYS.loggedInProfileImageUri);
          if (active) setCachedProfileImageUri(uri && uri.length > 0 ? uri : null);
        } catch {
          if (active) setCachedProfileImageUri(null);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const validatePhoneNumber = useCallback((phone: string): string => {
    const key = getSaudiPhoneValidationError(phone);
    return key ? t(key) : "";
  }, [t]);

  const validatePassword = useCallback((pwd: string): string => {
    const key = getPasswordValidationError(pwd, "generic");
    return key ? t(key) : "";
  }, [t]);

  const [phoneErrorShown, setPhoneErrorShown] = useState<boolean>(false);
  const [passwordErrorShown, setPasswordErrorShown] = useState<boolean>(false);
  const passwordErrorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { keyboardHeight } = useKeyboardHeight();

  // Validate and get translated error messages
  const phoneError = validatePhoneNumber(phoneNumber);
  const passwordError = validatePassword(password);

  // Use current validation errors (translated) when shown, otherwise empty
  // This ensures errors are always in the current language
  const displayPhoneError = phoneErrorShown ? phoneError : "";
  const displayPasswordError = passwordErrorShown ? passwordError : "";
  const isFormValid =
    phoneNumber.trim().length > 0 && password.trim().length > 0;

  // Auto-hide password error after 2 seconds
  useEffect(() => {
    if (passwordErrorShown) {
      // Clear any existing timeout
      if (passwordErrorTimeoutRef.current) {
        clearTimeout(passwordErrorTimeoutRef.current);
      }
      
      // Set new timeout to hide error after 2 seconds
      passwordErrorTimeoutRef.current = setTimeout(() => {
        setPasswordErrorShown(false);
      }, 2000);
    }

    // Cleanup timeout on unmount or when error changes
    return () => {
      if (passwordErrorTimeoutRef.current) {
        clearTimeout(passwordErrorTimeoutRef.current);
        passwordErrorTimeoutRef.current = null;
      }
    };
  }, [passwordErrorShown]);

  const handlePhoneChange = useCallback((text: string) => {
    const filteredText = text.replace(/[^0-9]/g, "");
    setPhoneNumber(filteredText);
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
  }, []);

  const handleLogin = useCallback(async () => {
    const phoneErr = validatePhoneNumber(phoneNumber);
    const pwdErr = validatePassword(password);

    if (phoneErr !== "") {
      setPhoneErrorShown(true);
    } else {
      setPhoneErrorShown(false);
    }

    if (pwdErr !== "") {
      setPasswordErrorShown(true);
    } else {
      setPasswordErrorShown(false);
    }

    if (phoneErr !== "" || pwdErr !== "") {
      return;
    }

    try {
      const result = await login({
        phoneNumber,
        password,
      }).unwrap();

      if (result.data?.token) {
        await AsyncStorage.setItem(STORAGE_KEYS.authToken, result.data.token);
        if (result.data.refreshToken) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.refreshToken,
            result.data.refreshToken
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
          setCachedProfileImageUri(u.profileImageUrl.trim());
        }
      }
      setHasBackendSession(true);

      Alert.alert(
        t("common.success"),
        result.message || (t("auth.loggedInSuccessfully") ?? "Logged in successfully"),
        [
          {
            text: "OK",
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "ProfileDetail" }],
                })
              );
            },
          },
        ]
      );
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      const errorMessage =
        err?.data?.message ??
        err?.message ??
        (t("auth.failedToLogin") ?? "Failed to login. Please try again.");
      Alert.alert(t("auth.loginError"), errorMessage);
    }
  }, [
    phoneNumber,
    password,
    navigation,
    login,
    validatePhoneNumber,
    validatePassword,
    t,
    setHasBackendSession,
  ]);

  const handleCreateAccount = useCallback(() => {
    navigation.navigate("CreateAccount");
  }, [navigation]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate("ForgotPassword");
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    navigateToListings();
  }, [navigateToListings]);

  const resetToProfile = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "ProfileDetail" }],
      })
    );
  }, [navigation]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      setIsLoadingGoogle(true);

      if (isSignedIn) {
        resetToProfile();
        return;
      }

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: Linking.createURL("/oauth-native-callback", {
          scheme: "aqarksyria",
        }),
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        resetToProfile();
      }
    } catch (err: any) {
      if (__DEV__) {
        console.warn("Google OAuth failed:", err);
      }

      if (err?.errors?.[0]?.code === "oauth_cancelled") {
        return;
      }

      const errorMessage = err?.errors?.[0]?.message || err?.message || "";
      if (
        err?.errors?.[0]?.code === "session_exists" ||
        errorMessage.includes("already signed in") ||
        errorMessage.includes("Session already exists")
      ) {
        resetToProfile();
        return;
      }

      Alert.alert(
        t("auth.loginError"),
        err?.errors?.[0]?.message || t("auth.failedToSignInWithGoogle")
      );
    } finally {
      setIsLoadingGoogle(false);
    }
  }, [startSSOFlow, resetToProfile, isSignedIn, t]);

  const handleAppleLogin = useCallback(() => {
    // Apple sign-in is not wired yet.
  }, []);

  const GoogleLogo = ({ containerStyle }: { containerStyle?: ViewStyle }) => (
    <View style={[styles.googleLogoContainer, containerStyle]}>
      <Svg width={wp(6)} height={wp(6)} viewBox="0 0 24 24">
        <Path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <Path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <Path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <Path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </Svg>
    </View>
  );

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      title: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      subtitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      dividerContainer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      socialButton: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      socialIcon: {
        marginRight: isRTL ? 0 : wp(3),
        marginLeft: isRTL ? wp(3) : 0,
      },
      googleLogoContainer: {
        marginRight: isRTL ? 0 : wp(3),
        marginLeft: isRTL ? wp(3) : 0,
      },
      socialButtonText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      createAccountContainer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      passwordInput: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      phoneInput: {
        textAlign: "left" as "left", // Always left-aligned so cursor starts from left (after prefix)
      },
      forgotPasswordContainer: {
        alignItems: (isRTL ? "flex-start" : "flex-end") as "flex-start" | "flex-end",
      },
    }),
    [isRTL]
  );

  const scrollContentStyle = useMemo(
    () => [styles.scrollContent, { paddingBottom: hp(8) + keyboardHeight }],
    [keyboardHeight]
  );

  if (isLoaded && isAuthenticated) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Header onClosePress={handleBackPress} />
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
          {cachedProfileImageUri ? (
            <View style={styles.loginAvatarWrap}>
              <Image
                source={{ uri: cachedProfileImageUri }}
                style={styles.loginAvatarImage}
                resizeMode="cover"
              />
            </View>
          ) : null}
          <Text style={[styles.title, rtlStyles.title]}>{t("auth.loginToBayt")}</Text>
          <Text style={[styles.subtitle, rtlStyles.subtitle]}>{t("auth.verifyToContinue")}</Text>
        </View>

        {/* Phone Number Input */}
        <TextInput
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          placeholder={t("auth.phoneNumber")}
          prefix="+966"
          keyboardType="phone-pad"
          showFocusStates={true}
          containerStyle={styles.inputContainerNoMargin}
          inputWrapperStyle={styles.inputWrapperNoBottomRadius}
          inputStyle={rtlStyles.phoneInput}
          error={displayPhoneError}
          touched={phoneErrorShown}
        />

        {/* Password Input */}
        <TextInput
          value={password}
          onChangeText={handlePasswordChange}
          placeholder={t("auth.password")}
          isPassword={true}
          showPasswordToggle={true}
          showFocusStates={true}
          containerStyle={styles.inputContainerNoMargin}
          hideTopBorder={true}
          error={displayPasswordError}
          touched={passwordErrorShown}
          inputStyle={rtlStyles.passwordInput}
        />

        {/* Forgot Password Link */}
        <View style={[styles.forgotPasswordContainer, rtlStyles.forgotPasswordContainer]}>
          <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>{t("auth.forgotYourPassword")}</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <PrimaryButton
          text={
            isLoggingIn
              ? (t("auth.signingIn") ?? "Logging in...")
              : t("auth.continue")
          }
          onPress={handleLogin}
          disabled={!isFormValid || isLoggingIn}
          style={styles.loginButton}
          showArrow={!isLoggingIn}
        />

        {/* Divider */}
        <View style={[styles.dividerContainer, rtlStyles.dividerContainer]}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t("auth.or")}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <TouchableOpacity
          style={[
            styles.socialButton,
            rtlStyles.socialButton,
            isLoadingGoogle && styles.socialButtonDisabled,
          ]}
          onPress={handleGoogleLogin}
          activeOpacity={0.7}
          disabled={isLoadingGoogle}
        >
          <GoogleLogo containerStyle={rtlStyles.googleLogoContainer} />
          <Text style={[styles.socialButtonText, rtlStyles.socialButtonText]}>
            {isLoadingGoogle ? t("auth.signingIn") : t("auth.continueWithGoogle")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, rtlStyles.socialButton]}
          onPress={handleAppleLogin}
          activeOpacity={0.7}
        >
          <Ionicons
            name="logo-apple"
            size={wp(6)}
            color="#000"
            style={[styles.socialIcon, rtlStyles.socialIcon]}
          />
          <Text style={[styles.socialButtonText, rtlStyles.socialButtonText]}>
            {t("auth.continueWithApple")}
          </Text>
        </TouchableOpacity>

        {/* Create Account Link */}
        <View style={[styles.createAccountContainer, rtlStyles.createAccountContainer]}>
          <Text style={styles.createAccountText}>{t("auth.dontHaveAccount")} </Text>
          <TouchableOpacity onPress={handleCreateAccount} activeOpacity={0.7}>
            <Text style={styles.createAccountLink}>{t("auth.createAccount")}</Text>
          </TouchableOpacity>
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
    paddingTop: Platform.OS === "ios" ? hp(3) : hp(2),
  },
  header: {
    marginBottom: hp(5),
  },
  loginAvatarWrap: {
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
    marginBottom: hp(2),
    alignSelf: "center",
  },
  loginAvatarImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: wp(6.5),
    fontWeight: "bold",
    color: "#111827",
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: wp(4),
    color: "#6b7280",
    marginTop: hp(0.5),
  },
  inputContainer: {
    marginBottom: hp(2.5),
  },
  inputContainerNoMargin: {
    marginBottom: 0,
  },
  inputWrapperNoBottomRadius: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  forgotPasswordContainer: {
    marginTop: hp(1.5),
    marginBottom: hp(1),
  },
  forgotPasswordText: {
    fontSize: wp(3.8),
    color: COLORS.primary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  loginButton: {
    marginTop: hp(3),
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp(4),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    fontSize: wp(3.5),
    color: "#9ca3af",
    marginHorizontal: wp(3),
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(3),
    paddingVertical: hp(1.8),
    marginBottom: hp(1.5),
  },
  socialIcon: {
    marginRight: wp(3),
  },
  googleLogoContainer: {
    marginRight: wp(3),
    justifyContent: "center",
    alignItems: "center",
  },
  socialButtonText: {
    fontSize: wp(4.5),
    color: "#111827",
    fontWeight: "500",
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  createAccountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(3),
  },
  createAccountText: {
    fontSize: wp(3.8),
    color: "#6b7280",
  },
  createAccountLink: {
    fontSize: wp(3.8),
    color: "#111827",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
