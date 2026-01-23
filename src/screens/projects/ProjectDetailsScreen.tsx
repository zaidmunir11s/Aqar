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
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import ScreenHeader from "../../components/common/ScreenHeader";
import type { ProjectProperty } from "../../types/property";
import { COLORS } from "@/constants";
import { useLocalization } from "../../hooks/useLocalization";

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
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocalization();

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imageViewerVisible, setImageViewerVisible] = useState<boolean>(false);
  const [showStickyHeader, setShowStickyHeader] = useState<boolean>(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-100)).current; // Start off-screen
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
      const rawIndex = Math.round(scrollPosition / SCREEN_WIDTH);
      // When RTL is active and gallery is inverted, adjust index calculation
      const imagesLength = project?.images?.length || 1;
      const index = isRTL && imagesLength > 0 
        ? imagesLength - 1 - rawIndex 
        : rawIndex;
      setCurrentImageIndex(index);
    },
    [isRTL, project?.images?.length]
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

  if (!project) {
    return (
      <View style={styles.center}>
        <Text style={isRTL && styles.centerTextRTL}>{t("projects.projectNotFound")}</Text>
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
        {/* Icons - Always visible, absolute positioned */}
        <View style={[styles.headerIcons, isRTL && styles.headerIconsRTL]}>
            <IconButton onPress={handleBackPress}>
              <Ionicons 
                name={isRTL ? "arrow-forward" : "arrow-back"} 
                size={wp(6)} 
                color={COLORS.primary} 
              />
            </IconButton>
          <View style={styles.headerIconsSpacer} />
            <IconButton onPress={handleShare}>
              <Ionicons
                name="share-social-outline"
                size={wp(5.5)}
                color={COLORS.primary}
              />
            </IconButton>
          </View>

        {/* Sticky Header Background with Title - slides in to join icons on scroll */}
        <Animated.View
          style={[
            styles.stickyHeaderBackground,
            isRTL && styles.stickyHeaderBackgroundRTL,
            {
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          <Text style={[styles.stickyHeaderTitle, isRTL && styles.stickyHeaderTitleRTL]} numberOfLines={1}>
            {project.projectNameArabic || project.projectName}
          </Text>
        </Animated.View>

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
            <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
              {t("projects.knowMore")}
            </Text>
            <TouchableOpacity style={[styles.documentButton, isRTL && styles.documentButtonRTL]}>
              <FontAwesome6 name="file-pdf" size={wp(6)} color="#6b7280" />
              <Text style={[styles.documentText, isRTL && styles.documentTextRTL]}>
                {t("projects.introducingDocument")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nearby Landmarks */}
          <ProjectLocation project={project} />

          <View style={{ height: hp(12) }} />
        </ScrollView>

        {/* Bottom Contact Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <Text style={styles.contactButtonText}>{t("projects.contact")}</Text>
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
          <View style={[styles.imageViewerHeaderContainer, { paddingTop: insets.top }]}>
            <ScreenHeader
              title={t("listings.listingMedia")}
              onBackPress={closeImageViewer}
              backButtonColor={COLORS.backButton}
            />
          </View>
          
          <View style={styles.imageViewerContent}>
            <View style={styles.imagesSectionHeader}>
              <Text style={[styles.imagesSectionTitle, isRTL && styles.imagesSectionTitleRTL]}>
                {t("listings.images")}
              </Text>
              <View style={styles.imagesSectionBorder} />
            </View>
            
            <ScrollView
              style={styles.imagesScrollView}
              contentContainerStyle={styles.imagesScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {projectImages.map((imageUri, index) => (
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
    backgroundColor: "#f3f4f6",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTextRTL: {
    textAlign: "right",
  },
  headerIconsRTL: {
    flexDirection: "row-reverse",
  },
  stickyHeaderBackgroundRTL: {
    flexDirection: "row-reverse",
  },
  stickyHeaderTitleRTL: {
    textAlign: "right",
  },
  sectionTitleRTL: {
    textAlign: "right",
  },
  documentButtonRTL: {
    flexDirection: "row-reverse",
  },
  documentTextRTL: {
    marginLeft: 0,
    marginRight: wp(3),
  },
  imagesSectionTitleRTL: {
    textAlign: "right",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(4),
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
  stickyHeaderTitle: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
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
    backgroundColor: COLORS.primary,
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
