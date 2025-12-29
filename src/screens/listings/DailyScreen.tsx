import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { View, StyleSheet, Animated, Platform, TouchableOpacity, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import {
  PriceMarker,
  BottomPropertyCard,
  MapBottomActions,
  BookingDateModal,
  DailyHeaderBoxes,
  CityModal,
  SearchFilterModal,
} from "../../components";
import type { SearchFilterState } from "../../components/map/SearchFilterModal";
import type { Property, DailyProperty } from "../../types/property";
import { 
  getPreservedFilter, 
  getPreservedDates, 
  getPreservedCity, 
  getPreservedSearchFilters,
  setPreservedDates,
  setPreservedCity,
  setPreservedSearchFilters
} from "./PropertyListScreen";

type NavigationProp = NativeStackNavigationProp<any>;

export default function DailyScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const mapRef = useRef<MapView>(null);
  const counterFadeAnim = useRef(new Animated.Value(1)).current;
  const mapMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [region, setRegion] = useState(RIYADH_REGION);
  const [cityModalVisible, setCityModalVisible] = useState<boolean>(false);
  const [showLocationError, setShowLocationError] = useState<boolean>(false);
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  
  // Initialize from params or preserved values
  const routeParamsForInit = route.params as { selectedCity?: string; searchFilters?: SearchFilterState | null } | undefined;
  const [selectedCity, setSelectedCity] = useState<string>(
    routeParamsForInit?.selectedCity || getPreservedCity() || "City"
  );
  const [searchFilters, setSearchFilters] = useState<SearchFilterState | null>(
    routeParamsForInit?.searchFilters || getPreservedSearchFilters()
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
          setPreservedCity(params.selectedCity);
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
        setPreservedCity(params.selectedCity);
        setSelectedCity(params.selectedCity);
      }
    }
    
    // Sync searchFilters from params
    if (params?.searchFilters !== undefined) {
      setPreservedSearchFilters(params.searchFilters);
      setSearchFilters(params.searchFilters);
    }
  }, [route.params, setPreservedCity, setPreservedSearchFilters]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [visitedIds, setVisitedIds] = useState<Set<number>>(new Set());
  const [isMapMoving, setIsMapMoving] = useState<boolean>(false);
  const [isSatelliteMode, setIsSatelliteMode] = useState<boolean>(false);

  // Use custom hooks
  const { getCurrentLocation } = useLocation();
  
  // Get selectedDates and selectedFilter from route params if available (when navigating from list screen)
  const routeParams = route.params as { shouldZoomOut?: boolean; selectedDates?: CalendarDates; selectedFilter?: string | null; selectedCity?: string; searchFilters?: SearchFilterState | null } | undefined;
  const initialDates = routeParams?.selectedDates || getPreservedDates() || { startDate: null, endDate: null };
  
  const { selectedDates, markedDates, handleDateSelect, resetDates, setSelectedDates } =
    useCalendar(initialDates);
  const { calculatePrice: calculateDailyPrice } = useDailyPrice(selectedDates);
  const { modalVisible, openModal: openBookingDateModal, closeModal: closeBookingDateModal } = useBookingModal();
  
  // Sync selectedDates when route params change (when navigating from list screen)
  useEffect(() => {
    if (routeParams?.selectedDates) {
      setSelectedDates(routeParams.selectedDates);
    }
  }, [routeParams?.selectedDates, setSelectedDates]);

  // Filter properties by city and dates only (for SearchFilterModal - excludes searchFilters)
  const filteredPropertiesForModal = useMemo(() => {
    let properties = PROPERTY_DATA.filter(
      (p) => p.listingType === "daily" && !("isProject" in p && p.isProject)
    );

    // Filter by city if selected
    if (selectedCity && selectedCity !== "City") {
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
  }, [selectedDates, selectedCity]);

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

  // Get reservation text to display
  const reservationText = useMemo(() => {
    if (selectedDates.startDate && selectedDates.endDate) {
      return formatDateRange(selectedDates.startDate, selectedDates.endDate);
    }
    return "Choose Reservation";
  }, [selectedDates]);

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

  const handleMarkerPress = useCallback(
    (property: Property) => {
    setSelectedId(property.id);
    setVisitedIds((prev) => {
      const next = new Set(prev);
      next.add(property.id);
      return next;
    });
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

    navigation.navigate("PropertyDetails", params);
  }, [
    navigation,
    selectedProperty,
    selectedDates,
    calculateDailyPrice,
    visibleProperties,
  ]);

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
    const preservedFilter = getPreservedFilter();
    
    const params: any = {
      properties: visibleProperties,
      listingType: "daily",
      selectedDates: selectedDates, // Always pass selectedDates, even if null
      selectedFilter: preservedFilter, // Preserve filter selection
      selectedCity: selectedCity !== "City" ? selectedCity : undefined, // Preserve city selection
      searchFilters: searchFilters, // Pass search filters
    };
    navigation.navigate("PropertyList", params);
  }, [visibleProperties, selectedDates, navigation, selectedCity, searchFilters, getPreservedFilter]);

  const handleCityPress = useCallback(() => {
    setCityModalVisible(true);
  }, []);

  const handleCitySearch = useCallback((city: string) => {
    setPreservedCity(city);
    setSelectedCity(city);
    // Navigate map to selected city
    const cityRegion = CITY_REGIONS[city];
    if (cityRegion && mapRef.current) {
      mapRef.current.animateToRegion(cityRegion, 800);
      setRegion(cityRegion);
    }
  }, []);

  const handleCityLocateMe = useCallback(async () => {
    // Get user's current location and set city
    const result = await getCurrentLocation();
    if (result.isOutsideSaudi) {
      setShowLocationError(true);
      // Hide error after 5 seconds
      setTimeout(() => {
        setShowLocationError(false);
      }, 5000);
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

  const handleSearchFilters = useCallback((filters: SearchFilterState, count: number) => {
    setPreservedSearchFilters(filters);
    setSearchFilters(filters);
    setFilterModalVisible(false);
  }, [setPreservedSearchFilters]);

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
            listingType="daily"
            calculatedPrice={
              p.listingType === "daily"
                ? calculateDailyPrice(p as DailyProperty)
                : null
            }
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
        initialRegion={RIYADH_REGION}
        mapType={isSatelliteMode ? "satellite" : "standard"}
        provider={Platform.OS === "android" ? "google" : undefined}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
      >
        {filteredProperties.map(renderMarker)}
      </MapView>

      {/* Daily Listing Header - Three Fixed White Boxes (Fixed at top) */}
      <View style={styles.dailyHeaderFixedContainer}>
        <DailyHeaderBoxes
          reservationText={reservationText}
          onReservationPress={openBookingDateModal}
          onCityPress={handleCityPress}
          onFiltersPress={handleFiltersPress}
          cityText={selectedCity}
        />
      </View>

      {/* Error Message */}
      {showLocationError && (
        <View style={styles.errorMessageContainer}>
          <Ionicons name="information-circle" size={wp(5)} color={COLORS.error} />
          <Text style={styles.errorMessageText}>
            Sorry, you cannot search for properties outside the Kingdom of Saudi Arabia
          </Text>
        </View>
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
        onClose={() => setCityModalVisible(false)}
        onSearch={handleCitySearch}
        onLocateMe={handleCityLocateMe}
        selectedCity={selectedCity !== "City" ? selectedCity : undefined}
      />

      <SearchFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onSearch={handleSearchFilters}
        properties={filteredPropertiesForModal}
      />
    </View>
  );
}

// Apply search filters to properties
function applySearchFilters(
  properties: Property[],
  filters: SearchFilterState
): Property[] {
  let filtered = [...properties];

  // Filter by property type
  if (filters.selectedPropertyType) {
    filtered = filtered.filter((p) => p.type === filters.selectedPropertyType);
  }

  // Filter by price (for daily properties, use dailyPrice or monthlyPrice)
  if (filters.fromPrice || filters.toPrice) {
    filtered = filtered.filter((p) => {
      let price: number | null = null;

      if (p.listingType === "daily" && "dailyPrice" in p) {
        price = p.dailyPrice;
      } else if (p.listingType === "daily" && "monthlyPrice" in p) {
        price = p.monthlyPrice;
      }

      if (price === null) return false;

      const fromPrice = filters.fromPrice ? parseFloat(filters.fromPrice) : 0;
      const toPrice = filters.toPrice ? parseFloat(filters.toPrice) : Infinity;

      return price >= fromPrice && price <= toPrice;
    });
  }

  // Filter by usage type (Singles/Families)
  if (filters.usageType) {
    const usage = filters.usageType === "Singles" ? "single" : "family";
    filtered = filtered.filter((p) => p.usage === usage);
  }

  // Filter by bedrooms
  if (filters.bedrooms) {
    if (filters.bedrooms === "6+") {
      filtered = filtered.filter((p) => p.bedrooms >= 6);
    } else {
      const bedrooms = parseInt(filters.bedrooms);
      filtered = filtered.filter((p) => p.bedrooms === bedrooms);
    }
  }

  // Filter by living rooms
  if (filters.livingRooms) {
    const livingRooms = parseInt(filters.livingRooms.replace("+", ""));
    filtered = filtered.filter((p) => p.livingRooms >= livingRooms);
  }

  // Filter by WC
  if (filters.wc) {
    const wc = parseInt(filters.wc.replace("+", ""));
    filtered = filtered.filter((p) => p.restrooms >= wc);
  }

  // Filter by features (toggles)
  const featureFilters: { [key: string]: string } = {
    furnished: "Furnished",
    carEntrance: "Car Entrance",
    airConditioned: "Air Conditioned",
    privateRoof: "Private Roof",
    apartmentInVilla: "Apartment in Villa",
    twoEntrances: "Two Entrances",
    specialEntrances: "Special Entrances",
    nearBus: "Near Bus",
    nearMetro: "Near Metro",
    pool: "Pool",
    footballPitch: "Football Pitch",
    volleyballCourt: "Volleyball Court",
    tent: "Tent",
    kitchen: "Kitchen",
    playground: "Playground",
    familySection: "Family Section",
    stairs: "Stairs",
    driverRoom: "Driver Room",
    maidRoom: "Maid Room",
    basement: "Basement",
  };

  Object.entries(featureFilters).forEach(([key, featureName]) => {
    if (filters[key as keyof SearchFilterState] === true) {
      filtered = filtered.filter(
        (p) => p.features && p.features.includes(featureName)
      );
    }
  });

  return filtered;
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
  dailyHeaderFixedContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: hp(1),
  },
});

