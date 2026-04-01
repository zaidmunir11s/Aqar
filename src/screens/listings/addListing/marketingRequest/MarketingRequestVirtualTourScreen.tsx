import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader } from "../../../../components";
import { COLORS } from "@/constants";
import { useLocalization } from "../../../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

type RouteAttachment = {
  id: string;
  uri: string;
  mediaType?: "photo" | "video" | "unknown";
  note?: string;
};

type RouteParams = {
  selectedCategory?: string;
  attachments?: RouteAttachment[];
  virtualTourLink?: string;
};

const MATTERPORT_MODEL_ID_REGEX = /^[A-Za-z0-9_-]{8,}$/;

const isValidMatterportUrl = (rawUrl: string): boolean => {
  try {
    const parsed = new URL(rawUrl);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== "https:" && protocol !== "http:") return false;

    const host = parsed.hostname.toLowerCase();
    if (
      host !== "my.matterport.com" &&
      host !== "matterport.com" &&
      host !== "www.matterport.com"
    ) {
      return false;
    }

    if (!parsed.pathname.startsWith("/show")) return false;

    const modelId = parsed.searchParams.get("m");
    if (!modelId) return false;

    return MATTERPORT_MODEL_ID_REGEX.test(modelId);
  } catch {
    return false;
  }
};

export default function MarketingRequestVirtualTourScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const params = (route.params ?? {}) as RouteParams;
  const { t, isRTL } = useLocalization();
  const [virtualTourLink, setVirtualTourLink] = useState(params.virtualTourLink ?? "");
  const [isFocused, setIsFocused] = useState(false);

  const trimmedLink = virtualTourLink.trim();
  const isValid = isValidMatterportUrl(trimmedLink);
  const canSave = isValid;
  const showError = trimmedLink.length > 0 && !isValid;
  const openPaddingBottom = hp(1);
  const closedPaddingBottom = insets.bottom + hp(1);
  const keyboardStyle = useAnimatedStyle(() => {
    const keyboardHeight = Math.max(0, keyboard.height.value);
    return {
      transform: [{ translateY: -keyboardHeight }],
      paddingBottom: keyboardHeight > 0 ? openPaddingBottom : closedPaddingBottom,
    };
  }, [openPaddingBottom, closedPaddingBottom]);

  const rtlStyles = useMemo(
    () => ({
      title: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      subtitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      input: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      error: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSave = useCallback(() => {
    if (!canSave) return;
    navigation.navigate("MarketingRequestAttachments", {
      selectedCategory: params.selectedCategory,
      attachments: params.attachments ?? [],
      virtualTourLink: trimmedLink,
    });
  }, [canSave, navigation, params.attachments, params.selectedCategory, trimmedLink]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.addVirtualTour")}
        onBackPress={handleBackPress}
        titleFontWeight="600"
        fontSize={wp(5)}
      />

      <View style={styles.content}>
        <Text style={[styles.subtitle, rtlStyles.subtitle]}>
          {t("listings.virtualTourHint")}
        </Text>
        <Text style={[styles.title, rtlStyles.title]}>
          {t("listings.virtualTourLink")}
        </Text>
        <TextInput
          value={virtualTourLink}
          onChangeText={setVirtualTourLink}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t("listings.virtualTourLink")}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            showError && styles.inputError,
            rtlStyles.input,
          ]}
        />
        {showError && (
          <Text style={[styles.errorText, rtlStyles.error]}>
            {t("listings.virtualTourInvalid")}
          </Text>
        )}
      </View>

      <Animated.View
        style={[
          styles.footer,
          keyboardStyle,
        ]}
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.85}
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
        >
          <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
            {t("common.save")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(3.2),
    paddingTop: hp(1.6),
    paddingBottom: hp(2),
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: wp(3.5),
    marginBottom: hp(0.4),
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: wp(4.2),
    fontWeight: "500",
    marginBottom: hp(1),
  },
  input: {
    height: hp(6),
    borderRadius: wp(2),
    borderWidth: 1.2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(3.5),
    color: COLORS.textPrimary,
    fontSize: wp(4),
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.primary,
  },
  errorText: {
    marginTop: hp(0.8),
    color: "#cc5a75",
    fontSize: wp(3.8),
  },
  footer: {
    paddingHorizontal: wp(3.5),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: -2 },
      },
      android: {
        elevation: 5,
      },
    }),
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    minHeight: hp(6.2),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  saveText: {
    color: "#fff",
    fontSize: wp(4.5),
    fontWeight: "600",
  },
  saveTextDisabled: {
    color: "#cfe7d6",
    opacity: 0.9,
  },
});
