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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  PROPERTY_DATA,
  RENT_FILTER_OPTIONS,
  SALE_FILTER_OPTIONS,
  DAILY_FILTER_OPTIONS,
} from "../../data/propertyData";
import {
  openPhoneDialer,
  openWhatsApp,
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
  PropertyAdvertiser,
  PropertyTabs,
  PropertyBottomBar,
  AverageCard,
  FinancingOptionsCard,
  AverageSaleCard,
  IconButton,
} from "../../components";
import { useCalendar } from "../../hooks";
import type { Property, DailyProperty } from "../../types/property";
import type { CalendarDates } from "../../hooks/useCalendar";
import type { TabType } from "../../components/property/PropertyTabs";
import { COLORS } from "@/constants";

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
  const scrollViewRef = useRef<ScrollView>(null);

  // Use calendar hook
  const { selectedDates, markedDates, handleDateSelect, resetDates } =
    useCalendar(passedDates);

  const property = useMemo(
    () => PROPERTY_DATA.find((p) => p.id === propertyId),
    [propertyId]
  );

  // Find current index in visible properties list
  const currentPropertyIndex = useMemo(() => {
    if (!visiblePropertyIds || visiblePropertyIds.length === 0) return -1;
    return visiblePropertyIds.indexOf(propertyId);
  }, [visiblePropertyIds, propertyId]);

  const hasNavigation = currentPropertyIndex >= 0;
  const canGoPrev = hasNavigation && currentPropertyIndex > 0;
  const canGoNext =
    hasNavigation && currentPropertyIndex < visiblePropertyIds.length - 1;

  // Navigation handlers
  const handlePrevProperty = useCallback(() => {
    if (canGoPrev) {
      const prevPropertyId = visiblePropertyIds[currentPropertyIndex - 1];
      navigation.replace("PropertyDetails", {
        propertyId: prevPropertyId,
        visiblePropertyIds,
        listingType: passedListingType,
        selectedDates: passedDates,
      });
    }
  }, [
    canGoPrev,
    currentPropertyIndex,
    visiblePropertyIds,
    navigation,
    passedListingType,
    passedDates,
  ]);

  const handleNextProperty = useCallback(() => {
    if (canGoNext) {
      const nextPropertyId = visiblePropertyIds[currentPropertyIndex + 1];
      navigation.replace("PropertyDetails", {
        propertyId: nextPropertyId,
        visiblePropertyIds,
        listingType: passedListingType,
        selectedDates: passedDates,
      });
    }
  }, [
    canGoNext,
    currentPropertyIndex,
    visiblePropertyIds,
    navigation,
    passedListingType,
    passedDates,
  ]);

  const handleImageScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollPosition / SCREEN_WIDTH);
      setCurrentImageIndex(index);
    },
    []
  );

  const handleCall = useCallback(() => {
    openPhoneDialer("+966123456789");
  }, []);

  const handleWhatsApp = useCallback(() => {
    openWhatsApp("966123456789");
  }, []);

  const handleChat = useCallback(() => {
    console.log("Open chat");
  }, []);

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
    console.log("Handle reservation");
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

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      // Show sticky header when scrolled past image gallery (approximately hp(30))
      const threshold = hp(30) - hp(10); // Show header slightly before image ends
      setShowStickyHeader(offsetY > threshold);

      // Update animated value for potential future animations
      scrollY.setValue(offsetY);
    },
    [scrollY]
  );

  const renderFullScreenImage = useCallback(
    ({ item }: { item: string }) => (
      <View style={styles.fullScreenImageContainer}>
        <Image
          source={{ uri: item }}
          style={styles.fullScreenImage}
          resizeMode="contain"
        />
      </View>
    ),
    []
  );

  const keyExtractorFullscreen = useCallback(
    (item: string, index: number) => `fullscreen-${index}`,
    []
  );

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  if (!property) {
    return (
      <View style={styles.center}>
        <Text>Property not found</Text>
      </View>
    );
  }

  const propertyImages =
    property.images && property.images.length > 0
      ? property.images
      : [getDefaultImageUrl()];

  // Get type label from filter options
  const getPropertyTypeLabel = useCallback(() => {
    let filterOptions;
    if (property.listingType === "rent") filterOptions = RENT_FILTER_OPTIONS;
    else if (property.listingType === "sale")
      filterOptions = SALE_FILTER_OPTIONS;
    else filterOptions = DAILY_FILTER_OPTIONS;

    const option = filterOptions.find((opt) => opt.type === property.type);
    return option
      ? option.label
      : property.type.charAt(0).toUpperCase() + property.type.slice(1);
  }, [property]);

  const typeLabel = getPropertyTypeLabel();
  const listingText =
    property.listingType === "rent"
      ? "for rent"
      : property.listingType === "sale"
        ? "for sale"
        : "";

  const displayPrice = useMemo(() => {
    if (property.listingType === "rent") {
      const rentProperty = property as any;
      return `${rentProperty.price.replace(" K", ",000")} SAR / Yearly`;
    } else if (property.listingType === "sale") {
      const saleProperty = property as any;
      return `${saleProperty.price
        .replace(" M", ",000,000")
        .replace(" K", ",000")} SAR`;
    } else {
      const dailyProperty = property as any;
      if (selectedDates.startDate && selectedDates.endDate) {
        const days = calculateDays(
          selectedDates.startDate,
          selectedDates.endDate
        );
        return `${(dailyProperty.dailyPrice || 0) * days} SAR`;
      } else {
        return dailyProperty.bookingType === "daily" ? "Daily" : "Monthly";
      }
    }
  }, [property, selectedDates]);

  return (
    <>
      <View style={styles.container}>
        {/* Sticky Header - appears on scroll */}
        {showStickyHeader && (
          <View style={styles.stickyHeader}>
            <IconButton onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={wp(6)} color={COLORS.backButton} />
            </IconButton>
            <View style={styles.stickyHeaderSpacer} />  
            <View style={styles.stickyHeaderRight}>
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
        )}

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
              selectedDates={selectedDates}
              onCalendarPress={openCalendar}
            />
          </View>

          {/* Average Card - Only for Rent */}
          {property.listingType === "rent" && (
            <AverageCard property={property} />
          )}

          {/* Financing Options Card and Average Sale Card - Only for Sale */}
          {property.listingType === "sale" && (
            <>
              <FinancingOptionsCard onPress={handleFinancingOptions} />
              <AverageSaleCard property={property} />
            </>
          )}

          {/* Property Information */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Property Information</Text>
            <View style={styles.infoList}>
              {[
                { icon: "resize", label: "Area", value: `${property.area}` },
                {
                  icon: "bed",
                  label: "Bedrooms",
                  value: property.bedrooms.toString(),
                },
                {
                  icon: "home",
                  label: "Living Rooms",
                  value: (property.livingRooms || 1).toString(),
                },
                {
                  icon: "water",
                  label: "Restrooms",
                  value: (property.restrooms || 2).toString(),
                },
                {
                  icon: "business",
                  label: "Real estate age",
                  value:
                    property.estateAge > 0
                      ? `${property.estateAge} years`
                      : "New",
                },
                { icon: "pricetag", label: "Type", value: "Residential" },
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
            <Text style={styles.sectionTitle}>Property Features</Text>
            <View style={styles.featuresList}>
              {[
                { label: "Water" },
                { label: "Electricity" },
                { label: "Private Roof" },
                { label: "Special Entrance" },
                { label: "Near Bus" },
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
            <Text style={styles.sectionTitle}>Extra</Text>
            <Text
              style={styles.description}
              numberOfLines={expandedDescription ? undefined : 3}
            >
              {property.description ||
                "شقة دور أرضي بخدمات متكاملة، مناسبة للعائلات، قريبة من المدارس والخدمات الأساسية. 5 غرف مع مكيفات، حمامين، مطبخ مجهز، الدور الثاني."}
            </Text>
            {!expandedDescription && (
              <TouchableOpacity onPress={expandDescription}>
                <Text style={styles.readMore}>Read more</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.sectionSeparator} />

          {/* Location Map */}
          <PropertyLocation property={property} />
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
            <TouchableOpacity style={styles.reportAd}>
              <Ionicons name="flag" size={wp(5)} color="#ef4444" />
              <Text style={styles.reportAdText}>Report Ad</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionSeparator} />

          <View
            style={{
              height: property.listingType === "daily" ? hp(22) : hp(12),
            }}
          />
        </ScrollView>

        {/* Fixed Bottom Card for Daily Bookings */}
        {property.listingType === "daily" && (
          <DailyBookingCard
            property={property as DailyProperty}
            selectedDates={selectedDates}
            onChooseDate={openCalendar}
            onReserve={handleReserve}
          />
        )}

        {/* Bottom Contact Bar with Navigation Arrows */}
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

      {/* Calendar Modal for Daily Bookings */}
      {property.listingType === "daily" && (
        <CalendarModal
          visible={calendarVisible}
          onClose={closeCalendar}
          markedDates={markedDates}
          onDayPress={handleDateSelect}
          selectedDates={selectedDates}
          onResetDates={resetDates}
          property={property as DailyProperty}
        />
      )}

      {/* Full Screen Image Viewer */}
      <Modal
        visible={imageViewerVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={closeImageViewer}
        statusBarTranslucent={true}
      >
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity
            style={styles.closeImageViewer}
            onPress={closeImageViewer}
          >
            <Ionicons name="close-circle" size={wp(10)} color="#fff" />
          </TouchableOpacity>

          <FlatList
            data={propertyImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={currentImageIndex}
            getItemLayout={getItemLayout}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
            renderItem={renderFullScreenImage}
            keyExtractor={keyExtractorFullscreen}
          />

          <View style={styles.fullScreenCounter}>
            <Text style={styles.fullScreenCounterText}>
              {currentImageIndex + 1} / {propertyImages.length}
            </Text>
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
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    // paddingTop: Platform.OS === "ios" ? hp(6) : hp(5),
    paddingBottom: hp(2),
    backgroundColor: "#fff",
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
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
  stickyHeaderSpacer: {
    flex: 1,
  },
  stickyHeaderRight: {
    flexDirection: "row",
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
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  closeImageViewer: {
    position: "absolute",
    top: Platform.OS === "ios" ? hp(7) : hp(5),
    right: wp(4),
    zIndex: 100,
  },
  fullScreenImageContainer: {
    width: SCREEN_WIDTH,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
  fullScreenCounter: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? hp(7) : hp(5),
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(5),
  },
  fullScreenCounterText: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "600",
  },
});
