import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { View, StyleSheet, Animated, Platform, Text} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  PROPERTY_DATA,
  RENT_FILTER_OPTIONS,
  SALE_FILTER_OPTIONS,
} from "../../data/propertyData";
import { RIYADH_REGION, COLORS } from "../../constants";
import { useLocation } from "../../hooks";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useLocalization } from "../../hooks/useLocalization";
import {
  PriceMarker,
  BottomPropertyCard,
  MapTabs,
  FilterChips,
  ProjectsCard,
  MapBottomActions,
} from "../../components";
import ProjectMarker from "../../components/project/ProjectMarker";
import type { TabType } from "../../components/map/MapTabs";
import type { Property } from "../../types/property";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  listingType?: "rent" | "sale";
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

// Helper function to check if property has valid coordinates
function hasValidCoordinates(property: Property): boolean {
  return (
    isValidCoordinate(property.lat) &&
    isValidLongitude(property.lng)
  );
}

export default function MapLandingScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const { t, isRTL } = useLocalization();
  const mapRef = useRef<MapView>(null);
  const counterFadeAnim = useRef(new Animated.Value(1)).current;
  const mapMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const markerPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMarkerPressTimeRef = useRef<number>(0);

  // Set initial tab from route params, default to "rent"
  const initialTab = params?.listingType === "sale" ? "sale" : "rent";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [region, setRegion] = useState(RIYADH_REGION);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [visitedIds, setVisitedIds] = useState<Set<number>>(new Set());
  const [isMapMoving, setIsMapMoving] = useState<boolean>(false);
  const [isSatelliteMode, setIsSatelliteMode] = useState<boolean>(false);
  const [showLocationError, setShowLocationError] = useState<boolean>(false);

  // Use custom hooks
  const { getCurrentLocation } = useLocation();

  // Get filter options based on active tab
  const filterOptions = useMemo(() => {
    if (activeTab === "rent") return RENT_FILTER_OPTIONS;
    return SALE_FILTER_OPTIONS;
  }, [activeTab]);

  // Update active tab when route params change
  useEffect(() => {
    if (params?.listingType === "sale" || params?.listingType === "rent") {
      setActiveTab(params.listingType);
    }
  }, [params?.listingType]);

  // Reset filter when tab changes
  useEffect(() => {
    setActiveFilter("all");
    setSelectedId(null);
  }, [activeTab]);

  // Track component mount state and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (mapMoveTimeoutRef.current) {
        clearTimeout(mapMoveTimeoutRef.current);
        mapMoveTimeoutRef.current = null;
      }
      if (markerPressTimeoutRef.current) {
        clearTimeout(markerPressTimeoutRef.current);
        markerPressTimeoutRef.current = null;
      }
    };
  }, []);

  // Filter properties
  const filteredProperties = useMemo(() => {
    let properties = PROPERTY_DATA.filter((p) => {
      // First check if coordinates are valid
      if (!hasValidCoordinates(p)) {
        return false;
      }
      
      if (activeTab === "sale") {
        return p.listingType === "sale";
      }
      return p.listingType === activeTab && !("isProject" in p && p.isProject);
    });

    if (activeFilter !== "all") {
      const f = filterOptions.find((x) => x.id === activeFilter);
      if (f?.type) {
        properties = properties.filter((p) => p.type === f.type);
      }
    }

    return properties;
  }, [activeTab, activeFilter, filterOptions]);

  // Get only regular properties (exclude projects) for counter
  const regularPropertiesOnly = useMemo(() => {
    return filteredProperties.filter((p) => !("isProject" in p && p.isProject));
  }, [filteredProperties]);

  // Get project count
  const projectCount = useMemo(() => {
    return PROPERTY_DATA.filter(
      (p) => "isProject" in p && p.isProject && p.listingType === "sale"
    ).length;
  }, []);

  // Get visible properties (include projects for sale tab)
  const visibleProperties = useMemo(() => {
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

    // For sale tab, include projects; for other tabs, exclude projects
    const propertiesToFilter = activeTab === "sale" 
      ? filteredProperties 
      : regularPropertiesOnly;

    return propertiesToFilter.filter(
      (p) =>
        hasValidCoordinates(p) &&
        p.lat >= region.latitude - latHalf &&
        p.lat <= region.latitude + latHalf &&
        p.lng >= region.longitude - lngHalf &&
        p.lng <= region.longitude + lngHalf
    );
  }, [regularPropertiesOnly, filteredProperties, region, activeTab]);

  const { visibleCount, totalCount } = useMemo(() => {
    return {
      visibleCount: visibleProperties.length,
      totalCount: regularPropertiesOnly.length,
    };
  }, [visibleProperties, regularPropertiesOnly]);

  // Animate counter fade
  useEffect(() => {
    Animated.timing(counterFadeAnim, {
      toValue: visibleCount === 0 ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visibleCount, counterFadeAnim]);

  const selectedProperty = useMemo(() => {
    // For sale tab, search in filteredProperties (includes projects); otherwise use regularPropertiesOnly
    const propertiesToSearch = activeTab === "sale" 
      ? filteredProperties 
      : regularPropertiesOnly;
    return propertiesToSearch.find((p) => p.id === selectedId) || null;
  }, [regularPropertiesOnly, filteredProperties, selectedId, activeTab]);

  // Handlers
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    // Reset map to original starting point when switching between tabs (rent/sale/daily)
    // Only animate if component is mounted and ref is valid
    if (isMountedRef.current && mapRef.current && isValidCoordinate(RIYADH_REGION.latitude) && isValidLongitude(RIYADH_REGION.longitude)) {
      try {
        mapRef.current.animateToRegion(RIYADH_REGION, 800);
      } catch (error) {
        console.warn("Error animating to region:", error);
      }
    }
  }, []);

  const handleFilterChange = useCallback((filterId: string) => {
    setActiveFilter(filterId);
  }, []);

  const handleMarkerPress = useCallback(
    (property: Property) => {
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

      // Don't handle marker press if component is unmounted
      if (!isMountedRef.current) {
        return;
      }

      // Use timeout to ensure map state is stable before navigation/state update
      markerPressTimeoutRef.current = setTimeout(() => {
        // Double-check component is still mounted
        if (!isMountedRef.current) {
          return;
        }

        try {
          if ("isProject" in property && property.isProject) {
            navigation.navigate("ProjectDetails", {
              propertyId: property.id,
            });
            return;
          }

          setSelectedId(property.id);
          setVisitedIds((prev) => {
            const next = new Set(prev);
            next.add(property.id);
            return next;
          });
        } catch (error) {
          console.warn("Error handling marker press:", error);
        }
      }, 100);
    },
    [navigation]
  );

  const handleMapPress = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleCardPress = useCallback(() => {
    if (!selectedProperty) return;

    if ("isProject" in selectedProperty && selectedProperty.isProject) {
      navigation.navigate("ProjectDetails", {
        propertyId: selectedProperty.id,
      });
      return;
    }

    const params: any = {
      propertyId: selectedProperty.id,
      visiblePropertyIds: visibleProperties.map((p) => p.id),
      listingType: activeTab,
    };

    // Navigate to DailyDetails for daily listings, PropertyDetails for rent/sale
    if (selectedProperty.listingType === "daily") {
      navigation.navigate("DailyDetails", params);
    } else {
    navigation.navigate("PropertyDetails", params);
    }
  }, [
    navigation,
    selectedProperty,
    activeTab,
    visibleProperties,
  ]);

  const handleLocateMe = useCallback(async () => {
    // Check if component is still mounted and map ref is valid
    if (!isMountedRef.current || !mapRef.current) {
      return;
    }

    try {
      const result = await getCurrentLocation();
      
      // Check if still mounted after async operation
      if (!isMountedRef.current || !mapRef.current) {
        return;
      }

      if (result.isOutsideSaudi) {
        setShowLocationError(true);
        // Hide error after 5 seconds
        setTimeout(() => {
          if (isMountedRef.current) {
            setShowLocationError(false);
          }
        }, 2000);
      } else if (result.region) {
        // Validate region before animating
        if (
          isValidCoordinate(result.region.latitude) &&
          isValidLongitude(result.region.longitude) &&
          isValidCoordinate(result.region.latitudeDelta) &&
          isValidLongitude(result.region.longitudeDelta) &&
          result.region.latitudeDelta > 0 &&
          result.region.longitudeDelta > 0
        ) {
          try {
            mapRef.current.animateToRegion(result.region, 800);
            setShowLocationError(false);
          } catch (error) {
            console.warn("Error animating to location:", error);
          }
        }
      }
    } catch (error) {
      console.warn("Error getting current location:", error);
    }
  }, [getCurrentLocation]);

  const handleRegionChange = useCallback(() => {
    setIsMapMoving(true);
    if (mapMoveTimeoutRef.current) {
      clearTimeout(mapMoveTimeoutRef.current);
    }
  }, []);

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
      }
      
      mapMoveTimeoutRef.current = setTimeout(() => {
        setIsMapMoving(false);
      }, 500);
    },
    []
  );

  const handleShowList = useCallback(() => {
    // Only include regular properties (exclude projects) for the list view
    const regularProperties = visibleProperties.filter(
      (p) => !("isProject" in p && p.isProject)
    );
    
    const params: any = {
      properties: regularProperties,
      listingType: activeTab,
    };
    navigation.navigate("PropertyList", params);
  }, [visibleProperties, activeTab, navigation]);

  const handleProjectsPress = useCallback(() => {
    navigation.navigate("Projects");
  }, [navigation]);


  const handleAddPress = useCallback(() => {
    navigation.navigate("AddListing");
  }, [navigation]);

  const handleToggleSatellite = useCallback(() => {
    setIsSatelliteMode((prev) => !prev);
  }, []);

  const renderMarker = useCallback(
    (p: Property) => {
      // Double-check coordinates before rendering marker
      if (!hasValidCoordinates(p)) {
        return null;
      }

      const isSelected = selectedId === p.id;
      const isVisited = visitedIds.has(p.id);

      // Use ProjectMarker for projects, PriceMarker for regular properties
      const isProject = "isProject" in p && p.isProject;

      return (
        <Marker
          key={`${p.id}-${isSelected ? 'selected' : 'unselected'}-${isVisited ? 'visited' : 'unvisited'}`}
          coordinate={{ latitude: p.lat, longitude: p.lng }}
          anchor={{ x: 0.5, y: 1 }}
          onPress={() => handleMarkerPress(p)}
          zIndex={isSelected ? 999 : 1}
        >
          {isProject ? (
            <ProjectMarker project={p as any} />
          ) : (
            <PriceMarker
              property={p}
              isSelected={isSelected}
              isVisited={isVisited}
              listingType={activeTab}
            />
          )}
        </Marker>
      );
    },
    [selectedId, visitedIds, activeTab, handleMarkerPress]
  );

  const cardVisible = !!selectedProperty;

  return (
    <View style={styles.container}>
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
        {visibleProperties.map(renderMarker).filter(Boolean)}
      </MapView>

      <MapTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <FilterChips
        filterOptions={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {activeTab === "sale" && (
        <ProjectsCard
          projectCount={projectCount}
          onPress={handleProjectsPress}
          showBelow={false}
        />
      )}

      {/* Error Message */}
      {showLocationError && (
        <View style={[styles.errorMessageContainer, isRTL && styles.errorMessageContainerRTL]}>
          <Ionicons name="information-circle" size={wp(4)} color={COLORS.error} />
          <Text style={[styles.errorMessageText, isRTL && styles.errorMessageTextRTL]}>
            {t("listings.locationError")}
          </Text>
        </View>
      )}

      {!cardVisible && !showLocationError && (
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

      <BottomPropertyCard
        property={selectedProperty}
        onPress={handleCardPress}
        listingType={activeTab}
        filterOptions={filterOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorMessageContainer: {
    position: "absolute",
    bottom: hp(5),
    left: wp(4),
    right: wp(4),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: wp(2),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.6),
    gap: wp(1.5),
    zIndex: 1000,
  },
  errorMessageContainerRTL: {
    flexDirection: "row-reverse",
  },
  errorMessageText: {
    flex: 1,
    fontSize: wp(3.2),
    color: COLORS.error,
    fontWeight: "500",
  },
  errorMessageTextRTL: {
    textAlign: "right",
  },
});
