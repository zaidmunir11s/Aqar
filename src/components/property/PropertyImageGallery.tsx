import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
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
  ListRenderItemInfo,
  LayoutChangeEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useLocalization } from "../../hooks/useLocalization";
import { COLORS } from "@/constants";
import { isOnlyDefaultPropertyPlaceholderImages } from "@/utils/propertyHelpers";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/** Slightly darker than `COLORS.background` for per-slide image captions */
const IMAGE_CAPTION_BAND_BG = "#dde2e8";

export type PropertyImageGallerySlide = {
  uri: string;
  caption: string;
};

export interface PropertyImageGalleryProps {
  images: string[];
  /** Same length as `images`; captions scroll with each slide. Omit for legacy screens. */
  imageCaptions?: string[];
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

const IMAGE_AREA_H = hp(30);
/** “See all” sits this far above the bottom edge of the image area */
const SEE_ALL_OFFSET_FROM_IMAGE_BOTTOM = hp(7);

/**
 * Horizontal image carousel; optional per-slide captions (publish preview) scroll with images.
 */
const PropertyImageGallery = memo<PropertyImageGalleryProps>(
  ({
    images,
    imageCaptions,
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
    const hideScrollBarTimer = useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );
    const scrollBarOpacity = useRef(new Animated.Value(0)).current;

    const validImages = images && images.length > 0 ? images : [];
    const scrollBarTrackWidth = SCREEN_WIDTH;

    const plainPlaceholderOnly = useMemo(
      () => isOnlyDefaultPropertyPlaceholderImages(validImages),
      [validImages],
    );

    const slides: PropertyImageGallerySlide[] = useMemo(() => {
      return validImages.map((uri, i) => ({
        uri,
        caption: (imageCaptions?.[i] ?? "").trim(),
      }));
    }, [validImages, imageCaptions]);

    const showCaptionRail = useMemo(
      () => imageCaptions != null && slides.some((s) => s.caption.length > 0),
      [imageCaptions, slides],
    );

    const [listCrossAxisSize, setListCrossAxisSize] = useState(IMAGE_AREA_H);
    const slideHeightsRef = useRef<number[]>([]);

    useEffect(() => {
      slideHeightsRef.current = new Array(slides.length).fill(0);
      setListCrossAxisSize(IMAGE_AREA_H);
    }, [slides.length, showCaptionRail]);

    /** Horizontal FlatList inside a parent ScrollView often never reports useful content height via onContentSizeChange — measure slides instead. */
    const handleSlideLayout = useCallback(
      (index: number, e: LayoutChangeEvent) => {
        if (!showCaptionRail) return;
        const h = Math.ceil(e.nativeEvent.layout.height);
        slideHeightsRef.current[index] = h;
        const reported = slideHeightsRef.current.filter((x) => x > 0);
        const maxSlide =
          reported.length > 0
            ? Math.max(IMAGE_AREA_H, ...reported)
            : IMAGE_AREA_H;
        setListCrossAxisSize(maxSlide);
      },
      [showCaptionRail],
    );

    const galleryHeight = showCaptionRail ? listCrossAxisSize : IMAGE_AREA_H;

    const scrollBarWidth = useMemo(() => {
      if (slides.length <= 1) return SCREEN_WIDTH;
      const minWidth = SCREEN_WIDTH * 0.15;
      const maxWidth = SCREEN_WIDTH * 0.5;
      const calculatedWidth = SCREEN_WIDTH / slides.length;
      return Math.max(minWidth, Math.min(maxWidth, calculatedWidth));
    }, [slides.length]);

    const scrollBarPosition = useMemo(() => {
      if (slides.length <= 1) return 0;
      const maxPosition = scrollBarTrackWidth - scrollBarWidth;
      const rawIndex = Math.round(scrollPosition / SCREEN_WIDTH);
      if (isRTL) {
        const reversedIndex = slides.length - 1 - rawIndex;
        return (reversedIndex / (slides.length - 1)) * maxPosition;
      }
      return (rawIndex / (slides.length - 1)) * maxPosition;
    }, [
      scrollPosition,
      slides.length,
      isRTL,
      scrollBarTrackWidth,
      scrollBarWidth,
    ]);

    useEffect(() => {
      Animated.timing(scrollBarOpacity, {
        toValue: showScrollBar ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, [showScrollBar, scrollBarOpacity]);

    const handleScrollBegin = useCallback(() => {
      setShowScrollBar(true);
      if (hideScrollBarTimer.current) {
        clearTimeout(hideScrollBarTimer.current);
      }
    }, []);

    const handleScrollEnd = useCallback(() => {
      if (hideScrollBarTimer.current) {
        clearTimeout(hideScrollBarTimer.current);
      }
      hideScrollBarTimer.current = setTimeout(() => {
        setShowScrollBar(false);
      }, 1000);
    }, []);

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const position = event.nativeEvent.contentOffset.x;
        setScrollPosition(position);
        onImageScroll(event);
        handleScrollBegin();
        handleScrollEnd();
      },
      [onImageScroll, handleScrollBegin, handleScrollEnd],
    );

    useEffect(() => {
      return () => {
        if (hideScrollBarTimer.current) {
          clearTimeout(hideScrollBarTimer.current);
        }
      };
    }, []);

    const renderSlide = useCallback(
      ({ item, index }: ListRenderItemInfo<PropertyImageGallerySlide>) => (
        <View
          style={styles.slidePage}
          onLayout={(e) => handleSlideLayout(index, e)}
        >
          <View style={styles.imageWrapper}>
            <TouchableOpacity activeOpacity={0.9} onPress={onImageViewerOpen}>
              <Image
                source={{ uri: item.uri }}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
          {showCaptionRail && item.caption.length > 0 ? (
            <View style={[styles.captionSlot, styles.captionSlotFilled]}>
              <Text
                style={[
                  styles.captionText,
                  isRTL && styles.captionTextRtlWriting,
                ]}
              >
                {item.caption}
              </Text>
            </View>
          ) : null}
        </View>
      ),
      [onImageViewerOpen, showCaptionRail, isRTL, handleSlideLayout],
    );

    const keyExtractor = useCallback(
      (_item: PropertyImageGallerySlide, index: number) => index.toString(),
      [],
    );

    const getItemLayout = useCallback(
      (
        _data: ArrayLike<PropertyImageGallerySlide> | null | undefined,
        index: number,
      ) => ({
        length: SCREEN_WIDTH,
        offset: SCREEN_WIDTH * index,
        index,
      }),
      [],
    );

    const scrollThumbTop = IMAGE_AREA_H - 3;
    const seeAllTop = IMAGE_AREA_H - SEE_ALL_OFFSET_FROM_IMAGE_BOTTOM;

    if (plainPlaceholderOnly && validImages[0]) {
      return (
        <View
          style={[
            styles.imageSection,
            styles.plainPlaceholderSection,
            { height: IMAGE_AREA_H },
          ]}
        >
          <Image
            source={{ uri: validImages[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      );
    }

    return (
      <View style={[styles.imageSection, { height: galleryHeight }]}>
        <FlatList
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBegin}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          renderItem={renderSlide}
          keyExtractor={keyExtractor}
          getItemLayout={showCaptionRail ? undefined : getItemLayout}
          removeClippedSubviews={false}
          snapToInterval={SCREEN_WIDTH}
          decelerationRate="fast"
          snapToAlignment="start"
          inverted={isRTL}
          disableIntervalMomentum
          bounces={false}
          style={{ height: galleryHeight }}
          contentContainerStyle={
            showCaptionRail ? styles.listContentWithCaptions : undefined
          }
          {...(showCaptionRail && slides.length > 0 && slides.length <= 24
            ? {
                initialNumToRender: slides.length,
                maxToRenderPerBatch: slides.length,
                windowSize: Math.min(21, slides.length + 2),
              }
            : {})}
        />

        {slides.length > 1 && (
          <Animated.View
            style={[
              styles.scrollBarContainer,
              isRTL && styles.scrollBarContainerRTL,
              {
                opacity: scrollBarOpacity,
                width: scrollBarTrackWidth,
                top: scrollThumbTop,
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

        {slides.length > 0 && (
          <TouchableOpacity
            style={[
              styles.seeAllPhotosBtn,
              isRTL && styles.seeAllPhotosBtnRTL,
              { top: seeAllTop },
            ]}
            onPress={onImageViewerOpen}
          >
            <Ionicons name="images" size={wp(4.5)} color="#fff" />
            <Text
              style={[
                styles.seeAllPhotosText,
                isRTL && styles.seeAllPhotosTextRTL,
              ]}
            >
              {slides.length} {t("listings.seeAllPhotos")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

PropertyImageGallery.displayName = "PropertyImageGallery";

const styles = StyleSheet.create({
  imageSection: {
    backgroundColor: COLORS.background,
    width: "100%",
  },
  plainPlaceholderSection: {
    overflow: "hidden",
  },
  listContentWithCaptions: {
    alignItems: "flex-start",
  },
  slidePage: {
    width: SCREEN_WIDTH,
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: IMAGE_AREA_H,
  },
  image: {
    width: SCREEN_WIDTH,
    height: IMAGE_AREA_H,
  },
  captionSlot: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.5),
  },
  captionSlotFilled: {
    backgroundColor: IMAGE_CAPTION_BAND_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  captionText: {
    width: "100%",
    fontSize: wp(3.4),
    lineHeight: hp(2),
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  captionTextRtlWriting: {
    writingDirection: "rtl",
  },
  seeAllPhotosBtn: {
    position: "absolute",
    zIndex: 2,
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
    textAlign: "right",
    writingDirection: "rtl",
  },
  scrollBarContainer: {
    position: "absolute",
    left: 0,
    height: 3,
    justifyContent: "center",
    zIndex: 2,
  },
  scrollBarContainerRTL: {},
  scrollBarThumb: {
    height: 3,
    backgroundColor: "#808080",
    borderRadius: 1.5,
  },
});

export default PropertyImageGallery;
