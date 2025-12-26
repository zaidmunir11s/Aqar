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
import { IconButton } from "../common";

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
    const renderImage = useCallback(
      ({ item }: { item: string }) => (
        <TouchableOpacity activeOpacity={0.9} onPress={onImageViewerOpen}>
          <Image
            source={{ uri: item }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ),
      [onImageViewerOpen]
    );

    const keyExtractor = useCallback(
      (item: string, index: number) => index.toString(),
      []
    );

    return (
      <View style={styles.imageSection}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onImageScroll}
          scrollEventThrottle={16}
          renderItem={renderImage}
          keyExtractor={keyExtractor}
        />

        {/* Header Icons Overlay - hide when sticky header is shown */}
        {!showStickyHeader && (
          <View style={styles.headerOverlay}>
            <IconButton onPress={onBackPress}>
              <Ionicons name="arrow-back" size={wp(6)} color="#0ab739" />
            </IconButton>

            <View style={styles.headerRight}>
              <IconButton onPress={onSharePress}>
                <Ionicons
                  name="share-social-outline"
                  size={wp(5.5)}
                  color="#0ab739"
                />
              </IconButton>
            </View>
          </View>
        )}

        {/* Image Counter Indicator */}
        {images.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        )}

        {/* See All Photos Button */}
        <TouchableOpacity
          style={styles.seeAllPhotosBtn}
          onPress={onImageViewerOpen}
        >
          <Ionicons name="images" size={wp(4.5)} color="#fff" />
          <Text style={styles.seeAllPhotosText}>
            All Images ({images.length})
          </Text>
        </TouchableOpacity>

        {/* Status Badges */}
        <View style={styles.statusBadges}>
          <View style={[styles.statusBadge, styles.availableBadge]}>
            <Text style={styles.availableBadgeText}>{availableStatus}</Text>
          </View>
          <View style={[styles.statusBadge, styles.readyBadge]}>
            <Text style={styles.readyBadgeText}>{readyStatus}</Text>
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
  headerOverlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? hp(6) : hp(5),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
  },
  headerRight: {
    flexDirection: "row",
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
  statusBadges: {
    position: "absolute",
    bottom: hp(2),
    right: wp(4),
    flexDirection: "row",
  },
  statusBadge: {
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(0.8),
    borderRadius: wp(1),
    marginLeft: wp(2),
  },
  availableBadge: {
    backgroundColor: "#e1eef4",
  },
  readyBadge: {
    backgroundColor: "#d1d5e0",
  },
  availableBadgeText: {
    color: "#1f85b3",
    fontSize: wp(3.2),
    fontWeight: "600",
  },
  readyBadgeText: {
    color: "#6a747e",
    fontSize: wp(3.2),
    fontWeight: "600",
  },
  imageCounter: {
    position: "absolute",
    top: Platform.OS === "ios" ? hp(7.5) : hp(6.5),
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(4),
  },
  imageCounterText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "600",
  },
});

export default ProjectImageGallery;
