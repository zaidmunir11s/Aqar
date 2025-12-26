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
import {
  PROPERTY_DATA,
  RENT_FILTER_OPTIONS,
  SALE_FILTER_OPTIONS,
  DAILY_FILTER_OPTIONS,
} from "../../data/propertyData";
import { RIYADH_REGION } from "../../constants";
import { useLocation, useCalendar, useDailyPrice } from "../../hooks";
import { calculateDays } from "../../utils";
import {
  PriceMarker,
  BottomPropertyCard,
  CalendarModal,
  MapTabs,
  FilterChips,
  ReservationDateCard,
  ProjectsCard,
  MapBottomActions,
} from "../../components";
import type { TabType } from "../../components/map/MapTabs";
import type { Property, DailyProperty } from "../../types/property";

type NavigationProp = NativeStackNavigationProp<any>;

export default function MapLandingScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const mapRef = useRef<MapView>(null);
  const counterFadeAnim = useRef(new Animated.Value(1)).current;
  const mapMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>("rent");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [region, setRegion] = useState(RIYADH_REGION);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [visitedIds, setVisitedIds] = useState<Set<number>>(new Set());
  const [isMapMoving, setIsMapMoving] = useState<boolean>(false);
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);
  const [isSatelliteMode, setIsSatelliteMode] = useState<boolean>(false);

  // Use custom hooks
  const { getCurrentLocation } = useLocation();
  const { selectedDates, markedDates, handleDateSelect, resetDates } =
    useCalendar();
  const { calculatePrice: calculateDailyPrice } = useDailyPrice(selectedDates);

  // Get filter options based on active tab
  const filterOptions = useMemo(() => {
    if (activeTab === "rent") return RENT_FILTER_OPTIONS;
    if (activeTab === "sale") return SALE_FILTER_OPTIONS;
    return DAILY_FILTER_OPTIONS;
  }, [activeTab]);

  // Reset filter when tab changes
  useEffect(() => {
    setActiveFilter("all");
    setSelectedId(null);
    resetDates();
  }, [activeTab, resetDates]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    let properties = PROPERTY_DATA.filter((p) => {
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

    // For daily tab: if dates are selected and less than 30 days, hide monthly properties
    if (
      activeTab === "daily" &&
      selectedDates.startDate &&
      selectedDates.endDate
    ) {
      const days = calculateDays(
        selectedDates.startDate,
        selectedDates.endDate
      );
      if (days < 30) {
        properties = properties.filter(
          (p) => !("bookingType" in p && p.bookingType === "monthly")
        );
      }
    }

    return properties;
  }, [activeTab, activeFilter, filterOptions, selectedDates]);

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

  // Get visible properties
  const visibleProperties = useMemo(() => {
    const latHalf = region.latitudeDelta / 2;
    const lngHalf = region.longitudeDelta / 2;

    return regularPropertiesOnly.filter(
      (p) =>
        p.lat >= region.latitude - latHalf &&
        p.lat <= region.latitude + latHalf &&
        p.lng >= region.longitude - lngHalf &&
        p.lng <= region.longitude + lngHalf
    );
  }, [regularPropertiesOnly, region]);

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

  const selectedProperty = useMemo(
    () => regularPropertiesOnly.find((p) => p.id === selectedId) || null,
    [regularPropertiesOnly, selectedId]
  );

  // Handlers
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    // Reset map to original starting point when switching between tabs (rent/sale/daily)
    if (mapRef.current) {
      mapRef.current.animateToRegion(RIYADH_REGION, 800);
    }
  }, []);

  const handleFilterChange = useCallback((filterId: string) => {
    setActiveFilter(filterId);
  }, []);

  const handleMarkerPress = useCallback(
    (property: Property) => {
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
    if (
      activeTab === "daily" &&
      selectedDates.startDate &&
      selectedDates.endDate &&
      selectedProperty.listingType === "daily"
    ) {
      params.selectedDates = selectedDates;
      params.calculatedPrice = calculateDailyPrice(
        selectedProperty as DailyProperty
      );
    }

    navigation.navigate("PropertyDetails", params);
  }, [
    navigation,
    selectedProperty,
    activeTab,
    selectedDates,
    calculateDailyPrice,
    visibleProperties,
  ]);

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
    const params: any = {
      properties: visibleProperties,
      listingType: activeTab,
    };
    if (
      activeTab === "daily" &&
      selectedDates.startDate &&
      selectedDates.endDate
    ) {
      params.selectedDates = selectedDates;
    }
    navigation.navigate("PropertyList", params);
  }, [visibleProperties, activeTab, selectedDates, navigation]);

  const handleProjectsPress = useCallback(() => {
    navigation.navigate("Projects");
  }, [navigation]);

  const handleOpenCalendar = useCallback(() => {
    setCalendarVisible(true);
  }, []);

  const handleCloseCalendar = useCallback(() => {
    setCalendarVisible(false);
  }, []);

  const handleAddPress = useCallback(() => {
    navigation.navigate("AddListing");
  }, [navigation]);

  const handleToggleSatellite = useCallback(() => {
    setIsSatelliteMode((prev) => !prev);
  }, []);

  const renderMarker = useCallback(
    (p: Property) => {
      return (
        <Marker
          key={p.id}
          coordinate={{ latitude: p.lat, longitude: p.lng }}
          anchor={{ x: 0.5, y: 1 }}
          onPress={() => handleMarkerPress(p)}
          zIndex={selectedId === p.id ? 999 : 1}
        >
          <PriceMarker
            property={p}
            isSelected={selectedId === p.id}
            isVisited={visitedIds.has(p.id)}
            listingType={activeTab}
            calculatedPrice={
              activeTab === "daily" && p.listingType === "daily"
                ? calculateDailyPrice(p as DailyProperty)
                : null
            }
          />
        </Marker>
      );
    },
    [selectedId, visitedIds, activeTab, calculateDailyPrice, handleMarkerPress]
  );

  const cardVisible = !!selectedProperty;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={RIYADH_REGION}
        mapType={isSatelliteMode ? "satellite" : "standard"}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
      >
        {filteredProperties.map(renderMarker)}
      </MapView>

      <MapTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <FilterChips
        filterOptions={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {activeTab === "daily" && (
        <ReservationDateCard
          selectedDates={selectedDates}
          onPress={handleOpenCalendar}
        />
      )}

      {activeTab === "sale" && (
        <ProjectsCard
          projectCount={projectCount}
          onPress={handleProjectsPress}
          showBelow={false}
        />
      )}

      {!cardVisible && (
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
        calculatedPrice={
          activeTab === "daily" &&
          selectedProperty &&
          selectedProperty.listingType === "daily"
            ? calculateDailyPrice(selectedProperty as DailyProperty)
            : null
        }
      />

      <CalendarModal
        visible={calendarVisible}
        onClose={handleCloseCalendar}
        markedDates={markedDates}
        onDayPress={handleDateSelect}
        selectedDates={selectedDates}
        onResetDates={resetDates}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
