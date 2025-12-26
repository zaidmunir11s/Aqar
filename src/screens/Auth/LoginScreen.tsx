import React, { useState, useCallback } from "react";
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
import {
  BackButton,
  PrimaryButton,
  PhoneInput,
  PasswordInput,
} from "../../components";

type NavigationProp = NativeStackNavigationProp<any>;

export default function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = useCallback(() => {
    console.log("Login with:", phoneNumber, password);
    navigation.navigate("ProfileDetail");
  }, [navigation, phoneNumber, password]);

  const handleCreateAccount = useCallback(() => {
    navigation.navigate("CreateAccount");
  }, [navigation]);

  const handleForgotPassword = useCallback(() => {
    // TODO: Navigate to forgot password screen
    console.log("Forgot password");
  }, []);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BackButton onPress={handleBackPress} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>
            Enter the mobile number of your account
          </Text>
        </View>

        {/* Phone Number Input */}
        <PhoneInput value={phoneNumber} onChangeText={setPhoneNumber} />

        {/* Password Input */}
        <PasswordInput
          value={password}
          onChangeText={setPassword}
          showForgotPassword={true}
          onForgotPassword={handleForgotPassword}
        />

        {/* Login Button */}
        <PrimaryButton
          text="Login"
          onPress={handleLogin}
          style={styles.loginButton}
        />

        {/* Divider */}
        <Text style={styles.dividerText}>Or create a new account</Text>

        {/* Create Account Button */}
        <PrimaryButton
          text="Create Account"
          onPress={handleCreateAccount}
          style={styles.createAccountButton}
          textStyle={styles.createAccountButtonText}
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
    paddingHorizontal: wp(6),
    paddingTop: Platform.OS === "ios" ? hp(7) : hp(5),
    paddingBottom: hp(3),
  },
  header: {
    marginBottom: hp(4),
    marginTop: hp(4),
  },
  title: {
    fontSize: wp(10),
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: hp(1.5),
  },
  subtitle: {
    fontSize: wp(4),
    color: "#6b7280",
    lineHeight: hp(3),
  },
  loginButton: {
    marginTop: hp(2),
  },
  dividerText: {
    fontSize: wp(4),
    color: "#6b7280",
    textAlign: "center",
    marginVertical: hp(3),
  },
  createAccountButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#3b82f6",
    ...Platform.select({
      ios: {
        shadowColor: "#3b82f6",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  createAccountButtonText: {
    color: "#3b82f6",
  },
});
