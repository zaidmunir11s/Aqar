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
  DAILY_FILTER_OPTIONS,
} from "../../data/propertyData";
import {
  calculateDays,
  getDefaultImageUrl,
  navigateToMapScreen,
  getPropertyById,
} from "../../utils";
import {
  CalendarModal,
  InfoItem,
  FeatureItem,
  DailyBookingCard,
  PropertyImageGallery,
  PropertyHeader,
  PropertyLocation,
  PropertyTabs,
  PropertyBottomBar,
  IconButton,
  UnitRules,
} from "../../components";
import { useCalendar, usePropertyDetailNavigation, useTabNavigation } from "../../hooks";
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

export default function DailyDetailScreen(): React.JSX.Element {
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
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);
  const [showStickyHeader, setShowStickyHeader] = useState<boolean>(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-200)).current; // Start fully off-screen (hidden)
  const scrollViewRef = useRef<ScrollView>(null);

  // Use calendar hook for daily bookings
  const { selectedDates, markedDates, handleDateSelect, resetDates } =
    useCalendar(passedDates);

  const property = useMemo(
    () => getPropertyById(propertyId) as DailyProperty | undefined,
    [propertyId]
  );

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
    dates: selectedDates,
    listingType: passedListingType,
    navigation,
    useFilteredIdsForReplace: false,
  });

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

  const { navigateToChat } = useTabNavigation();

  const handleChat = useCallback(() => {
    if (!property) return;

    // Navigate directly to Conversation (standardized with PropertyDetailsScreen)
    const defaultMessage = t("listings.inRegardOfAdNumber", { id: property.id });
    const advertiserName = property.advertiserName || "Property Owner";
    const advertiserId = property.advertiserId || `advertiser-${property.id}`;

    navigateToChat("Conversation", {
      propertyId: property.id,
      advertiserName,
      advertiserId,
      defaultMessage,
    });
  }, [navigateToChat, property, t]);

  const handleShare = useCallback(() => {
    console.log("Share property");
  }, []);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Use navigateToMapScreen to go to correct map (DailyMap when in Daily stack)
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
    if (!property) return;
    const images =
      property.images && property.images.length > 0
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

  const openCalendar = useCallback(() => {
    setCalendarVisible(true);
  }, []);

  const closeCalendar = useCallback(() => {
    setCalendarVisible(false);
  }, []);

  const handleReserve = useCallback(() => {
    if (!property) return;
    
    navigation.navigate("Reserve", {
      propertyId: property.id,
      selectedDates: selectedDates,
    });
  }, [navigation, property, selectedDates]);

  const handleCopyId = useCallback(() => {
    console.log("Copy ID:", property?.id);
  }, [property]);

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

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      headerIcons: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      headerIconsRight: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      sectionTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      featureRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      description: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      readMore: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      reportAd: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      reportAdText: {
        marginLeft: isRTL ? 0 : wp(2),
        marginRight: isRTL ? wp(2) : 0,
      },
      center: {
        alignItems: "center" as const,
      },
    }),
    [isRTL]
  );

  if (!property) {
    return (
      <View style={[styles.center, rtlStyles.center]}>
        <Text>{t("listings.propertyNotFound")}</Text>
      </View>
    );
  }

  const propertyImages =
    property.images && property.images.length > 0
      ? property.images
      : [getDefaultImageUrl()];

  // Get type label from filter options with translation
  const getPropertyTypeLabel = useCallback(() => {
    const filterOptions = DAILY_FILTER_OPTIONS;
    const option = filterOptions.find((opt) => opt.type === property.type);
    if (option) {
      // Map property types to translation keys
      const typeTranslationMap: { [key: string]: string } = {
        "apartment": "apartmentForBooking",
        "villa": "villaForBooking",
        "studio": "studioForBooking",
        "chalet": "chaletForBooking",
        "tent": "tentForBooking",
        "farm": "farmForBooking",
        "hall": "hallForBooking",
      };
      const translationKey = typeTranslationMap[property.type];
      if (translationKey) {
        return t(`listings.propertyTypes.${translationKey}`);
      }
      return option.label;
    }
    return property.type.charAt(0).toUpperCase() + property.type.slice(1);
  }, [property, t]);

  const typeLabel = getPropertyTypeLabel();

  // Calculate display price for daily properties
  const displayPrice = useMemo(() => {
    const dailyProperty = property as DailyProperty;
    if (selectedDates.startDate && selectedDates.endDate) {
      const days = calculateDays(
        selectedDates.startDate,
        selectedDates.endDate
      );
      return `${(dailyProperty.dailyPrice || 0) * days} ${t("listings.sar")}`;
    } else {
      return t("listings.chooseDateToSeePrice");
    }
  }, [property, selectedDates, t]);

  return (
    <>
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* Icons - Always visible, absolute positioned */}
        <View
          style={[
            styles.headerIcons,
            rtlStyles.headerIcons,
            { top: 0, paddingTop: insets.top },
          ]}
        >
          <IconButton onPress={handleBackPress}>
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={wp(6)} color={COLORS.backButton} />
          </IconButton>
          <View style={styles.headerIconsSpacer} />  
          <View style={[styles.headerIconsRight, rtlStyles.headerIconsRight]}>
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
              listingText=""
              displayPrice={displayPrice}
              selectedDates={selectedDates}
              onCalendarPress={openCalendar}
            />
          </View>

          {/* Property Information */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, rtlStyles.sectionTitle]}>{t("listings.propertyInformation")}</Text>
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
            <Text style={[styles.sectionTitle, rtlStyles.sectionTitle]}>{t("listings.propertyFeatures")}</Text>
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
                      rtlStyles.featureRow,
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
            <Text style={[styles.sectionTitle, rtlStyles.sectionTitle]}>{t("listings.extra")}</Text>
            <View style={styles.descriptionWrapper}>
              <Text
                style={[styles.description, styles.descriptionMeasure]}
                onTextLayout={handleDescriptionTextLayout}
              >
                {descriptionText}
              </Text>
              <Text
                style={[styles.description, rtlStyles.description]}
                numberOfLines={expandedDescription ? undefined : 3}
              >
                {descriptionText}
              </Text>
              {!expandedDescription && descriptionExceedsThreeLines && (
                <TouchableOpacity onPress={expandDescription}>
                  <Text style={[styles.readMore, rtlStyles.readMore]}>{t("listings.readMore")}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.sectionSeparator} />

          {/* Unit Rules - Only for Daily Listings */}
          <UnitRules property={property as DailyProperty} />
          <View style={styles.sectionSeparator} />

          {/* Location Map */}
          <PropertyLocation
            property={property}
            onPress={() => navigation.navigate("NearbyServices", { propertyId: property.id })}
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
            <TouchableOpacity style={[styles.reportAd, rtlStyles.reportAd]}>
              <Ionicons name="flag" size={wp(5.5)} color={COLORS.error} />
              <Text style={[styles.reportAdText, rtlStyles.reportAdText]}>{t("listings.reportAd")}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionSeparator} />

          {/* Extra spacing for daily booking card + bottom bar (responsive) */}
          <View style={{ height: hp(5) + hp(4) + insets.bottom }} />
        </ScrollView>

        {/* Fixed Bottom Card for Daily Bookings */}
        <DailyBookingCard
          property={property as DailyProperty}
          selectedDates={selectedDates}
          onChooseDate={openCalendar}
          onReserve={handleReserve}
        />

        {/* Bottom Contact Bar with Navigation Arrows */}
        <View style={{ paddingBottom: insets.bottom, backgroundColor: COLORS.white }}>
          <PropertyBottomBar
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrevPress={handlePrevProperty}
            onNextPress={handleNextProperty}
            onCall={() => {}}
            onWhatsApp={() => {}}
            onChat={handleChat}
            isDailyListing={true}
          />
        </View>
      </View>

      {/* Calendar Modal for Daily Bookings */}
      <CalendarModal
        visible={calendarVisible}
        onClose={closeCalendar}
        markedDates={markedDates}
        onDayPress={handleDateSelect}
        selectedDates={selectedDates}
        onResetDates={resetDates}
        property={property as DailyProperty}
      />

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
  headerIcons: {
    position: "absolute",
    top: Platform.OS === "ios" ? hp(3) : hp(2),
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
    color: "#111827",
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
    // marginHorizontal: wp(4),
  },
  reportAdSection: {
    backgroundColor: COLORS.background,
    paddingTop: hp(2),
  },
  reportAd: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    padding: wp(2),
  },
  reportAdText: {
    fontSize: wp(4),
    color: COLORS.error,
    marginLeft: wp(2),
    fontWeight: "600",
  },
});

