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
  ActivityIndicator,
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
import { ScreenHeader, TextInput, SingleButtonFooter } from "../../components";
import { useLocalization } from "../../hooks/useLocalization";
import { useGetMeQuery, useUpdateMeMutation } from "@/redux/api/userApi";
import { useUser } from "@clerk/clerk-expo";
import { uploadListingMediaToSupabase } from "@/utils/uploadListingImagesToSupabase";
import { supabase } from "@/utils/supabaseSingleton";

type NavigationProp = NativeStackNavigationProp<any>;

export default function UpdateProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const { user: clerkUser } = useUser();
  const { data: meData } = useGetMeQuery();
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
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

  // Auto-populate from backend user (preferred) with Clerk fallback.
  useEffect(() => {
    const me = meData?.user;
    const nextName =
      me && (me.firstName || me.lastName)
        ? `${me.firstName ?? ""} ${me.lastName ?? ""}`.trim()
        : (clerkUser?.fullName?.trim() ||
            [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ").trim() ||
            "");
    const nextEmail =
      (me?.email ?? clerkUser?.primaryEmailAddress?.emailAddress ?? "").trim();
    const nextBio = (me as any)?.bio ?? "";
    const nextProfileImage =
      (me?.profileImage ?? clerkUser?.imageUrl ?? null) || null;

    setName((prev) => (prev.trim().length ? prev : nextName));
    setEmail((prev) => (prev.trim().length ? prev : nextEmail));
    setBio((prev) => (prev.trim().length ? prev : String(nextBio ?? "")));
    setProfileImage((prev) => (prev ? prev : nextProfileImage));
  }, [clerkUser, meData]);

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

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    const full = name.trim();
    if (!full) {
      Alert.alert(t("common.error", { defaultValue: "Error" }), t("profile.nameRequired", { defaultValue: "Name is required" }));
      return;
    }

    let profileImageUrl: string | null = profileImage;
    try {
      if (profileImageUrl && !profileImageUrl.startsWith("http://") && !profileImageUrl.startsWith("https://")) {
        const uploaded = await uploadListingMediaToSupabase(
          supabase,
          [{ uri: profileImageUrl, order: 0, mediaType: "photo" }],
          { prefix: "profiles" }
        );
        profileImageUrl = uploaded[0]?.url ?? null;
      }
    } catch (e: any) {
      Alert.alert(
        t("common.error", { defaultValue: "Error" }),
        e?.message || t("profile.profileImageUploadFailed", { defaultValue: "Failed to upload profile image." })
      );
      return;
    }

    const parts = full.split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? full;
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

    try {
      await updateMe({
        firstName,
        lastName,
        email: email.trim() || null,
        profileImage: profileImageUrl,
        bio: bio.trim() || null,
      }).unwrap();
      Alert.alert(t("common.success", { defaultValue: "Success" }), t("profile.profileUpdated", { defaultValue: "Profile updated" }));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(
        t("common.error", { defaultValue: "Error" }),
        e?.message || t("profile.updateFailed", { defaultValue: "Failed to update profile." })
      );
    }
  }, [name, profileImage, updateMe, email, bio, t, navigation, isSaving]);
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
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Animated.View style={[styles.footerWrapper, { bottom: keyboardHeight }]}>
        <SingleButtonFooter
          fixed={false}
          label={t("profile.save", { defaultValue: "Save" })}
          onPress={handleSave}
          disabled={isSaving}
          icon={isSaving ? <ActivityIndicator color={COLORS.white} /> : undefined}
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
  footerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});

