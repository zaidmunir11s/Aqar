import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ListFilter } from "lucide-react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute, StackActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLocalization } from "../../hooks/useLocalization";
import {
  IconButton,
  ProjectMarker,
  ProjectListCard,
  ProjectUnitsSortModal,
} from "../../components";
import type { ProjectUnitsSortOption } from "../../components";
import { COLORS, RIYADH_REGION } from "@/constants";
import { getDefaultImageUrl, openPhoneDialer } from "../../utils";
import { PROPERTY_DATA, SALE_FILTER_OPTIONS, RENT_FILTER_OPTIONS } from "../../data/propertyData";
import type { ProjectProperty, Property } from "../../types/property";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  developerName: string;
  developerLogo: string;
}

function isProjectProperty(property: Property): property is ProjectProperty {
  return "isProject" in property && property.isProject === true;
}

function isValidLat(value: number | undefined | null): boolean {
  return (
    typeof value === "number" &&
    !isNaN(value) &&
    isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLng(value: number | undefined | null): boolean {
  return (
    typeof value === "number" &&
    !isNaN(value) &&
    isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

function hasValidCoordinates(project: ProjectProperty): boolean {
  return isValidLat(project.lat) && isValidLng(project.lng);
}

export default function DeveloperProfileScreen(): React.JSX.Element {
  const route = useRoute();
  const params = route.params as RouteParams;
  const developerName = params?.developerName ?? "";
  const developerLogo = params?.developerLogo ?? "";
  const navigation = useNavigation<NavigationProp>();
  const { isRTL, t } = useLocalization();

  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState<ProjectUnitsSortOption>("normalSort");
  const headerTranslateY = useRef(new Animated.Value(-100)).current;

  const logoUri = developerLogo.trim()
    ? developerLogo
    : getDefaultImageUrl("project");
  const displayName = developerName.trim() || t("listings.company");

  const logoContainerMargin = useMemo(
    () => ({ marginRight: isRTL ? 0 : wp(3), marginLeft: isRTL ? wp(3) : 0 }),
    [isRTL]
  );

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("ProjectsMap");
    }
  }, [navigation]);

  const handleShare = useCallback(() => {
    // TODO: share developer profile
  }, []);

  const handleCall = useCallback(() => {
    openPhoneDialer("+966123456789");
  }, []);

  // Projects by this developer with valid coordinates
  const developerProjects = useMemo(() => {
    const name = developerName.trim().toLowerCase();
    if (!name) return [];
    return PROPERTY_DATA.filter(
      (p): p is ProjectProperty =>
        isProjectProperty(p) && hasValidCoordinates(p) && (p.developerName?.trim().toLowerCase() === name)
    );
  }, [developerName]);

  // Map region: fit developer projects or default to Riyadh
  const mapRegion = useMemo(() => {
    if (developerProjects.length === 0) return RIYADH_REGION;
    const lats = developerProjects.map((p) => p.lat as number);
    const lngs = developerProjects.map((p) => p.lng as number);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latDelta = Math.max(maxLat - minLat, 0.02) * 1.4;
    const lngDelta = Math.max(maxLng - minLng, 0.02) * 1.4;
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [developerProjects]);

  const DEVELOPER_PROJECTS_SORT_OPTIONS: ProjectUnitsSortOption[] = useMemo(
    () => ["normalSort", "priceHighToLow", "priceLowToHigh"],
    []
  );

  const sortedDeveloperProjects = useMemo(() => {
    const list = [...developerProjects];
    if (selectedSortOption === "normalSort") return list;
    return list.sort((a, b) => {
      const priceA = a.projectDetails?.minPrice ?? 0;
      const priceB = b.projectDetails?.minPrice ?? 0;
      if (selectedSortOption === "priceHighToLow") return priceB - priceA;
      return priceA - priceB;
    });
  }, [developerProjects, selectedSortOption]);

  const handleProjectPress = useCallback(
    (project: ProjectProperty) => {
      // Pop DeveloperProfile and the previous ProjectDetails so back from ProjectDetails goes to map
      navigation.dispatch(StackActions.pop(2));
      navigation.navigate("ProjectDetails", { propertyId: project.id });
    },
    [navigation]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const threshold = hp(30) - hp(10);
      const shouldShow = offsetY > threshold;

      if (shouldShow !== showStickyHeader) {
        setShowStickyHeader(shouldShow);
        Animated.timing(headerTranslateY, {
          toValue: shouldShow ? 0 : -100,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    },
    [showStickyHeader, headerTranslateY]
  );

  return (
    <View style={styles.container}>
      {/* Back and Share on image section */}
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

      {/* Sticky header: company name only */}
      <Animated.View
        style={[
          styles.stickyHeaderBackground,
          isRTL && styles.stickyHeaderBackgroundRTL,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <Text
          style={[styles.stickyHeaderTitle, isRTL && styles.stickyHeaderTitleRTL]}
          numberOfLines={1}
        >
          {displayName}
        </Text>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Image section: same icon as main image */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: logoUri }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Below image: same icon + company name — LTR: left; RTL: right */}
        <View style={[styles.titleSection, isRTL && styles.titleSectionRTL]}>
          <View style={[styles.logoAndNameRow, isRTL && styles.logoAndNameRowRTL]}>
            <View style={[styles.logoContainer, logoContainerMargin]}>
              <Image
                source={{ uri: logoUri }}
                style={styles.developerLogo}
                resizeMode="cover"
              />
            </View>
            <Text style={[styles.companyName, isRTL && styles.companyNameRTL]} numberOfLines={1}>
              {displayName}
            </Text>
          </View>
        </View>

        {/* Stats section: 4 options in 2x2 grid (Units, Projects, Total area, Population) */}
        <View style={[styles.statsSection, isRTL && styles.statsSectionRTL]}>
          <View style={[styles.statsRow, isRTL && styles.statsRowRTL]}>
            <View style={[styles.statCard, isRTL && styles.statCardRTL]}>
              <View style={styles.statIconBox}>
                <View style={styles.statIconInner}>
                  <Ionicons name="home" size={wp(5)} color={COLORS.textPrimary} />
                </View>
              </View>
              <View style={[styles.statTextWrap, isRTL && styles.statTextWrapRTL]}>
                <Text style={[styles.statTitle, isRTL && styles.statTitleRTL]}>
                  {t("projects.units")}
                </Text>
                <Text style={[styles.statValue, isRTL && styles.statValueRTL]}>0+</Text>
              </View>
            </View>
            <View style={[styles.statCard, isRTL && styles.statCardRTL]}>
              <View style={styles.statIconBox}>
                <View style={styles.statIconInner}>
                  <MaterialCommunityIcons name="city-variant" size={wp(5)} color={COLORS.textPrimary} />
                </View>
              </View>
              <View style={[styles.statTextWrap, isRTL && styles.statTextWrapRTL]}>
                <Text style={[styles.statTitle, isRTL && styles.statTitleRTL]}>
                  {t("projects.projectsCount")}
                </Text>
                <Text style={[styles.statValue, isRTL && styles.statValueRTL]}>0+</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statsRow, isRTL && styles.statsRowRTL]}>
            <View style={[styles.statCard, isRTL && styles.statCardRTL]}>
              <View style={styles.statIconBox}>
                <View style={styles.statIconInner}>
                  <MaterialCommunityIcons name="aspect-ratio" size={wp(5)} color={COLORS.textPrimary} />
                </View>
              </View>
              <View style={[styles.statTextWrap, isRTL && styles.statTextWrapRTL]}>
                <Text style={[styles.statTitle, isRTL && styles.statTitleRTL]}>
                  {t("projects.totalArea")}
                </Text>
                <Text style={[styles.statValue, isRTL && styles.statValueRTL]}>+</Text>
              </View>
            </View>
            <View style={[styles.statCard, isRTL && styles.statCardRTL]}>
              <View style={styles.statIconBox}>
                <View style={styles.statIconInner}>
                  <Ionicons name="people" size={wp(5)} color={COLORS.textPrimary} />
                </View>
              </View>
              <View style={[styles.statTextWrap, isRTL && styles.statTextWrapRTL]}>
                <Text style={[styles.statTitle, isRTL && styles.statTitleRTL]}>
                  {t("projects.population")}
                </Text>
                <Text style={[styles.statValue, isRTL && styles.statValueRTL]}>+</Text>
              </View>
            </View>
          </View>
        </View>

        {/* About Us section */}
        <View style={[styles.aboutSection, isRTL && styles.aboutSectionRTL]}>
          <Text style={[styles.aboutTitle, isRTL && styles.aboutTitleRTL]}>
            {t("projects.aboutUs")}
          </Text>
          <Text style={[styles.aboutBody, isRTL && styles.aboutBodyRTL]}>
            {t("projects.aboutUsDescription")}
          </Text>
        </View>

        {/* Projects Map section */}
        <View style={[styles.mapSection, isRTL && styles.mapSectionRTL]}>
          <Text style={[styles.mapSectionTitle, isRTL && styles.mapSectionTitleRTL]}>
            {t("projects.projectsMap")}
          </Text>
          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              initialRegion={mapRegion}
              scrollEnabled={false}
              zoomEnabled={true}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              {developerProjects.map((p) => (
                <Marker
                  key={p.id}
                  coordinate={{ latitude: p.lat!, longitude: p.lng! }}
                  anchor={{ x: 0.5, y: 1 }}
                >
                  <ProjectMarker project={p} />
                </Marker>
              ))}
            </MapView>
          </View>
        </View>

        {/* Projects section - same projects as map markers, with sort */}
        <View style={[styles.projectsListSection, isRTL && styles.projectsListSectionRTL]}>
          <View style={[styles.projectsListHeader, isRTL && styles.projectsListHeaderRTL]}>
            <Text style={[styles.projectsListTitle, isRTL && styles.projectsListTitleRTL]}>
              {t("projects.projectsCount")}
            </Text>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setSortModalVisible(true)}
              activeOpacity={0.7}
            >
              <ListFilter
                size={wp(5.5)}
                strokeWidth={3}
                color={selectedSortOption !== "normalSort" ? COLORS.primary : COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {sortedDeveloperProjects.map((p) => (
            <ProjectListCard
              key={p.id}
              project={p}
              onPress={() => handleProjectPress(p)}
              filterOptions={p.listingType === "sale" ? SALE_FILTER_OPTIONS : RENT_FILTER_OPTIONS}
              hideTypeTags
              hideDeveloperLogo
              availableBadgeVariant="orange"
            />
          ))}
        </View>

        <View style={{ height: hp(2) }} />
      </ScrollView>

      {/* Projects sort modal - Normal Sort, Price high to low, Price low to high */}
      <ProjectUnitsSortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        selectedOption={selectedSortOption}
        onSelect={(option) => {
          setSelectedSortOption(option);
          setSortModalVisible(false);
        }}
        options={DEVELOPER_PROJECTS_SORT_OPTIONS}
      />

      {/* Bottom Call Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.callButton, isRTL && styles.callButtonRTL]}
          onPress={handleCall}
        >
          <Ionicons name="call" size={wp(5)} color={COLORS.white} />
          <Text style={styles.callButtonText}>{t("projects.call")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgGray,
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
  headerIconsRTL: {
    flexDirection: "row-reverse",
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
    backgroundColor: COLORS.white,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(4),
    paddingLeft: wp(12),
    paddingRight: wp(12),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 4 },
    }),
  },
  stickyHeaderBackgroundRTL: {
    flexDirection: "row-reverse",
  },
  stickyHeaderTitle: {
    flex: 1,
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  stickyHeaderTitleRTL: {
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  imageSection: {
    height: hp(30),
    backgroundColor: COLORS.black,
    width: SCREEN_WIDTH,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: hp(30),
  },
  titleSection: {
    backgroundColor: COLORS.bgGray,
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleSectionRTL: {
    alignItems: "flex-start",
  },
  logoAndNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoAndNameRowRTL: {
    flexDirection: "row-reverse",
  },
  logoContainer: {
    width: wp(20),
    height: wp(20),
    maxWidth: wp(20),
    maxHeight: wp(20),
    backgroundColor: COLORS.bgGray,
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  developerLogo: {
    width: "100%",
    height: "100%",
  },
  companyName: {
    flex: 1,
    fontSize: wp(5),
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  companyNameRTL: {
    textAlign: "right",
  },
  statsSection: {
    backgroundColor: COLORS.bgGray,
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statsSectionRTL: {
    flexDirection: "column",
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: hp(2),
  },
  statsRowRTL: {
    flexDirection: "row-reverse",
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp(1.5),
  },
  statCardRTL: {
    flexDirection: "row-reverse",
  },
  statIconBox: {
    width: wp(10),
    height: wp(10),
    backgroundColor: COLORS.white,
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.08,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  statIconInner: {
    padding: wp(0.7),
    borderRadius: wp(1.5),
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  statTextWrap: {
    flex: 1,
    marginLeft: wp(2.5),
  },
  statTextWrapRTL: {
    marginLeft: 0,
    marginRight: wp(2.5),
  },
  statTitle: {
    fontSize: wp(3.8),
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  statTitleRTL: {
    textAlign: "right",
  },
  statValue: {
    fontSize: wp(3.2),
    color: COLORS.textPrimary,
    marginTop: hp(0.3),
  },
  statValueRTL: {
    textAlign: "right",
  },
  mapSection: {
    backgroundColor: COLORS.bgGray,
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mapSectionRTL: {
    flexDirection: "column",
  },
  mapSectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: hp(2),
  },
  mapSectionTitleRTL: {
    textAlign: "right",
  },
  mapWrapper: {
    width: "100%",
    height: hp(28),
    borderRadius: wp(2),
    overflow: "hidden",
    backgroundColor: COLORS.borderLight,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  projectsListSection: {
    backgroundColor: COLORS.bgGray,
    padding: wp(4),
  },
  projectsListSectionRTL: {
    flexDirection: "column",
  },
  projectsListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(2),
  },
  projectsListHeaderRTL: {
    flexDirection: "row-reverse",
  },
  projectsListTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  projectsListTitleRTL: {
    textAlign: "right",
  },
  sortButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDE1E6",
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.2),
    borderRadius: wp(2),
  },
  aboutSection: {
    backgroundColor: COLORS.bgGray,
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  aboutSectionRTL: {
    flexDirection: "column",
  },
  aboutTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: hp(1.5),
  },
  aboutTitleRTL: {
    textAlign: "right",
  },
  aboutBody: {
    fontSize: wp(3.8),
    color: COLORS.textSecondary,
    lineHeight: hp(2.8),
  },
  aboutBodyRTL: {
    textAlign: "right",
  },
  bottomBar: {
    backgroundColor: COLORS.white,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderTopWidth: 1.5,
    borderTopColor: COLORS.borderLight,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: hp(1.5),
    borderRadius: wp(1.5),
    gap: wp(2),
  },
  callButtonRTL: {
    flexDirection: "row-reverse",
  },
  callButtonText: {
    color: COLORS.white,
    fontSize: wp(4.5),
    fontWeight: "700",
  },
});
