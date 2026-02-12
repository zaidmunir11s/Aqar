import React, { memo, useCallback, useMemo, useState, useRef, useEffect } from "react";
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
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useLocalization } from "../../hooks/useLocalization";
import { COLORS } from "@/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface PropertyImageGalleryProps {
  images: string[];
  currentIndex: number;
  onImageScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onImageViewerOpen: () => void;
  onBackPress: () => void;
  onLikePress: () => void;
  onSharePress: () => void;
  onFavoritePress: () => void;
  liked: boolean;
  favorited: boolean;
  showStickyHeader?: boolean;
}

/**
 * Property image gallery component with header overlay
 */
const PropertyImageGallery = memo<PropertyImageGalleryProps>(
  ({
    images,
    currentIndex,
    onImageScroll,
    onImageViewerOpen,
    onBackPress,
    onLikePress,
    onSharePress,
    onFavoritePress,
    liked,
    favorited,
    showStickyHeader = false,
  }) => {
    const { t, isRTL } = useLocalization();
    const [showScrollBar, setShowScrollBar] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const hideScrollBarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollBarOpacity = useRef(new Animated.Value(0)).current;

    // Ensure we have valid images array
    const validImages = images && images.length > 0 ? images : [];
    const scrollBarHeight = 3;
    const scrollBarTrackWidth = SCREEN_WIDTH; // Full width for positioning
    
    // Calculate scroll bar width based on number of images
    // More images = smaller width, fewer images = larger width
    const scrollBarWidth = useMemo(() => {
      if (validImages.length <= 1) return SCREEN_WIDTH;
      const minWidth = SCREEN_WIDTH * 0.15; // Minimum 15% of screen
      const maxWidth = SCREEN_WIDTH * 0.5; // Maximum 50% of screen
      const calculatedWidth = SCREEN_WIDTH / validImages.length;
      return Math.max(minWidth, Math.min(maxWidth, calculatedWidth));
    }, [validImages.length]);

    // Calculate scroll bar position based on actual scroll position (RTL-aware)
    const scrollBarPosition = useMemo(() => {
      if (validImages.length <= 1) return 0;
      const maxPosition = scrollBarTrackWidth - scrollBarWidth;
      // Calculate raw index from scroll position
      const rawIndex = Math.round(scrollPosition / SCREEN_WIDTH);
      // In RTL with inverted FlatList, scroll position 0 shows last image (on right)
      // So we need to reverse the calculation for RTL
      if (isRTL) {
        const reversedIndex = validImages.length - 1 - rawIndex;
        return (reversedIndex / (validImages.length - 1)) * maxPosition;
      } else {
        return (rawIndex / (validImages.length - 1)) * maxPosition;
      }
    }, [scrollPosition, validImages.length, isRTL, scrollBarTrackWidth, scrollBarWidth]);

    // Show/hide scroll bar with animation
    useEffect(() => {
      Animated.timing(scrollBarOpacity, {
        toValue: showScrollBar ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, [showScrollBar, scrollBarOpacity]);

    // Handle scroll start
    const handleScrollBegin = useCallback(() => {
      setShowScrollBar(true);
      if (hideScrollBarTimer.current) {
        clearTimeout(hideScrollBarTimer.current);
      }
    }, []);

    // Handle scroll end
    const handleScrollEnd = useCallback(() => {
      if (hideScrollBarTimer.current) {
        clearTimeout(hideScrollBarTimer.current);
      }
      hideScrollBarTimer.current = setTimeout(() => {
        setShowScrollBar(false);
      }, 1000); // Hide after 1 second of no scrolling
    }, []);

    // Combined scroll handler
    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const position = event.nativeEvent.contentOffset.x;
        setScrollPosition(position);
        onImageScroll(event);
        handleScrollBegin();
        handleScrollEnd();
      },
      [onImageScroll, handleScrollBegin, handleScrollEnd]
    );

    // Cleanup timer on unmount
    useEffect(() => {
      return () => {
        if (hideScrollBarTimer.current) {
          clearTimeout(hideScrollBarTimer.current);
        }
      };
    }, []);

    const renderImage = useCallback(
      ({ item }: { item: string }) => (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      ),
      []
    );

    const keyExtractor = useCallback(
      (item: string, index: number) => index.toString(),
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

    return (
      <View style={styles.imageSection}>
        <FlatList
          data={validImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBegin}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          renderItem={renderImage}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          removeClippedSubviews={false}
          snapToInterval={SCREEN_WIDTH}
          decelerationRate="fast"
          snapToAlignment="start"
          inverted={isRTL}
          disableIntervalMomentum={true}
          bounces={false}
        />

        {/* Scroll Bar Indicator */}
        {validImages.length > 1 && (
          <Animated.View
            style={[
              styles.scrollBarContainer,
              isRTL && styles.scrollBarContainerRTL,
              {
                opacity: scrollBarOpacity,
                width: scrollBarTrackWidth,
              },
            ]}
            pointerEvents="none"
          >
            <Animated.View
              style={[
                styles.scrollBarThumb,
                {
                  width: scrollBarWidth,
                  transform: [{ translateX: scrollBarPosition }],
                },
              ]}
            />
          </Animated.View>
        )}


        {/* See All Photos Button */}
        {validImages.length > 0 && (
        <TouchableOpacity
          style={[styles.seeAllPhotosBtn, isRTL && styles.seeAllPhotosBtnRTL]}
          onPress={onImageViewerOpen}
        >
          <Ionicons name="images" size={wp(4.5)} color="#fff" />
          <Text style={[styles.seeAllPhotosText, isRTL && styles.seeAllPhotosTextRTL]}>
              {validImages.length} {t("listings.seeAllPhotos")}
          </Text>
        </TouchableOpacity>
        )}
      </View>
    );
  }
);

PropertyImageGallery.displayName = "PropertyImageGallery";

const styles = StyleSheet.create({
  imageSection: {
    height: hp(30),
    backgroundColor: COLORS.background,
    width: "100%",
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: hp(30),
  },
  image: {
    width: SCREEN_WIDTH,
    height: hp(30),
  },
  seeAllPhotosBtn: {
    position: "absolute",
    bottom: hp(2),
    left: wp(4),
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllPhotosText: {
    color: "#fff",
    fontSize: wp(3.5),
    marginLeft: wp(2),
    fontWeight: "600",
  },
  seeAllPhotosBtnRTL: {
    left: undefined,
    right: wp(4),
    flexDirection: "row-reverse",
  },
  seeAllPhotosTextRTL: {
    marginLeft: 0,
    marginRight: wp(2),
  },
  scrollBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 3,
    justifyContent: "center",
  },
  scrollBarContainerRTL: {
    // Keep left: 0 for consistent transform behavior
    // The transform will handle RTL positioning
  },
  scrollBarThumb: {
    height: 3,
    backgroundColor: "#808080",
    borderRadius: 1.5,
  },
});

export default PropertyImageGallery;
