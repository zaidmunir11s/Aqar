import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Linking,
  BackHandler,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader, ListingFooter, CancelModal } from "../../../../components";
import { COLORS } from "@/constants";
import { useLocalization } from "../../../../hooks/useLocalization";
import { navigateToMapScreen } from "../../../../utils";

type NavigationProp = NativeStackNavigationProp<any>;

type RouteAttachment = {
  id: string;
  uri: string;
  mediaType?: "photo" | "video" | "unknown";
  note?: string;
};

type AttachmentItem = RouteAttachment & {
  note: string;
};

type RouteParams = {
  attachments?: RouteAttachment[];
  virtualTourLink?: string;
  selectedCategory?: string;
};

export default function MarketingRequestAttachmentsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { t, isRTL } = useLocalization();
  const params = (route.params ?? {}) as RouteParams;

  const [attachments, setAttachments] = useState<AttachmentItem[]>(
    (params.attachments ?? []).map((asset) => ({
      ...asset,
      note: asset.note ?? "",
    }))
  );
  const [virtualTourLink] = useState(params.virtualTourLink ?? "");
  const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const selectedCategory = params.selectedCategory;

  const buildDraftParams = useCallback(
    () => ({
      selectedCategory,
      attachments: attachments.map(({ id, uri, mediaType, note }) => ({
        id,
        uri,
        mediaType,
        note,
      })),
      virtualTourLink,
    }),
    [attachments, selectedCategory, virtualTourLink]
  );

  const mergeAttachments = useCallback(
    (
      previous: AttachmentItem[],
      incoming: Array<{ id: string; uri: string; mediaType?: "photo" | "video" | "unknown" }>
    ): AttachmentItem[] => {
      const map = new Map<string, AttachmentItem>();
      previous.forEach((item) => {
        map.set(item.id, item);
      });
      incoming.forEach((item) => {
        const existing = map.get(item.id);
        if (existing) {
          map.set(item.id, {
            ...existing,
            uri: item.uri,
            mediaType: item.mediaType,
          });
          return;
        }
        map.set(item.id, { ...item, note: "" });
      });
      return Array.from(map.values());
    },
    []
  );

  const rtlStyles = useMemo(
    () => ({
      headerRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      titleText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      iconRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      input: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      coverLabelWrap: {
        alignSelf: (isRTL ? "flex-end" : "flex-start") as "flex-start" | "flex-end",
      },
      /** Cover / make-cover chips: leading corner follows reading direction */
      mediaOverlayStart: isRTL ? { right: wp(3.2) } : { left: wp(3.2) },
      deleteFabEdge: isRTL ? { left: wp(2.8) } : { right: wp(2.8) },
      overlayLabelText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
    }),
    [isRTL]
  );

  const handleBackPress = useCallback(() => {
    navigation.navigate("MarketingRequestPlaceholder", buildDraftParams());
  }, [buildDraftParams, navigation]);

  const handleClosePress = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const handleCancelBack = useCallback(() => {
    setShowCancelModal(false);
  }, []);

  const handleCancelYes = useCallback(() => {
    setShowCancelModal(false);
    navigateToMapScreen(navigation);
  }, [navigation]);

  const handleFooterBackPress = useCallback(() => {
    navigation.navigate("MarketingRequestPlaceholder", buildDraftParams());
  }, [buildDraftParams, navigation]);

  const handleFooterNextPress = useCallback(() => {
    navigation.navigate("MarketingRequestChooseLocation", {
      selectedCategory,
      attachments: attachments.map(({ id, uri, mediaType, note }) => ({
        id,
        uri,
        mediaType,
        note,
      })),
      virtualTourLink,
    });
  }, [attachments, navigation, selectedCategory, virtualTourLink]);

  const handleMakeCover = useCallback((id: string) => {
    setAttachments((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      const [selected] = next.splice(idx, 1);
      next.unshift(selected);
      return next;
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleNoteChange = useCallback((id: string, note: string) => {
    setAttachments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  }, []);

  const coverPhotoId = useMemo(
    () => attachments.find((item) => item.mediaType !== "video")?.id ?? null,
    [attachments]
  );

  const handleActionIconPress = useCallback(
    async (action: "attach" | "camera" | "video" | "tour") => {
      if (action === "attach") {
        navigation.navigate("AttachMedia", {
          selectedCategory,
          attachments: attachments.map(({ id, uri, mediaType, note }) => ({
            id,
            uri,
            mediaType,
            note,
          })),
          virtualTourLink,
        });
        return;
      }

      if (action === "tour") {
        navigation.navigate("MarketingRequestVirtualTour", {
          selectedCategory,
          attachments: attachments.map(({ id, uri, mediaType, note }) => ({
            id,
            uri,
            mediaType,
            note,
          })),
          virtualTourLink,
        });
        return;
      }

      if (action === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== "granted") {
          await Linking.openSettings();
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 1,
        });
        if (result.canceled) return;
        const mapped = result.assets.map((asset, index) => ({
          id: asset.assetId ?? `${asset.uri}-${Date.now()}-${index}`,
          uri: asset.uri,
          mediaType: "photo" as const,
        }));
        setAttachments((prev) => mergeAttachments(prev, mapped));
        return;
      }

      if (action === "video") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== "granted") {
          await Linking.openSettings();
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["videos"],
          quality: 1,
        });
        if (result.canceled) return;
        const mapped = result.assets.map((asset, index) => ({
          id: asset.assetId ?? `${asset.uri}-${Date.now()}-${index}`,
          uri: asset.uri,
          mediaType: "video" as const,
        }));
        setAttachments((prev) => mergeAttachments(prev, mapped));
      }
    },
    [attachments, mergeAttachments, navigation, selectedCategory, virtualTourLink]
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("MarketingRequestPlaceholder", buildDraftParams());
        return true;
      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [buildDraftParams, navigation])
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.addImagesAndVideos")}
        onBackPress={handleBackPress}
        showRightSide
        rightComponent={
          <TouchableOpacity
            onPress={handleClosePress}
            activeOpacity={0.7}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={wp(6)} color={COLORS.primary} />
          </TouchableOpacity>
        }
        titleFontWeight="600"
        fontSize={wp(5)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerRow, rtlStyles.headerRow]}>
          <Text style={[styles.attachmentsTitle, rtlStyles.titleText]}>
            {t("listings.attachments")}
          </Text>
          <View style={[styles.actionIconsRow, rtlStyles.iconRow]}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.75}
              onPress={() => handleActionIconPress("attach")}
            >
              <Ionicons name="attach" size={wp(5.5)} color={COLORS.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.75}
              onPress={() => handleActionIconPress("camera")}
            >
              <Ionicons name="camera" size={wp(5.5)} color={COLORS.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.75}
              onPress={() => handleActionIconPress("video")}
            >
              <Ionicons name="videocam" size={wp(5.5)} color={COLORS.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.75}
              onPress={() => handleActionIconPress("tour")}
            >
              <Ionicons name="images" size={wp(5.5)} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {attachments.map((item, index) => (
          <View key={item.id} style={styles.attachmentBlock}>
            {item.mediaType !== "video" ? (
              <TextInput
                value={item.note}
                onChangeText={(text) => handleNoteChange(item.id, text)}
                onFocus={() => setFocusedNoteId(item.id)}
                onBlur={() => setFocusedNoteId((prev) => (prev === item.id ? null : prev))}
                style={[
                  styles.noteInput,
                  focusedNoteId === item.id && styles.noteInputFocused,
                  rtlStyles.input,
                ]}
                placeholder={t("listings.writeOnImageHere")}
                placeholderTextColor="#9ca3af"
              />
            ) : null}

            <View style={styles.mediaWrap}>
              <Image source={{ uri: item.uri }} style={styles.mediaImage} />

              {item.mediaType !== "video" ? (
                item.id === coverPhotoId ? (
                  <View style={[styles.coverTag, rtlStyles.mediaOverlayStart, rtlStyles.coverLabelWrap]}>
                    <Text style={[styles.coverTagText, rtlStyles.overlayLabelText]}>
                      {t("listings.coverPhoto")}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.makeCoverTag, rtlStyles.mediaOverlayStart, rtlStyles.coverLabelWrap]}
                    activeOpacity={0.8}
                    onPress={() => handleMakeCover(item.id)}
                  >
                    <Text style={[styles.makeCoverTagText, rtlStyles.overlayLabelText]}>
                      {t("listings.makeItCover")}
                    </Text>
                  </TouchableOpacity>
                )
              ) : null}

              <TouchableOpacity
                style={[styles.deleteFab, rtlStyles.deleteFabEdge]}
                activeOpacity={0.75}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash" size={wp(5)} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <ListingFooter
        currentStep={2}
        totalSteps={5}
        onBackPress={handleFooterBackPress}
        onNextPress={handleFooterNextPress}
        nextDisabled={false}
        backText={t("common.back")}
        nextText={t("common.next")}
      />
      <CancelModal
        visible={showCancelModal}
        onBack={handleCancelBack}
        onConfirm={handleCancelYes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  closeButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(0.8),
    paddingBottom: hp(1.5),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(0.8),
  },
  attachmentsTitle: {
    fontSize: wp(5.8),
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  actionIconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1.2),
  },
  iconButton: {
    width: wp(6.8),
    height: wp(6.8),
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentBlock: {
    marginBottom: hp(1),
  },
  noteInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    minHeight: hp(5.8),
    paddingHorizontal: wp(4),
    fontSize: wp(4.2),
    color: COLORS.textPrimary,
    marginBottom: hp(0.7),
  },
  noteInputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.activeChipBackground,
  },
  mediaWrap: {
    position: "relative",
  },
  mediaImage: {
    width: "100%",
    height: hp(20.5),
    borderRadius: wp(1.2),
    backgroundColor: "#dfe4e4",
  },
  coverTag: {
    position: "absolute",
    top: hp(0.9),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
    borderRadius: wp(3),
    paddingHorizontal: wp(3.2),
    paddingVertical: hp(1),
  },
  coverTagText: {
    color: "#fff",
    fontSize: wp(3.9),
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  makeCoverTag: {
    position: "absolute",
    top: hp(0.9),
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#fff",
    borderRadius: wp(3),
    paddingHorizontal: wp(3.2),
    paddingVertical: hp(1),
  },
  makeCoverTagText: {
    color: "#fff",
    fontSize: wp(3.7),
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  deleteFab: {
    position: "absolute",
    top: hp(0.9),
    width: wp(7.5),
    height: wp(7.5),
    borderRadius: wp(3.6),
    backgroundColor: COLORS.shadowErrorLight,
    borderWidth: 1,
    borderColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
  },
});
