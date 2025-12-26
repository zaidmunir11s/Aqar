import React, { memo, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { getUsageLabel, getDefaultImageUrl, getTypeLabelFromType } from "../../utils";
import type { Property } from "../../types/property";
import { COLORS } from "../../constants";
import { DAILY_FILTER_OPTIONS } from "../../data/propertyData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface DailyBookingListCardProps {
  property: Property;
  onPress: () => void;
  priceLine: string;
  calculatedPrice?: number | null;
}

/**
 * Daily booking list card component with landscape image and navigation arrows
 */
const DailyBookingListCard = memo<DailyBookingListCardProps>(
  ({ property, onPress, priceLine, calculatedPrice }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const images = property.images && property.images.length > 0 
      ? property.images 
      : [getDefaultImageUrl()];

    const handleImageScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / SCREEN_WIDTH);
        setCurrentImageIndex(index);
      },
      []
    );

    const handlePrevImage = useCallback(() => {
      if (currentImageIndex > 0) {
        const newIndex = currentImageIndex - 1;
        flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
        setCurrentImageIndex(newIndex);
      }
    }, [currentImageIndex]);

    const handleNextImage = useCallback(() => {
      if (currentImageIndex < images.length - 1) {
        const newIndex = currentImageIndex + 1;
        flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
        setCurrentImageIndex(newIndex);
      }
    }, [currentImageIndex, images.length]);

    const renderImage = useCallback(
      ({ item }: { item: string }) => (
        <Image
          source={{ uri: item }}
          style={styles.image}
          resizeMode="cover"
        />
      ),
      []
    );

    const keyExtractor = useCallback(
      (item: string, index: number) => index.toString(),
      []
    );

    const typeLabel = getTypeLabelFromType(property.type, DAILY_FILTER_OPTIONS) || "Property";
    const usageLabel = getUsageLabel(property.usage);

    // Format location: "Chalet in Riyadh, Banban"
    const locationParts = property.address?.split(",").map(part => part.trim()) || [];
    let locationText = typeLabel;
    if (locationParts.length >= 2) {
      locationText = `${typeLabel} in ${locationParts[locationParts.length - 2]}, ${locationParts[locationParts.length - 1]}`;
    } else if (locationParts.length === 1 && locationParts[0]) {
      locationText = `${typeLabel} in ${locationParts[0]}`;
    } else {
      locationText = `${typeLabel} in ${property.address || "Location not available"}`;
    }

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={onPress}
      >
        {/* Landscape Image with Navigation Arrows */}
        <View style={styles.imageContainer}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
            renderItem={renderImage}
            keyExtractor={keyExtractor}
            onScrollToIndexFailed={() => {}}
          />

          {/* Left Arrow - Always show if there are multiple images */}
          {images.length > 1 && (
            <TouchableOpacity
              style={[styles.arrowButton, styles.leftArrow]}
              onPress={handlePrevImage}
              activeOpacity={0.7}
              disabled={currentImageIndex === 0}
            >
              <Ionicons 
                name="chevron-back" 
                size={wp(4.5)} 
                color="#333" 
              />
            </TouchableOpacity>
          )}

          {/* Right Arrow - Always show if there are multiple images */}
          {images.length > 1 && (
            <TouchableOpacity
              style={[styles.arrowButton, styles.rightArrow]}
              onPress={handleNextImage}
              activeOpacity={0.7}
              disabled={currentImageIndex === images.length - 1}
            >
              <Ionicons 
                name="chevron-forward" 
                size={wp(4.5)} 
                color="#333" 
              />
            </TouchableOpacity>
          )}

          {/* Image Dots Indicator */}
          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentImageIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>{priceLine}</Text>
          </View>

          {/* Property Details Section */}
          <View style={styles.detailsSection}>
            {property.area != null && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="arrow-expand-horizontal"
                  size={wp(4)}
                  color="#9ca3af"
                />
                <Text style={styles.detailText}>{property.area} m2</Text>
              </View>
            )}
            {property.bedrooms != null && (
              <View style={styles.detailItem}>
                <FontAwesome name="bed" size={wp(4)} color="#9ca3af" />
                <Text style={styles.detailText}>{property.bedrooms}</Text>
              </View>
            )}
            {property.restrooms != null && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="toilet"
                  size={wp(4)}
                  color="#9ca3af"
                />
                <Text style={styles.detailText}>{property.restrooms}</Text>
              </View>
            )}
          </View>

          {/* Location Section */}
          <View style={styles.locationSection}>
            <Ionicons name="location" size={wp(4)} color={COLORS.showListCardLocation} />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationText}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

DailyBookingListCard.displayName = "DailyBookingListCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    marginBottom: hp(2),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 4 },
    }),
  },
  imageContainer: {
    width: "100%",
    height: hp(20),
    position: "relative",
    backgroundColor: "#e5e7eb",
  },
  image: {
    width: SCREEN_WIDTH,
    height: hp(20),
  },
  arrowButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -wp(6) }],
    backgroundColor: "#fff",
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 3 },
    }),
  },
  leftArrow: {
    left: wp(2),
  },
  rightArrow: {
    right: wp(2),
  },
  dotsContainer: {
    position: "absolute",
    bottom: hp(1),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: wp(1.5),
  },
  dot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
  },
  content: {
    padding: wp(4),
  },
  priceSection: {
    marginBottom: hp(1),
  },
  price: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: COLORS.showListCardPrice,
  },
  detailsSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: hp(1),
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: wp(4),
    marginBottom: hp(0.5),
  },
  detailText: {
    marginLeft: wp(1),
    fontSize: wp(3.2),
    color: "#6b7280",
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    flex: 1,
    fontSize: wp(3.2),
    color: "#6b7280",
    marginLeft: wp(1),
  },
});

export default DailyBookingListCard;

