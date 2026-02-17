import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
  TextStyle,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { ScreenHeader, TextInput, SingleButtonFooter } from "../../components";
import { useLocalization } from "../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

export default function ChangePhoneNumberScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [phoneTouched, setPhoneTouched] = useState<boolean>(false);
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  const rtlStyles = useMemo(
    () => ({
      label: { textAlign: isRTL ? "right" : "left" },
    }),
    [isRTL]
  );

  // Saudi Arabia phone number validation
  // Format: 05XXXXXXXX (10 digits, starts with 05)
  const validatePhoneNumber = (phone: string): string => {
    if (phone.trim().length === 0) {
      return t("profile.phoneNumberRequired", { defaultValue: "Phone number is required" });
    }
    
    // Remove any non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, "");
    
    // Check if it starts with 05
    if (!digitsOnly.startsWith("05")) {
      return t("profile.phoneNumberMustStartWith05", { defaultValue: "Phone number must start with 05" });
    }
    
    // Check exact length (10 digits: 05 + 8 more digits)
    if (digitsOnly.length !== 10) {
      return t("profile.phoneNumberMustBe10Digits", { defaultValue: "Phone number must be 10 digits" });
    }
    
    return "";
  };

  const phoneError = validatePhoneNumber(phoneNumber);
  
  // Check if phone number is valid
  const isFormValid = phoneError === "" && phoneNumber.trim().length > 0;

  // Listen to keyboard show/hide events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        setIsKeyboardVisible(true);
        // Set keyboard height to position footer just above keyboard
        Animated.timing(keyboardHeight, {
          toValue: event.endCoordinates.height,
          duration: event.duration || 250,
          useNativeDriver: false, // Can't use native driver for bottom positioning
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (event) => {
        setIsKeyboardVisible(false);
        // Reset keyboard height to 0 to bring footer back to original position
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: event.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardHeight]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePhoneChange = useCallback((text: string) => {
    // Filter to only allow numbers
    const filteredText = text.replace(/[^0-9]/g, "");
    setPhoneNumber(filteredText);
  }, []);

  const handleContinue = useCallback(() => {
    // Mark field as touched
    setPhoneTouched(true);

    // Validate phone number
    const phoneErr = validatePhoneNumber(phoneNumber);

    if (phoneErr !== "") {
      // Validation failed, return early
      return;
    }

    // All validations passed
    console.log("Change phone number:", phoneNumber);
    // TODO: Implement change phone number functionality
  }, [phoneNumber]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("profile.changePhoneNumber", { defaultValue: "Change Phone Number" })}
        onBackPress={handleBackPress}
        fontWeightBold={true}
      />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            !isKeyboardVisible && styles.scrollContentNoKeyboard,
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={isKeyboardVisible}
          keyboardShouldPersistTaps="handled"
        >
          {/* Phone Number Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, rtlStyles.label as TextStyle]}>{t("profile.newPhoneNumber", { defaultValue: "New phone number" })}</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              onBlur={() => setPhoneTouched(true)}
              keyboardType="phone-pad"
              showFocusStates={true}
              containerStyle={styles.inputContainer}
              error={phoneTouched ? phoneError : ""}
              touched={phoneTouched}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Animated.View style={[styles.footerWrapper, { bottom: keyboardHeight }]}>
        <SingleButtonFooter
          fixed={false}
          label={t("auth.continue", { defaultValue: "Continue" })}
          onPress={handleContinue}
          disabled={!isFormValid}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgGray,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
    paddingBottom: hp(12), // Extra padding for footer (hp(6) button + hp(4) padding)
  },
  scrollContentNoKeyboard: {
    flexGrow: 1,
  },
  inputSection: {
    marginBottom: hp(3),
  },
  label: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: hp(1.2),
  },
  inputContainer: {
    marginBottom: 0,
  },
  footerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});

