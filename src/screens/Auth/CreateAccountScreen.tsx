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
import { BackButton, PrimaryButton, PhoneInput } from "../../components";

type NavigationProp = NativeStackNavigationProp<any>;

export default function CreateAccountScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const isFormValid = phoneNumber.trim().length > 0;

  const handleSendVerification = useCallback(() => {
    if (!isFormValid) return;
    console.log("Send verification code to:", phoneNumber);
  }, [isFormValid, phoneNumber]);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Listings");
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Enter the mobile number of your account
          </Text>
        </View>

        {/* Phone Number Input */}
        <PhoneInput value={phoneNumber} onChangeText={setPhoneNumber} />

        {/* Send Verification Code Button */}
        <PrimaryButton
          text="Send verification code"
          onPress={handleSendVerification}
          disabled={!isFormValid}
          style={styles.sendButton}
        />

        {/* Spacer to push privacy note to bottom */}
        <View style={styles.spacer} />

        {/* Privacy Note */}
        <Text style={styles.privacyNote}>
          * Your mobile number will not be shown until you add a listing.
        </Text>
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
  sendButton: {
    marginTop: hp(2),
  },
  spacer: {
    flex: 1,
    minHeight: hp(20),
  },
  privacyNote: {
    fontSize: wp(3.5),
    color: "#9ca3af",
    lineHeight: hp(2.5),
    marginTop: hp(2),
  },
});
