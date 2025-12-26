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
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PROPERTY_DATA } from "../../data/propertyData";
import { openPhoneDialer, getDefaultImageUrl } from "../../utils";
import { IconButton } from "../../components";
import {
  ProjectImageGallery,
  ProjectHeader,
  ProjectDetails,
  ProjectFeatures,
  ProjectLocation,
} from "../../components";
import type { ProjectProperty } from "../../types/property";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  propertyId: number;
}

export default function ProjectDetailsScreen(): React.JSX.Element {
  const route = useRoute();
  const params = route.params as RouteParams;
  const { propertyId } = params;
  const navigation = useNavigation<NavigationProp>();

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imageViewerVisible, setImageViewerVisible] = useState<boolean>(false);
  const [showStickyHeader, setShowStickyHeader] = useState<boolean>(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const project = useMemo(
    () =>
      PROPERTY_DATA.find(
        (p) => p.id === propertyId && "isProject" in p && p.isProject
      ) as ProjectProperty | undefined,
    [propertyId]
  );

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

  const handleShare = useCallback(() => {
    console.log("Share project");
  }, []);

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

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Projects");
    }
  }, [navigation]);

  const openImageViewer = useCallback(() => {
    setImageViewerVisible(true);
  }, []);

  const closeImageViewer = useCallback(() => {
    setImageViewerVisible(false);
  }, []);

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

  if (!project) {
    return (
      <View style={styles.center}>
        <Text>Project not found</Text>
      </View>
    );
  }

  const projectImages =
    project.images && project.images.length > 0
      ? project.images
      : [getDefaultImageUrl("project")];

  return (
    <>
      <View style={styles.container}>
        {/* Sticky Header - appears on scroll */}
        {showStickyHeader && (
          <View style={styles.stickyHeader}>
            <IconButton onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={wp(6)} color="#10b981" />
            </IconButton>
            <Text style={styles.stickyHeaderTitle} numberOfLines={1}>
              {project.projectNameArabic || project.projectName}
            </Text>
            <IconButton onPress={handleShare}>
              <Ionicons
                name="share-social-outline"
                size={wp(5.5)}
                color="#10b981"
              />
            </IconButton>
          </View>
        )}

        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Image Gallery - now inside ScrollView so it scrolls */}
          <ProjectImageGallery
            images={projectImages}
            currentIndex={currentImageIndex}
            onImageScroll={handleImageScroll}
            onImageViewerOpen={openImageViewer}
            onBackPress={handleBackPress}
            onSharePress={handleShare}
            availableStatus={project.projectDetails.availableStatus}
            readyStatus={project.projectDetails.readyStatus}
            showStickyHeader={showStickyHeader}
          />

          {/* Project Header */}
          <ProjectHeader project={project} />

          {/* Project Details */}
          <ProjectDetails
            projectDetails={project.projectDetails}
            isFirstSection={false}
          />

          {/* Project Features */}
          <ProjectFeatures features={project.projectFeatures} />

          {/* Know More */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Know More</Text>
            <TouchableOpacity style={styles.documentButton}>
              <FontAwesome6 name="file-pdf" size={wp(6)} color="#6b7280" />
              <Text style={styles.documentText}>Introducing Document</Text>
            </TouchableOpacity>
          </View>

          {/* Nearby Landmarks */}
          <ProjectLocation project={project} />

          <View style={{ height: hp(12) }} />
        </ScrollView>

        {/* Bottom Contact Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>
        </View>
      </View>

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
            data={projectImages}
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
              {currentImageIndex + 1} / {projectImages.length}
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
    backgroundColor: "#f3f4f6",
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
  stickyHeaderTitle: {
    flex: 1,
    fontSize: wp(4.5),
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginHorizontal: wp(2),
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    padding: wp(4),
    borderTopWidth: 1,
    borderTopColor: "#dcdcde",
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hp(2),
  },
  documentButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e4e3e8",
    padding: wp(4),
    borderRadius: wp(2),
  },
  documentText: {
    fontSize: wp(4),
    color: "#686f75",
    marginLeft: wp(3),
    fontWeight: "500",
  },
  bottomBar: {
    backgroundColor: "#fff",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderTopWidth: 1.5,
    borderTopColor: "#f0f3f4",
  },
  contactButton: {
    backgroundColor: "#0ab739",
    paddingVertical: hp(1.5),
    borderRadius: wp(1.5),
    alignItems: "center",
  },
  contactButtonText: {
    color: "#fff",
    fontSize: wp(4.5),
    fontWeight: "700",
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
