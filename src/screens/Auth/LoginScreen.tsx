import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { PrimaryButton, TextInput } from "../../components";
import { COLORS } from "../../constants";

type NavigationProp = NativeStackNavigationProp<any>;

export default function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const isFormValid =
    phoneNumber.trim().length > 0 && password.trim().length > 0;

  const handleLogin = useCallback(() => {
    if (!isFormValid) return;
    console.log("Login with:", phoneNumber, password);
    navigation.navigate("ProfileDetail");
  }, [isFormValid, phoneNumber, password, navigation]);

  const handleCreateAccount = useCallback(() => {
    navigation.navigate("CreateAccount");
  }, [navigation]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate("ForgotPassword");
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Navigate to Listings tab when there's no back history
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate("Listings");
      } else {
        navigation.navigate("Listings");
      }
    }
  }, [navigation]);

  const handleGoogleLogin = useCallback(() => {
    console.log("Continue with Google");
    // TODO: Implement Google login
  }, []);

  const handleAppleLogin = useCallback(() => {
    console.log("Continue with Apple");
    // TODO: Implement Apple login
  }, []);

  const GoogleLogo = () => (
    <View style={styles.googleLogoContainer}>
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Close Button */}
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={wp(6)} color="#000" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Log in to AQAR</Text>
          <Text style={styles.subtitle}>Verify to continue</Text>
        </View>

        {/* Phone Number Input */}
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Phone number"
          prefix="+966"
          keyboardType="phone-pad"
          showFocusStates={true}
          containerStyle={styles.inputContainerNoMargin}
          inputWrapperStyle={styles.inputWrapperNoBottomRadius}
        />

        {/* Password Input */}
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          isPassword={true}
          showPasswordToggle={true}
          showFocusStates={true}
          containerStyle={styles.inputContainerNoMargin}
          hideTopBorder={true}
          rightAction={{
            type: "text",
            content: "Forgot your password?",
            onPress: handleForgotPassword,
          }}
        />

        {/* Login Button */}
        <PrimaryButton
          text="Continue"
          onPress={handleLogin}
          disabled={!isFormValid}
          style={styles.loginButton}
          showArrow={true}
        />

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleLogin}
          activeOpacity={0.7}
        >
          <GoogleLogo />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleAppleLogin}
          activeOpacity={0.7}
        >
          <Ionicons
            name="logo-apple"
            size={wp(6)}
            color="#000"
            style={styles.socialIcon}
          />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        {/* Create Account Link */}
        <View style={styles.createAccountContainer}>
          <Text style={styles.createAccountText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleCreateAccount} activeOpacity={0.7}>
            <Text style={styles.createAccountLink}>Create Account</Text>
          </TouchableOpacity>
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
    paddingTop: Platform.OS === "ios" ? hp(3) : hp(2),
    paddingBottom: hp(3),
  },
  closeButton: {
    width: wp(10),
    height: wp(10),
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: hp(2),
  },
  header: {
    marginBottom: hp(5),
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
  loginButton: {
    marginTop: hp(1),
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
