import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Platform,
  ViewStyle,
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  Share,
  TextInput as RNTextInput,
} from "react-native";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS, STORAGE_KEYS } from "../../constants";
import {
  ScreenHeader,
  UserInfoCard,
  ProfileAdsTabs,
  ListingTypeSegmentFilter,
  PropertyCard,
} from "../../components";
import type { ProfileAdsTabKey } from "../../components/profile/ProfileAdsTabs";
import type { ListingTypeFilter } from "../../components/profile/ListingTypeSegmentFilter";
import { useLocalization, useTabNavigation } from "../../hooks";
import { getUserProfilePublishedAds } from "../../utils/publishedListingsStore";
import {
  useGetMeQuery,
  useGetMyListingsQuery,
  useGetPublicUserByIdQuery,
  useGetPublicUserListingsQuery,
} from "@/redux/api";
import { useHideAdvertiserMutation, useReportAdvertiserMutation } from "@/redux/api/userApi";
import { mapApiListingToProperty } from "@/utils/apiListingMapper";
import { registerApiListingProperties } from "@/utils/propertyLookup";
import { useIsAuthenticated } from "@/context/auth-context";
import {
  formatProfileLastSeen,
  formatProfileSinceDate,
  getAccountProfileMeta,
  getLastActiveAtMs,
  syncAccountProfileMetaOnAuth,
  touchLastActiveAt,
} from "../../utils/accountActivityStorage";
import { buildProfileAdCardLines } from "../../utils/profileAdCard";
import type { Property } from "../../types/property";
import { secureGet } from "@/utils/secureStore";

type NavigationProp = NativeStackNavigationProp<any>;

type RouteParams = {
  userId?: string;
  userName?: string;
};

export default function UserProfileAdsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const params = (route.params ?? {}) as RouteParams;
  const profileUserId = params.userId?.trim() || undefined;
  const { navigateToListings } = useTabNavigation();
  const { t, isRTL, i18n } = useLocalization();
  const { isAuthenticated } = useIsAuthenticated();
  const { data: meData } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const { data: myListingsData } = useGetMyListingsQuery(undefined, {
    skip: !isAuthenticated,
  });

  // When opened from a listing (advertiser row), we want to show that user's profile + ads,
  // even if the viewer isn't authenticated (or /me hasn't loaded yet).
  const isViewingOtherUser = Boolean(profileUserId) && profileUserId !== meData?.user?.id;

  const [hideAdvertiser, { isLoading: isHidingAdvertiser }] = useHideAdvertiserMutation();
  const [reportAdvertiser, { isLoading: isReportingAdvertiser }] = useReportAdvertiserMutation();

  const { data: publicUserData } = useGetPublicUserByIdQuery(profileUserId!, {
    skip: !profileUserId,
  });
  const { data: publicUserListingsData } = useGetPublicUserListingsQuery(profileUserId!, {
    skip: !profileUserId,
  });

  const apiMyProperties = useMemo(() => {
    const rows = isViewingOtherUser
      ? publicUserListingsData?.listings ?? []
      : myListingsData?.listings ?? [];
    return rows.map(mapApiListingToProperty);
  }, [isViewingOtherUser, myListingsData, publicUserListingsData]);

  useEffect(() => {
    if (apiMyProperties.length > 0) {
      registerApiListingProperties(apiMyProperties);
    }
  }, [apiMyProperties]);

  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [userPhoneDigits, setUserPhoneDigits] = useState<string>("");
  const [listTick, setListTick] = useState(0);
  const [adsTab, setAdsTab] = useState<ProfileAdsTabKey>("current");
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingTypeFilter>(null);
  const [sinceDisplay, setSinceDisplay] = useState<string>("");
  const [lastSeenDisplay, setLastSeenDisplay] = useState<string>("");
  const [hideConfirmVisible, setHideConfirmVisible] = useState(false);

  type FeedbackVariant = "success" | "error";
  const [feedback, setFeedback] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: FeedbackVariant;
  }>({ visible: false, title: "", message: "", variant: "success" });
  const feedbackOnCloseRef = useRef<null | (() => void)>(null);

  const closeFeedback = useCallback(() => {
    setFeedback((s) => ({ ...s, visible: false }));
    const cb = feedbackOnCloseRef.current;
    feedbackOnCloseRef.current = null;
    if (cb) cb();
  }, []);

  const showFeedback = useCallback(
    (title: string, message: string, variant: FeedbackVariant, onClose?: () => void) => {
      feedbackOnCloseRef.current = onClose ?? null;
      setFeedback({ visible: true, title, message, variant });
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          if (isViewingOtherUser) {
            const u = publicUserData?.user;
            const name =
              u && (u.firstName || u.lastName)
                ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                : params.userName?.trim() ?? "";
            if (!active) return;
            setDisplayName(name);
            setAvatarUri(u?.profileImage?.trim?.() ? u.profileImage.trim() : null);
            setUserPhoneDigits("");
            setSinceDisplay(t("listings.notAvailable"));
            setLastSeenDisplay(t("profile.now"));
            return;
          }
          const [name, uri, phone] = await Promise.all([
            secureGet(STORAGE_KEYS.loggedInDisplayName),
            secureGet(STORAGE_KEYS.loggedInProfileImageUri),
            secureGet(STORAGE_KEYS.loggedInPhoneNumber),
          ]);
          const phoneDigits = (phone ?? "").replace(/\D/g, "");
          let meta = await getAccountProfileMeta();
          if (phoneDigits.length > 0 && !meta) {
            await syncAccountProfileMetaOnAuth(phoneDigits);
            meta = await getAccountProfileMeta();
          }
          const previousLastMs = await getLastActiveAtMs();
          await touchLastActiveAt();
          if (!active) return;
          const me = meData?.user;
          const meName =
            me && (me.firstName || me.lastName)
              ? `${me.firstName ?? ""} ${me.lastName ?? ""}`.trim()
              : "";
          const nextName = meName || (name?.trim() ?? "");
          const nextAvatar =
            (me?.profileImage && me.profileImage.length > 0
              ? me.profileImage
              : uri && uri.length > 0
                ? uri
                : null) ?? null;
          const mePhoneDigits = (me?.phoneNumber ?? "").replace(/\D/g, "");
          const nextPhoneDigits = mePhoneDigits || phoneDigits;

          setDisplayName(nextName);
          setAvatarUri(nextAvatar);
          setUserPhoneDigits(nextPhoneDigits);

          const nowLabel = t("profile.now");
          if (meta && meta.phoneDigits === phoneDigits) {
            setSinceDisplay(formatProfileSinceDate(meta.createdAtMs, i18n.language));
          } else {
            setSinceDisplay(t("listings.notAvailable"));
          }
          const lastSeen =
            previousLastMs != null
              ? formatProfileLastSeen(previousLastMs, i18n.language, nowLabel)
              : nowLabel;
          setLastSeenDisplay(lastSeen);
        } catch {
          if (!active) return;
          setDisplayName("");
          setAvatarUri(null);
          setUserPhoneDigits("");
          setSinceDisplay(t("listings.notAvailable"));
          setLastSeenDisplay(t("profile.now"));
        } finally {
          if (active) setListTick((x) => x + 1);
        }
      })();
      return () => {
        active = false;
      };
    }, [t, i18n.language, meData?.user, isViewingOtherUser, publicUserData?.user, params.userName])
  );

  const { current, archived } = useMemo(() => {
    const local = getUserProfilePublishedAds(userPhoneDigits || null);
    const mergedCurrent = [...apiMyProperties, ...local.current];
    return { current: mergedCurrent, archived: local.archived };
  }, [userPhoneDigits, listTick, apiMyProperties]);

  const baseList = adsTab === "current" ? current : archived;

  const filteredAds = useMemo(() => {
    if (listingTypeFilter == null) return baseList;
    return baseList.filter((p) => p.listingType === listingTypeFilter);
  }, [baseList, listingTypeFilter]);

  const headerTitleCount = current.length;

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSharePress = useCallback(async () => {
    const name = displayName.trim();
    const phone = userPhoneDigits.trim();
    const bio = (isViewingOtherUser ? publicUserData?.user?.bio : meData?.user?.bio) ?? "";

    const lines: string[] = [];
    if (name) lines.push(name);
    if (phone) lines.push(`${t("profile.phoneNumber")}: ${phone}`);
    if (bio.trim()) {
      lines.push("");
      lines.push(String(bio).trim());
    }

    const message = lines.filter(Boolean).join("\n").trim();
    if (!message) return;

    try {
      await Share.share({ message });
    } catch {
      // dismissed
    }
  }, [displayName, isViewingOtherUser, meData?.user?.bio, publicUserData?.user?.bio, t, userPhoneDigits]);

  const handleHideAdvertiserPress = useCallback(() => {
    if (!profileUserId) return;
    if (!isAuthenticated) {
      showFeedback(t("auth.loginRequiredTitle"), t("auth.loginRequiredMessage"), "error");
      return;
    }

    setHideConfirmVisible(true);
  }, [isAuthenticated, profileUserId, showFeedback, t]);

  type ReportReason =
    | "SPAM"
    | "FRAUD"
    | "HARASSMENT"
    | "INAPPROPRIATE_CONTENT"
    | "OTHER";

  const reportReasonOptions = useMemo(
    () =>
      [
        { key: "SPAM" as const, label: t("profile.reportReasons.spam") },
        { key: "FRAUD" as const, label: t("profile.reportReasons.fraud") },
        { key: "HARASSMENT" as const, label: t("profile.reportReasons.harassment") },
        { key: "INAPPROPRIATE_CONTENT" as const, label: t("profile.reportReasons.inappropriate") },
        { key: "OTHER" as const, label: t("profile.reportReasons.other") },
      ] as const,
    [t]
  );

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<ReportReason | null>(null);
  const [reportFreeText, setReportFreeText] = useState("");

  const closeReportModal = useCallback(() => {
    if (isReportingAdvertiser) return;
    setReportModalVisible(false);
  }, [isReportingAdvertiser]);

  const openReportModal = useCallback(() => {
    if (!profileUserId) return;
    if (!isAuthenticated) {
      showFeedback(t("auth.loginRequiredTitle"), t("auth.loginRequiredMessage"), "error");
      return;
    }
    setSelectedReportReason(null);
    setReportFreeText("");
    setReportModalVisible(true);
  }, [isAuthenticated, profileUserId, showFeedback, t]);

  const submitAdvertiserReport = useCallback(async () => {
    if (!profileUserId) return;
    if (!selectedReportReason) {
      showFeedback(t("common.error"), t("profile.reportReasonRequired"), "error");
      return;
    }
    try {
      await reportAdvertiser({
        advertiserId: profileUserId,
        reason: selectedReportReason,
        details: reportFreeText.trim() || null,
      }).unwrap();
      setReportModalVisible(false);
      showFeedback(t("common.done"), t("profile.reportAdvertiserSuccess"), "success");
    } catch {
      showFeedback(t("common.error"), t("errors.generic"), "error");
    }
  }, [profileUserId, reportAdvertiser, reportFreeText, selectedReportReason, showFeedback, t]);

  const handleMorePress = useCallback(() => {
    if (!profileUserId) return;

    // replaced by popover menu
    openMoreMenu();
  }, [profileUserId]);

  const moreButtonRef = useRef<View>(null);
  const [moreMenu, setMoreMenu] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  });

  const closeMoreMenu = useCallback(() => {
    setMoreMenu((s) => ({ ...s, visible: false }));
  }, []);

  const openMoreMenu = useCallback(() => {
    const node: any = moreButtonRef.current;
    if (!node?.measureInWindow) {
      setMoreMenu({ visible: true, x: wp(50), y: hp(12) });
      return;
    }
    node.measureInWindow((x: number, y: number, w: number, h: number) => {
      const menuWidth = wp(46);
      const nextX = Math.max(wp(4), x + w - menuWidth);
      const nextY = y + h + hp(1);
      setMoreMenu({ visible: true, x: nextX, y: nextY });
    });
  }, []);

  const handlePropertyPress = useCallback(
    (item: Property) => {
      navigateToListings("PropertyDetails", {
        propertyId: item.id,
        visiblePropertyIds: filteredAds.map((p) => p.id),
        listingType: item.listingType,
      });
    },
    [navigateToListings, filteredAds]
  );

  const renderItem: ListRenderItem<Property> = useCallback(
    ({ item }) => {
      const { title, priceLine, listingTypeForCard } = buildProfileAdCardLines(
        item,
        t,
        i18n.language
      );
      return (
        <View style={styles.cardRow}>
          <PropertyCard
            property={item}
            onPress={() => handlePropertyPress(item)}
            title={title || t("listings.property")}
            priceLine={priceLine || t("listings.priceNotAvailable")}
            listingType={listingTypeForCard}
          />
        </View>
      );
    },
    [t, i18n.language, handlePropertyPress]
  );

  const keyExtractor = useCallback((item: Property) => String(item.id), []);

  const rtlStyles = useMemo(
    () => ({
      rightIconsContainer: {
        flexDirection: isRTL ? "row-reverse" : "row",
      } as ViewStyle,
      profileName: {
        textAlign: (isRTL ? "right" : "center") as "center" | "right" | "left",
      },
      emptyText: {
        textAlign: (isRTL ? "right" : "center") as "center" | "right" | "left",
      },
    }),
    [isRTL]
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <View style={styles.profilePlaceholder}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatarFill}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("../../../assets/User.png")}
              style={styles.userImage}
              resizeMode="cover"
            />
          )}
        </View>
        {displayName.length > 0 ? (
          <Text style={[styles.profileName, rtlStyles.profileName]} numberOfLines={2}>
            {displayName}
          </Text>
        ) : null}
        <UserInfoCard sinceDate={sinceDisplay} lastSeen={lastSeenDisplay} />
        <ProfileAdsTabs
          activeTab={adsTab}
          onTabChange={setAdsTab}
          currentCount={current.length}
          archivedCount={archived.length}
        />
        <ListingTypeSegmentFilter value={listingTypeFilter} onChange={setListingTypeFilter} />
      </View>
    ),
    [
      avatarUri,
      displayName,
      rtlStyles.profileName,
      adsTab,
      current.length,
      archived.length,
      listingTypeFilter,
      sinceDisplay,
      lastSeenDisplay,
    ]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("profile.userProfileAdsTitle", { count: headerTitleCount })}
        onBackPress={handleBackPress}
        fontWeightBold={true}
        backButtonColor={COLORS.primary}
        rightComponent={
          <View style={[styles.rightIconsContainer, rtlStyles.rightIconsContainer]}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSharePress}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social" size={wp(6)} color={COLORS.primary} />
            </TouchableOpacity>
            <View ref={moreButtonRef} collapsable={false}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={openMoreMenu}
                activeOpacity={0.7}
                disabled={isHidingAdvertiser || isReportingAdvertiser}
              >
                <Ionicons name="ellipsis-vertical" size={wp(6)} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        }
        showRightSide={true}
      />
      <Modal
        visible={moreMenu.visible}
        transparent
        animationType="fade"
        onRequestClose={closeMoreMenu}
      >
        <Pressable style={styles.popoverBackdrop} onPress={closeMoreMenu}>
          <Pressable
            style={[styles.popoverMenu, { left: moreMenu.x, top: moreMenu.y }]}
            onPress={() => {}}
          >
            <Pressable
              style={styles.popoverItem}
              onPress={() => {
                closeMoreMenu();
                openReportModal();
              }}
            >
              <Text style={styles.popoverItemText}>{t("profile.reportAdvertiserAction")}</Text>
            </Pressable>
            <View style={styles.popoverDivider} />
            <Pressable
              style={styles.popoverItem}
              onPress={() => {
                closeMoreMenu();
                handleHideAdvertiserPress();
              }}
            >
              <Text style={[styles.popoverItemText, styles.popoverItemTextDanger]}>
                {t("profile.hideAdvertiserAction")}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        visible={hideConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHideConfirmVisible(false)}
      >
        <Pressable
          style={styles.reportBackdrop}
          onPress={() => {
            if (isHidingAdvertiser) return;
            setHideConfirmVisible(false);
          }}
        >
          <Pressable style={styles.reportCard} onPress={() => {}}>
            <View style={styles.reportHeaderRow}>
              <Text style={styles.reportTitle}>{t("profile.hideAdvertiserAction")}</Text>
              <Pressable
                style={styles.reportCloseButton}
                onPress={() => setHideConfirmVisible(false)}
                disabled={isHidingAdvertiser}
              >
                <Ionicons name="close" size={wp(5)} color="#6b7280" />
              </Pressable>
            </View>
            <Text style={styles.reportSubtitle}>{t("profile.hideAdvertiserConfirm")}</Text>
            <View style={styles.reportActionsRow}>
              <Pressable
                style={styles.reportCancelButton}
                onPress={() => setHideConfirmVisible(false)}
                disabled={isHidingAdvertiser}
              >
                <Text style={styles.reportCancelText}>{t("common.cancel")}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.reportSubmitButton,
                  isHidingAdvertiser && styles.reportSubmitButtonDisabled,
                ]}
                onPress={async () => {
                  if (!profileUserId) return;
                  try {
                    await hideAdvertiser({ advertiserId: profileUserId }).unwrap();
                    setHideConfirmVisible(false);
                    showFeedback(
                      t("common.done"),
                      t("profile.hideAdvertiserSuccess"),
                      "success",
                      () => navigation.goBack()
                    );
                  } catch {
                    setHideConfirmVisible(false);
                    showFeedback(t("common.error"), t("errors.generic"), "error");
                  }
                }}
                disabled={isHidingAdvertiser}
              >
                <Text style={styles.reportSubmitText}>
                  {isHidingAdvertiser ? t("common.loading") : t("profile.hideAdvertiserAction")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeReportModal}
      >
        <Pressable style={styles.reportBackdrop} onPress={closeReportModal}>
          <Pressable style={styles.reportCard} onPress={() => {}}>
            <View style={styles.reportHeaderRow}>
              <Text style={styles.reportTitle}>{t("profile.reportAdvertiserTitle")}</Text>
              <Pressable
                style={styles.reportCloseButton}
                onPress={closeReportModal}
                disabled={isReportingAdvertiser}
              >
                <Ionicons name="close" size={wp(5)} color="#6b7280" />
              </Pressable>
            </View>
            <Text style={styles.reportSubtitle}>{t("profile.reportAdvertiserSubtitle")}</Text>

            <View style={styles.reportReasonGrid}>
              {reportReasonOptions.map((opt) => {
                const selected = selectedReportReason === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    style={[
                      styles.reportReasonChip,
                      selected && styles.reportReasonChipSelected,
                    ]}
                    onPress={() => setSelectedReportReason(opt.key)}
                    disabled={isReportingAdvertiser}
                  >
                    <Text
                      style={[
                        styles.reportReasonChipText,
                        selected && styles.reportReasonChipTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.reportDetailsLabel}>{t("profile.reportDetailsOptional")}</Text>
            <RNTextInput
              value={reportFreeText}
              onChangeText={setReportFreeText}
              placeholder={t("profile.reportDetailsPlaceholder")}
              placeholderTextColor="#9ca3af"
              style={styles.reportDetailsInput}
              multiline
              editable={!isReportingAdvertiser}
              textAlignVertical="top"
            />

            <View style={styles.reportActionsRow}>
              <Pressable
                style={styles.reportCancelButton}
                onPress={closeReportModal}
                disabled={isReportingAdvertiser}
              >
                <Text style={styles.reportCancelText}>{t("common.cancel")}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.reportSubmitButton,
                  isReportingAdvertiser && styles.reportSubmitButtonDisabled,
                ]}
                onPress={submitAdvertiserReport}
                disabled={isReportingAdvertiser}
              >
                <Text style={styles.reportSubmitText}>
                  {isReportingAdvertiser ? t("common.loading") : t("common.submit")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        visible={feedback.visible}
        transparent
        animationType="fade"
        onRequestClose={closeFeedback}
      >
        <Pressable style={styles.feedbackBackdrop} onPress={closeFeedback}>
          <Pressable style={styles.feedbackCard} onPress={() => {}}>
            <View style={styles.feedbackHeaderRow}>
              <View
                style={[
                  styles.feedbackDot,
                  feedback.variant === "success" ? styles.feedbackDotSuccess : styles.feedbackDotError,
                ]}
              />
              <Text style={styles.feedbackTitle}>{feedback.title}</Text>
              <Pressable style={styles.feedbackCloseButton} onPress={closeFeedback}>
                <Ionicons name="close" size={wp(5)} color="#6b7280" />
              </Pressable>
            </View>
            <Text style={styles.feedbackMessage}>{feedback.message}</Text>
            <View style={styles.feedbackActionsRow}>
              <Pressable style={styles.feedbackOkButton} onPress={closeFeedback}>
                <Text style={styles.feedbackOkText}>{t("common.ok")}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <FlatList
        data={filteredAds}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <Text style={[styles.emptyText, rtlStyles.emptyText]}>
            {t("profile.noAdsFound")}
          </Text>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  rightIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
  iconButton: {
    padding: wp(1),
  },
  popoverBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  popoverMenu: {
    position: "absolute",
    width: wp(46),
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: hp(0.8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  popoverItem: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
  },
  popoverItemText: {
    fontSize: wp(4),
    color: COLORS.text,
  },
  popoverItemTextDanger: {
    color: "#dc2626",
  },
  popoverDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e7eb",
    marginHorizontal: wp(3),
  },
  reportBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: wp(5),
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: wp(4.5),
  },
  reportHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reportTitle: {
    fontSize: wp(4.6),
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },
  reportCloseButton: {
    padding: wp(1),
    marginLeft: wp(2),
  },
  reportSubtitle: {
    marginTop: hp(0.8),
    fontSize: wp(3.6),
    color: "#6b7280",
  },
  reportReasonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2.2),
    marginTop: hp(1.6),
  },
  reportReasonChip: {
    paddingVertical: hp(0.9),
    paddingHorizontal: wp(3),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  reportReasonChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(37, 99, 235, 0.08)",
  },
  reportReasonChipText: {
    fontSize: wp(3.5),
    color: COLORS.text,
  },
  reportReasonChipTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  reportDetailsLabel: {
    marginTop: hp(2),
    fontSize: wp(3.6),
    color: COLORS.text,
    fontWeight: "600",
  },
  reportDetailsInput: {
    marginTop: hp(0.8),
    minHeight: hp(12),
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    fontSize: wp(3.7),
    color: COLORS.text,
  },
  reportActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: wp(2.5),
    marginTop: hp(2),
  },
  reportCancelButton: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  reportCancelText: {
    color: "#111827",
    fontSize: wp(3.7),
    fontWeight: "600",
  },
  reportSubmitButton: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  reportSubmitButtonDisabled: {
    opacity: 0.6,
  },
  reportSubmitText: {
    color: "#fff",
    fontSize: wp(3.7),
    fontWeight: "700",
  },
  feedbackBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: wp(6),
  },
  feedbackCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: wp(4.5),
  },
  feedbackHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2.5),
  },
  feedbackDot: {
    width: wp(2.6),
    height: wp(2.6),
    borderRadius: wp(1.3),
  },
  feedbackDotSuccess: {
    backgroundColor: "#16a34a",
  },
  feedbackDotError: {
    backgroundColor: "#dc2626",
  },
  feedbackTitle: {
    flex: 1,
    fontSize: wp(4.4),
    fontWeight: "700",
    color: COLORS.text,
  },
  feedbackCloseButton: {
    padding: wp(1),
  },
  feedbackMessage: {
    marginTop: hp(1.2),
    fontSize: wp(3.7),
    color: "#374151",
  },
  feedbackActionsRow: {
    marginTop: hp(2),
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  feedbackOkButton: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(5),
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  feedbackOkText: {
    color: "#111827",
    fontSize: wp(3.7),
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
    flexGrow: 1,
  },
  listHeader: {
    alignItems: "center",
    paddingTop: hp(4),
    width: "100%",
  },
  profilePlaceholder: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    backgroundColor: COLORS.textTertiary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(1.5),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  avatarFill: {
    width: "100%",
    height: "100%",
  },
  userImage: {
    width: "100%",
    height: "100%",
    bottom: wp(-3),
  },
  profileName: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(2),
    paddingHorizontal: wp(2),
    width: "100%",
    textAlign: "center",
  },
  cardRow: {
    width: "100%",
    marginBottom: hp(0.65),
  },
  emptyText: {
    marginTop: hp(3),
    fontSize: wp(4),
    color: COLORS.textSecondary,
    width: "100%",
    textAlign: "center",
  },
});
