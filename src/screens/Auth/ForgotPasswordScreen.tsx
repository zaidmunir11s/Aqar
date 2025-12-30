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
import { BackButton, PrimaryButton, TextInput } from "../../components";
import { COLORS } from "../../constants";
import { Entypo } from "@expo/vector-icons";

type NavigationProp = NativeStackNavigationProp<any>;

export default function ForgotPasswordScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const isFormValid = phoneNumber.trim().length > 0;

  const handleContinue = useCallback(() => {
    if (!isFormValid) return;
    console.log("Continue with phone number:", phoneNumber);
    // TODO: Navigate to verification code screen or handle password reset
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
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter the mobile number of your account
          </Text>
        </View>

        {/* Phone Number Input */}
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          label="Phone number"
          labelIcon={{
            name: "mobile",
            library: "Entypo",
            color: COLORS.numberLabel,
          }}
          prefix="+966"
          placeholder=""
          keyboardType="phone-pad"
          showFocusStates={true}
        />

        {/* Continue Button */}
        <PrimaryButton
          text="Continue"
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

