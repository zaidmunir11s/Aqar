import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  Text,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  PROPERTY_DATA,
  SALE_FILTER_OPTIONS,
  RENT_FILTER_OPTIONS,
} from "../../data/propertyData";
import { RIYADH_REGION, COLORS, CITY_REGIONS } from "../../constants";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useLocation } from "../../hooks";
import {
  ProjectMarker,
  MapTabs,
  FilterChips,
  MapBottomActions,
  ProjectSearchModal,
} from "../../components";
import type { TabType } from "../../components/map/MapTabs";
import type { ProjectProperty, Property } from "../../types/property";
import { useLocalization } from "../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

// Type guard to check if a property is a ProjectProperty
function isProjectProperty(property: Property): property is ProjectProperty {
  return "isProject" in property && property.isProject === true;
}

// Helper function to validate coordinates
function isValidCoordinate(value: number | undefined | null): boolean {
  return (
    typeof value === "number" &&
    !isNaN(value) &&
    isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

// Helper function to validate longitude
function isValidLongitude(value: number | undefined | null): boolean {
  return (
    typeof value === "number" &&
    !isNaN(value) &&
    isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

// Helper function to check if project has valid coordinates
function hasValidCoordinates(project: ProjectProperty): boolean {
  return isValidCoordinate(project.lat) && isValidLongitude(project.lng);
}

export default function ProjectsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocalization();
  const mapRef = useRef<MapView>(null);
  const counterFadeAnim = useRef(new Animated.Value(1)).current;
  const mapMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const markerPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastMarkerPressTimeRef = useRef<number>(0);

  const [activeTab, setActiveTab] = useState<TabType>("sale");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [region, setRegion] = useState(RIYADH_REGION);
  const [homeRegion, setHomeRegion] = useState(RIYADH_REGION);
  const [isLocationReady, setIsLocationReady] = useState<boolean>(false);
  const [isMapMoving, setIsMapMoving] = useState<boolean>(false);
  const [isSatelliteMode, setIsSatelliteMode] = useState<boolean>(false);
  const [showLocationError, setShowLocationError] = useState<boolean>(false);
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<
    string | null
  >(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const mapReadyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { getCurrentLocation } = useLocation();
  const hasCenteredOnMountRef = useRef<boolean>(false);

  const filteredProjects = useMemo(() => {
    let projects = PROPERTY_DATA.filter(
      (p): p is ProjectProperty =>
        isProjectProperty(p) &&
        p.listingType === activeTab &&
        hasValidCoordinates(p),
    );

    // Filter by city if selected
    if (selectedCity) {
      projects = projects.filter((p) => {
        const city = (p as any).city;
        return city && city.toLowerCase() === selectedCity.toLowerCase();
      });
    }

    // Filter by property type if selected
    if (selectedPropertyType) {
      projects = projects.filter((p) => p.type === selectedPropertyType);
    }

    if (activeFilter !== "all") {
      const filterOptions =
        activeTab === "sale" ? SALE_FILTER_OPTIONS : RENT_FILTER_OPTIONS;
      const f = filterOptions.find((x) => x.id === activeFilter);
      if (f?.type) {
        projects = projects.filter((p) => p.type === f.type);
      }
    }

    return projects;
  }, [activeTab, activeFilter, selectedCity, selectedPropertyType]);

  // Get projects currently visible on map
  const visibleProjects = useMemo(() => {
    // Validate region values
    if (
      !isValidCoordinate(region.latitude) ||
      !isValidLongitude(region.longitude) ||
      !isValidCoordinate(region.latitudeDelta) ||
      !isValidLongitude(region.longitudeDelta) ||
      region.latitudeDelta <= 0 ||
      region.longitudeDelta <= 0
    ) {
      return [];
    }

    const latHalf = region.latitudeDelta / 2;
    const lngHalf = region.longitudeDelta / 2;

    return filteredProjects.filter(
      (p) =>
        hasValidCoordinates(p) &&
        p.lat >= region.latitude - latHalf &&
        p.lat <= region.latitude + latHalf &&
        p.lng >= region.longitude - lngHalf &&
        p.lng <= region.longitude + lngHalf,
    );
  }, [filteredProjects, region]);

  const { visibleCount, totalCount } = useMemo(() => {
    return {
      visibleCount: visibleProjects.length,
      totalCount: filteredProjects.length,
    };
  }, [visibleProjects, filteredProjects]);

  useEffect(() => {
    const anim = Animated.timing(counterFadeAnim, {
      toValue: visibleCount === 0 ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [visibleCount, counterFadeAnim]);

  // Track component mount state and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (mapReadyTimeoutRef.current) {
        clearTimeout(mapReadyTimeoutRef.current);
        mapReadyTimeoutRef.current = null;
      }
      if (mapMoveTimeoutRef.current) {
        clearTimeout(mapMoveTimeoutRef.current);
        mapMoveTimeoutRef.current = null;
      }
      if (markerPressTimeoutRef.current) {
        clearTimeout(markerPressTimeoutRef.current);
        markerPressTimeoutRef.current = null;
      }
      // Reset map ready state to prevent operations after unmount
      setIsMapReady(false);
    };
  }, []);

  const centerOnCurrentLocation = useCallback(async () => {
    if (!isMountedRef.current || !mapRef.current) return;
    try {
      const result = await getCurrentLocation();
      if (!isMountedRef.current || !mapRef.current) return;

      if (result.region) {
        setHomeRegion(result.region);
        setRegion(result.region);
        mapRef.current.animateToRegion(result.region, 800);
        setShowLocationError(false);
        // Reveal map after animation so Riyadh is never visible
        setTimeout(() => {
          if (isMountedRef.current) setIsLocationReady(true);
        }, 850);
      } else if (result.error) {
        setIsLocationReady(true);
        setShowLocationError(true);
        setTimeout(() => {
          if (isMountedRef.current) setShowLocationError(false);
        }, 2000);
      }
    } catch {
      setIsLocationReady(true);
      setShowLocationError(true);
      setTimeout(() => {
        if (isMountedRef.current) setShowLocationError(false);
      }, 2000);
    }
  }, [getCurrentLocation]);

  // Default: start at user's current location
  useEffect(() => {
    if (hasCenteredOnMountRef.current) return;
    hasCenteredOnMountRef.current = true;
    centerOnCurrentLocation();
  }, [centerOnCurrentLocation]);

  // Handlers
  const handleTabChange = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
      setActiveFilter("all"); // Reset filter when switching tabs
      // Reset map to user's home region when switching between tabs
      // Only animate if component is mounted, map is ready, and ref is valid
      if (
        isMountedRef.current &&
        isMapReady &&
        mapRef.current &&
        isValidCoordinate(homeRegion.latitude) &&
        isValidLongitude(homeRegion.longitude)
      ) {
        try {
          mapRef.current.animateToRegion(homeRegion, 800);
        } catch (error) {
          console.warn("Error animating to region:", error);
        }
      }
    },
    [isMapReady, homeRegion],
  );

  const handleFilterChange = useCallback((filterId: string) => {
    setActiveFilter(filterId);
  }, []);

  const handleMarkerPress = useCallback(
    (project: ProjectProperty) => {
      // Prevent rapid clicks (debounce - minimum 300ms between clicks)
      const now = Date.now();
      if (now - lastMarkerPressTimeRef.current < 300) {
        return;
      }
      lastMarkerPressTimeRef.current = now;

      // Clear any pending marker press timeout
      if (markerPressTimeoutRef.current) {
        clearTimeout(markerPressTimeoutRef.current);
        markerPressTimeoutRef.current = null;
      }

      // Don't handle marker press if component is unmounted, map is moving, or not ready
      if (
        !isMountedRef.current ||
        !isMapReady ||
        isMapMoving ||
        !mapRef.current
      ) {
        return;
      }

      // Validate project before navigation
      if (!project || !project.id || !hasValidCoordinates(project)) {
        console.warn("Invalid project data, cannot navigate:", project);
        return;
      }

      // Use timeout to ensure map state is stable before navigation
      markerPressTimeoutRef.current = setTimeout(() => {
        // Double-check everything is still valid
        if (
          !isMountedRef.current ||
          !isMapReady ||
          isMapMoving ||
          !mapRef.current
        ) {
          return;
        }

        try {
          navigation.navigate("ProjectDetails", {
            propertyId: project.id,
          });
        } catch (error) {
          console.warn("Error navigating to project details:", error);
        }
      }, 100);
    },
    [navigation, isMapReady, isMapMoving],
  );

  const handleMapPress = useCallback(() => {
    // Do nothing - projects navigate directly
  }, []);

  const handleLocateMe = useCallback(async () => {
    // Only allow location if component is mounted and map is ready
    if (!isMountedRef.current || !isMapReady || !mapRef.current) {
      return;
    }

    try {
      const result = await getCurrentLocation();

      // Check if still mounted after async operation
      if (!isMountedRef.current) {
        return;
      }

      if (result.region) {
        // Validate region before animating
        if (
          mapRef.current &&
          isValidCoordinate(result.region.latitude) &&
          isValidLongitude(result.region.longitude) &&
          isValidCoordinate(result.region.latitudeDelta) &&
          isValidLongitude(result.region.longitudeDelta) &&
          result.region.latitudeDelta > 0 &&
          result.region.longitudeDelta > 0
        ) {
          try {
            setHomeRegion(result.region);
            setRegion(result.region);
            mapRef.current.animateToRegion(result.region, 800);
            setShowLocationError(false);
          } catch (error) {
            console.warn("Error animating to location:", error);
          }
        }
      } else if (result.error) {
        setShowLocationError(true);
        setTimeout(() => {
          if (isMountedRef.current) setShowLocationError(false);
        }, 2000);
      }
    } catch (error) {
      console.warn("Error getting current location:", error);
    }
  }, [getCurrentLocation, isMapReady]);

  const handleRegionChange = useCallback(() => {
    setIsMapMoving(true);
    if (mapMoveTimeoutRef.current) {
      clearTimeout(mapMoveTimeoutRef.current);
    }
  }, []);

  // Helper function to find the closest city based on map coordinates
  const findClosestCity = useCallback(
    (lat: number, lng: number): string | null => {
      // Validate inputs
      if (!isValidCoordinate(lat) || !isValidLongitude(lng)) {
        return null;
      }

      let closestCity: string | null = null;
      let minDistance = Infinity;

      for (const [cityName, cityRegion] of Object.entries(CITY_REGIONS)) {
        // Validate city region coordinates
        if (
          !isValidCoordinate(cityRegion.latitude) ||
          !isValidLongitude(cityRegion.longitude)
        ) {
          continue; // Skip invalid city regions
        }

        const distance = Math.sqrt(
          Math.pow(lat - cityRegion.latitude, 2) +
            Math.pow(lng - cityRegion.longitude, 2),
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestCity = cityName;
        }
      }

      // Only return city if it's reasonably close (within ~0.3 degrees, roughly 33km)
      return minDistance < 0.3 ? closestCity : null;
    },
    [],
  );

  const handleRegionChangeComplete = useCallback(
    (newRegion: typeof RIYADH_REGION) => {
      // Validate region before setting state
      if (
        isValidCoordinate(newRegion.latitude) &&
        isValidLongitude(newRegion.longitude) &&
        isValidCoordinate(newRegion.latitudeDelta) &&
        isValidLongitude(newRegion.longitudeDelta) &&
        newRegion.latitudeDelta > 0 &&
        newRegion.longitudeDelta > 0
      ) {
        setRegion(newRegion);

        // Detect which city the map is centered on and update selectedCity
        const detectedCity = findClosestCity(
          newRegion.latitude,
          newRegion.longitude,
        );
        if (detectedCity && detectedCity !== selectedCity) {
          setSelectedCity(detectedCity);
        }
      }

      mapMoveTimeoutRef.current = setTimeout(() => {
        setIsMapMoving(false);
      }, 500);
    },
    [findClosestCity, selectedCity],
  );

  const handleShowList = useCallback(() => {
    const params = {
      properties: visibleProjects,
      listingType: "projects",
    };
    navigation.navigate("PropertyList", params);
  }, [visibleProjects, navigation]);

  const handleAddPress = useCallback(() => {
    navigation.navigate("AddListing");
  }, [navigation]);

  const handleToggleSatellite = useCallback(() => {
    setIsSatelliteMode((prev) => !prev);
  }, []);

  const handleSearchPress = useCallback(() => {
    setSearchModalVisible(true);
  }, []);

  const handleSearch = useCallback(
    (city: string | null, propertyType: string | null) => {
      setSelectedCity(city);
      setSelectedPropertyType(propertyType);

      // Move map to selected city if city is provided
      // Only animate if component is mounted, map is ready, and ref is valid
      if (
        isMountedRef.current &&
        isMapReady &&
        city &&
        CITY_REGIONS[city] &&
        mapRef.current
      ) {
        const cityRegion = CITY_REGIONS[city];
        // Validate city region before animating
        if (
          isValidCoordinate(cityRegion.latitude) &&
          isValidLongitude(cityRegion.longitude) &&
          isValidCoordinate(cityRegion.latitudeDelta) &&
          isValidLongitude(cityRegion.longitudeDelta) &&
          cityRegion.latitudeDelta > 0 &&
          cityRegion.longitudeDelta > 0
        ) {
          try {
            mapRef.current.animateToRegion(cityRegion, 800);
          } catch (error) {
            console.warn("Error animating to city:", error);
          }
        }
      }
    },
    [isMapReady],
  );

  const renderMarker = useCallback(
    (p: ProjectProperty) => {
      // Double-check coordinates before rendering marker
      if (!p || !p.id || !hasValidCoordinates(p)) {
        return null;
      }

      // Ensure coordinates are valid numbers
      const lat = Number(p.lat);
      const lng = Number(p.lng);

      if (!isValidCoordinate(lat) || !isValidLongitude(lng)) {
        return null;
      }

      return (
        <Marker
          key={p.id}
          coordinate={{ latitude: lat, longitude: lng }}
          anchor={{ x: 0.5, y: 1 }}
          onPress={() => {
            // handleMarkerPress already checks isMapReady and isMapMoving
            handleMarkerPress(p);
          }}
        >
          <ProjectMarker project={p} />
        </Marker>
      );
    },
    [handleMarkerPress],
  );

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={homeRegion}
        mapType={isSatelliteMode ? "satellite" : "standard"}
        provider={Platform.OS === "android" ? "google" : undefined}
        rotateEnabled={false}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
        onMapReady={() => {
          // Add a delay to ensure map is fully ready before allowing interactions
          // Android Google Maps needs more time to fully initialize
          if (mapReadyTimeoutRef.current) {
            clearTimeout(mapReadyTimeoutRef.current);
          }
          mapReadyTimeoutRef.current = setTimeout(
            () => {
              // Double-check component is still mounted and map ref is still valid
              if (isMountedRef.current && mapRef.current) {
                setIsMapReady(true);
              }
            },
            Platform.OS === "android" ? 500 : 300,
          );
        }}
      >
        {visibleProjects.map(renderMarker).filter(Boolean)}
      </MapView>

      {/* Loading overlay — hides map until user's location is ready so Riyadh is never shown */}
      {!isLocationReady && (
        <View style={styles.mapLoadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {/* Top tabs */}
      <MapTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Filter chips */}
      <FilterChips
        filterOptions={
          activeTab === "sale" ? SALE_FILTER_OPTIONS : RENT_FILTER_OPTIONS
        }
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onSearchPress={handleSearchPress}
      />

      {/* Search Modal */}
      <ProjectSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSearch={handleSearch}
        selectedCity={selectedCity || undefined}
        selectedPropertyType={selectedPropertyType}
      />

      {/* Bottom actions - hidden when location error is shown */}
      {!showLocationError && (
        <MapBottomActions
          onShowListPress={handleShowList}
          onAddPress={handleAddPress}
          onLocatePress={handleLocateMe}
          onToggleSatellite={handleToggleSatellite}
          isSatelliteMode={isSatelliteMode}
          isMapMoving={isMapMoving}
          visibleCount={visibleCount}
          totalCount={totalCount}
          counterFadeAnim={counterFadeAnim}
        />
      )}

      {/* Commented out: "you cannot search for properties outside Saudi Arabia" message on map */}
      {/* {showLocationError && (
        <View
          style={[
            styles.errorMessageContainer,
            isRTL && styles.errorMessageContainerRTL,
            { bottom: hp(10) + insets.bottom },
          ]}
        >
          <Ionicons name="warning" size={wp(4)} color={COLORS.error} />
          <Text style={[styles.errorMessageText, isRTL && styles.errorMessageTextRTL]}>
            {t("listings.locationError")}
          </Text>
        </View>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  errorMessageContainer: {
    position: "absolute",
    left: wp(4),
    right: wp(4),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    gap: wp(2),
    zIndex: 1000,
  },
  errorMessageText: {
    flex: 1,
    fontSize: wp(3.2),
    color: COLORS.error,
    fontWeight: "500",
  },
  errorMessageContainerRTL: {
    flexDirection: "row-reverse",
  },
  errorMessageTextRTL: {
    textAlign: "right",
  },
});
