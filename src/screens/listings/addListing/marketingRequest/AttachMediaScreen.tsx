import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader } from "../../../../components";
import { COLORS } from "@/constants";
import { useLocalization } from "../../../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

export default function AttachMediaScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { t, isRTL } = useLocalization();
  const params = (route.params ?? {}) as {
    selectedCategory?: string;
    attachments?: {
      id: string;
      uri: string;
      mediaType?: "photo" | "video" | "unknown";
      note?: string;
    }[];
    virtualTourLink?: string;
  };

  const rtlStyles = useMemo(
    () => ({
      row: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      text: {
        marginLeft: isRTL ? 0 : wp(3),
        marginRight: isRTL ? wp(3) : 0,
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL],
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleAttachPhotos = useCallback(async () => {
    navigation.navigate("MarketingRequestAlbums", {
      mode: "photos",
      selectedCategory: params.selectedCategory,
      attachments: params.attachments ?? [],
      virtualTourLink: params.virtualTourLink,
      ...((params as any)?.deed ? { deed: (params as any).deed } : {}),
    });
  }, [
    navigation,
    params.attachments,
    params.selectedCategory,
    params.virtualTourLink,
  ]);

  const handleAttachVideo = useCallback(async () => {
    navigation.navigate("MarketingRequestAlbums", {
      mode: "videos",
      selectedCategory: params.selectedCategory,
      attachments: params.attachments ?? [],
      virtualTourLink: params.virtualTourLink,
      ...((params as any)?.deed ? { deed: (params as any).deed } : {}),
    });
  }, [
    navigation,
    params.attachments,
    params.selectedCategory,
    params.virtualTourLink,
  ]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.attachPhotosOrVideos")}
        onBackPress={handleBackPress}
        titleFontWeight="600"
        fontSize={wp(5)}
      />

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.optionRow, rtlStyles.row]}
          onPress={handleAttachPhotos}
          activeOpacity={0.85}
        >
          <Ionicons name="camera" size={wp(5.6)} color={COLORS.textTertiary} />
          <Text style={[styles.optionText, rtlStyles.text]}>
            {t("listings.attachPhotos")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionRow, rtlStyles.row]}
          onPress={handleAttachVideo}
          activeOpacity={0.85}
        >
          <Ionicons
            name="videocam"
            size={wp(5.6)}
            color={COLORS.textTertiary}
          />
          <Text style={[styles.optionText, rtlStyles.text]}>
            {t("listings.attachVideo")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    gap: hp(1),
  },
  optionRow: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2.4),
    minHeight: hp(6.6),
    paddingHorizontal: wp(4),
    alignItems: "center",
    flexDirection: "row",
  },
  optionText: {
    marginLeft: wp(3),
    color: COLORS.textSecondary,
    fontSize: wp(4),
    fontWeight: "500",
  },
});
