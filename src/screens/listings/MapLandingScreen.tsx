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
  StatusBar,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RENT_FILTER_OPTIONS, SALE_FILTER_OPTIONS } from "../../data/propertyData";
import { RIYADH_REGION, COLORS } from "../../constants";
import { useLocation } from "../../hooks";
import type { LocationRegion } from "../../hooks/useLocation";
import { useIsAuthenticated } from "../../context/auth-context";
import { isValidMapRegion } from "@/utils/geoValidation";
import {
  filterRentSaleFromPropertyData,
  hasValidMapCoordinates,
} from "@/utils/listingPropertyFilters";
import {
  PriceMarker,
  BottomPropertyCard,
  MapTabs,
  FilterChips,
  MapBottomActions,
  AddActionBottomSheet,
  CancelModal,
} from "../../components";
import { useLocalization } from "../../hooks/useLocalization";
import type { TabType } from "../../components/map/MapTabs";
import type { Property } from "../../types/property";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  listingType?: "rent" | "sale";
}

/** Last user-centered map region for Map Landing; survives screen remounts within the app session. */
let mapLandingLastUserRegion: LocationRegion | null = null;

/** Marker UI session: survives remount when returning via navigate/pop (e.g. cancel flow → map). */
let mapLandingMarkerSession: { selectedId: number | null; visitedIds: number[] } = {
  selectedId: null,
  visitedIds: [],
};

/** Satellite toggle: survives remount; Android native tiles can desync from JS until MapView remounts. */
let mapPreferredSatellite = false;

/** Debounce viewport-driven React state so marker list does not rebuild on every map frame completion. */
const MAP_REGION_STATE_DEBOUNCE_MS = 200;

export default function MapLandingScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const { t } = useLocalization();
  const { isAuthenticated, isLoaded } = useIsAuthenticated();
  const mapRef = useRef<MapView>(null);
  const counterFadeAnim = useRef(new Animated.Value(1)).current;
  const mapMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const regionStateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const markerPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMarkerPressTimeRef = useRef<number>(0);

  // Set initial tab from route params, default to "rent"
  const initialTab = params?.listingType === "sale" ? "sale" : "rent";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [region, setRegion] = useState<LocationRegion | null>(() => mapLandingLastUserRegion);
  const [isLocationReady, setIsLocationReady] = useState<boolean>(() => mapLandingLastUserRegion !== null);
  const [selectedId, setSelectedId] = useState<number | null>(
    () => mapLandingMarkerSession.selectedId
  );
  const [visitedIds, setVisitedIds] = useState<Set<number>>(
    () => new Set(mapLandingMarkerSession.visitedIds)
  );
  const [isMapMoving, setIsMapMoving] = useState<boolean>(false);
  const [isSatelliteMode, setIsSatelliteMode] = useState<boolean>(() => mapPreferredSatellite);
  const isSatelliteModeRef = useRef(isSatelliteMode);
  /** Android: bump so MapView remounts on focus when satellite is on (fixes tiles stuck on standard after leaving stack). */
  const [mapAndroidRemountKey, setMapAndroidRemountKey] = useState(0);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [showExitAppModal, setShowExitAppModal] = useState(false);

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

  useEffect(() => {
    mapLandingMarkerSession.selectedId = selectedId;
  }, [selectedId]);

  useEffect(() => {
    mapLandingMarkerSession.visitedIds = [...visitedIds];
  }, [visitedIds]);

  useEffect(() => {
    isSatelliteModeRef.current = isSatelliteMode;
    mapPreferredSatellite = isSatelliteMode;
  }, [isSatelliteMode]);

  // Track component mount state and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (mapMoveTimeoutRef.current) {
        clearTimeout(mapMoveTimeoutRef.current);
        mapMoveTimeoutRef.current = null;
      }
      if (regionStateDebounceRef.current) {
        clearTimeout(regionStateDebounceRef.current);
        regionStateDebounceRef.current = null;
      }
      if (markerPressTimeoutRef.current) {
        clearTimeout(markerPressTimeoutRef.current);
        markerPressTimeoutRef.current = null;
      }
    };
  }, []);

  const dismissExitAppModal = useCallback(() => {
    setShowExitAppModal(false);
  }, []);

  const confirmExitApp = useCallback(() => {
    setShowExitAppModal(false);
    BackHandler.exitApp();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") {
        return undefined;
      }
      const onHardwareBackPress = () => {
        if (showExitAppModal) {
          dismissExitAppModal();
          return true;
        }
        if (isAddModalVisible) {
          setIsAddModalVisible(false);
          return true;
        }
        if (selectedId != null) {
          setSelectedId(null);
          return true;
        }
        setShowExitAppModal(true);
        return true;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onHardwareBackPress);
      return () => sub.remove();
    }, [
      dismissExitAppModal,
      isAddModalVisible,
      selectedId,
      showExitAppModal,
    ])
  );

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") {
        return undefined;
      }
      const id = requestAnimationFrame(() => {
        if (!isSatelliteModeRef.current) return;
        setMapAndroidRemountKey((k) => k + 1);
      });
      return () => cancelAnimationFrame(id);
    }, [])
  );

  const filteredProperties = useMemo(() => {
    let properties = filterRentSaleFromPropertyData(activeTab, {
      requireMapCoordinates: true,
    });

    if (activeFilter !== "all") {
      const f = filterOptions.find((x) => x.id === activeFilter);
      if (f?.type) {
        properties = properties.filter((p) => p.type === f.type);
      }
    }

    return properties;
  }, [activeTab, activeFilter, filterOptions]);

  const visibleProperties = useMemo(() => {
    if (!region || !isValidMapRegion(region)) return [];

    const latHalf = region.latitudeDelta / 2;
    const lngHalf = region.longitudeDelta / 2;

    return filteredProperties.filter(
      (p) =>
        hasValidMapCoordinates(p) &&
        p.lat >= region.latitude - latHalf &&
        p.lat <= region.latitude + latHalf &&
        p.lng >= region.longitude - lngHalf &&
        p.lng <= region.longitude + lngHalf
    );
  }, [filteredProperties, region]);

  const { visibleCount, totalCount } = useMemo(() => {
    return {
      visibleCount: visibleProperties.length,
      totalCount: filteredProperties.length,
    };
  }, [visibleProperties, filteredProperties]);

  // Animate counter fade
  useEffect(() => {
    const anim = Animated.timing(counterFadeAnim, {
      toValue: visibleCount === 0 ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [visibleCount, counterFadeAnim]);

  const selectedProperty = useMemo(() => {
    return filteredProperties.find((p) => p.id === selectedId) || null;
  }, [filteredProperties, selectedId]);

  // Handlers
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
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
    []
  );

  const handleMapPress = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleCardPress = useCallback(() => {
    if (!selectedProperty) return;

    const params: any = {
      propertyId: selectedProperty.id,
      visiblePropertyIds: visibleProperties.map((p) => p.id),
      listingType: activeTab,
    };

    navigation.navigate("PropertyDetails", params);
  }, [
    navigation,
    selectedProperty,
    activeTab,
    visibleProperties,
  ]);

  const applyLocatedRegion = useCallback((next: LocationRegion, animate: boolean) => {
    mapLandingLastUserRegion = next;
    setRegion(next);
    if (isMountedRef.current) setIsLocationReady(true);
    if (animate && mapRef.current) {
      try {
        mapRef.current.animateToRegion(next, 800);
      } catch (error) {
        console.warn("Error animating to location:", error);
      }
    }
  }, []);

  const handleLocateMe = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      const result = await getCurrentLocation();
      if (!isMountedRef.current) return;

      if (result.region) {
        if (isValidMapRegion(result.region)) {
          applyLocatedRegion(result.region, true);
        } else {
          setRegion((prev) => (prev !== null ? prev : RIYADH_REGION));
          if (isMountedRef.current) setIsLocationReady(true);
        }
      } else if (result.error) {
        setRegion((prev) => (prev !== null ? prev : RIYADH_REGION));
        if (isMountedRef.current) setIsLocationReady(true);
      }
    } catch (error) {
      console.warn("Error getting current location:", error);
      setRegion((prev) => (prev !== null ? prev : RIYADH_REGION));
      if (isMountedRef.current) setIsLocationReady(true);
    }
  }, [getCurrentLocation, applyLocatedRegion]);

  // First cold open this session: one GPS read to set the map center (no animation — MapView uses initialRegion).
  // After that, only the locate button fetches GPS again; pan/zoom updates `mapLandingLastUserRegion` so we do not snap back here.
  useEffect(() => {
    if (mapLandingLastUserRegion !== null) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await getCurrentLocation();
        if (cancelled || !isMountedRef.current) return;

        if (result.region) {
          if (isValidMapRegion(result.region)) {
            applyLocatedRegion(result.region, false);
          } else {
            setRegion((prev) => (prev !== null ? prev : RIYADH_REGION));
            if (isMountedRef.current) setIsLocationReady(true);
          }
        } else if (result.error) {
          setRegion((prev) => (prev !== null ? prev : RIYADH_REGION));
          if (isMountedRef.current) setIsLocationReady(true);
        }
      } catch (error) {
        console.warn("Error getting current location:", error);
        if (!cancelled && isMountedRef.current) {
          setRegion((prev) => (prev !== null ? prev : RIYADH_REGION));
          setIsLocationReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getCurrentLocation, applyLocatedRegion]);

  const handleRegionChange = useCallback(() => {
    setIsMapMoving(true);
    if (mapMoveTimeoutRef.current) {
      clearTimeout(mapMoveTimeoutRef.current);
    }
  }, []);

  const handleRegionChangeComplete = useCallback((newRegion: LocationRegion) => {
    if (isValidMapRegion(newRegion)) {
      mapLandingLastUserRegion = newRegion;
      if (regionStateDebounceRef.current) {
        clearTimeout(regionStateDebounceRef.current);
      }
      regionStateDebounceRef.current = setTimeout(() => {
        regionStateDebounceRef.current = null;
        if (isMountedRef.current && mapLandingLastUserRegion && isValidMapRegion(mapLandingLastUserRegion)) {
          setRegion(mapLandingLastUserRegion);
        }
      }, MAP_REGION_STATE_DEBOUNCE_MS);
    }

    mapMoveTimeoutRef.current = setTimeout(() => {
      setIsMapMoving(false);
    }, 500);
  }, []);

  const handleShowList = useCallback(() => {
    const params: any = {
      properties: visibleProperties,
      listingType: activeTab,
    };
    navigation.navigate("PropertyList", params);
  }, [visibleProperties, activeTab, navigation]);

  const handleAddPress = useCallback(() => {
    if (!isLoaded) return;

    if (isAuthenticated) {
      setIsAddModalVisible(true);
      return;
    }

    navigation.navigate("ProfileTab", { screen: "Login" });
  }, [isAuthenticated, isLoaded, navigation]);

  const closeAddModal = useCallback(() => {
    setIsAddModalVisible(false);
  }, []);

  const handleAddAdPress = useCallback(() => {
    setIsAddModalVisible(false);
    requestAnimationFrame(() => {
      navigation.navigate("AddListing");
    });
  }, [navigation]);

  const handleSearchRequestPress = useCallback(() => {
    setIsAddModalVisible(false);
    requestAnimationFrame(() => {
      navigation.navigate("SearchRequest");
    });
  }, [navigation]);

  const handleToggleSatellite = useCallback(() => {
    setIsSatelliteMode((prev) => {
      const next = !prev;
      mapPreferredSatellite = next;
      isSatelliteModeRef.current = next;
      return next;
    });
  }, []);

  const renderMarker = useCallback(
    (p: Property) => {
      // Double-check coordinates before rendering marker
      if (!hasValidMapCoordinates(p)) {
        return null;
      }

      const isSelected = selectedId === p.id;
      const isVisited = visitedIds.has(p.id);

      return (
        <Marker
          key={`${p.id}-${isSelected ? 'selected' : 'unselected'}-${isVisited ? 'visited' : 'unvisited'}`}
          coordinate={{ latitude: p.lat, longitude: p.lng }}
          anchor={{ x: 0.5, y: 1 }}
          onPress={() => handleMarkerPress(p)}
          zIndex={isSelected ? 999 : 1}
        >
          <PriceMarker
            property={p}
            isSelected={isSelected}
            isVisited={isVisited}
            listingType={activeTab}
          />
        </Marker>
      );
    },
    [selectedId, visitedIds, activeTab, handleMarkerPress]
  );

  const cardVisible = !!selectedProperty;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      {region ? (
        <MapView
          key={Platform.OS === "android" ? `map-android-${mapAndroidRemountKey}` : "map-ios"}
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={region}
          mapType={isSatelliteMode ? "satellite" : "standard"}
          provider={Platform.OS === "android" ? "google" : undefined}
          rotateEnabled={false}
          onRegionChange={handleRegionChange}
          onRegionChangeComplete={handleRegionChangeComplete}
          onPress={handleMapPress}
        >
          {visibleProperties.map(renderMarker).filter(Boolean)}
        </MapView>
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.mapPlaceholder]} />
      )}

      {/* Loading overlay until first GPS fix (no default city as initial map center) */}
      {!isLocationReady && (
        <View style={styles.mapLoadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      <MapTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <FilterChips
        filterOptions={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {!cardVisible && isLocationReady && (
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

      <AddActionBottomSheet
        visible={isAddModalVisible}
        onClose={closeAddModal}
        onAddAdPress={handleAddAdPress}
        onSearchRequestPress={handleSearchRequestPress}
      />

      <BottomPropertyCard
        property={selectedProperty}
        onPress={handleCardPress}
        listingType={activeTab}
        filterOptions={filterOptions}
      />

      <CancelModal
        visible={showExitAppModal}
        title={t("navigation.exitAppTitle")}
        description={t("navigation.exitAppMessage")}
        onBack={dismissExitAppModal}
        onConfirm={confirmExitApp}
        backText={t("common.no")}
        confirmText={t("common.yes")}
        alignBodyToStart
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapPlaceholder: { backgroundColor: "#e5e7eb" },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
});
