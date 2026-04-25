import React, { useCallback, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ListRenderItemInfo,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import PagerView from "react-native-pager-view";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenHeader from "../../components/common/ScreenHeader";
import GalleryVideoSlide from "../../components/property/GalleryVideoSlide";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export type ListingMediaRouteParams = {
  images: string[];
  /** Same length as `images`; shown above each image (Listing Media), vs below in Property gallery. */
  imageCaptions?: string[];
  /** Shown as a second tab with native video players (e.g. marketing publish preview). */
  videoUris?: string[];
};

const IMAGE_ITEM_HEIGHT = hp(40);
const VIDEO_ITEM_HEIGHT = hp(40);
/** Match PropertyImageGallery caption band */
const IMAGE_CAPTION_BAND_BG = "#dde2e8";

type MediaTab = "images" | "videos";

function ListingMediaScreen(): React.JSX.Element {
  const route = useRoute();
  const navigation = useNavigation();
  const { width: windowWidth } = useWindowDimensions();
  const { t, isRTL } = useLocalization();

  const params = route.params as ListingMediaRouteParams | undefined;
  const images = params?.images ?? [];
  const imageCaptions = params?.imageCaptions;
  const videoUris = params?.videoUris ?? [];
  const hasVideos = videoUris.length > 0;
  const mediaContentWidth = windowWidth - wp(8);

  const hasAnyImageCaption = useMemo(
    () => imageCaptions?.some((c) => (c ?? "").trim().length > 0) ?? false,
    [imageCaptions],
  );

  const initialTab: MediaTab =
    images.length === 0 && hasVideos ? "videos" : "images";
  const initialPageIndex = initialTab === "videos" ? 1 : 0;

  const [activeTab, setActiveTab] = useState<MediaTab>(initialTab);
  const pagerRef = useRef<PagerView>(null);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const goToTab = useCallback((tab: MediaTab) => {
    const page = tab === "images" ? 0 : 1;
    setActiveTab(tab);
    pagerRef.current?.setPage(page);
  }, []);

  const onPageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      const page = e.nativeEvent.position;
      setActiveTab(page === 0 ? "images" : "videos");
    },
    [],
  );

  const renderImageItem = useCallback(
    ({ item, index }: ListRenderItemInfo<string>) => {
      const caption = (imageCaptions?.[index] ?? "").trim();
      return (
        <View style={styles.imageItemContainer}>
          {caption.length > 0 ? (
            <View style={styles.imageCaptionBandTop}>
              <Text
                style={[
                  styles.imageCaptionText,
                  isRTL && styles.imageCaptionTextRtlWriting,
                ]}
              >
                {caption}
              </Text>
            </View>
          ) : null}
          <Image
            source={{ uri: item }}
            style={[
              styles.imageItem,
              caption.length > 0 && styles.imageItemUnderCaption,
            ]}
            resizeMode="cover"
          />
        </View>
      );
    },
    [imageCaptions, isRTL],
  );

  const renderVideoItem = useCallback(
    ({ item }: ListRenderItemInfo<string>) => (
      <View style={styles.videoItemContainer}>
        <GalleryVideoSlide
          uri={item}
          width={mediaContentWidth}
          height={VIDEO_ITEM_HEIGHT}
        />
      </View>
    ),
    [mediaContentWidth],
  );

  const imageKeyExtractor = useCallback(
    (_: string, index: number) => `image-${index}`,
    [],
  );
  const videoKeyExtractor = useCallback(
    (_: string, index: number) => `video-${index}`,
    [],
  );

  /** Only when no captions: row heights are uniform (caption bands make measured height unpredictable). */
  const getImageItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: IMAGE_ITEM_HEIGHT + hp(2),
      offset: (IMAGE_ITEM_HEIGHT + hp(2)) * index,
      index,
    }),
    [],
  );

  const getVideoItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: VIDEO_ITEM_HEIGHT + hp(2),
      offset: (VIDEO_ITEM_HEIGHT + hp(2)) * index,
      index,
    }),
    [],
  );

  const pagerLayoutDirection = useMemo<"rtl" | "ltr">(
    () => (isRTL ? "rtl" : "ltr"),
    [isRTL],
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.listingMedia")}
        onBackPress={handleBackPress}
        backButtonColor={COLORS.backButton}
      />

      <View style={[styles.sectionTabsRow, isRTL && styles.sectionTabsRowRTL]}>
        <TouchableOpacity
          style={[
            styles.sectionTab,
            activeTab === "images" && styles.sectionTabActive,
          ]}
          onPress={() => goToTab("images")}
          activeOpacity={0.75}
        >
          <Text
            style={[
              styles.sectionTabLabel,
              activeTab === "images" && styles.sectionTabLabelActive,
              isRTL && styles.sectionTabLabelRTL,
            ]}
          >
            {t("listings.images")}
          </Text>
        </TouchableOpacity>
        {hasVideos ? (
          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeTab === "videos" && styles.sectionTabActive,
            ]}
            onPress={() => goToTab("videos")}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.sectionTabLabel,
                activeTab === "videos" && styles.sectionTabLabelActive,
                isRTL && styles.sectionTabLabelRTL,
              ]}
            >
              {t("listings.listingVideo")}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* PagerView must never receive `null` children — its internals clone every child and crash on null. */}
      {hasVideos ? (
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={initialPageIndex}
          layoutDirection={pagerLayoutDirection}
          scrollEnabled
          onPageSelected={onPageSelected}
        >
          <View key="page-images" style={styles.page} collapsable={false}>
            <FlatList
              data={images}
              renderItem={renderImageItem}
              keyExtractor={imageKeyExtractor}
              contentContainerStyle={styles.listContent}
              style={styles.list}
              showsVerticalScrollIndicator
              getItemLayout={
                images.length > 20 && !hasAnyImageCaption
                  ? getImageItemLayout
                  : undefined
              }
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={5}
              removeClippedSubviews
              nestedScrollEnabled
            />
          </View>
          <View key="page-videos" style={styles.page} collapsable={false}>
            <FlatList
              data={videoUris}
              renderItem={renderVideoItem}
              keyExtractor={videoKeyExtractor}
              contentContainerStyle={styles.listContent}
              style={styles.list}
              showsVerticalScrollIndicator
              getItemLayout={
                videoUris.length > 10 ? getVideoItemLayout : undefined
              }
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={5}
              removeClippedSubviews
              nestedScrollEnabled
            />
          </View>
        </PagerView>
      ) : (
        <View style={styles.page}>
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={imageKeyExtractor}
            contentContainerStyle={styles.listContent}
            style={styles.list}
            showsVerticalScrollIndicator
            getItemLayout={
              images.length > 20 && !hasAnyImageCaption
                ? getImageItemLayout
                : undefined
            }
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}
            removeClippedSubviews
            nestedScrollEnabled
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sectionTabsRow: {
    flexDirection: "row",
    width: "100%",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    /** Darker off-white than — clearly not pure white */
    backgroundColor: "#f9fafb",
  },
  sectionTabsRowRTL: {
    flexDirection: "row-reverse",
  },
  sectionTab: {
    flex: 1,
    paddingVertical: hp(1),
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -StyleSheet.hairlineWidth,
  },
  sectionTabActive: {
    borderBottomColor: COLORS.primary,
  },
  sectionTabLabel: {
    fontSize: wp(4),
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  sectionTabLabelActive: {
    color: COLORS.textPrimary,
  },
  sectionTabLabelRTL: {
    textAlign: "center",
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  imageItemContainer: {
    marginBottom: hp(2),
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  imageCaptionBandTop: {
    width: "100%",
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: IMAGE_CAPTION_BAND_BG,
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(0.5),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  imageCaptionText: {
    width: "100%",
    fontSize: wp(3.4),
    lineHeight: hp(2),
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  /** Keep RTL glyph shaping while caption stays visually centered */
  imageCaptionTextRtlWriting: {
    writingDirection: "rtl",
  },
  imageItem: {
    width: "100%",
    height: IMAGE_ITEM_HEIGHT,
  },
  imageItemUnderCaption: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  videoItemContainer: {
    marginBottom: hp(2),
    borderRadius: wp(2),
    overflow: "hidden",
    backgroundColor: "#000",
    alignSelf: "center",
    width: "100%",
  },
});

export default ListingMediaScreen;
