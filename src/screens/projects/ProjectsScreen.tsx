import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { View, StyleSheet, Animated, Platform, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PROPERTY_DATA, SALE_FILTER_OPTIONS, RENT_FILTER_OPTIONS } from "../../data/propertyData";
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

type NavigationProp = NativeStackNavigationProp<any>;

// Type guard to check if a property is a ProjectProperty
function isProjectProperty(property: Property): property is ProjectProperty {
  return "isProject" in property && property.isProject === true;
}

export default function ProjectsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const mapRef = useRef<MapView>(null);
  const counterFadeAnim = useRef(new Animated.Value(1)).current;
  const mapMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>("sale");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [region, setRegion] = useState(RIYADH_REGION);
  const [isMapMoving, setIsMapMoving] = useState<boolean>(false);
  const [isSatelliteMode, setIsSatelliteMode] = useState<boolean>(false);
  const [showLocationError, setShowLocationError] = useState<boolean>(false);
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  const { getCurrentLocation } = useLocation();

  const filteredProjects = useMemo(() => {
    let projects = PROPERTY_DATA.filter(
      (p): p is ProjectProperty =>
        isProjectProperty(p) && p.listingType === activeTab
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
      const filterOptions = activeTab === "sale" ? SALE_FILTER_OPTIONS : RENT_FILTER_OPTIONS;
      const f = filterOptions.find((x) => x.id === activeFilter);
      if (f?.type) {
        projects = projects.filter((p) => p.type === f.type);
      }
    }

    return projects;
  }, [activeTab, activeFilter, selectedCity, selectedPropertyType]);

  // Get projects currently visible on map
  const visibleProjects = useMemo(() => {
    const latHalf = region.latitudeDelta / 2;
    const lngHalf = region.longitudeDelta / 2;

    return filteredProjects.filter(
      (p) =>
        p.lat >= region.latitude - latHalf &&
        p.lat <= region.latitude + latHalf &&
        p.lng >= region.longitude - lngHalf &&
        p.lng <= region.longitude + lngHalf
    );
  }, [filteredProjects, region]);

  const { visibleCount, totalCount } = useMemo(() => {
    return {
      visibleCount: visibleProjects.length,
      totalCount: filteredProjects.length,
    };
  }, [visibleProjects, filteredProjects]);

  useEffect(() => {
    Animated.timing(counterFadeAnim, {
      toValue: visibleCount === 0 ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visibleCount, counterFadeAnim]);

  // Handlers
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setActiveFilter("all"); // Reset filter when switching tabs
    // Reset map to original starting point when switching between tabs
    if (mapRef.current) {
      mapRef.current.animateToRegion(RIYADH_REGION, 800);
    }
  }, []);

  const handleFilterChange = useCallback((filterId: string) => {
    setActiveFilter(filterId);
  }, []);

  const handleMarkerPress = useCallback(
    (project: ProjectProperty) => {
      navigation.navigate("ProjectDetails", {
        propertyId: project.id,
      });
    },
    [navigation]
  );

  const handleMapPress = useCallback(() => {
    // Do nothing - projects navigate directly
  }, []);

  const handleLocateMe = useCallback(async () => {
    const result = await getCurrentLocation();
    if (result.isOutsideSaudi) {
      setShowLocationError(true);
      // Hide error after 5 seconds
      setTimeout(() => {
        setShowLocationError(false);
      }, 5000);
    } else if (result.region) {
      mapRef.current?.animateToRegion(result.region, 800);
      setShowLocationError(false);
    }
  }, [getCurrentLocation]);

  const handleRegionChange = useCallback(() => {
    setIsMapMoving(true);
    if (mapMoveTimeoutRef.current) {
      clearTimeout(mapMoveTimeoutRef.current);
    }
  }, []);

  // Helper function to find the closest city based on map coordinates
  const findClosestCity = useCallback((lat: number, lng: number): string | null => {
    let closestCity: string | null = null;
    let minDistance = Infinity;

    for (const [cityName, cityRegion] of Object.entries(CITY_REGIONS)) {
      const distance = Math.sqrt(
        Math.pow(lat - cityRegion.latitude, 2) + Math.pow(lng - cityRegion.longitude, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = cityName;
      }
    }

    // Only return city if it's reasonably close (within ~0.3 degrees, roughly 33km)
    return minDistance < 0.3 ? closestCity : null;
  }, []);

  const handleRegionChangeComplete = useCallback(
    (newRegion: typeof RIYADH_REGION) => {
      setRegion(newRegion);
      
      // Detect which city the map is centered on and update selectedCity
      const detectedCity = findClosestCity(newRegion.latitude, newRegion.longitude);
      if (detectedCity && detectedCity !== selectedCity) {
        setSelectedCity(detectedCity);
      }
      
      mapMoveTimeoutRef.current = setTimeout(() => {
        setIsMapMoving(false);
      }, 500);
    },
    [findClosestCity, selectedCity]
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

  const handleSearch = useCallback((city: string | null, propertyType: string | null) => {
    setSelectedCity(city);
    setSelectedPropertyType(propertyType);
    
    // Move map to selected city if city is provided
    if (city && CITY_REGIONS[city] && mapRef.current) {
      mapRef.current.animateToRegion(CITY_REGIONS[city], 800);
    }
  }, []);

  const renderMarker = useCallback(
    (p: ProjectProperty) => {
      return (
        <Marker
          key={p.id}
          coordinate={{ latitude: p.lat, longitude: p.lng }}
          anchor={{ x: 0.5, y: 1 }}
          onPress={() => handleMarkerPress(p)}
        >
          <ProjectMarker project={p} />
        </Marker>
      );
    },
    [handleMarkerPress]
  );

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={RIYADH_REGION}
        mapType={isSatelliteMode ? "satellite" : "standard"}
        provider={Platform.OS === "android" ? "google" : undefined}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
      >
        {visibleProjects.map(renderMarker)}
      </MapView>

      {/* Top tabs */}
      <MapTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Filter chips */}
      <FilterChips
        filterOptions={activeTab === "sale" ? SALE_FILTER_OPTIONS : RENT_FILTER_OPTIONS}
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

      {/* Bottom actions */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorMessageContainer: {
    position: "absolute",
    bottom: hp(20),
    left: wp(4),
    right: wp(4),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    gap: wp(2),
    zIndex: 1000,
  },
  errorMessageText: {
    flex: 1,
    fontSize: wp(3.5),
    color: COLORS.error,
    fontWeight: "500",
  },
});
