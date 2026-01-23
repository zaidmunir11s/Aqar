import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
  Alert,
  TextStyle,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { ScreenHeader, TextInput, CancelModal } from "../../components";
import { useLocalization } from "../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

export default function UpdateProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const keyboardHeight = useRef(new Animated.Value(0)).current;

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

  const handleImagePicker = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need access to your photos to set a profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  }, []);

  const handleSave = useCallback(() => {
    console.log("Save profile:", { name, email, bio });
    // TODO: Implement save functionality
  }, [name, email, bio]);

  const handleDeleteAccount = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    setShowDeleteModal(false);
    console.log("Delete account");
    // TODO: Implement delete account functionality
  }, []);
  const rtlStyles = useMemo(
    () => ({
      profilePictureSection: { flexDirection: isRTL ? "row-reverse" : "row" },
      label: { textAlign: isRTL ? "right" : "left", flexDirection: isRTL ? "row-reverse" : "row" },
      
    }),
    [isRTL]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("profile.updateProfile", { defaultValue: "Update profile" })}
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
          {/* Profile Picture Section */}
          <View style={styles.profilePictureSection}>
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
                  <FontAwesome
                    name="camera"
                    size={wp(7)}
                    color={COLORS.textTertiary}
                  />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.profilePictureText}>
              {t("profile.clickToAddProfilePicture", { defaultValue: "Click to add a profile picture" })}
            </Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, rtlStyles.label as TextStyle]}>{t("profile.name", { defaultValue: "Name" })}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder=""
              showFocusStates={true}
              containerStyle={styles.inputContainer}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, rtlStyles.label as TextStyle]}>{t("profile.email", { defaultValue: "Email" })}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder=""
              keyboardType="email-address"
              showFocusStates={true}
              containerStyle={styles.inputContainer}
            />
          </View>

          {/* Bio Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, rtlStyles.label as TextStyle]}>{t("profile.bio", { defaultValue: "Bio" })}</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder={t("profile.enterHere", { defaultValue: "Enter here" })}
              multiline={true}
              numberOfLines={4}
              showFocusStates={true}
              containerStyle={styles.inputContainer}
            />
          </View>

          {/* Delete Account Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>{t("profile.deleteAccount", { defaultValue: "Delete Account" })}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Footer with Save Button */}
      <Animated.View
        style={[
          styles.footer,
          {
            bottom: keyboardHeight,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>{t("profile.save", { defaultValue: "Save" })}</Text>
        </TouchableOpacity>
      </Animated.View>

      <CancelModal
        visible={showDeleteModal}
        title={t("profile.deleteAccount", { defaultValue: "Delete Account" })}
        description={t("profile.deleteAccountConfirm", { defaultValue: "Are you sure you want to delete your account?" })}
        onBack={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        backText={t("common.no", { defaultValue: "NO" })}
        confirmText={t("common.yes", { defaultValue: "Yes" })}
        confirmButtonColor={"#c13234"}
      />
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
  profilePictureSection: {
    alignItems: "center",
    marginBottom: hp(3),
  },
  imagePickerButton: {
    marginBottom: hp(1.5),
  },
  profileImage: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(2),
    backgroundColor: COLORS.borderLight,
  },
  placeholderContainer: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(3),
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border
  },
  profilePictureText: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    fontWeight: "400",
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
  deleteButton: {
    backgroundColor: "#c13234",
    borderRadius: wp(2),
    height: hp(5),
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  deleteButtonText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.white,
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
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(2),
    height: hp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.white,
  },
});

