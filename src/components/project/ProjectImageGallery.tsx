import React, { memo, useCallback, useMemo, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
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

export interface ProjectImageGalleryProps {
  images: string[];
  currentIndex: number;
  onImageScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onImageViewerOpen: () => void;
  onBackPress: () => void;
  onSharePress: () => void;
  availableStatus: string;
  readyStatus: string;
  showStickyHeader?: boolean;
}

/**
 * Project image gallery component
 */
const ProjectImageGallery = memo<ProjectImageGalleryProps>(
  ({
    images,
    currentIndex,
    onImageScroll,
    onImageViewerOpen,
    onBackPress,
    onSharePress,
    availableStatus,
    readyStatus,
    showStickyHeader = false,
  }) => {
    const { t, isRTL } = useLocalization();
    const [showScrollBar, setShowScrollBar] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const hideScrollBarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollBarOpacity = useRef(new Animated.Value(0)).current;

    const scrollBarHeight = 3;
    const scrollBarTrackWidth = SCREEN_WIDTH; // Full width for positioning
    
    // Calculate scroll bar width based on number of images
    // More images = smaller width, fewer images = larger width
    const scrollBarWidth = useMemo(() => {
      if (images.length <= 1) return SCREEN_WIDTH;
      const minWidth = SCREEN_WIDTH * 0.15; // Minimum 15% of screen
      const maxWidth = SCREEN_WIDTH * 0.5; // Maximum 50% of screen
      const calculatedWidth = SCREEN_WIDTH / images.length;
      return Math.max(minWidth, Math.min(maxWidth, calculatedWidth));
    }, [images.length]);

    // Calculate scroll bar position based on actual scroll position (RTL-aware)
    const scrollBarPosition = useMemo(() => {
      if (images.length <= 1) return 0;
      const maxPosition = scrollBarTrackWidth - scrollBarWidth;
      // Calculate raw index from scroll position
      const rawIndex = Math.round(scrollPosition / SCREEN_WIDTH);
      // In RTL with inverted FlatList, scroll position 0 shows last image (on right)
      // So we need to reverse the calculation for RTL
      if (isRTL) {
        const reversedIndex = images.length - 1 - rawIndex;
        return (reversedIndex / (images.length - 1)) * maxPosition;
      } else {
        return (rawIndex / (images.length - 1)) * maxPosition;
      }
    }, [scrollPosition, images.length, isRTL, scrollBarTrackWidth, scrollBarWidth]);

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

    // Helper function to translate status
    const translateStatus = useCallback((status: string): string => {
      if (!status) return status;
      const lowerStatus = status.toLowerCase().trim();
      
      if (lowerStatus === "available") {
        return t("projects.status.available");
      } else if (lowerStatus === "ready") {
        return t("projects.status.ready");
      } else if (lowerStatus === "under construction") {
        return t("projects.status.underConstruction");
      }
      
      // Fallback to original if no match
      return status;
    }, [t]);

    const translatedAvailableStatus = useMemo(
      () => translateStatus(availableStatus),
      [availableStatus, translateStatus]
    );

    const translatedReadyStatus = useMemo(
      () => translateStatus(readyStatus),
      [readyStatus, translateStatus]
    );

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        seeAllPhotosBtn: {
          left: isRTL ? undefined : wp(4),
          right: isRTL ? wp(4) : undefined,
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        seeAllPhotosText: {
          marginLeft: isRTL ? 0 : wp(2),
          marginRight: isRTL ? wp(2) : 0,
        },
        statusBadges: {
          right: isRTL ? undefined : wp(4),
          left: isRTL ? wp(4) : undefined,
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        statusBadge: {
          marginLeft: isRTL ? 0 : wp(2),
          marginRight: isRTL ? wp(2) : 0,
        },
      }),
      [isRTL]
    );
    const renderImage = useCallback(
      ({ item }: { item: string }) => (
        <View>
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
          data={images}
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
        {images.length > 1 && (
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
        <TouchableOpacity
          style={[styles.seeAllPhotosBtn, rtlStyles.seeAllPhotosBtn]}
          onPress={onImageViewerOpen}
        >
          <Ionicons name="images" size={wp(4.5)} color="#fff" />
          <Text style={[styles.seeAllPhotosText, rtlStyles.seeAllPhotosText]}>
            {t("projects.allImages")} ({images.length})
          </Text>
        </TouchableOpacity>

        {/* Status Badges */}
        <View style={[styles.statusBadges, rtlStyles.statusBadges]}>
          <View style={[styles.statusBadge, styles.availableBadge, rtlStyles.statusBadge]}>
            <Text style={styles.availableBadgeText}>{translatedAvailableStatus}</Text>
          </View>
          <View style={[styles.statusBadge, styles.readyBadge, rtlStyles.statusBadge]}>
            <Text style={styles.readyBadgeText}>{translatedReadyStatus}</Text>
          </View>
        </View>
      </View>
    );
  }
);

ProjectImageGallery.displayName = "ProjectImageGallery";

const styles = StyleSheet.create({
  imageSection: {
    height: hp(30),
    backgroundColor: "#000",
  },
  image: {
    width: SCREEN_WIDTH,
    height: hp(30),
  },
  seeAllPhotosBtn: {
    position: "absolute",
    bottom: hp(2),
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    alignItems: "center",
  },
  seeAllPhotosText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "600",
  },
  statusBadges: {
    position: "absolute",
    bottom: hp(2),
  },
  statusBadge: {
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(0.8),
    borderRadius: wp(1),
  },
  availableBadge: {
    backgroundColor: "#e1eef4",
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  readyBadge: {
    backgroundColor: "#d1d5e0",
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  availableBadgeText: {
    color: "#1f85b3",
    fontSize: wp(3.2),
    fontWeight: "600",
  },
  readyBadgeText: {
    color: COLORS.textSecondary ,
    fontSize: wp(3.2),
    fontWeight: "600",
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

export default ProjectImageGallery;
