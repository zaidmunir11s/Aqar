import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { View, StyleSheet, Animated } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PROPERTY_DATA, SALE_FILTER_OPTIONS } from "../../data/propertyData";
import { RIYADH_REGION } from "../../constants";
import { useLocation } from "../../hooks";
import {
  ProjectMarker,
  MapTabs,
  FilterChips,
  MapBottomActions,
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
  const { getCurrentLocation } = useLocation();

  const filteredProjects = useMemo(() => {
    if (activeTab !== "sale") {
      return [];
    }

    let projects = PROPERTY_DATA.filter(
      (p): p is ProjectProperty =>
        isProjectProperty(p) && p.listingType === "sale"
    );

    if (activeFilter !== "all") {
      const f = SALE_FILTER_OPTIONS.find((x) => x.id === activeFilter);
      if (f?.type) {
        projects = projects.filter((p) => p.type === f.type);
      }
    }

    return projects;
  }, [activeTab, activeFilter]);

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
    const newRegion = await getCurrentLocation();
    if (newRegion) {
      mapRef.current?.animateToRegion(newRegion, 800);
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
      setRegion(newRegion);
      mapMoveTimeoutRef.current = setTimeout(() => {
        setIsMapMoving(false);
      }, 500);
    },
    []
  );

  const handleShowList = useCallback(() => {
    const params = {
      properties: visibleProjects,
      listingType: "sale",
    };
    navigation.navigate("PropertyList", params);
  }, [visibleProjects, navigation]);

  const handleAddPress = useCallback(() => {
    console.log("Add property");
    // TODO: Navigate to add property screen
  }, []);

  const handleToggleSatellite = useCallback(() => {
    setIsSatelliteMode((prev) => !prev);
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
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
      >
        {filteredProjects.map(renderMarker)}
      </MapView>

      {/* Top tabs */}
      <MapTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Filter chips */}
      <FilterChips
        filterOptions={SALE_FILTER_OPTIONS}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
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
});
