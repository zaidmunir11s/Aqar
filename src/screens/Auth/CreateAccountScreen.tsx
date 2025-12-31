import React, { useState, useCallback, useEffect } from "react";
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
import { BackButton, PrimaryButton, TextInput } from "../../components";
import { COLORS } from "../../constants";

type NavigationProp = NativeStackNavigationProp<any>;

export default function CreateAccountScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
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
        if (result && 'assets' in result && result.assets && result.assets[0]) {
          setProfileImage(result.assets[0].uri);
        }
      } catch (error) {
        // Silently fail if no pending result
        console.log("No pending image picker result");
      }
    };
    checkPendingResult();
  }, []);

  // Validation functions
  const validatePhoneNumber = (phone: string): string => {
    if (phone.trim().length === 0) {
      return "Phone number is required";
    }
    if (!/^\d+$/.test(phone)) {
      return "Invalid phone number";
    }
    return "";
  };

  const validatePassword = (pwd: string): string => {
    if (pwd.trim().length === 0) {
      return "Password is required";
    }
    if (pwd.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      return "Password must contain at least one special character";
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

  const handleAgreeAndContinue = useCallback(() => {
    if (!isFormValid) {
      // Show errors if form is invalid
      if (phoneError !== "") {
        setPhoneErrorShown(true);
      }
      if (passwordError !== "") {
        setPasswordTouched(true);
      }
      return;
    }
    console.log("Agree & Continue:", {
      firstName,
      lastName,
      phoneNumber,
      password,
    });
    // Navigate to Login screen
    navigation.navigate("Login");
  }, [isFormValid, firstName, lastName, phoneNumber, password, phoneError, passwordError, navigation]);

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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need access to your photos to set a profile picture."
        );
        return;
      }

      // Launch image picker with safer options
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
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
              <View style={styles.editIconContainer}>
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

        {/* Phone Number Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            placeholder="Phone number"
            prefix="+966"
            keyboardType="phone-pad"
            showFocusStates={true}
            error={phoneErrorShown ? phoneError : ""}
            touched={phoneErrorShown}
          />
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={handlePasswordChange}
            onBlur={() => setPasswordTouched(true)}
            placeholder="Password"
            isPassword={true}
            showPasswordToggle={true}
            showFocusStates={true}
            error={passwordTouched ? passwordError : ""}
            touched={passwordTouched}
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
