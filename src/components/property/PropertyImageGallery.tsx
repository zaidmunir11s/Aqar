import React, { memo, useCallback } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
    const renderImage = useCallback(
      ({ item }: { item: string }) => (
        <View style={styles.imageWrapper}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={onImageViewerOpen}
            style={styles.imageTouchable}
          >
          <Image
            source={{ uri: item }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
        </View>
      ),
      [onImageViewerOpen]
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

    // Ensure we have valid images array
    const validImages = images && images.length > 0 ? images : [];

    return (
      <View style={styles.imageSection}>
        <FlatList
          data={validImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onImageScroll}
          scrollEventThrottle={16}
          renderItem={renderImage}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          removeClippedSubviews={false}
          snapToInterval={SCREEN_WIDTH}
          decelerationRate="fast"
          snapToAlignment="start"
        />


        {/* See All Photos Button */}
        {validImages.length > 0 && (
        <TouchableOpacity
          style={styles.seeAllPhotosBtn}
          onPress={onImageViewerOpen}
        >
          <Ionicons name="images" size={wp(4.5)} color="#fff" />
          <Text style={styles.seeAllPhotosText}>
              {validImages.length} See all photos...
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
    backgroundColor: "#000",
    width: "100%",
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: hp(30),
  },
  imageTouchable: {
    width: "100%",
    height: "100%",
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
});

export default PropertyImageGallery;
