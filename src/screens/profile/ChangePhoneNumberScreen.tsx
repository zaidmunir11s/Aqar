import React, { useState, useCallback, useEffect, useRef } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { ScreenHeader, TextInput } from "../../components";

type NavigationProp = NativeStackNavigationProp<any>;

export default function ChangePhoneNumberScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [phoneTouched, setPhoneTouched] = useState<boolean>(false);
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  // Saudi Arabia phone number validation
  // Format: 05XXXXXXXX (10 digits, starts with 05)
  const validatePhoneNumber = (phone: string): string => {
    if (phone.trim().length === 0) {
      return "Phone number is required";
    }
    
    // Remove any non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, "");
    
    // Check if it starts with 05
    if (!digitsOnly.startsWith("05")) {
      return "Phone number must start with 05";
    }
    
    // Check exact length (10 digits: 05 + 8 more digits)
    if (digitsOnly.length !== 10) {
      return "Phone number must be 10 digits";
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
        title="Change Phone Number"
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
            <Text style={styles.label}>New phone number</Text>
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
      
      {/* Footer with Continue Button */}
      <Animated.View
        style={[
          styles.footer,
          {
            bottom: keyboardHeight,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isFormValid && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!isFormValid}
        >
          <Text style={[
            styles.continueButtonText,
            !isFormValid && styles.continueButtonTextDisabled
          ]}>Continue</Text>
        </TouchableOpacity>
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
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(1),
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(2),
    height: hp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.white,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.primaryDark,
    opacity: 0.6,
  },
  continueButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
});

