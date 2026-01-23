import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Platform,
  Modal,
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
  DAILY_FILTER_OPTIONS,
} from "../../data/propertyData";
import {
  calculateDays,
  getDefaultImageUrl,
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
import ScreenHeader from "../../components/common/ScreenHeader";
import { useCalendar } from "../../hooks";
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

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imageViewerVisible, setImageViewerVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>("main");
  const [expandedDescription, setExpandedDescription] =
    useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [favorited, setFavorited] = useState<boolean>(false);
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);
  const [showStickyHeader, setShowStickyHeader] = useState<boolean>(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-100)).current; // Start off-screen
  const scrollViewRef = useRef<ScrollView>(null);

  // Use calendar hook for daily bookings
  const { selectedDates, markedDates, handleDateSelect, resetDates } =
    useCalendar(passedDates);

  const property = useMemo(
    () => PROPERTY_DATA.find((p) => p.id === propertyId) as DailyProperty | undefined,
    [propertyId]
  );

  // Filter visible properties based on selected dates and minimum days requirement
  const filteredVisiblePropertyIds = useMemo(() => {
    if (!selectedDates?.startDate || !selectedDates?.endDate) {
      // If no dates selected, return all visible properties
      return visiblePropertyIds;
    }

    const days = calculateDays(selectedDates.startDate, selectedDates.endDate);

    // Filter properties that meet minimum days requirement
    return visiblePropertyIds.filter((id) => {
      const prop = PROPERTY_DATA.find((p) => p.id === id);
      if (!prop || prop.listingType !== "daily") {
        // For non-daily properties, include them (no minimum days requirement)
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
  }, [visiblePropertyIds, selectedDates]);

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
        visiblePropertyIds: visiblePropertyIds, // Use original list, not filtered
        listingType: passedListingType,
        // Don't pass selectedDates - let user select dates again for next property
      });
    }
  }, [
    canGoPrev,
    currentPropertyIndex,
    filteredVisiblePropertyIds,
    visiblePropertyIds,
    navigation,
    passedListingType,
  ]);

  const handleNextProperty = useCallback(() => {
    if (canGoNext) {
      const nextPropertyId = filteredVisiblePropertyIds[currentPropertyIndex + 1];
      // Check if next property is daily or not
      const nextProperty = PROPERTY_DATA.find((p) => p.id === nextPropertyId);
      const screenName = nextProperty?.listingType === "daily" ? "DailyDetails" : "PropertyDetails";
      navigation.replace(screenName, {
        propertyId: nextPropertyId,
        visiblePropertyIds: visiblePropertyIds, // Use original list, not filtered
        listingType: passedListingType,
        // Don't pass selectedDates - let user select dates again for next property
      });
    }
  }, [
    canGoNext,
    currentPropertyIndex,
    filteredVisiblePropertyIds,
    visiblePropertyIds,
    navigation,
    passedListingType,
  ]);

  const handleImageScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollPosition / SCREEN_WIDTH);
      setCurrentImageIndex(index);
    },
    []
  );

  const handleChat = useCallback(() => {
    if (!property) return;
    
    // Navigate to ContactHostScreen
    navigation.navigate("ContactHost", {
      propertyId: property.id,
      selectedDates: selectedDates,
    });
  }, [navigation, property, selectedDates]);

  const handleShare = useCallback(() => {
    console.log("Share property");
  }, []);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("MapLanding");
    }
  }, [navigation]);

  const toggleLike = useCallback(() => {
    setLiked((prev) => !prev);
  }, []);

  const toggleFavorite = useCallback(() => {
    setFavorited((prev) => !prev);
  }, []);

  const openImageViewer = useCallback(() => {
    setImageViewerVisible(true);
  }, []);

  const closeImageViewer = useCallback(() => {
    setImageViewerVisible(false);
  }, []);

  const expandDescription = useCallback(() => {
    setExpandedDescription(true);
  }, []);

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
      // Show sticky header when scrolled past image gallery (approximately hp(30))
      const threshold = hp(30) - hp(10); // Show header slightly before image ends
      const shouldShow = offsetY > threshold;
      
      if (shouldShow !== showStickyHeader) {
        setShowStickyHeader(shouldShow);
        // Animate header sliding down/up
        Animated.timing(headerTranslateY, {
          toValue: shouldShow ? 0 : -100,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }

      // Update animated value for potential future animations
      scrollY.setValue(offsetY);
    },
    [scrollY, showStickyHeader, headerTranslateY]
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
      imagesSectionTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
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
  }, [property, selectedDates]);

  return (
    <>
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* Icons - Always visible, absolute positioned */}
        <View style={[styles.headerIcons, rtlStyles.headerIcons]}>
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

        {/* Sticky Header Background - slides in to join icons on scroll */}
        <Animated.View
          style={[
            styles.stickyHeaderBackground,
            {
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
                  backgroundColor={index % 2 === 0 ? "#fff" : "#ebf1f1"}
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
                { label: t("listings.privateRoof") },
                { label: t("listings.specialEntrance") },
                { label: t("listings.nearBus") },
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
                          rowIndex % 2 === 0 ? "#fff" : "#ebf1f1",
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
            <Text
              style={[styles.description, rtlStyles.description]}
              numberOfLines={expandedDescription ? undefined : 3}
            >
              {property.description ||
                "شقة دور أرضي بخدمات متكاملة، مناسبة للعائلات، قريبة من المدارس والخدمات الأساسية. 5 غرف مع مكيفات، حمامين، مطبخ مجهز، الدور الثاني."}
            </Text>
            {!expandedDescription && (
              <TouchableOpacity onPress={expandDescription}>
                <Text style={[styles.readMore, rtlStyles.readMore]}>{t("listings.readMore")}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.sectionSeparator} />

          {/* Unit Rules - Only for Daily Listings */}
          <UnitRules property={property as DailyProperty} />
          <View style={styles.sectionSeparator} />

          {/* Location Map */}
          <PropertyLocation property={property} />
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
              <Ionicons name="flag" size={wp(5)} color="#ef4444" />
              <Text style={[styles.reportAdText, rtlStyles.reportAdText]}>{t("listings.reportAd")}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionSeparator} />

          {/* Extra spacing for daily booking card */}
          <View style={{ height: hp(22) }} />
        </ScrollView>

        {/* Fixed Bottom Card for Daily Bookings */}
        <DailyBookingCard
          property={property as DailyProperty}
          selectedDates={selectedDates}
          onChooseDate={openCalendar}
          onReserve={handleReserve}
        />

        {/* Bottom Contact Bar with Navigation Arrows */}
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

      {/* Full Screen Image Viewer */}
      <Modal
        visible={imageViewerVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={closeImageViewer}
        statusBarTranslucent={true}
      >
        <View style={styles.imageViewerContainer}>
          <View style={[styles.imageViewerHeaderContainer, { paddingTop: insets.top }]}>
            <ScreenHeader
              title={t("listings.listingMedia")}
              onBackPress={closeImageViewer}
              backButtonColor={COLORS.backButton}
            />
          </View>
          
          <View style={styles.imageViewerContent}>
            <View style={styles.imagesSectionHeader}>
              <Text style={[styles.imagesSectionTitle, rtlStyles.imagesSectionTitle]}>{t("listings.images")}</Text>
              <View style={styles.imagesSectionBorder} />
            </View>
            
            <ScrollView
              style={styles.imagesScrollView}
              contentContainerStyle={styles.imagesScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {propertyImages.map((imageUri, index) => (
                <View key={`image-${index}`} style={styles.imageItemContainer}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.imageItem}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebf1f1",
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
    borderBottomColor: "#e5e7eb",
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
    backgroundColor: "#ebf1f1",
  },
  headerContainer: {
    backgroundColor: "#ebf1f1",
    paddingTop: hp(1),
  },
  sectionContainer: {
    backgroundColor: "#ebf1f1",
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
    backgroundColor: "#ebf1f1",
  },
  featuresList: {
    backgroundColor: "#ebf1f1",
  },
  featureRow: {
    flexDirection: "row",
    width: "100%",
  },
  extraSection: {
    backgroundColor: "#ebf1f1",
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(1),
  },
  description: {
    fontSize: wp(3.5),
    color: "#4b5563",
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
    borderBottomColor: "#d1d5db",
    marginHorizontal: wp(4),
  },
  reportAdSection: {
    backgroundColor: "#ebf1f1",
    paddingTop: hp(2),
  },
  reportAd: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: wp(4),
    marginHorizontal: wp(4),
    borderRadius: wp(2),
  },
  reportAdText: {
    fontSize: wp(3.5),
    color: "#ef4444",
    marginLeft: wp(2),
    fontWeight: "600",
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "#ebf1f1",
  },
  imageViewerHeaderContainer: {
    backgroundColor: "#fff",
  },
  imageViewerContent: {
    flex: 1,
    backgroundColor: "#ebf1f1",
  },
  imagesSectionHeader: {
    backgroundColor: "#ebf1f1",
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(1.5),
  },
  imagesSectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hp(1),
    textAlign: "center",
  },
  imagesSectionBorder: {
    height: 2,
    backgroundColor: COLORS.primary,
    width: "100%",
  },
  imagesScrollView: {
    flex: 1,
  },
  imagesScrollContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  imageItemContainer: {
    marginBottom: hp(2),
    borderRadius: wp(2),
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  imageItem: {
    width: "100%",
    height: hp(40),
    borderRadius: wp(2),
  },
});

