import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Share,
  Alert,
  Modal,
  TextInput as RNTextInput,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  RENT_FILTER_OPTIONS,
  SALE_FILTER_OPTIONS,
} from "../../data/propertyData";
import {
  openPhoneDialer,
  openWhatsApp,
  getDefaultImageUrl,
  isOnlyDefaultPropertyPlaceholderImages,
  navigateToMapScreen,
  getPropertyById,
  buildDefaultRentPaymentRows,
  buildPropertyInfoRows,
  buildDynamicFeatureLabels,
  isPublishedListingProperty,
  normalizeAdvertiserPhoneForTel,
  normalizeAdvertiserPhoneForWhatsApp,
  type DetailIconSpec,
} from "../../utils";
import {
  FeatureItem,
  PropertyImageGallery,
  PropertyHeader,
  PropertyLocation,
  PropertyAdvertiser,
  PropertyTabs,
  PropertyBottomBar,
  AverageCard,
  AverageSaleCard,
  IconButton,
  RentPaymentsSection,
} from "../../components";
import type { Property, RentSaleProperty } from "../../types/property";
import type { CalendarDates } from "../../hooks/useCalendar";
import type { TabType } from "../../components/property/PropertyTabs";
import { COLORS } from "@/constants";
import { getMarketingRequestCategoryTranslationKey } from "@/constants/categories";
import {
  useLocalization,
  usePropertyDetailNavigation,
  useTabNavigation,
} from "../../hooks";
import {
  useGetPublicListingByIdQuery,
  useGetMyFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useReportListingMutation,
} from "@/redux/api";
import { mapApiListingToProperty } from "@/utils/apiListingMapper";
import { registerApiListingProperties } from "@/utils/propertyLookup";
import { useIsAuthenticated } from "@/context/auth-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  propertyId: number;
  /** Backend listing UUID — loads fresh detail from API when set. */
  listingId?: string;
  selectedDates?: CalendarDates;
  visiblePropertyIds?: number[];
  listingType?: string;
}

export default function PropertyDetailsScreen(): React.JSX.Element {
  const route = useRoute();
  const params = route.params as RouteParams;
  const {
    propertyId,
    listingId,
    selectedDates: passedDates,
    visiblePropertyIds = [],
    listingType: passedListingType,
  } = params;
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocalization();
  const { isAuthenticated } = useIsAuthenticated();

  const { data: listingDto } = useGetPublicListingByIdQuery(listingId!, {
    skip: !listingId,
  });

  const {
    data: favoritesData,
    refetch: refetchFavorites,
    isFetching: isFetchingFavorites,
  } = useGetMyFavoritesQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const propertyFromApi = useMemo(() => {
    if (!listingDto) return undefined;
    return mapApiListingToProperty(listingDto);
  }, [listingDto]);

  useEffect(() => {
    if (propertyFromApi) {
      registerApiListingProperties([propertyFromApi]);
    }
  }, [propertyFromApi]);

  const stickyHeaderHeight =
    insets.top + (Platform.OS === "ios" ? hp(8) : hp(7));

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<TabType>("main");
  const [expandedDescription, setExpandedDescription] =
    useState<boolean>(false);
  const [descriptionExceedsThreeLines, setDescriptionExceedsThreeLines] =
    useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [favorited, setFavorited] = useState<boolean>(false);
  const [showStickyHeader, setShowStickyHeader] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState<string>("");
  const [reportDetails, setReportDetails] = useState<string>("");
  const [reportListing, { isLoading: isReporting }] =
    useReportListingMutation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-200)).current; // Start fully off-screen (hidden)
  const scrollViewRef = useRef<ScrollView>(null);

  const property = useMemo(() => {
    if (propertyFromApi) return propertyFromApi;
    return getPropertyById(propertyId);
  }, [propertyFromApi, propertyId]);

  useEffect(() => {
    if (!property?.serverListingId || !favoritesData?.favorites) return;
    const ids = new Set(favoritesData.favorites.map((f) => f.listingId));
    setFavorited(ids.has(property.serverListingId));
  }, [property?.serverListingId, favoritesData]);

  // Ensure favorite state is restored after app relaunch / returning to screen.
  // RTK Query cache is in-memory; after reload we must refetch.
  useEffect(() => {
    if (!isAuthenticated || !property?.serverListingId) return;
    // Avoid spamming when the query is already in flight.
    if (isFetchingFavorites) return;
    refetchFavorites();
  }, [isAuthenticated, property?.serverListingId]);

  useEffect(() => {
    setExpandedDescription(false);
    setDescriptionExceedsThreeLines(false);
  }, [propertyId]);

  const {
    filteredVisiblePropertyIds,
    canGoPrev,
    canGoNext,
    handlePrevProperty,
    handleNextProperty,
    panResponder,
  } = usePropertyDetailNavigation({
    propertyId,
    visiblePropertyIds,
    dates: passedDates,
    listingType: passedListingType,
    navigation,
    selectedDatesForReplace: passedDates,
    useFilteredIdsForReplace: true,
  });

  const handleImageScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const rawIndex = Math.round(scrollPosition / SCREEN_WIDTH);
      // When RTL is active and gallery is inverted, adjust index calculation
      const imagesLength = property?.images?.length || 1;
      const index =
        isRTL && imagesLength > 0 ? imagesLength - 1 - rawIndex : rawIndex;
      setCurrentImageIndex(index);
    },
    [isRTL, property?.images?.length],
  );

  /** Mock catalog listings omit `advertiserPhone`; published ads (id ≥ 500000) must use stored publisher number only. */
  const resolvedAdvertiserPhoneForContact = useMemo(() => {
    if (!property) return "";
    const raw = property.advertiserPhone?.trim();
    if (raw) return raw;
    if (property.serverListingId) return "";
    if (property.id < 500000) return "+966123456789";
    return "";
  }, [property]);

  const hasAdvertiserContactPhone = useMemo(
    () =>
      Boolean(
        normalizeAdvertiserPhoneForTel(
          resolvedAdvertiserPhoneForContact || undefined,
        ),
      ),
    [resolvedAdvertiserPhoneForContact],
  );

  const handleCall = useCallback(() => {
    const tel = normalizeAdvertiserPhoneForTel(
      resolvedAdvertiserPhoneForContact || undefined,
    );
    if (!tel) return;
    openPhoneDialer(tel).catch((e: any) => {
      Alert.alert(
        t("common.error"),
        e?.message || t("common.somethingWentWrong") || "Something went wrong.",
      );
    });
  }, [resolvedAdvertiserPhoneForContact]);

  const handleWhatsApp = useCallback(() => {
    const wa = normalizeAdvertiserPhoneForWhatsApp(
      resolvedAdvertiserPhoneForContact || undefined,
    );
    if (!wa) return;
    openWhatsApp(wa).catch((e: any) => {
      Alert.alert(
        t("common.error"),
        e?.message || t("common.somethingWentWrong") || "Something went wrong.",
      );
    });
  }, [resolvedAdvertiserPhoneForContact]);

  const handleShare = useCallback(async () => {
    if (!property) return;

    const metaLocation = String(
      (property.listingMetadata as any)?.locationDisplayName ?? "",
    ).trim();
    const title =
      (metaLocation ||
        property.address?.trim() ||
        property.city?.trim() ||
        property.categoryLabel?.trim() ||
        t("listings.property")) ??
      "Listing";

    const locationParts = [
      metaLocation || null,
      property.city?.trim() ? property.city.trim() : null,
    ].filter(Boolean) as string[];
    const locationLine = locationParts.length ? locationParts[0] : "";

    const advertiserName = property.advertiserName?.trim() || "";
    const contactPhone = resolvedAdvertiserPhoneForContact?.trim() || "";

    const rentSale =
      property.listingType !== "daily" && "price" in property
        ? (property as RentSaleProperty)
        : undefined;
    const priceRaw = rentSale?.price ? String(rentSale.price).trim() : "";

    const facts: string[] = [];
    if (Number.isFinite(property.bedrooms) && property.bedrooms > 0) {
      facts.push(`${t("listings.bedrooms")}: ${property.bedrooms}`);
    }
    if (Number.isFinite(property.restrooms) && property.restrooms > 0) {
      facts.push(`${t("listings.bathrooms")}: ${property.restrooms}`);
    }
    if (Number.isFinite(property.area) && property.area > 0) {
      facts.push(`${t("listings.area")}: ${property.area}`);
    }

    const listingTypeLabel =
      property.listingType === "sale"
        ? t("listings.forSale")
        : property.listingType === "rent"
          ? t("listings.forRent")
          : t("listings.property");

    const description = (property.description ?? "").trim();

    const lines: string[] = [];
    lines.push(`${title} • ${listingTypeLabel}`);
    if (priceRaw) {
      lines.push(`${t("listings.price")}: ${priceRaw} ${t("listings.sar")}`);
    }
    if (locationLine) {
      lines.push(`${t("listings.location") ?? "Location"}: ${locationLine}`);
    }
    if (facts.length) {
      lines.push(facts.join(" · "));
    }
    if (advertiserName || contactPhone) {
      lines.push("");
      lines.push(t("listings.advertiserInformation") ?? "Advertiser");
      if (advertiserName) lines.push(`${t("profile.name")}: ${advertiserName}`);
      if (contactPhone)
        lines.push(`${t("profile.phoneNumber")}: ${contactPhone}`);
    }
    if (description) {
      lines.push("");
      lines.push(description);
    }

    const message = lines.join("\n");
    try {
      await Share.share({ message, title });
    } catch {
      // dismissed
    }
  }, [property, resolvedAdvertiserPhoneForContact, t]);

  const openReportModal = useCallback(() => {
    setReportReason("");
    setReportDetails("");
    setIsReportModalVisible(true);
  }, []);

  const closeReportModal = useCallback(() => {
    if (isReporting) return;
    setIsReportModalVisible(false);
  }, [isReporting]);

  const submitReport = useCallback(async () => {
    const sid = property?.serverListingId;
    if (!sid) {
      Alert.alert(t("common.error"), "Listing ID is missing.");
      return;
    }
    const reason = reportReason.trim();
    if (!reason) {
      Alert.alert(
        t("common.error"),
        t("listings.reportAdReasonRequired") ?? "Please choose a reason.",
      );
      return;
    }
    try {
      await reportListing({
        listingId: sid,
        reason,
        details: reportDetails.trim() || null,
      }).unwrap();
      setIsReportModalVisible(false);
      Alert.alert(
        t("common.success"),
        t("listings.reportSubmitted") ?? "Report submitted.",
      );
    } catch (e: any) {
      Alert.alert(
        t("common.error"),
        e?.data?.message || e?.message || "Could not submit report.",
      );
    }
  }, [
    property?.serverListingId,
    reportReason,
    reportDetails,
    reportListing,
    t,
  ]);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Use navigateToMapScreen to go to correct map (MapLanding/DailyMap/ProjectsMap)
      // and preserve map state via popToTop when possible
      navigateToMapScreen(navigation);
    }
  }, [navigation]);

  // Like feature removed (keep state for legacy/local listings only if needed elsewhere).
  const toggleLike = useCallback(() => {
    setLiked((prev) => !prev);
  }, []);

  const toggleFavorite = useCallback(async () => {
    if (!property?.serverListingId) {
      setFavorited((prev) => !prev);
      return;
    }
    if (!isAuthenticated) {
      Alert.alert(
        t("common.error"),
        t("auth.loginRequired") ?? "Please log in to save favorites.",
      );
      return;
    }
    const sid = property.serverListingId;
    const next = !favorited;
    setFavorited(next);
    try {
      if (!next) {
        await removeFavorite({ listingId: sid }).unwrap();
      } else {
        await addFavorite({ listingId: sid }).unwrap();
      }
    } catch {
      // rollback on failure
      setFavorited(!next);
    }
  }, [
    property?.serverListingId,
    isAuthenticated,
    favorited,
    addFavorite,
    removeFavorite,
    t,
  ]);

  const openImageViewer = useCallback(() => {
    const images =
      property?.images && property.images.length > 0
        ? property.images
        : [getDefaultImageUrl()];
    const imageCaptionsForMedia =
      property?.images?.length && property?.imageCaptions?.length
        ? property.images.map((_uri, idx) =>
            (property.imageCaptions?.[idx] ?? "").trim(),
          )
        : undefined;
    navigation.navigate("ListingMedia", {
      images,
      ...(imageCaptionsForMedia
        ? { imageCaptions: imageCaptionsForMedia }
        : {}),
      ...(property?.videoUris?.length ? { videoUris: property.videoUris } : {}),
    });
  }, [navigation, property]);

  const expandDescription = useCallback(() => {
    setExpandedDescription(true);
  }, []);

  const descriptionText = (property?.description ?? "").trim();

  const listingIdText = useMemo(() => {
    if (property?.serverListingId) {
      return property.serverListingId;
    }
    if (typeof property?.listingId === "number") {
      return String(property.listingId);
    }
    return String(property?.id ?? "---");
  }, [property?.id, property?.listingId, property?.serverListingId]);

  const createdAtText = useMemo(() => {
    if (!property?.createdAt) return "---";
    const createdDate = new Date(property.createdAt);
    if (Number.isNaN(createdDate.getTime())) return "---";
    return createdDate.toLocaleString(isRTL ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [property?.createdAt, isRTL]);

  const dynamicFeatureLabels = useMemo(
    () => buildDynamicFeatureLabels(property, t),
    [property, t],
  );

  const isPublishedListing = useMemo(
    () => isPublishedListingProperty(property),
    [property],
  );

  const propertyInfoRows = useMemo(
    () => buildPropertyInfoRows(property, t),
    [property, t],
  );

  const propertyFeatureRows = useMemo(() => {
    if (property?.serverListingId) {
      return dynamicFeatureLabels;
    }
    if (dynamicFeatureLabels.length > 0 || isPublishedListing) {
      return dynamicFeatureLabels;
    }
    return [
      t("listings.water"),
      t("listings.electricity"),
      t("listings.privateRoofFeature"),
      t("listings.specialEntrance"),
      t("listings.nearBusFeature"),
    ];
  }, [property?.serverListingId, dynamicFeatureLabels, isPublishedListing, t]);

  const handleDescriptionTextLayout = useCallback(
    (e: { nativeEvent: { lines: unknown[] } }) => {
      if (e.nativeEvent.lines.length > 3) {
        setDescriptionExceedsThreeLines(true);
      }
    },
    [],
  );

  const handleTabPress = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleCopyId = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(listingIdText);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1500);
    } catch {
      Alert.alert(t("common.error"), "Could not copy to clipboard.");
    }
  }, [listingIdText, t]);

  const handleAdvertiserRowPress = useCallback(() => {
    const advertiserId = property?.advertiserId;
    if (!advertiserId) {
      navigation.navigate("UserProfileAds");
      return;
    }
    navigation.navigate("UserProfileAds", {
      userId: String(advertiserId),
      userName: property?.advertiserName ?? "",
    });
  }, [navigation, property?.advertiserId, property?.advertiserName]);
  const { navigateToProfile } = useTabNavigation();
  // Financing options are disabled (feature not implemented yet).

  const handleAverageCardPress = useCallback(() => {
    if (!property) return;
    navigation.navigate("AveragePriceDetail", {
      property,
      averageType: property.listingType === "rent" ? "rent" : "sale",
    });
  }, [navigation, property]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      // Show sticky header only when scrolled past image gallery (approximately hp(30))
      const threshold = hp(30) - hp(10); // Show header slightly before image ends
      const shouldShow = offsetY > threshold;

      if (shouldShow !== showStickyHeader) {
        setShowStickyHeader(shouldShow);
        // Animate header sliding down/up - hide fully off-screen when not shown
        Animated.timing(headerTranslateY, {
          toValue: shouldShow ? 0 : -stickyHeaderHeight,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }

      // Update animated value for potential future animations
      scrollY.setValue(offsetY);
    },
    [scrollY, showStickyHeader, headerTranslateY, stickyHeaderHeight],
  );

  const propertyImages = useMemo((): string[] => {
    if (!property) return [];
    if (property.images && property.images.length > 0) return property.images;
    return [getDefaultImageUrl()];
  }, [property]);

  const propertyImageCaptions = useMemo(() => {
    if (!property?.images?.length || !property.imageCaptions?.length)
      return undefined;
    return property.images.map((_uri, idx) =>
      (property.imageCaptions?.[idx] ?? "").trim(),
    );
  }, [property]);

  const isPlaceholderGalleryOnly = useMemo(
    () => isOnlyDefaultPropertyPlaceholderImages(propertyImages),
    [propertyImages],
  );

  if (!property) {
    return (
      <View style={styles.center}>
        <Text style={isRTL && styles.centerTextRTL}>
          {t("listings.propertyNotFound")}
        </Text>
      </View>
    );
  }

  // Helper function to translate property type
  const getTranslatedTypeLabel = useCallback(
    (type: string, filterOptions: any[]) => {
      const opt = filterOptions.find((o) => o.type === type);
      if (!opt) return type;

      // Try to find translation in propertyTypes
      const translationKey = `listings.propertyTypes.${type}`;
      const translated = t(translationKey);

      // If translation exists and is different from the key, use it
      if (translated && translated !== translationKey) {
        return translated;
      }

      // Fallback to filter option label
      return opt.label;
    },
    [t],
  );

  // Get type label from filter options
  const getPropertyTypeLabel = useCallback(() => {
    if (property.categoryLabel?.trim()) {
      return property.categoryLabel.trim();
    }
    if (property.categoryId?.trim()) {
      const key = getMarketingRequestCategoryTranslationKey(
        property.categoryId.trim(),
      );
      if (key) {
        return t(key);
      }
    }
    let filterOptions;
    if (property.listingType === "rent") filterOptions = RENT_FILTER_OPTIONS;
    else filterOptions = SALE_FILTER_OPTIONS;

    return getTranslatedTypeLabel(property.type, filterOptions);
  }, [property, getTranslatedTypeLabel, t]);

  const parseCompactPrice = useCallback((rawPrice: string): number | null => {
    const trimmed = rawPrice.trim();
    if (!trimmed) return null;
    const kMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*K$/i);
    if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
    const mMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*M$/i);
    if (mMatch) return Math.round(parseFloat(mMatch[1]) * 1000000);
    const digits = trimmed.replace(/[^\d]/g, "");
    if (!digits) return null;
    return Number(digits);
  }, []);

  const typeLabel = getPropertyTypeLabel();
  const listingText =
    property.categoryLabel || property.categoryId
      ? ""
      : property.listingType === "rent"
        ? t("listings.forRent")
        : property.listingType === "sale"
          ? t("listings.forSale")
          : "";

  const displayPrice = useMemo(() => {
    const formatNumeric = (value: number) =>
      value.toLocaleString(isRTL ? "ar-SA" : "en-US");
    if (property.listingType === "rent") {
      const rentProperty = property as any;
      const parsed = parseCompactPrice(String(rentProperty.price ?? ""));
      if (parsed != null) {
        return `${formatNumeric(parsed)} ${t("listings.sar")}`;
      }
      return `${String(rentProperty.price ?? "---")} ${t("listings.sar")}`;
    } else if (property.listingType === "sale") {
      const saleProperty = property as any;
      const parsed = parseCompactPrice(String(saleProperty.price ?? ""));
      if (parsed != null) {
        return `${formatNumeric(parsed)} ${t("listings.sar")}`;
      }
      return `${String(saleProperty.price ?? "---")} ${t("listings.sar")}`;
    }
    return "";
  }, [isRTL, parseCompactPrice, property, t]);

  const rentPaymentRows = useMemo(() => {
    if (property.listingType !== "rent") return [];
    const rent = property as RentSaleProperty;
    const schedule = rent.rentPaymentSchedule;
    if (Array.isArray(schedule) && schedule.length > 0) {
      return schedule;
    }
    const parsed = parseCompactPrice(String(rent.price ?? ""));
    if (parsed == null) return [];
    return buildDefaultRentPaymentRows(parsed);
  }, [property, parseCompactPrice]);

  const renderDetailIcon = useCallback(
    (icon: DetailIconSpec | null | undefined) => {
      if (icon == null) {
        return null;
      }
      const size = wp(5);
      const color = "#9ca3af";

      if (icon.library === "MaterialCommunityIcons") {
        return (
          <MaterialCommunityIcons
            name={icon.name as any}
            size={size}
            color={color}
          />
        );
      }
      if (icon.library === "Feather") {
        return <Feather name={icon.name as any} size={size} color={color} />;
      }
      return <Ionicons name={icon.name as any} size={size} color={color} />;
    },
    [],
  );

  return (
    <>
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* Icons - Always visible, absolute positioned */}
        <View
          style={[
            styles.headerIcons,
            isRTL && styles.headerIconsRTL,
            { paddingTop: insets.top },
          ]}
        >
          <IconButton onPress={handleBackPress}>
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={wp(6)}
              color={COLORS.backButton}
            />
          </IconButton>
          <View style={styles.headerIconsSpacer} />
          <View
            style={[
              styles.headerIconsRight,
              isRTL && styles.headerIconsRightRTL,
            ]}
          >
            <IconButton onPress={handleShare}>
              <Ionicons
                name="share-social-outline"
                size={wp(5.5)}
                color={COLORS.backButton}
              />
            </IconButton>
            <IconButton onPress={toggleFavorite}>
              <Ionicons
                name={favorited ? "heart" : "heart-outline"}
                size={wp(5.5)}
                color={COLORS.backButton}
              />
            </IconButton>
          </View>
        </View>

        {/* Sticky Header Background - only visible when scrolled past gallery */}
        <Animated.View
          pointerEvents={showStickyHeader ? "auto" : "none"}
          style={[
            styles.stickyHeaderBackground,
            {
              height: stickyHeaderHeight,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        />

        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Image Gallery - now inside ScrollView so it scrolls */}
          <View style={styles.publishGallerySection}>
            <PropertyImageGallery
              images={propertyImages}
              imageCaptions={propertyImageCaptions}
              currentIndex={currentImageIndex}
              onImageScroll={handleImageScroll}
              onImageViewerOpen={openImageViewer}
              onBackPress={handleBackPress}
              onLikePress={toggleLike}
              onSharePress={handleShare}
              onFavoritePress={toggleFavorite}
              liked={liked}
              favorited={favorited}
              showStickyHeader={showStickyHeader}
            />
          </View>
          {/* Property Header */}
          <View style={styles.headerContainer}>
            <PropertyHeader
              property={property}
              typeLabel={typeLabel}
              listingText={listingText}
              displayPrice={displayPrice}
            />
          </View>

          {/* Average Card - Only for Rent */}
          {property.listingType === "rent" && (
            <AverageCard property={property} onPress={handleAverageCardPress} />
          )}

          {/* Financing Options Card and Average Sale Card - Only for Sale */}
          {property.listingType === "sale" && (
            <>
              <AverageSaleCard
                property={property}
                onPress={handleAverageCardPress}
              />
            </>
          )}

          {/* Property Information */}
          {propertyInfoRows.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text
                style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}
              >
                {t("listings.propertyInformation")}
              </Text>
              <View style={styles.infoList}>
                {propertyInfoRows.map((item, index) => (
                  <View
                    key={`${item.label}-${item.icon?.name ?? "no-icon"}-${index}`}
                    style={[
                      styles.publishAlignedInfoRow,
                      isRTL && styles.publishAlignedRowReverse,
                      index === propertyInfoRows.length - 1 &&
                        styles.lastListItemBorder,
                      {
                        backgroundColor:
                          index % 2 === 0 ? COLORS.white : COLORS.background,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.publishAlignedInfoLeft,
                        isRTL && styles.publishAlignedRowReverse,
                      ]}
                    >
                      {item.icon != null ? (
                        renderDetailIcon(item.icon)
                      ) : (
                        <View style={styles.publishAlignedIconSpacer} />
                      )}
                      <Text
                        style={[
                          styles.publishAlignedInfoLabel,
                          isRTL && styles.sectionTitleRTL,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.publishAlignedInfoValueColumn,
                        isRTL && styles.publishAlignedInfoValueColumnRTL,
                      ]}
                    >
                      <Text
                        style={[
                          styles.publishAlignedInfoValueText,
                          isRTL && styles.sectionTitleRTL,
                        ]}
                      >
                        {item.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.sectionSeparator} />
            </View>
          )}

          {/* Property Features */}
          {propertyFeatureRows.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text
                style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}
              >
                {t("listings.propertyFeatures")}
              </Text>
              <View style={styles.featuresList}>
                {propertyFeatureRows
                  .map((label) => ({ label }))
                  .reduce<{ label: string; index: number }[][]>(
                    (rows, item, index) => {
                      const rowIndex = Math.floor(index / 2);
                      if (!rows[rowIndex]) {
                        rows[rowIndex] = [];
                      }
                      rows[rowIndex].push({ ...item, index });
                      return rows;
                    },
                    [],
                  )
                  .map((row, rowIndex) => (
                    <View
                      key={rowIndex}
                      style={[
                        styles.featureRow,
                        isRTL && styles.featureRowRTL,
                        rowIndex ===
                          Math.ceil(propertyFeatureRows.length / 2) - 1 &&
                          styles.lastListItemBorder,
                        {
                          backgroundColor:
                            rowIndex % 2 === 0 ? "#fff" : COLORS.background,
                        },
                      ]}
                    >
                      {row.map((item, itemIndex) => (
                        <FeatureItem
                          key={`${item.label}-${rowIndex}-${itemIndex}`}
                          label={item.label}
                          backgroundColor="transparent"
                          showBorder={itemIndex === 0 && row.length === 2}
                        />
                      ))}
                    </View>
                  ))}
              </View>
              <View style={styles.sectionSeparator} />
            </View>
          )}

          {/* Extra / Description */}
          <View style={styles.extraSection}>
            <Text
              style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}
            >
              {t("listings.extra")}
            </Text>
            <View style={styles.descriptionWrapper}>
              {descriptionText.length > 0 && (
                <>
                  <Text
                    style={[styles.description, styles.descriptionMeasure]}
                    onTextLayout={handleDescriptionTextLayout}
                  >
                    {descriptionText}
                  </Text>
                  <Text
                    style={[styles.description, isRTL && styles.descriptionRTL]}
                    numberOfLines={expandedDescription ? undefined : 3}
                  >
                    {descriptionText}
                  </Text>
                  {!expandedDescription && descriptionExceedsThreeLines && (
                    <TouchableOpacity onPress={expandDescription}>
                      <Text
                        style={[styles.readMore, isRTL && styles.readMoreRTL]}
                      >
                        {t("listings.readMore")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
          <View style={styles.sectionSeparator} />

          {/* Location Map */}
          <PropertyLocation
            property={property}
            onPress={() =>
              navigation.navigate("NearbyServices", { propertyId: property.id })
            }
          />
          <View style={styles.sectionSeparator} />

          {property.listingType === "rent" && rentPaymentRows.length > 0 && (
            <>
              <RentPaymentsSection rows={rentPaymentRows} />
              <View style={styles.sectionSeparator} />
            </>
          )}

          {/* Advertiser Information */}
          <PropertyAdvertiser
            advertiserName={property.advertiserName?.trim() ?? ""}
            advertiserSubtitle={property.advertiserSubtitle}
            contactActionsEnabled={hasAdvertiserContactPhone}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
            onAdvertiserRowPress={handleAdvertiserRowPress}
          />
          <View style={styles.sectionSeparator} />

          {/* Tabs Section */}
          <PropertyTabs
            activeTab={activeTab}
            onTabChange={handleTabPress}
            property={property}
            onCopyId={handleCopyId}
            copyIdLabel={
              copiedId ? (t("common.copied") ?? "Copied") : undefined
            }
          />

          {/* Report Ad */}
          <View style={styles.reportAdSection}>
            <TouchableOpacity
              style={[styles.reportAd, isRTL && styles.reportAdRTL]}
              activeOpacity={0.85}
              onPress={openReportModal}
              disabled={!property?.serverListingId}
            >
              <Ionicons name="flag" size={wp(5.5)} color={COLORS.error} />
              <Text
                style={[styles.reportAdText, isRTL && styles.reportAdTextRTL]}
              >
                {t("listings.reportAd")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionSeparator} />

          <View style={{ height: hp(12) }} />
        </ScrollView>

        {/* Bottom Contact Bar with Navigation Arrows */}
        <View
          style={{
            paddingBottom: insets.bottom,
            backgroundColor: COLORS.white,
          }}
        >
          <PropertyBottomBar
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrevPress={handlePrevProperty}
            onNextPress={handleNextProperty}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
            contactActionsEnabled={hasAdvertiserContactPhone}
          />
        </View>
      </View>

      <Modal
        visible={isReportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeReportModal}
      >
        <View style={styles.reportModalBackdrop}>
          <View style={styles.reportModalCard}>
            <Text
              style={[
                styles.reportModalTitle,
                isRTL && styles.reportModalTitleRTL,
              ]}
            >
              {t("listings.reportAd")}
            </Text>

            <Text
              style={[
                styles.reportModalLabel,
                isRTL && styles.reportModalTitleRTL,
              ]}
            >
              {t("listings.reason") ?? "Reason"}
            </Text>
            <View style={styles.reportReasons}>
              {[
                t("listings.reportReasonSpam") ?? "Spam",
                t("listings.reportReasonFraud") ?? "Fraud / scam",
                t("listings.reportReasonInaccurate") ??
                  "Inaccurate information",
                t("listings.reportReasonOther") ?? "Other",
              ].map((label) => (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.reportReasonChip,
                    reportReason === label && styles.reportReasonChipActive,
                  ]}
                  onPress={() => setReportReason(label)}
                  activeOpacity={0.8}
                  disabled={isReporting}
                >
                  <Text
                    style={[
                      styles.reportReasonChipText,
                      reportReason === label &&
                        styles.reportReasonChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={[
                styles.reportModalLabel,
                isRTL && styles.reportModalTitleRTL,
              ]}
            >
              {t("listings.detailsOptional") ?? "Details (optional)"}
            </Text>
            <RNTextInput
              value={reportDetails}
              onChangeText={setReportDetails}
              editable={!isReporting}
              placeholder={t("listings.addMoreDetails") ?? "Add more details"}
              multiline
              style={[
                styles.reportDetailsInput,
                isRTL && styles.reportDetailsInputRTL,
              ]}
            />

            <View
              style={[
                styles.reportModalActions,
                isRTL && styles.reportModalActionsRTL,
              ]}
            >
              <TouchableOpacity
                style={[styles.reportModalBtn, styles.reportModalCancel]}
                onPress={closeReportModal}
                disabled={isReporting}
                activeOpacity={0.8}
              >
                <Text style={styles.reportModalCancelText}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.reportModalBtn,
                  styles.reportModalSubmit,
                  isReporting && styles.reportModalBtnDisabled,
                ]}
                onPress={submitReport}
                disabled={isReporting}
                activeOpacity={0.85}
              >
                <Text style={styles.reportModalSubmitText}>
                  {isReporting
                    ? (t("common.loading") ?? "Loading...")
                    : (t("listings.submitReport") ?? "Submit")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTextRTL: {
    textAlign: "right",
  },
  headerIconsRTL: {
    flexDirection: "row-reverse",
  },
  headerIconsRightRTL: {
    flexDirection: "row-reverse",
  },
  sectionTitleRTL: {
    textAlign: "right",
  },
  descriptionRTL: {
    textAlign: "right",
  },
  readMoreRTL: {
    textAlign: "right",
  },
  reportAdRTL: {
    flexDirection: "row-reverse",
  },
  reportAdTextRTL: {
    marginLeft: 0,
    marginRight: wp(2),
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  headerIcons: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    zIndex: 1001,
  },
  headerIconsSpacer: {
    flex: 1,
  },
  headerIconsRight: {
    flexDirection: "row",
  },
  stickyHeaderBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? hp(10) : hp(9),
    backgroundColor: "#fff",
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 4 },
    }),
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.background,
    paddingTop: hp(1),
  },
  publishGallerySection: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  sectionContainer: {
    backgroundColor: COLORS.background,
    paddingTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: hp(1.5),
    paddingHorizontal: wp(4),
  },
  infoList: {
    backgroundColor: COLORS.background,
  },
  publishAlignedInfoRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  publishAlignedInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    width: "56%",
    gap: wp(3),
  },
  publishAlignedIconSpacer: {
    width: wp(5),
  },
  publishAlignedInfoLabel: {
    flexShrink: 1,
    fontSize: wp(3.5),
    color: COLORS.textPrimary,
    textAlign: "left",
  },
  publishAlignedInfoValueColumn: {
    width: "44%",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: wp(2),
  },
  publishAlignedInfoValueColumnRTL: {
    alignItems: "flex-end",
    paddingLeft: 0,
    paddingRight: wp(2),
  },
  publishAlignedInfoValueText: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  publishAlignedRowReverse: {
    flexDirection: "row-reverse",
  },
  featuresList: {
    backgroundColor: COLORS.background,
  },
  lastListItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  featureRow: {
    flexDirection: "row",
    width: "100%",
  },
  featureRowRTL: {
    flexDirection: "row-reverse",
  },
  extraSection: {
    backgroundColor: COLORS.background,
    paddingTop: hp(2),
    paddingBottom: hp(1),
  },
  descriptionWrapper: {
    position: "relative",
    paddingHorizontal: wp(4),
  },
  descriptionMeasure: {
    position: "absolute",
    opacity: 0,
    width: "100%",
    zIndex: -1,
  },
  description: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    lineHeight: hp(3),
  },
  readMore: {
    fontSize: wp(3.5),
    color: "#3b82f6",
    fontWeight: "600",
    marginTop: hp(1),
  },
  sectionSeparator: {
    paddingTop: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reportAdSection: {
    backgroundColor: COLORS.background,
    paddingTop: hp(2),
  },
  reportAd: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: wp(2),
  },
  reportAdText: {
    fontSize: wp(4),
    color: COLORS.error,
    marginLeft: wp(2),
    fontWeight: "600",
  },
  reportModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: wp(5),
  },
  reportModalCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(4),
  },
  reportModalTitle: {
    fontSize: wp(4.8),
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: hp(1.2),
  },
  reportModalTitleRTL: {
    textAlign: "right",
  },
  reportModalLabel: {
    fontSize: wp(3.6),
    color: COLORS.textSecondary,
    marginTop: hp(1),
    marginBottom: hp(0.8),
  },
  reportReasons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
  },
  reportReasonChip: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: wp(10),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  reportReasonChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(14,133,106,0.10)",
  },
  reportReasonChipText: {
    fontSize: wp(3.4),
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  reportReasonChipTextActive: {
    color: COLORS.primary,
  },
  reportDetailsInput: {
    minHeight: hp(10),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    padding: wp(3),
    backgroundColor: COLORS.background,
    textAlignVertical: "top",
  },
  reportDetailsInputRTL: {
    textAlign: "right",
  },
  reportModalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: wp(3),
    marginTop: hp(2),
  },
  reportModalActionsRTL: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
  },
  reportModalBtn: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
  },
  reportModalBtnDisabled: {
    opacity: 0.6,
  },
  reportModalCancel: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportModalCancelText: {
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  reportModalSubmit: {
    backgroundColor: COLORS.primary,
  },
  reportModalSubmitText: {
    fontWeight: "800",
    color: COLORS.white,
  },
});
