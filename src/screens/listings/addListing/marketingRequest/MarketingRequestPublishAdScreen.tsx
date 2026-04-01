import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader, PropertyImageGallery } from "@/components";
import { COLORS, STORAGE_KEYS } from "@/constants";
import { useLocalization } from "@/hooks/useLocalization";
import {
  getDefaultImageUrl,
  formatPropertyDetailValueForListingDisplay,
  isOnlyDefaultPropertyPlaceholderImages,
} from "@/utils";
import type { UserRentPaymentPublishInput } from "@/utils/rentPayments";
import { addPublishedListingFromMarketingRequest } from "@/utils/publishedListingsStore";
import { PropertyDetailsDisplayItem } from "@/components/marketingRequestPropertyDetails/shared/CategoryFormProps";
import { getMarketingRequestCategoryTranslationKey } from "@/constants/categories";
import type { PropertyDetailItem } from "@/types/property";

const SCREEN_WIDTH = Dimensions.get("window").width;

type NavigationProp = NativeStackNavigationProp<any>;
type RouteParams = {
  selectedCategory?: string;
  attachments?: Array<{
    id: string;
    uri: string;
    mediaType?: "photo" | "video" | "unknown";
    note?: string;
  }>;
  /** From choose-location: geocoded or modal area/city string */
  locationDisplayName?: string;
  selectedLocation?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  area?: string;
  price?: string;
  description?: string;
  hasCommission?: boolean;
  commissionType?: "percentage" | "fixed";
  commissionValue?: string;
  meterPrice?: string;
  propertyDetailsItems?: PropertyDetailsDisplayItem[];
  pricingDetailsItems?: PropertyDetailsDisplayItem[];
  rentPaymentOptions?: UserRentPaymentPublishInput;
};

const normalizeNumericDisplay = (value?: string): string => {
  if (!value) return "---";
  const digitsOnly = value.replace(/[^\d]/g, "");
  if (!digitsOnly) return value.trim() || "---";
  return digitsOnly.replace(/^0+(?=\d)/, "");
};

/** Show a value row only if it is not a zero/placeholder. Pure "0" (e.g. apartments, living rooms) must be hidden. */
const shouldShowValueDetail = (value?: string): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "---") return false;
  const lower = trimmed.toLowerCase();
  if (lower === "not defined" || lower === "unknown") return false;

  const digitsOnly = trimmed.replace(/[^\d]/g, "");
  if (digitsOnly.length > 0) {
    return Number(digitsOnly) > 0;
  }
  return true;
};

const hasPositiveNumericValue = (value?: string): boolean => {
  if (!value) return false;
  const digitsOnly = value.replace(/[^\d]/g, "");
  if (!digitsOnly) return false;
  return Number(digitsOnly) > 0;
};

const shouldShowPropertyDetailItem = (item: PropertyDetailsDisplayItem): boolean => {
  if (item.type === "toggle") {
    return item.enabled === true;
  }
  return shouldShowValueDetail(item.value);
};

export default function MarketingRequestPublishAdScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { t, isRTL, i18n } = useLocalization();
  const insets = useSafeAreaInsets();
  const params = (route.params as RouteParams | undefined) ?? {};
  const selectedCategory = params.selectedCategory ?? "";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categoryLabel = useMemo(() => {
    const key = getMarketingRequestCategoryTranslationKey(selectedCategory);
    return key ? t(key) : selectedCategory;
  }, [selectedCategory, t]);

  const propertyDetailsItems = useMemo(() => {
    return (params.propertyDetailsItems ?? [])
      .filter((item) => !(item.type === "toggle" && item.label === t("listings.drainageAvailability")))
      .map((item) => {
        let next = item;
        if (item.type === "value" && item.value != null) {
          if (item.label === t("listings.streetWidth")) {
            const raw = String(next.value ?? "").trim();
            const numMatch = raw.match(/^(\d+)/);
            if (numMatch) {
              next = { ...next, value: t("listings.streetWidthWithMeter", { value: numMatch[1] }) };
            }
          }
        }
        if (item.label === t("listings.extraUnit")) {
          next = { ...next, label: t("listings.publishAdExtraUnitLabel") };
        } else if (item.label === t("listings.lift")) {
          next = { ...next, label: t("listings.publishAdLiftLabel") };
        } else if (item.label === t("listings.landType")) {
          next = { ...next, label: t("listings.type") };
        }
        if (next.type === "value" && next.value != null) {
          const s = String(next.value).trim();
          if (s.length > 0 && s !== "---") {
            next = {
              ...next,
              value: formatPropertyDetailValueForListingDisplay(next.label, s, t),
            };
          }
        }
        return next;
      })
      .filter(shouldShowPropertyDetailItem);
  }, [params.propertyDetailsItems, t]);
  const pricingDetailsItems = useMemo(
    () => (params.pricingDetailsItems ?? []).filter(shouldShowPropertyDetailItem),
    [params.pricingDetailsItems]
  );
  const normalizedArea = normalizeNumericDisplay(params.area);
  const shouldShowArea = hasPositiveNumericValue(normalizedArea);

  const orderedInfoItems = useMemo<PropertyDetailItem[]>(() => {
    const resolveInfoIcon = (label: string, currentIcon?: string): string | undefined => {
      const L = label.trim().toLowerCase();
      if (label === t("listings.pricePerMeter") || label === t("listings.meterPrice")) {
        return undefined;
      }
      if (L === t("listings.tent").trim().toLowerCase()) {
        return undefined;
      }
      if (L === t("listings.well").trim().toLowerCase()) {
        return "mdi:water-well";
      }
      if (L === t("listings.trees").trim().toLowerCase()) {
        return "mdi:tree-outline";
      }
      if (label === t("listings.area")) return "feather:maximize";
      if (label === t("listings.bedrooms")) return "mdi:bed-outline";
      if (label === t("listings.livingRooms")) return "mdi:sofa-outline";
      if (label === t("listings.restrooms")) return "mdi:toilet";
      if (label === t("listings.realEstateAge") || label === t("listings.ageLessThan")) {
        return "mdi:calendar-clock-outline";
      }
      if (label === t("listings.streetWidth")) {
        return "mdi:arrow-expand-horizontal";
      }
      if (label === t("listings.type")) return "feather:tag";
      if (label === t("listings.usage")) return "feather:users";
      return currentIcon?.trim() ? currentIcon.trim() : "mdi:information-outline";
    };

    const rows: PropertyDetailItem[] = [
      ...(shouldShowArea
        ? [
            {
              type: "value" as const,
              icon: "feather:maximize",
              label: t("listings.area"),
              value: normalizedArea,
            },
          ]
        : []),
      ...pricingDetailsItems.map((item) =>
        item.type === "value" ? { ...item } : item
      ),
      ...propertyDetailsItems.map((item) =>
        item.type === "value" ? { ...item } : item
      ),
    ];
    return rows
      .map((item) =>
        item.type === "value"
          ? { ...item, icon: resolveInfoIcon(item.label, item.icon) }
          : { ...item, icon: item.icon ?? undefined }
      )
      .filter((item) =>
        item.type === "toggle" ? item.enabled === true : shouldShowPropertyDetailItem(item)
      );
  }, [normalizedArea, pricingDetailsItems, propertyDetailsItems, shouldShowArea, t]);

  const headerCommissionText = useMemo(() => {
    if (!params.hasCommission || !params.commissionValue?.trim()) return null;
    const loc = i18n.language?.startsWith("ar") ? "ar-SA" : "en-US";
    let valuePart: string;
    if (params.commissionType === "percentage") {
      const raw = params.commissionValue.replace(/[^\d.]/g, "");
      const n = parseFloat(raw);
      if (Number.isNaN(n) || n <= 0) return null;
      const pctStr = Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(6))).replace(/\.?0+$/, "");
      valuePart = `${pctStr}%`;
    } else {
      const digits = params.commissionValue.replace(/[^\d]/g, "");
      if (!digits || Number(digits) <= 0) return null;
      valuePart = `${Number(digits).toLocaleString(loc)} ${t("listings.riyals")}`;
    }
    return t("listings.publishCommissionLine", { value: valuePart });
  }, [params.commissionType, params.commissionValue, params.hasCommission, i18n.language, t]);

  const publishPhotoEntries = useMemo(() => {
    return (params.attachments ?? [])
      .filter((item) => item.mediaType !== "video" && item.uri?.trim())
      .map((item) => ({
        uri: item.uri.trim(),
        note: (item.note ?? "").trim(),
      }));
  }, [params.attachments]);

  const publishImages = useMemo(() => {
    if (publishPhotoEntries.length > 0) {
      return publishPhotoEntries.map((e) => e.uri);
    }
    return [getDefaultImageUrl()];
  }, [publishPhotoEntries]);

  const publishPlaceholderOnly = useMemo(
    () => isOnlyDefaultPropertyPlaceholderImages(publishImages),
    [publishImages]
  );

  const hasAnyPhotoCaption = useMemo(
    () => publishPhotoEntries.some((e) => e.note.length > 0),
    [publishPhotoEntries]
  );

  const publishImageCaptions = useMemo(
    () =>
      publishPhotoEntries.length > 0 ? publishPhotoEntries.map((e) => e.note) : undefined,
    [publishPhotoEntries]
  );

  const publishVideoUris = useMemo(
    () =>
      (params.attachments ?? [])
        .filter((item) => item.mediaType === "video" && item.uri?.trim())
        .map((item) => item.uri.trim()),
    [params.attachments]
  );

  const handleImageScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const rawIndex = Math.round(scrollPosition / SCREEN_WIDTH);
      const index = isRTL ? publishImages.length - 1 - rawIndex : rawIndex;
      setCurrentImageIndex(index);
    },
    [isRTL, publishImages.length]
  );

  const handleOpenGallery = useCallback(() => {
    navigation.navigate("ListingMedia", {
      images: publishImages,
      ...(publishImageCaptions ? { imageCaptions: publishImageCaptions } : {}),
      ...(publishVideoUris.length > 0 ? { videoUris: publishVideoUris } : {}),
    });
  }, [navigation, publishImageCaptions, publishImages, publishVideoUris]);

  const locationLabel = useMemo(() => {
    const passed = params.locationDisplayName?.trim();
    if (passed) return passed;
    return t("listings.publishAdDefaultLocation");
  }, [params.locationDisplayName, t]);

  const descriptionTrimmed = (params.description ?? "").trim();
  const hasDescription = descriptionTrimmed.length > 0;
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [descriptionTextWidth, setDescriptionTextWidth] = useState(0);
  const [descriptionFullLineCount, setDescriptionFullLineCount] = useState(0);
  const descriptionHorizontalPad = wp(4);

  const onDescriptionWrapperLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const outerW = e.nativeEvent.layout.width;
      const inner = Math.max(0, outerW - 2 * descriptionHorizontalPad);
      if (inner > 0) setDescriptionTextWidth(inner);
    },
    [descriptionHorizontalPad]
  );

  const rtlBodyText = useMemo(
    () =>
      isRTL
        ? ({ textAlign: "right" as const, writingDirection: "rtl" as const })
        : ({ textAlign: "left" as const, writingDirection: "ltr" as const }),
    [isRTL]
  );

  const handlePublishAd = useCallback(async () => {
    const commissionText = headerCommissionText ? headerCommissionText.trim() : undefined;
    const [publisherDisplayName, publisherPhoneDigits] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.loggedInDisplayName),
      AsyncStorage.getItem(STORAGE_KEYS.loggedInPhoneNumber),
    ]);
    const created = addPublishedListingFromMarketingRequest({
      selectedCategory,
      categoryLabel,
      commissionText,
      attachments: params.attachments,
      locationDisplayName: locationLabel,
      selectedLocation: params.selectedLocation
        ? {
            latitude: params.selectedLocation.latitude,
            longitude: params.selectedLocation.longitude,
          }
        : undefined,
      area: params.area,
      price: params.price,
      description: params.description,
      detailsItems: orderedInfoItems,
      rentPaymentOptions: params.rentPaymentOptions,
      publisherDisplayName: publisherDisplayName?.trim() || undefined,
      publisherPhoneDigits: publisherPhoneDigits?.trim() || undefined,
    });

    const listingType: "rent" | "sale" = created.listingType === "rent" ? "rent" : "sale";
    navigation.navigate("MapLanding", { listingType });
  }, [
    selectedCategory,
    categoryLabel,
    headerCommissionText,
    params.attachments,
    locationLabel,
    params.selectedLocation,
    params.area,
    params.price,
    params.description,
    orderedInfoItems,
    params.rentPaymentOptions,
    navigation,
  ]);

  const renderDetailIcon = useCallback((icon?: string | null) => {
    if (icon == null || !String(icon).trim()) {
      return null;
    }
    const trimmed = String(icon).trim();
    const size = wp(5);
    const color = "#9ca3af";
    if (trimmed.startsWith("mdi:")) {
      const name = trimmed.slice(4);
      return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
    }
    if (trimmed.startsWith("feather:")) {
      const name = trimmed.slice("feather:".length);
      return <Feather name={name as any} size={size} color={color} />;
    }
    return <Ionicons name={trimmed as any} size={size} color={color} />;
  }, []);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.publishAd")}
        hideTitle={publishPlaceholderOnly}
        onBackPress={() => navigation.goBack()}
        titleFontWeight="700"
        fontSize={wp(5)}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={hasAnyPhotoCaption ? styles.publishGallerySection : undefined}>
          <PropertyImageGallery
            images={publishImages}
            imageCaptions={publishImageCaptions}
            currentIndex={currentImageIndex}
            onImageScroll={handleImageScroll}
            onImageViewerOpen={handleOpenGallery}
            onBackPress={() => navigation.goBack()}
            onLikePress={() => {}}
            onSharePress={() => {}}
            onFavoritePress={() => {}}
            liked={false}
            favorited={false}
          />
        </View>

        <View style={styles.summaryHeaderBlock}>
          <Text style={[styles.locationHeaderText, rtlBodyText]}>{locationLabel}</Text>
          <Text style={[styles.categoryText, rtlBodyText]}>{categoryLabel}</Text>
          <Text style={[styles.priceLineBase, rtlBodyText]}>
            <Text style={[styles.priceMain, rtlBodyText]}>
              {params.price ? `${normalizeNumericDisplay(params.price)} ${t("listings.sar")}` : "---"}
            </Text>
            {headerCommissionText ? (
              <Text style={[styles.headerCommissionInline, rtlBodyText]}>{` ${headerCommissionText}`}</Text>
            ) : null}
          </Text>
        </View>
        <View style={styles.sectionSeparator} />

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, rtlBodyText]}>{t("listings.propertyInformation")}</Text>
          <View style={styles.infoList}>
            {orderedInfoItems.map((item, index) =>
              item.type === "value" ? (
                <View
                  key={`${item.label}-${index}`}
                  style={[
                    styles.infoRow,
                    isRTL && styles.rowReverse,
                    { backgroundColor: index % 2 === 0 ? COLORS.white : COLORS.background },
                  ]}
                >
                  <View style={[styles.infoLeftSection, isRTL && styles.rowReverse]}>
                    {item.icon != null && String(item.icon).trim().length > 0 ? (
                      renderDetailIcon(item.icon)
                    ) : (
                      <View style={styles.infoIconSpacer} />
                    )}
                    <Text style={[styles.infoLabel, rtlBodyText]}>{item.label}</Text>
                  </View>
                  <View style={[styles.infoValueColumn, isRTL && styles.infoValueColumnRTL]}>
                    <Text style={[styles.infoValueText, rtlBodyText]}>{item.value ?? "---"}</Text>
                  </View>
                </View>
              ) : (
                <View
                  key={`${item.label}-${index}`}
                  style={[
                    styles.toggleInfoRow,
                    isRTL && styles.rowReverse,
                    { backgroundColor: index % 2 === 0 ? COLORS.white : COLORS.background },
                  ]}
                >
                  <View style={[styles.infoLeftSection, isRTL && styles.rowReverse]}>
                    <View style={styles.infoIconSpacer} />
                    <Text style={[styles.toggleInfoLabel, rtlBodyText]}>{item.label}</Text>
                  </View>
                  <View style={[styles.infoValueColumn, isRTL && styles.infoValueColumnRTL]}>
                    {item.enabled ? (
                      item.label === t("listings.tent") ? (
                        <Text style={[styles.infoValueText, rtlBodyText]}>1</Text>
                      ) : (
                        <Ionicons name="checkmark-circle" size={wp(6)} color={COLORS.checkmarkCircle} />
                      )
                    ) : (
                      <Text style={[styles.toggleInfoDash, rtlBodyText]}>-</Text>
                    )}
                  </View>
                </View>
              )
            )}
            <View
              style={[
                styles.infoRow,
                isRTL && styles.rowReverse,
                { backgroundColor: (orderedInfoItems.length % 2 === 0) ? COLORS.white : COLORS.background },
              ]}
            >
              <View style={[styles.infoLeftSection, isRTL && styles.rowReverse]}>
                <Feather name="hash" size={wp(5)} color="#9ca3af" />
                <Text style={[styles.infoLabel, rtlBodyText]}>{t("listings.listingId")}</Text>
              </View>
              <View style={[styles.infoValueColumn, isRTL && styles.infoValueColumnRTL]}>
                <Text style={[styles.infoValueText, rtlBodyText]} />
              </View>
            </View>
            <View
              style={[
                styles.infoRow,
                isRTL && styles.rowReverse,
                { backgroundColor: ((orderedInfoItems.length + 1) % 2 === 0) ? COLORS.white : COLORS.background },
              ]}
            >
              <View style={[styles.infoLeftSection, isRTL && styles.rowReverse]}>
                <MaterialCommunityIcons name="clock-time-four-outline" size={wp(5)} color="#9ca3af" />
                <Text style={[styles.infoLabel, rtlBodyText]}>{t("listings.lastUpdated")}</Text>
              </View>
              <View style={[styles.infoValueColumn, isRTL && styles.infoValueColumnRTL]}>
                <Text style={[styles.infoValueText, rtlBodyText]} />
              </View>
            </View>
            <View
              style={[
                styles.infoRow,
                isRTL && styles.rowReverse,
                { backgroundColor: ((orderedInfoItems.length + 2) % 2 === 0) ? COLORS.white : COLORS.background },
              ]}
            >
              <View style={[styles.infoLeftSection, isRTL && styles.rowReverse]}>
                <Feather name="eye" size={wp(5)} color="#9ca3af" />
                <Text style={[styles.infoLabel, rtlBodyText]}>{t("listings.views")}</Text>
              </View>
              <View style={[styles.infoValueColumn, isRTL && styles.infoValueColumnRTL]}>
                <Text style={[styles.infoValueText, rtlBodyText]}>0</Text>
              </View>
            </View>
          </View>
          <View style={styles.propertyInfoListBottomLine} />
          {/* <View style={styles.sectionSeparator} /> */}
        </View>

        {hasDescription ? (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, rtlBodyText]}>{t("listings.description")}</Text>
            <View style={styles.descriptionWrapper} onLayout={onDescriptionWrapperLayout}>
              {descriptionTextWidth > 0 ? (
                <Text
                  pointerEvents="none"
                  style={[
                    styles.descriptionText,
                    styles.descriptionMeasureText,
                    isRTL ? styles.descriptionMeasureAnchorRTL : styles.descriptionMeasureAnchorLTR,
                    rtlBodyText,
                    { width: descriptionTextWidth },
                  ]}
                  onTextLayout={(e) => setDescriptionFullLineCount(e.nativeEvent.lines.length)}
                >
                  {descriptionTrimmed}
                </Text>
              ) : null}
              <Text
                style={[styles.descriptionText, rtlBodyText]}
                numberOfLines={descriptionExpanded ? undefined : 3}
                ellipsizeMode="tail"
              >
                {descriptionTrimmed}
              </Text>
              {descriptionFullLineCount > 3 && !descriptionExpanded ? (
                <TouchableOpacity
                  onPress={() => setDescriptionExpanded(true)}
                  activeOpacity={0.7}
                  style={[styles.readMoreTouchable, isRTL && styles.readMoreTouchableRTL]}
                >
                  <Text style={[styles.readMoreLink, rtlBodyText]}>{t("listings.readMore")}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={styles.sectionSeparator} />
          </View>
        ) : null}

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, rtlBodyText]}>{t("listings.location")}</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.mapWrapper}
            onPress={() =>
              navigation.navigate("NearbyServices", {
                propertyId: 1,
                latitude: params.selectedLocation?.latitude,
                longitude: params.selectedLocation?.longitude,
              })
            }
          >
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: params.selectedLocation?.latitude ?? 24.7136,
                  longitude: params.selectedLocation?.longitude ?? 46.6753,
                  latitudeDelta: params.selectedLocation?.latitudeDelta ?? 0.06,
                  longitudeDelta: params.selectedLocation?.longitudeDelta ?? 0.06,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: params.selectedLocation?.latitude ?? 24.7136,
                    longitude: params.selectedLocation?.longitude ?? 46.6753,
                  }}
                >
                  <Ionicons name="location" size={wp(8)} color={COLORS.primary} />
                </Marker>
              </MapView>
            </View>
          </TouchableOpacity>
          <View style={[styles.locationAlert, isRTL && styles.locationAlertRTL]}>
            <Ionicons name="information-circle" size={wp(5)} color="#3b82f6" />
            <Text style={[styles.locationAlertText, rtlBodyText]}>{locationLabel}</Text>
          </View>
          <View style={styles.sectionSeparator} />
        </View>
      </ScrollView>

      <View style={[styles.singleActionFooter, { paddingBottom: Math.max(hp(1), insets.bottom) }]}>
        <TouchableOpacity style={styles.publishButton} activeOpacity={0.85} onPress={handlePublishAd}>
          <Text style={styles.publishButtonText}>{t("listings.publishAd")}</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(1),
  },
  publishGallerySection: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  summaryHeaderBlock: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1.6),
    paddingBottom: hp(2),
    backgroundColor: COLORS.background,
    gap: hp(1.1),
    width: "100%",
  },
  locationHeaderText: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    lineHeight: hp(2.4),
  },
  categoryText: {
    fontSize: wp(4.4),
    fontWeight: "600",
    color: COLORS.textPrimary,
    lineHeight: hp(2.8),
  },
  priceLineBase: {
    flexShrink: 1,
  },
  priceMain: {
    fontSize: wp(4.4),
    fontWeight: "700",
    color: COLORS.primary,
  },
  headerCommissionInline: {
    fontSize: wp(3.1),
    fontWeight: "500",
    color: COLORS.textSecondary,
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
  propertyInfoListBottomLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    width: "100%",
  },
  infoRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  infoLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    width: "56%",
    gap: wp(3),
  },
  infoIconSpacer: {
    width: wp(5),
  },
  infoLabel: {
    flexShrink: 1,
    fontSize: wp(3.5),
    color: COLORS.textPrimary,
  },
  infoValueColumn: {
    width: "44%",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: wp(2),
  },
  infoValueColumnRTL: {
    alignItems: "flex-end",
    paddingLeft: 0,
    paddingRight: wp(2),
  },
  infoValueText: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  descriptionWrapper: {
    paddingHorizontal: wp(4),
  },
  descriptionMeasureText: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
    top: 0,
  },
  descriptionMeasureAnchorLTR: {
    left: 0,
  },
  descriptionMeasureAnchorRTL: {
    right: 0,
  },
  descriptionText: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    lineHeight: hp(3),
  },
  readMoreTouchable: {
    marginTop: hp(0.8),
    alignSelf: "flex-start",
  },
  readMoreTouchableRTL: {
    alignSelf: "flex-end",
  },
  readMoreLink: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: "#2563eb",
  },
  mapWrapper: {
    marginHorizontal: wp(4),
    borderRadius: wp(2),
    overflow: "hidden",
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  mapContainer: {
    height: hp(22),
    borderRadius: wp(2),
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  locationAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    backgroundColor: COLORS.background,
    padding: wp(3),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: wp(4),
  },
  locationAlertRTL: {
    flexDirection: "row-reverse",
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  locationAlertText: {
    flex: 1,
    fontSize: wp(3),
    color: COLORS.textPrimary,
  },
  sectionSeparator: {
    paddingTop: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toggleInfoRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  toggleInfoLabel: {
    flexShrink: 1,
    fontSize: wp(3.5),
    color: COLORS.textPrimary,
  },
  toggleInfoDash: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
  },
  singleActionFooter: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  publishButton: {
    height: hp(5.5),
    borderRadius: wp(2),
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  publishButtonText: {
    fontSize: wp(4.1),
    fontWeight: "600",
    color: COLORS.white,
  },
});

