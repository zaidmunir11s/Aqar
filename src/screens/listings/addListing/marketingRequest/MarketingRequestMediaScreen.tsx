import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  Pressable,
  Animated,
  PanResponder,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  ScreenHeader,
  ListingFooter,
  CancelModal,
} from "../../../../components";
import { navigateToMapScreen } from "../../../../utils";
import { COLORS } from "@/constants";
import { useLocalization } from "../../../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

interface MediaAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface MediaActionRowProps {
  action: MediaAction;
  rtl: {
    actionRow: { flexDirection: "row" | "row-reverse" };
    actionText: { marginLeft: number; marginRight: number; textAlign: "left" | "right" };
  };
  onPress: (id: string) => void;
}

const MediaActionRow = memo<MediaActionRowProps>(({ action, rtl, onPress }) => {
  const handlePress = useCallback(() => onPress(action.id), [action.id, onPress]);

  return (
    <TouchableOpacity
      style={[styles.actionRow, rtl.actionRow]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <Ionicons name={action.icon} size={wp(5.6)} color={COLORS.textTertiary} />
      <Text style={[styles.actionText, rtl.actionText]}>{action.title}</Text>
    </TouchableOpacity>
  );
});

MediaActionRow.displayName = "MediaActionRow";

export default function MarketingRequestMediaScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { t, isRTL } = useLocalization();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isWarningMounted, setIsWarningMounted] = useState(false);
  const [permissionModalMessage, setPermissionModalMessage] = useState("");
  const warningTranslateY = useRef(new Animated.Value(hp(12))).current;
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const params = (route.params ?? {}) as {
    selectedCategory?: string;
    attachments?: Array<{
      id: string;
      uri: string;
      mediaType?: "photo" | "video" | "unknown";
      note?: string;
    }>;
    virtualTourLink?: string;
  };

  const existingAttachments = params.attachments ?? [];
  const existingVirtualTourLink = params.virtualTourLink;

  const actions = useMemo<MediaAction[]>(
    () => [
      {
        id: "attach",
        title: t("listings.attachPhotosOrVideos"),
        icon: "attach",
      },
      {
        id: "take-photo",
        title: t("listings.takePhoto"),
        icon: "camera",
      },
      {
        id: "record-video",
        title: t("listings.recordVideo"),
        icon: "videocam",
      },
      {
        id: "virtual-tour",
        title: t("listings.addVirtualTour"),
        icon: "images",
      },
    ],
    [t]
  );

  const rtlStyles = useMemo(
    () => ({
      heading: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      subtitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      actionRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      actionText: {
        marginLeft: isRTL ? 0 : wp(3),
        marginRight: isRTL ? wp(3) : 0,
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      warningContainer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      warningText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      modalText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      modalButtonRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
    }),
    [isRTL]
  );

  const openSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  const clearWarningTimer = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const hideWarningAnimated = useCallback(() => {
    clearWarningTimer();
    Animated.timing(warningTranslateY, {
      toValue: hp(12),
      duration: 260,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsWarningMounted(false);
      }
    });
  }, [clearWarningTimer, warningTranslateY]);

  const showWarningAnimated = useCallback(() => {
    clearWarningTimer();
    setIsWarningMounted(true);
    warningTranslateY.setValue(hp(12));

    Animated.timing(warningTranslateY, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();

    warningTimerRef.current = setTimeout(() => {
      hideWarningAnimated();
    }, 3000);
  }, [clearWarningTimer, hideWarningAnimated, warningTranslateY]);

  useEffect(() => {
    return () => {
      clearWarningTimer();
    };
  }, [clearWarningTimer]);

  const warningPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy > 0) {
            warningTranslateY.setValue(gesture.dy);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > hp(4.5)) {
            hideWarningAnimated();
            return;
          }
          Animated.spring(warningTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
            bounciness: 0,
          }).start();
        },
      }),
    [hideWarningAnimated, warningTranslateY]
  );

  const showPermissionDeniedModal = useCallback(
    (message: string) => {
      setPermissionModalMessage(message);
      setShowPermissionModal(true);
      showWarningAnimated();
    },
    [showWarningAnimated]
  );

  const handlePermissionLater = useCallback(() => {
    setShowPermissionModal(false);
  }, []);

  const handlePermissionOk = useCallback(async () => {
    setShowPermissionModal(false);
    await openSettings();
  }, [openSettings]);

  const ensureMediaLibraryPermission = useCallback(async (): Promise<boolean> => {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (res.status !== "granted") {
      showPermissionDeniedModal(t("listings.mediaPermissionDeniedModal"));
      return false;
    }
    if (isWarningMounted) {
      hideWarningAnimated();
    }
    return true;
  }, [hideWarningAnimated, isWarningMounted, showPermissionDeniedModal, t]);

  const ensureCameraPermission = useCallback(async (): Promise<boolean> => {
    const res = await ImagePicker.requestCameraPermissionsAsync();
    if (res.status !== "granted") {
      showPermissionDeniedModal(t("listings.cameraPermissionDeniedModal"));
      return false;
    }
    if (isWarningMounted) {
      hideWarningAnimated();
    }
    return true;
  }, [hideWarningAnimated, isWarningMounted, showPermissionDeniedModal, t]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
    navigation.goBack();
  }, [navigation]);

  const handleNextPress = useCallback(() => {
    navigation.navigate("MarketingRequestChooseLocation", {
      selectedCategory: params.selectedCategory,
      attachments: existingAttachments.map(({ id, uri, mediaType, note }) => ({
        id,
        uri,
        mediaType,
        note: note ?? "",
      })),
      virtualTourLink: existingVirtualTourLink ?? "",
    });
  }, [existingAttachments, existingVirtualTourLink, navigation, params.selectedCategory]);

  const handleActionPress = useCallback(
    async (id: string) => {
      const navigateToAttachments = (assets: ImagePicker.ImagePickerAsset[]) => {
        if (assets.length === 0) return;
        const mapped = assets.map((asset, index) => ({
          id: asset.assetId ?? `${asset.uri}-${Date.now()}-${index}`,
          uri: asset.uri,
          mediaType: asset.type === "video" ? "video" : "photo",
        }));
        navigation.navigate("MarketingRequestAttachments", {
          selectedCategory: params.selectedCategory,
          attachments: [...existingAttachments, ...mapped],
          virtualTourLink: existingVirtualTourLink,
        });
      };

      try {
        if (id === "attach") {
          const ok = await ensureMediaLibraryPermission();
          if (!ok) return;
          navigation.navigate("AttachMedia", {
            selectedCategory: params.selectedCategory,
            attachments: existingAttachments,
            virtualTourLink: existingVirtualTourLink,
          });
          return;
        }

        if (id === "take-photo") {
          const ok = await ensureCameraPermission();
          if (!ok) return;
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 1,
          });
          if (!result.canceled) navigateToAttachments(result.assets);
          return;
        }

        if (id === "record-video") {
          const ok = await ensureCameraPermission();
          if (!ok) return;
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["videos"],
            quality: 1,
          });
          if (!result.canceled) navigateToAttachments(result.assets);
          return;
        }

        if (id === "virtual-tour") {
          navigation.navigate("MarketingRequestVirtualTour", {
            selectedCategory: params.selectedCategory,
            attachments: existingAttachments,
            virtualTourLink: existingVirtualTourLink,
          });
          return;
        }
      } catch {
        showWarningAnimated();
      }
    },
    [
      ensureCameraPermission,
      ensureMediaLibraryPermission,
      existingAttachments,
      existingVirtualTourLink,
      navigation,
      params.selectedCategory,
      showWarningAnimated,
    ]
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
        <Text style={[styles.heading, rtlStyles.heading]}>
          {t("listings.addPhotosOrVideosOfProperty")}
        </Text>
        <Text style={[styles.subtitle, rtlStyles.subtitle]}>
          {t("listings.addingVideoRaisesPriority")}
        </Text>

        <View style={styles.actionsContainer}>
          {actions.map((action) => (
            <MediaActionRow
              key={action.id}
              action={action}
              rtl={{
                actionRow: rtlStyles.actionRow,
                actionText: rtlStyles.actionText,
              }}
              onPress={handleActionPress}
            />
          ))}
        </View>
      </ScrollView>

      {isWarningMounted && (
        <Animated.View
          style={[
            styles.warningContainer,
            rtlStyles.warningContainer,
            { transform: [{ translateY: warningTranslateY }] },
          ]}
          {...warningPanResponder.panHandlers}
        >
          <Ionicons
            name="information-circle"
            size={wp(4)}
            color={COLORS.error}
          />
          <Text style={[styles.warningText, rtlStyles.warningText]}>
            {t("listings.permissionDeniedBanner")}
          </Text>
        </Animated.View>
      )}

      <ListingFooter
        currentStep={2}
        totalSteps={5}
        onBackPress={handleFooterBackPress}
        onNextPress={handleNextPress}
        nextDisabled={false}
        backText={t("common.back")}
        nextText={t("common.next")}
      />

      <CancelModal
        visible={showCancelModal}
        onBack={handleCancelBack}
        onConfirm={handleCancelYes}
      />

      <Modal
        transparent
        visible={showPermissionModal}
        animationType="fade"
        onRequestClose={handlePermissionLater}
      >
        <Pressable style={styles.permissionModalOverlay} onPress={handlePermissionLater}>
          <Pressable style={styles.permissionModalCard}>
            <Text style={[styles.permissionModalTitle, rtlStyles.modalText]}>
              {t("common.appName")}
            </Text>
            <Text style={[styles.permissionModalMessage, rtlStyles.modalText]}>
              {permissionModalMessage}
            </Text>
            <View style={[styles.permissionModalButtons, rtlStyles.modalButtonRow]}>
              <TouchableOpacity
                style={styles.permissionModalButton}
                onPress={handlePermissionLater}
                activeOpacity={0.7}
              >
                <Text style={styles.permissionModalLaterText}>{t("common.later")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.permissionModalButton}
                onPress={handlePermissionOk}
                activeOpacity={0.7}
              >
                <Text style={styles.permissionModalOkText}>{t("common.ok")}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },
  heading: {
    fontSize: wp(5.1),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(0.2),
  },
  subtitle: {
    fontSize: wp(3.9),
    color: COLORS.textPrimary,
    lineHeight: hp(2.5),
    marginBottom: hp(2.2),
  },
  actionsContainer: {
    gap: hp(1),
  },
  actionRow: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2.4),
    minHeight: hp(6.6),
    paddingHorizontal: wp(4),
    alignItems: "center",
    flexDirection: "row",
  },
  actionText: {
    marginLeft: wp(3),
    color: COLORS.textSecondary,
    fontSize: wp(4),
    fontWeight: "500",
  },
  warningContainer: {
    marginHorizontal: wp(4),
    marginBottom: hp(0.8),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    gap: wp(2),
  },
  warningText: {
    flex: 1,
    fontSize: wp(3.2),
    color: COLORS.error,
    fontWeight: "500",
  },
  permissionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
  },
  permissionModalCard: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: wp(2.5),
    paddingHorizontal: wp(5),
    paddingTop: hp(2.4),
    paddingBottom: hp(1.2),
  },
  permissionModalTitle: {
    fontSize: wp(5.1),
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: hp(1),
  },
  permissionModalMessage: {
    fontSize: wp(4.3),
    color: COLORS.textSecondary,
    lineHeight: hp(3.4),
    marginBottom: hp(2),
  },
  permissionModalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: wp(2),
  },
  permissionModalButton: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
  },
  permissionModalLaterText: {
    color: COLORS.textSecondary,
    fontSize: wp(4.3),
    fontWeight: "500",
  },
  permissionModalOkText: {
    color: COLORS.primary,
    fontSize: wp(4.3),
    fontWeight: "600",
  },
});
