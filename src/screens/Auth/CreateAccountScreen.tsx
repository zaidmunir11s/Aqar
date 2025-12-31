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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BackButton, PrimaryButton, TextInput } from "../../components";
import { COLORS } from "../../constants";

type NavigationProp = NativeStackNavigationProp<any>;

export default function CreateAccountScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0;

  const handleAgreeAndContinue = useCallback(() => {
    if (!isFormValid) return;
    console.log("Agree & Continue:", {
      firstName,
      lastName,
      email,
      password,
    });
    // TODO: Navigate to next screen
  }, [isFormValid, firstName, lastName, email, password]);

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
          <Text style={styles.title}>Finishing sign up</Text>
        </View>

        {/* Full Name Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            showFocusStates={true}
            containerStyle={styles.nameInputContainer}
            inputWrapperStyle={styles.inputWrapperNoBottomRadius}
          />
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            showFocusStates={true}
            hideTopBorder={true}
          />
        </View>

        {/* Email Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            showFocusStates={true}
          />
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            isPassword={true}
            showPasswordToggle={true}
            showFocusStates={true}
          />
        </View>

        {/* Legal Text */}
        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>
            By Logging In Or Registering, You Have Agreed To{" "}
          </Text>
          <View style={styles.linksInline}>
            <TouchableOpacity onPress={handleTermsPress} activeOpacity={0.7}>
              <Text style={styles.legalLink}>The Terms And Conditions</Text>
            </TouchableOpacity>
            <Text style={styles.legalText}> And </Text>
            <TouchableOpacity onPress={handlePrivacyPress} activeOpacity={0.7}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Agree & Continue Button */}
        <PrimaryButton
          text="Agree & continue"
          onPress={handleAgreeAndContinue}
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
    // marginBottom: hp(2),
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
    marginTop: hp(13),
  },
});
