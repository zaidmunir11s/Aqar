import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  PROPERTY_DATA,
  RENT_FILTER_OPTIONS,
  SALE_FILTER_OPTIONS,
} from "../../data/propertyData";
import {
  openPhoneDialer,
  openWhatsApp,
  getDefaultImageUrl,
  calculateDays,
  navigateToMapScreen,
} from "../../utils";
import {
  InfoItem,
  FeatureItem,
  PropertyImageGallery,
  PropertyHeader,
  PropertyLocation,
  PropertyAdvertiser,
  PropertyTabs,
  PropertyBottomBar,
  AverageCard,
  FinancingOptionsCard,
  AverageSaleCard,
  IconButton,
} from "../../components";
import type { Property, DailyProperty } from "../../types/property";
import type { CalendarDates } from "../../hooks/useCalendar";
import type { TabType } from "../../components/property/PropertyTabs";
import { COLORS } from "@/constants";
import { useLocalization } from "../../hooks/useLocalization";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  propertyId: number;
  selectedDates?: CalendarDates;
  visiblePropertyIds?: number[];
  listingType?: string;
}

export default function PropertyDetailsScreen(): React.JSX.Element {
  const route = useRoute();
  const params = route.params as RouteParams;
  const {
    propertyId,
    selectedDates: passedDates,
    visiblePropertyIds = [],
    listingType: passedListingType,
  } = params;
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocalization();

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
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-200)).current; // Start fully off-screen (hidden)
  const scrollViewRef = useRef<ScrollView>(null);

  const property = useMemo(
    () => PROPERTY_DATA.find((p) => p.id === propertyId),
    [propertyId]
  );

  useEffect(() => {
    setExpandedDescription(false);
    setDescriptionExceedsThreeLines(false);
  }, [propertyId]);

  // Filter visible properties based on selected dates and minimum days requirement
  const filteredVisiblePropertyIds = useMemo(() => {
    if (!passedDates?.startDate || !passedDates?.endDate) {
      // If no dates selected, return all visible properties
      return visiblePropertyIds;
    }

    const days = calculateDays(passedDates.startDate, passedDates.endDate);

    // Filter properties that meet minimum days requirement
    return visiblePropertyIds.filter((id) => {
      const prop = PROPERTY_DATA.find((p) => p.id === id);
      if (!prop || prop.listingType !== "daily") {
        // For non-daily properties (rent/sale), include them (no minimum days requirement)
        return true;
      }

      const dailyProp = prop as DailyProperty;
      
      // Check minimum days based on booking type
      if (dailyProp.bookingType === "monthly") {
        // Monthly properties require minimum 30 days
        return days >= 30;
      } else if (dailyProp.bookingType === "daily") {
        // Daily properties require minimum 1 day
        return days >= 1;
      }
      
      // Default: include property
      return true;
    });
  }, [visiblePropertyIds, passedDates]);

  // Find current index in filtered visible properties list
  const currentPropertyIndex = useMemo(() => {
    if (!filteredVisiblePropertyIds || filteredVisiblePropertyIds.length === 0) return -1;
    return filteredVisiblePropertyIds.indexOf(propertyId);
  }, [filteredVisiblePropertyIds, propertyId]);

  const hasNavigation = currentPropertyIndex >= 0;
  const canGoPrev = hasNavigation && currentPropertyIndex > 0;
  const canGoNext =
    hasNavigation && currentPropertyIndex < filteredVisiblePropertyIds.length - 1;

  // Navigation handlers
  const handlePrevProperty = useCallback(() => {
    if (canGoPrev) {
      const prevPropertyId = filteredVisiblePropertyIds[currentPropertyIndex - 1];
      // Check if previous property is daily or not
      const prevProperty = PROPERTY_DATA.find((p) => p.id === prevPropertyId);
      const screenName = prevProperty?.listingType === "daily" ? "DailyDetails" : "PropertyDetails";
      navigation.replace(screenName, {
        propertyId: prevPropertyId,
        visiblePropertyIds: filteredVisiblePropertyIds,
        listingType: passedListingType,
        selectedDates: passedDates,
      });
    }
  }, [
    canGoPrev,
    currentPropertyIndex,
    filteredVisiblePropertyIds,
    navigation,
    passedListingType,
    passedDates,
  ]);

  const handleNextProperty = useCallback(() => {
    if (canGoNext) {
      const nextPropertyId = filteredVisiblePropertyIds[currentPropertyIndex + 1];
      // Check if next property is daily or not
      const nextProperty = PROPERTY_DATA.find((p) => p.id === nextPropertyId);
      const screenName = nextProperty?.listingType === "daily" ? "DailyDetails" : "PropertyDetails";
      navigation.replace(screenName, {
        propertyId: nextPropertyId,
        visiblePropertyIds: filteredVisiblePropertyIds,
        listingType: passedListingType,
        selectedDates: passedDates,
      });
    }
  }, [
    canGoNext,
    currentPropertyIndex,
    filteredVisiblePropertyIds,
    navigation,
    passedListingType,
    passedDates,
  ]);

  const handleImageScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const rawIndex = Math.round(scrollPosition / SCREEN_WIDTH);
      // When RTL is active and gallery is inverted, adjust index calculation
      const imagesLength = property?.images?.length || 1;
      const index = isRTL && imagesLength > 0 
        ? imagesLength - 1 - rawIndex 
        : rawIndex;
      setCurrentImageIndex(index);
    },
    [isRTL, property?.images?.length]
  );

  const handleCall = useCallback(() => {
    openPhoneDialer("+966123456789");
  }, []);

  const handleWhatsApp = useCallback(() => {
    openWhatsApp("966123456789");
  }, []);

  const handleChat = useCallback(() => {
    if (!property) return;

    // Push Conversation in the same stack so back returns to PropertyDetails
    const defaultMessage = t("listings.inRegardOfAdNumber", { id: property.id });
    const advertiserName = property.advertiserName || "Property Owner";
    const advertiserId = property.advertiserId || `advertiser-${property.id}`;

    navigation.navigate("Conversation", {
      propertyId: property.id,
      advertiserName,
      advertiserId,
      defaultMessage,
    });
  }, [navigation, property, t]);

  const handleShare = useCallback(() => {
    console.log("Share property");
  }, []);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Use navigateToMapScreen to go to correct map (MapLanding/DailyMap/ProjectsMap)
      // and preserve map state via popToTop when possible
      navigateToMapScreen(navigation);
    }
  }, [navigation]);

  const toggleLike = useCallback(() => {
    setLiked((prev) => !prev);
  }, []);

  const toggleFavorite = useCallback(() => {
    setFavorited((prev) => !prev);
  }, []);

  const openImageViewer = useCallback(() => {
    const images =
      property?.images && property.images.length > 0
        ? property.images
        : [getDefaultImageUrl()];
    navigation.navigate("ListingMedia", { images });
  }, [navigation, property]);

  const expandDescription = useCallback(() => {
    setExpandedDescription(true);
  }, []);

  const descriptionText =
    property?.description ||
    "شقة دور أرضي بخدمات متكاملة، مناسبة للعائلات، قريبة من المدارس والخدمات الأساسية. 5 غرف مع مكيفات، حمامين، مطبخ مجهز، الدور الثاني.";

  const handleDescriptionTextLayout = useCallback(
    (e: { nativeEvent: { lines: unknown[] } }) => {
      if (e.nativeEvent.lines.length > 3) {
        setDescriptionExceedsThreeLines(true);
      }
    },
    []
  );

  const handleTabPress = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);



  const handleCopyId = useCallback(() => {
    console.log("Copy ID:", property?.id);
  }, [property]);

  const handleFinancingOptions = useCallback(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("ProfileTab", { screen: "Login" });
    } else {
      navigation.navigate("ProfileTab", { screen: "Login" });
    }
  }, [navigation]);

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
    [scrollY, showStickyHeader, headerTranslateY, stickyHeaderHeight]
  );

  // PanResponder for swipe navigation
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // Only respond to horizontal swipes (not vertical scrolling)
          const { dx, dy } = gestureState;
          return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
        },
        onPanResponderRelease: (evt, gestureState) => {
          const { dx, vx } = gestureState;
          const swipeThreshold = 50; // Minimum swipe distance
          const velocityThreshold = 0.3; // Minimum swipe velocity

          // Swipe right (positive dx) = go to previous property
          if (dx > swipeThreshold || vx > velocityThreshold) {
            if (canGoPrev) {
              handlePrevProperty();
            }
          }
          // Swipe left (negative dx) = go to next property
          else if (dx < -swipeThreshold || vx < -velocityThreshold) {
            if (canGoNext) {
              handleNextProperty();
            }
          }
        },
      }),
    [canGoPrev, canGoNext, handlePrevProperty, handleNextProperty]
  );


  if (!property) {
    return (
      <View style={styles.center}>
        <Text style={isRTL && styles.centerTextRTL}>{t("listings.propertyNotFound")}</Text>
      </View>
    );
  }

  const propertyImages =
    property.images && property.images.length > 0
      ? property.images
      : [getDefaultImageUrl()];

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
    [t]
  );

  // Get type label from filter options
  const getPropertyTypeLabel = useCallback(() => {
    let filterOptions;
    if (property.listingType === "rent") filterOptions = RENT_FILTER_OPTIONS;
    else filterOptions = SALE_FILTER_OPTIONS;

    return getTranslatedTypeLabel(property.type, filterOptions);
  }, [property, getTranslatedTypeLabel]);

  const typeLabel = getPropertyTypeLabel();
  const listingText =
    property.listingType === "rent"
      ? t("listings.forRent")
      : property.listingType === "sale"
        ? t("listings.forSale")
        : "";

  const displayPrice = useMemo(() => {
    if (property.listingType === "rent") {
      const rentProperty = property as any;
      return `${rentProperty.price.replace(" K", ",000")} ${t("listings.sar")} / ${t("listings.yearly")}`;
    } else if (property.listingType === "sale") {
      const saleProperty = property as any;
      return `${saleProperty.price
        .replace(" M", ",000,000")
        .replace(" K", ",000")} ${t("listings.sar")}`;
    }
    return "";
  }, [property, t]);

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
          <View style={[styles.headerIconsRight, isRTL && styles.headerIconsRightRTL]}>
            <IconButton onPress={toggleLike}>
              <Ionicons
                name={liked ? "thumbs-up" : "thumbs-up-outline"}
                size={wp(5.5)}
                color={COLORS.backButton}
              />
            </IconButton>
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
          <PropertyImageGallery
            images={propertyImages}
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
              <FinancingOptionsCard onPress={handleFinancingOptions} />
              <AverageSaleCard property={property} onPress={handleAverageCardPress} />
            </>
          )}

          {/* Property Information */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
              {t("listings.propertyInformation")}
            </Text>
            <View style={styles.infoList}>
              {[
                { icon: "resize", label: t("listings.area"), value: `${property.area}` },
                {
                  icon: "bed",
                  label: t("listings.bedrooms"),
                  value: property.bedrooms.toString(),
                },
                {
                  icon: "home",
                  label: t("listings.livingRooms"),
                  value: (property.livingRooms || 1).toString(),
                },
                {
                  icon: "water",
                  label: t("listings.restrooms"),
                  value: (property.restrooms || 2).toString(),
                },
                {
                  icon: "business",
                  label: t("listings.realEstateAge"),
                  value:
                    property.estateAge > 0
                      ? `${property.estateAge} ${t("listings.years")}`
                      : t("listings.new"),
                },
                { icon: "pricetag", label: t("listings.type"), value: t("listings.residential") },
              ].map((item, index) => (
                <InfoItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  backgroundColor={index % 2 === 0 ? "#fff" : COLORS.background}
                />
              ))}
            </View>
            <View style={styles.sectionSeparator} />
          </View>

          {/* Property Features */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
              {t("listings.propertyFeatures")}
            </Text>
            <View style={styles.featuresList}>
              {[
                { label: t("listings.water") },
                { label: t("listings.electricity") },
                { label: t("listings.privateRoofFeature") },
                { label: t("listings.specialEntrance") },
                { label: t("listings.nearBusFeature") },
              ]
                .reduce<Array<Array<{ label: string; index: number }>>>(
                  (rows, item, index) => {
                    const rowIndex = Math.floor(index / 2);
                    if (!rows[rowIndex]) {
                      rows[rowIndex] = [];
                    }
                    rows[rowIndex].push({ ...item, index });
                    return rows;
                  },
                  []
                )
                .map((row, rowIndex) => (
                  <View
                    key={rowIndex}
                    style={[
                      styles.featureRow,
                      isRTL && styles.featureRowRTL,
                      {
                        backgroundColor:
                          rowIndex % 2 === 0 ? "#fff" : COLORS.background,
                      },
                    ]}
                  >
                    {row.map((item, itemIndex) => (
                      <FeatureItem
                        key={item.label}
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

          {/* Extra / Description */}
          <View style={styles.extraSection}>
            <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
              {t("listings.extra")}
            </Text>
            <View style={styles.descriptionWrapper}>
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
                  <Text style={[styles.readMore, isRTL && styles.readMoreRTL]}>
                    {t("listings.readMore")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.sectionSeparator} />


          {/* Location Map */}
          <PropertyLocation
            property={property}
            onPress={() => navigation.navigate("NearbyServices", { propertyId: property.id })}
          />
          <View style={styles.sectionSeparator} />

          {/* Advertiser Information */}
              <PropertyAdvertiser
                onCall={handleCall}
                onWhatsApp={handleWhatsApp}
                onChat={handleChat}
              />
              <View style={styles.sectionSeparator} />

          {/* Tabs Section */}
          <PropertyTabs
            activeTab={activeTab}
            onTabChange={handleTabPress}
            property={property}
            onCopyId={handleCopyId}
          />
          <View style={styles.sectionSeparator} />

          {/* Report Ad */}
          <View style={styles.reportAdSection}>
            <TouchableOpacity style={[styles.reportAd, isRTL && styles.reportAdRTL]}>
              <Ionicons name="flag" size={wp(5.5)} color={COLORS.error} />
              <Text style={[styles.reportAdText, isRTL && styles.reportAdTextRTL]}>
                {t("listings.reportAd")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionSeparator} />

          <View style={{ height: hp(12) }} />
        </ScrollView>


        {/* Bottom Contact Bar with Navigation Arrows */}
        <View style={{ paddingBottom: insets.bottom, backgroundColor: COLORS.white }}>
          <PropertyBottomBar
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrevPress={handlePrevProperty}
            onNextPress={handleNextProperty}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
            onChat={handleChat}
          />
        </View>
      </View>
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
  featuresList: {
    backgroundColor: COLORS.background,
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
});
