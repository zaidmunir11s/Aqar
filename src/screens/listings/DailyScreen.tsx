import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { View, StyleSheet, Animated, Platform, TouchableOpacity, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  PROPERTY_DATA,
  DAILY_FILTER_OPTIONS,
} from "../../data/propertyData";
import { RIYADH_REGION, COLORS, CITY_REGIONS } from "../../constants";
import { useLocation, useCalendar, useDailyPrice, useBookingModal } from "../../hooks";
import type { CalendarDates } from "../../hooks/useCalendar";
import { calculateDays, formatDateRange } from "../../utils";
import { useLocalization } from "../../hooks/useLocalization";
import {
  PriceMarker,
  BottomPropertyCard,
  MapBottomActions,
  BookingDateModal,
  DailyHeaderBoxes,
  CityModal,
  SearchFilterModal,
} from "../../components";
import { applySearchFilters } from "../../utils";
import type { SearchFilterState } from "../../components/map/SearchFilterModal";
import type { Property, DailyProperty } from "../../types/property";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import {
  setPreservedCity,
  setPreservedSearchFilters,
  setPreservedDates,
} from "../../redux/slices/listingsFiltersSlice";

type NavigationProp = NativeStackNavigationProp<any>;

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

export default function DailyScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { preservedCity, preservedSearchFilters, preservedFilter, preservedDates } =
    useAppSelector((s) => s.listingsFilters);
  const { t, isRTL } = useLocalization();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const counterFadeAnim = useRef(new Animated.Value(1)).current;
  const mapMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markerPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locateMeErrorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMarkerPressTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  // Initial region: use city from params (when coming from list via "Show Map") or preserved city, else Riyadh
  const initialRegionFromParams = useMemo(() => {
    const params = route.params as { selectedCity?: string } | undefined;
    const city = params?.selectedCity || preservedCity;
    return (city && CITY_REGIONS[city]) ? CITY_REGIONS[city] : RIYADH_REGION;
  }, [route.params, preservedCity]);
  const [region, setRegion] = useState(initialRegionFromParams);
  const [cityModalVisible, setCityModalVisible] = useState<boolean>(false);
  const [showLocationError, setShowLocationError] = useState<boolean>(false);
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  
  // Initialize from params or preserved values
  const routeParamsForInit = route.params as { selectedCity?: string; searchFilters?: SearchFilterState | null } | undefined;
  const [selectedCity, setSelectedCity] = useState<string>(
    routeParamsForInit?.selectedCity || preservedCity || "City"
  );
  const [searchFilters, setSearchFilters] = useState<SearchFilterState | null>(
    routeParamsForInit?.searchFilters || preservedSearchFilters
  );
  
  // Check if we should zoom out or navigate to city when navigating from list screen
  useEffect(() => {
    const params = route.params as { shouldZoomOut?: boolean; selectedCity?: string; searchFilters?: SearchFilterState | null };
    if (params?.shouldZoomOut && mapRef.current) {
      // If city is provided, navigate to that city, otherwise zoom out to default region
      if (params.selectedCity) {
        const cityRegion = CITY_REGIONS[params.selectedCity];
        if (cityRegion) {
          mapRef.current.animateToRegion(cityRegion, 800);
          setRegion(cityRegion);
          dispatch(setPreservedCity(params.selectedCity));
          setSelectedCity(params.selectedCity);
        } else {
          mapRef.current.animateToRegion(RIYADH_REGION, 800);
        }
      } else {
        mapRef.current.animateToRegion(RIYADH_REGION, 800);
      }
    } else if (params?.selectedCity && mapRef.current) {
      // If city is provided without shouldZoomOut, just navigate to it
      const cityRegion = CITY_REGIONS[params.selectedCity];
      if (cityRegion) {
        mapRef.current.animateToRegion(cityRegion, 800);
        setRegion(cityRegion);
        dispatch(setPreservedCity(params.selectedCity));
        setSelectedCity(params.selectedCity);
      }
    }
    
    // Sync searchFilters from params
    if (params?.searchFilters !== undefined) {
      dispatch(setPreservedSearchFilters(params.searchFilters));
      setSearchFilters(params.searchFilters);
    }
  }, [route.params, dispatch]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [visitedIds, setVisitedIds] = useState<Set<number>>(new Set());
  const [isMapMoving, setIsMapMoving] = useState<boolean>(false);
  const [isSatelliteMode, setIsSatelliteMode] = useState<boolean>(false);

  // Use custom hooks
  const { getCurrentLocation } = useLocation();
  
  // Get selectedDates and selectedFilter from route params if available
  const routeParams = route.params as { shouldZoomOut?: boolean; selectedDates?: CalendarDates; selectedFilter?: string | null; selectedCity?: string; searchFilters?: SearchFilterState | null } | undefined;
  const initialDates = routeParams?.selectedDates || preservedDates || { startDate: null, endDate: null };
  
  const { selectedDates, markedDates, handleDateSelect, resetDates, setSelectedDates } =
    useCalendar(initialDates);
  const { calculatePrice: calculateDailyPrice } = useDailyPrice(selectedDates);
  const { modalVisible, openModal: openBookingDateModal, closeModal: closeBookingDateModal } = useBookingModal();
  
  // Track if we've shown the calendar modal on first visit
  const hasShownCalendarOnMount = useRef<boolean>(false);
  
  // Sync selectedDates when route params change (when navigating from list screen)
  useEffect(() => {
    if (routeParams?.selectedDates) {
      setSelectedDates(routeParams.selectedDates);
    }
  }, [routeParams?.selectedDates, setSelectedDates]);

  // Sync selectedDates to Redux when user selects dates in calendar (for tab switching)
  useEffect(() => {
    if (selectedDates.startDate && selectedDates.endDate) {
      dispatch(setPreservedDates(selectedDates));
    }
  }, [selectedDates.startDate, selectedDates.endDate, dispatch]);

  // Sync searchFilters from preserved state when screen comes into focus
  const previousFiltersRef = useRef<string>("");
  useFocusEffect(
    useCallback(() => {
      const preservedFiltersString = JSON.stringify(preservedSearchFilters);
      if (preservedFiltersString !== previousFiltersRef.current) {
        previousFiltersRef.current = preservedFiltersString;
        setSearchFilters(preservedSearchFilters);
      }
    }, [preservedSearchFilters])
  );

  // When coming from PropertyList via "Show Map", animate map to selected city after a short delay
  useFocusEffect(
    useCallback(() => {
      const params = route.params as { shouldZoomOut?: boolean; selectedCity?: string } | undefined;
      if (!params?.shouldZoomOut) return;
      const city = params.selectedCity || preservedCity;
      if (!city || !CITY_REGIONS[city]) return;
      const cityRegion = CITY_REGIONS[city];
      const timer = setTimeout(() => {
        if (mapRef.current && cityRegion) {
          mapRef.current.animateToRegion(cityRegion, 800);
          setRegion(cityRegion);
          dispatch(setPreservedCity(city));
          setSelectedCity(city);
        }
      }, 150);
      return () => clearTimeout(timer);
    }, [route.params, preservedCity, dispatch])
  );
  
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
      if (locateMeErrorTimeoutRef.current) {
        clearTimeout(locateMeErrorTimeoutRef.current);
        locateMeErrorTimeoutRef.current = null;
      }
    };
  }, []);

  // Show calendar modal automatically on first visit if no dates are selected
  useEffect(() => {
    if (!hasShownCalendarOnMount.current && !selectedDates.startDate && !selectedDates.endDate) {
      hasShownCalendarOnMount.current = true;
      // Small delay to ensure the screen is fully mounted
      setTimeout(() => {
        openBookingDateModal();
      }, 300);
    }
  }, [selectedDates.startDate, selectedDates.endDate, openBookingDateModal]);

  // Filter properties by city and dates only (for SearchFilterModal - excludes searchFilters)
  const filteredPropertiesForModal = useMemo(() => {
    let properties = PROPERTY_DATA.filter(
      (p) => 
        p.listingType === "daily" && 
        !("isProject" in p && p.isProject) &&
        hasValidCoordinates(p)
    );

    // Filter by city if selected
    if (selectedCity && selectedCity !== t("listings.city")) {
      properties = properties.filter((p) => {
        const city = (p as any).city;
        return city && city.toLowerCase() === selectedCity.toLowerCase();
      });
    }

    // Filter properties based on selected dates
    if (
      selectedDates.startDate &&
      selectedDates.endDate
    ) {
      const days = calculateDays(
        selectedDates.startDate,
        selectedDates.endDate
      );
      
      // Hide monthly properties if dates are less than 30 days
      if (days < 30) {
        properties = properties.filter(
          (p) => !("bookingType" in p && p.bookingType === "monthly")
        );
      }
      
      // Hide weekly properties if dates are less than 7 days
      if (days < 7) {
        properties = properties.filter(
          (p) => {
            const dailyProp = p as any;
            return !("bookingType" in p && dailyProp.bookingType === "weekly");
          }
        );
      }
    }

    return properties;
  }, [selectedDates, selectedCity, t]);

  // Filter properties - only daily listings (includes searchFilters)
  const filteredProperties = useMemo(() => {
    let properties = [...filteredPropertiesForModal];

    // Apply search filters if any
    if (searchFilters) {
      properties = applySearchFilters(properties, searchFilters);
    }

    return properties;
  }, [filteredPropertiesForModal, searchFilters]);

  // Get only regular properties (exclude projects) for counter
  const regularPropertiesOnly = useMemo(() => {
    return filteredProperties.filter((p) => !("isProject" in p && p.isProject));
  }, [filteredProperties]);

  // Get visible properties
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

    return regularPropertiesOnly.filter(
      (p) =>
        hasValidCoordinates(p) &&
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

  // Get reservation text to display
  const reservationText = useMemo(() => {
    if (selectedDates.startDate && selectedDates.endDate) {
      return formatDateRange(selectedDates.startDate, selectedDates.endDate, t, isRTL);
    }
    return t("listings.chooseReservation");
  }, [selectedDates, t, isRTL]);

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

  const selectedProperty = useMemo(
    () => regularPropertiesOnly.find((p) => p.id === selectedId) || null,
    [regularPropertiesOnly, selectedId]
  );

  // Handlers

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

      // Use timeout to ensure map state is stable before state update
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
      listingType: "daily",
    };
    if (
      selectedDates.startDate &&
      selectedDates.endDate &&
      selectedProperty.listingType === "daily"
    ) {
      params.selectedDates = selectedDates;
      params.calculatedPrice = calculateDailyPrice(
        selectedProperty as DailyProperty
      );
    }

    navigation.navigate("DailyDetails", params);
  }, [
    navigation,
    selectedProperty,
    selectedDates,
    calculateDailyPrice,
    visibleProperties,
  ]);

  const handleLocateMe = useCallback(async () => {
    if (locateMeErrorTimeoutRef.current) {
      clearTimeout(locateMeErrorTimeoutRef.current);
      locateMeErrorTimeoutRef.current = null;
    }
    const result = await getCurrentLocation();
    if (!isMountedRef.current) return;
    if (result.isOutsideSaudi) {
      setShowLocationError(true);
      locateMeErrorTimeoutRef.current = setTimeout(() => {
        locateMeErrorTimeoutRef.current = null;
        if (isMountedRef.current) setShowLocationError(false);
      }, 2000);
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
    const params: any = {
      properties: visibleProperties,
      listingType: "daily",
      selectedDates: selectedDates,
      selectedFilter: preservedFilter,
      selectedCity: selectedCity !== "City" ? selectedCity : undefined,
      searchFilters: searchFilters,
    };
    navigation.navigate("PropertyList", params);
  }, [visibleProperties, selectedDates, navigation, selectedCity, searchFilters, preservedFilter]);

  const handleCityPress = useCallback(() => {
    setCityModalVisible(true);
  }, []);

  const handleCitySearch = useCallback(
    (city: string) => {
      dispatch(setPreservedCity(city));
      setSelectedCity(city);
      const cityRegion = CITY_REGIONS[city];
      if (cityRegion && mapRef.current) {
        mapRef.current.animateToRegion(cityRegion, 800);
        setRegion(cityRegion);
      }
    },
    [dispatch]
  );

  const handleCityLocateMe = useCallback(async () => {
    if (locateMeErrorTimeoutRef.current) {
      clearTimeout(locateMeErrorTimeoutRef.current);
      locateMeErrorTimeoutRef.current = null;
    }
    const result = await getCurrentLocation();
    if (!isMountedRef.current) return;
    if (result.isOutsideSaudi) {
      setShowLocationError(true);
      locateMeErrorTimeoutRef.current = setTimeout(() => {
        locateMeErrorTimeoutRef.current = null;
        if (isMountedRef.current) setShowLocationError(false);
      }, 1000);
    } else if (result.region) {
      // TODO: Reverse geocode to get city name
      setSelectedCity("Current Location");
      mapRef.current?.animateToRegion(result.region, 800);
      setShowLocationError(false);
    }
  }, [getCurrentLocation]);

  const handleFiltersPress = useCallback(() => {
    setFilterModalVisible(true);
  }, []);

  const closeCityModal = useCallback(() => setCityModalVisible(false), []);
  const closeFilterModal = useCallback(() => setFilterModalVisible(false), []);

  const handleSearchFilters = useCallback(
    (filters: SearchFilterState | null, count: number, shouldClose?: boolean) => {
      dispatch(setPreservedSearchFilters(filters));
      setSearchFilters(filters);
      if (shouldClose) {
        setFilterModalVisible(false);
      }
    },
    [dispatch]
  );

  // Count active filters - price range counts as 1, property type counts as 1, all sub-options count separately
  const activeFilterCount = useMemo(() => {
    if (!searchFilters) return 0;
    let count = 0;
    
    // Price range counts as 1 filter (if either from or to is set)
    if (searchFilters.fromPrice !== "" || searchFilters.toPrice !== "") {
      count++;
    }
    
    // Property type counts as 1 filter
    if (searchFilters.selectedPropertyType !== null) {
      count++;
      
      // Only count sub-options if property type is selected
      // Usage type
      if (searchFilters.usageType !== null) count++;
      
      // Bedrooms (including "All" — user has made a selection)
      if (searchFilters.bedrooms !== "") count++;
      
      // Living rooms (including "All")
      if (searchFilters.livingRooms !== "") count++;
      
      // WC (including "All")
      if (searchFilters.wc !== "") count++;
      
      // Villa type
      if (searchFilters.villaType !== null) count++;
      
      // Count boolean filters
      const booleanFilters = [
        "furnished", "carEntrance", "airConditioned", "privateRoof",
        "apartmentInVilla", "twoEntrances", "specialEntrances", "nearBus",
        "nearMetro", "pool", "footballPitch", "volleyballCourt", "tent",
        "kitchen", "playground", "familySection", "stairs", "driverRoom",
        "maidRoom", "basement"
      ];
      booleanFilters.forEach(key => {
        if (searchFilters[key as keyof SearchFilterState] === true) count++;
      });
    }
    
    return count;
  }, [searchFilters]);

  const handleSearchBookingDate = useCallback(() => {
    closeBookingDateModal();
  }, [closeBookingDateModal]);

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
      const calculatedPriceValue =
        p.listingType === "daily"
          ? calculateDailyPrice(p as DailyProperty)
          : null;

      return (
        <Marker
          key={`${p.id}-${isSelected ? 'selected' : 'unselected'}-${isVisited ? 'visited' : 'unvisited'}-${calculatedPriceValue || 'no-price'}`}
          coordinate={{ latitude: p.lat, longitude: p.lng }}
          anchor={{ x: 0.5, y: 1 }}
          onPress={() => handleMarkerPress(p)}
          zIndex={isSelected ? 999 : 1}
        >
          <PriceMarker
            property={p}
            isSelected={isSelected}
            isVisited={isVisited}
            listingType="daily"
            calculatedPrice={calculatedPriceValue}
          />
        </Marker>
      );
    },
    [selectedId, visitedIds, calculateDailyPrice, handleMarkerPress]
  );

  const cardVisible = !!selectedProperty;

  return (
    <View style={styles.container}>
      <MapView
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

      {/* Daily Listing Header - Three Fixed White Boxes (Fixed at top, below status bar) */}
      <View style={[styles.dailyHeaderFixedContainer, { paddingTop: insets.top + hp(1) }]}>
        <DailyHeaderBoxes
          reservationText={reservationText}
          onReservationPress={openBookingDateModal}
          onCityPress={handleCityPress}
          onFiltersPress={handleFiltersPress}
          cityText={selectedCity}
          filterCount={activeFilterCount}
        />
      </View>

      {/* Error Message - above bottom safe area / action area */}
      {showLocationError && (
        <View
          style={[
            styles.errorMessageContainer,
            isRTL && styles.errorMessageContainerRTL,
            { bottom: hp(10) + insets.bottom },
          ]}
        >
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
          addButtonColor="#3b82f6"
        />
      )}

      <BottomPropertyCard
        property={selectedProperty}
        onPress={handleCardPress}
        listingType="daily"
        filterOptions={DAILY_FILTER_OPTIONS}
        calculatedPrice={
          selectedProperty &&
          selectedProperty.listingType === "daily"
            ? calculateDailyPrice(selectedProperty as DailyProperty)
            : null
        }
      />

      <BookingDateModal
        visible={modalVisible}
        onClose={closeBookingDateModal}
        onSearch={handleSearchBookingDate}
        selectedDates={selectedDates}
        onDayPress={handleDateSelect}
      />

      <CityModal
        visible={cityModalVisible}
        onClose={closeCityModal}
        onSearch={handleCitySearch}
        onLocateMe={handleCityLocateMe}
        selectedCity={selectedCity !== "City" ? selectedCity : undefined}
      />

      <SearchFilterModal
        visible={filterModalVisible}
        onClose={closeFilterModal}
        onSearch={handleSearchFilters}
        properties={filteredPropertiesForModal}
        initialFilters={searchFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  dailyHeaderFixedContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});

