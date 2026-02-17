import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
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
  ProjectUnitsFilterModal,
  ProjectUnitsSortModal,
  SingleButtonFooter,
} from "../../components";
import type { ProjectUnitsFilterState, ProjectUnitsSortOption } from "../../components";
import type { ProjectProperty } from "../../types/property";
import { COLORS } from "@/constants";
import { useLocalization } from "../../hooks/useLocalization";
import { ListFilter, SlidersHorizontal } from "lucide-react-native";


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

  const stickyHeaderHeight =
    insets.top + (Platform.OS === "ios" ? hp(8) : hp(7));

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [showStickyHeader, setShowStickyHeader] = useState<boolean>(false);
  const [unitsFilterModalVisible, setUnitsFilterModalVisible] = useState<boolean>(false);
  const [unitsFilterState, setUnitsFilterState] = useState<ProjectUnitsFilterState | null>(null);
  const [unitsSortModalVisible, setUnitsSortModalVisible] = useState<boolean>(false);
  const [selectedSortOption, setSelectedSortOption] = useState<ProjectUnitsSortOption>("normalSort");
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-200)).current; // Start fully off-screen (hidden)
  const scrollViewRef = useRef<ScrollView>(null);

  const project = useMemo(
    () =>
      PROPERTY_DATA.find(
        (p) => p.id === propertyId && "isProject" in p && p.isProject
      ) as ProjectProperty | undefined,
    [propertyId]
  );

  const hasActiveFilters = useMemo(() => {
    if (!unitsFilterState) return false;
    const f = unitsFilterState;
    return (
      f.rooms !== null ||
      f.livingRooms !== null ||
      f.wcs !== null ||
      (f.minPrice?.trim() ?? "") !== "" ||
      (f.maxPrice?.trim() ?? "") !== ""
    );
  }, [unitsFilterState]);

  const hasNonDefaultSort = selectedSortOption !== "normalSort";

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
      // Show sticky header only when scrolled past image gallery (approximately hp(30))
      const threshold = hp(30) - hp(10); // Show header slightly before image ends
      const shouldShow = offsetY > threshold;

      if (shouldShow !== showStickyHeader) {
        setShowStickyHeader(shouldShow);
        // Animate header sliding down/up - hide fully off-screen when not shown
        Animated.timing(headerTranslateY, {
          toValue: shouldShow ? 0 : -stickyHeaderHeight,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }

      // Update animated value for potential future animations
      scrollY.setValue(offsetY);
    },
    [scrollY, showStickyHeader, headerTranslateY, stickyHeaderHeight]
  );

  const handleDeveloperLogoPress = useCallback(() => {
    if (!project) return;
    navigation.navigate("DeveloperProfile", {
      developerName: project.developerName,
      developerLogo: project.developerLogo ?? "",
    });
  }, [navigation, project]);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Projects");
    }
  }, [navigation]);

  const openImageViewer = useCallback(() => {
    if (!project) return;
    const images =
      project.images && project.images.length > 0
        ? project.images
        : [getDefaultImageUrl("project")];
    navigation.navigate("ListingMedia", { images });
  }, [navigation, project]);

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
        <View
          style={[
            styles.headerIcons,
            isRTL && styles.headerIconsRTL,
            { top: 0, paddingTop: insets.top },
          ]}
        >
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

        {/* Sticky Header Background with Title - only visible when scrolled past gallery */}
        <Animated.View
          pointerEvents={showStickyHeader ? "auto" : "none"}
          style={[
            styles.stickyHeaderBackground,
            isRTL && styles.stickyHeaderBackgroundRTL,
            {
              height: stickyHeaderHeight,
              paddingTop: insets.top,
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
          <ProjectHeader project={project} onLogoPress={handleDeveloperLogoPress} />

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

          {/* Project Units */}
          <View style={[styles.section, styles.projectUnitsSection]}>
            <View style={[styles.projectUnitsRow, isRTL && styles.projectUnitsRowRTL]}>
              <Text style={[styles.projectUnitsTitle, isRTL && styles.sectionTitleRTL]}>
                {t("projects.projectUnits")}
              </Text>
              <View style={[styles.projectUnitsButtons, isRTL && styles.projectUnitsButtonsRTL]}>
                <TouchableOpacity
                  style={[styles.filterButton, isRTL && styles.filterButtonRTL]}
                  onPress={() => setUnitsFilterModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <SlidersHorizontal
                    size={25}
                    color={hasActiveFilters ? COLORS.primary : COLORS.textSecondary}
                    strokeWidth={2.5}
                  />
                  <Text style={styles.filterButtonText}>
                    {t("projects.filter")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.filterIconButton}
                  onPress={() => setUnitsSortModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <ListFilter
                    size={wp(5.5)}
                    strokeWidth={3}
                    color={hasNonDefaultSort ? COLORS.primary : COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ height: hp(12) }} />
        </ScrollView>

          <SingleButtonFooter
            fixed={false}
            label={t("projects.contact")}
            onPress={handleCall}
          />
      </View>

      {/* Project Units Filter Modal - slides up from bottom */}
      <ProjectUnitsFilterModal
        visible={unitsFilterModalVisible}
        onClose={() => setUnitsFilterModalVisible(false)}
        onSearch={(filters) => {
          setUnitsFilterState(filters);
          setUnitsFilterModalVisible(false);
          // TODO: apply filters to project units list when list is implemented
        }}
        initialFilters={unitsFilterState}
      />

      {/* Project Units Sort Modal - Filter by (Normal Sort, Price, Area) */}
      <ProjectUnitsSortModal
        visible={unitsSortModalVisible}
        onClose={() => setUnitsSortModalVisible(false)}
        selectedOption={selectedSortOption}
        onSelect={(option) => {
          setSelectedSortOption(option);
          setUnitsSortModalVisible(false);
          // TODO: apply sort to project units list when list is implemented
        }}
      />

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  headerIcons: {
    position: "absolute",
    // top: Platform.OS === "ios" ? hp(3) : hp(2),
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
  projectUnitsSection: {
    paddingVertical: hp(1.8),
  },
  projectUnitsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  projectUnitsRowRTL: {
    flexDirection: "row-reverse",
  },
  projectUnitsTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
  },
  projectUnitsButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  projectUnitsButtonsRTL: {
    flexDirection: "row-reverse",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DDE1E6",
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.2),
    borderRadius: wp(2),
    gap: wp(1.5),
  },
  filterButtonRTL: {
    flexDirection: "row-reverse",
  },
  filterButtonText: {
    fontSize: wp(4.2),
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  filterIconButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDE1E6",
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.2),
    borderRadius: wp(2),
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
});
