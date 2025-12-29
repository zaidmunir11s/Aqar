import React, { useMemo, useCallback, useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  PROPERTY_DATA,
  RENT_FILTER_OPTIONS,
  SALE_FILTER_OPTIONS,
  DAILY_FILTER_OPTIONS,
} from "../../data/propertyData";
import { getTypeLabelFromType, formatPrice, formatDateRange, calculateDays } from "../../utils";
import { PropertyCard, DailyBookingListCard, BookingDateModal, DailyHeaderBoxes, CityModal, SearchFilterModal } from "../../components";
import type { SearchFilterState } from "../../components/map/SearchFilterModal";
import { COLORS, CITY_REGIONS } from "../../constants";
import { useCalendar, useBookingModal } from "../../hooks";
import type { Property } from "../../types/property";
import type { CalendarDates } from "../../hooks/useCalendar";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  properties: Property[];
  listingType: string;
  selectedDates?: CalendarDates;
  selectedFilter?: string | null; // Preserve filter selection
  selectedCity?: string; // Preserve city selection
  searchFilters?: SearchFilterState | null; // Preserve search filters
}

// Module-level variables to preserve filter state across navigation resets
let preservedFilter: string | null = null;
let preservedDates: CalendarDates = { startDate: null, endDate: null };
let preservedCity: string = "City";
let preservedSearchFilters: SearchFilterState | null = null;

// Export getter and setter functions to access preserved filters from other modules
export const getPreservedFilter = (): string | null => preservedFilter;
export const getPreservedDates = (): CalendarDates => preservedDates;
export const getPreservedCity = (): string => preservedCity;
export const getPreservedSearchFilters = (): SearchFilterState | null => preservedSearchFilters;

// Setter functions to update preserved values
export const setPreservedDates = (dates: CalendarDates) => {
  preservedDates = dates;
};
export const setPreservedCity = (city: string) => {
  preservedCity = city;
};
export const setPreservedSearchFilters = (filters: SearchFilterState | null) => {
  preservedSearchFilters = filters;
};

export default function PropertyListScreen(): React.JSX.Element {
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const navigation = useNavigation<NavigationProp>();
  
  // Get properties from params or load default daily properties for initial route
  const listingType = params?.listingType || "daily"; // Default to daily for initial route
  const properties = useMemo(() => {
    if (params?.properties) {
      return params.properties;
    }
    // If no params (initial route), load all daily properties
    if (listingType === "daily") {
      return PROPERTY_DATA.filter(
        (p) => p.listingType === "daily" && !("isProject" in p && p.isProject)
      );
    }
    return [];
  }, [params?.properties, listingType]);
  
  const selectedDatesFromParams = params?.selectedDates;
  // const insets = useSafeAreaInsets();
  // Initialize filter from params or preserved filter - always prioritize preservedFilter
  // This ensures filter is never lost even if params don't have it
  const [selectedFilter, setSelectedFilter] = useState<string | null>(
    params?.selectedFilter ?? preservedFilter ?? null
  );
  
  // Initialize preserved filter from params if available (when navigating back)
  // But never clear it if params don't have it - preserve existing filter
  useEffect(() => {
    if (params?.selectedFilter !== undefined && params.selectedFilter !== null) {
      preservedFilter = params.selectedFilter;
      // Also update state if it's different
      if (selectedFilter !== params.selectedFilter) {
        setSelectedFilter(params.selectedFilter);
      }
    } else if (params?.selectedFilter === undefined && preservedFilter !== null && selectedFilter === null) {
      // If params don't have filter but preservedFilter exists and state is null, restore preservedFilter
      setSelectedFilter(preservedFilter);
    }
  }, [params?.selectedFilter]);
  
  // Update preserved filter when it changes - but never clear it unless explicitly set to null by user
  useEffect(() => {
    if (selectedFilter !== null) {
      preservedFilter = selectedFilter;
    }
    // Note: We don't restore from preservedFilter here to avoid infinite loops
    // The restoration happens in the params effect above
  }, [selectedFilter]);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cityModalVisible, setCityModalVisible] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>(
    params?.selectedCity || preservedCity || "City"
  );
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilterState | null>(
    params?.searchFilters || preservedSearchFilters
  );
  
  // Sync selectedCity when params change
  useEffect(() => {
    if (params?.selectedCity) {
      preservedCity = params.selectedCity;
      setSelectedCity(params.selectedCity);
    } else if (!params?.selectedCity && preservedCity && preservedCity !== "City") {
      setSelectedCity(preservedCity);
    }
  }, [params?.selectedCity]);

  // Sync searchFilters when params change
  useEffect(() => {
    if (params?.searchFilters) {
      preservedSearchFilters = params.searchFilters;
      setSearchFilters(params.searchFilters);
    } else if (!params?.searchFilters && preservedSearchFilters) {
      setSearchFilters(preservedSearchFilters);
    }
  }, [params?.searchFilters]);

  // Update preserved city when it changes
  useEffect(() => {
    if (selectedCity && selectedCity !== "City") {
      preservedCity = selectedCity;
    }
  }, [selectedCity]);

  // Use calendar hook for date management - initialize with params or preserved dates
  const initialDates = selectedDatesFromParams || preservedDates || { startDate: null, endDate: null };
  const { selectedDates: calendarSelectedDates, handleDateSelect, setSelectedDates } = useCalendar(initialDates);
  const { modalVisible: bookingDateModalVisible, openModal: openBookingDateModal, closeModal: closeBookingDateModal } = useBookingModal();
  
  // Sync calendar dates with params when they change (from navigation)
  useEffect(() => {
    if (selectedDatesFromParams) {
      preservedDates = selectedDatesFromParams;
      setSelectedDates(selectedDatesFromParams);
    } else if (!selectedDatesFromParams && preservedDates.startDate && preservedDates.endDate) {
      setSelectedDates(preservedDates);
    }
  }, [selectedDatesFromParams, setSelectedDates]);

  // Update preserved dates when they change
  useEffect(() => {
    if (calendarSelectedDates.startDate && calendarSelectedDates.endDate) {
      preservedDates = calendarSelectedDates;
    }
  }, [calendarSelectedDates]);
  
  // Use calendar dates (they will be synced with params)
  const effectiveSelectedDates = calendarSelectedDates;

  // Get reservation text to display for daily listings
  const reservationText = useMemo(() => {
    if (listingType === "daily" && effectiveSelectedDates.startDate && effectiveSelectedDates.endDate) {
      return formatDateRange(effectiveSelectedDates.startDate, effectiveSelectedDates.endDate);
    }
    return "Choose Reservation";
  }, [listingType, effectiveSelectedDates]);

  // Calculate daily price based on selected dates
  const calculateDailyPrice = useCallback(
    (property: Property) => {
      if (!effectiveSelectedDates || !effectiveSelectedDates.startDate || !effectiveSelectedDates.endDate)
        return null;
      const start = new Date(effectiveSelectedDates.startDate);
      const end = new Date(effectiveSelectedDates.endDate);
      const days =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
      const dailyProperty = property as any;
      return (dailyProperty.dailyPrice || 0) * days;
    },
    [effectiveSelectedDates]
  );

  const getTypeLabel = useCallback(
    (type: string) => {
      let filterOptions;
      if (listingType === "rent") filterOptions = RENT_FILTER_OPTIONS;
      else if (listingType === "sale") filterOptions = SALE_FILTER_OPTIONS;
      else filterOptions = DAILY_FILTER_OPTIONS;

      return getTypeLabelFromType(type, filterOptions);
    },
    [listingType]
  );

  const handlePropertyPress = useCallback(
    (item: Property) => {
      const navParams: any = {
        propertyId: item.id,
        visiblePropertyIds: properties.map((p) => p.id),
        listingType: listingType,
      };

      if (listingType === "daily" && effectiveSelectedDates) {
        navParams.selectedDates = effectiveSelectedDates;
      }

      navigation.navigate("PropertyDetails", navParams);
    },
    [properties, listingType, effectiveSelectedDates, navigation]
  );

  const handleBackPress = useCallback(() => {
    // Navigate to the correct map screen based on listingType
    if (listingType === "daily") {
      navigation.navigate("DailyMap", { 
        shouldZoomOut: true,
        selectedDates: effectiveSelectedDates, // Pass current selected dates
        selectedFilter: selectedFilter, // Preserve filter when going to map
        selectedCity: selectedCity !== "City" ? selectedCity : undefined, // Pass selected city
        searchFilters: searchFilters, // Pass search filters
      });
    } else if (listingType === "projects" || listingType === "sale") {
      navigation.navigate("ProjectsMap");
    } else {
      // For rent or default, go to MapLanding
      navigation.navigate("MapLanding");
    }
  }, [navigation, listingType, effectiveSelectedDates, selectedFilter, selectedCity]);

  const handleFilterPress = useCallback((filterType: string) => {
    // Toggle filter: if same filter is pressed, unselect it
    const newFilter = selectedFilter === filterType ? null : filterType;
    setSelectedFilter(newFilter);
    // Update preserved filter
    preservedFilter = newFilter;
  }, [selectedFilter]);

  const handleSearchPress = useCallback(() => {
    // TODO: Implement search functionality
    console.log("Search pressed");
  }, []);

  const handleChooseReservation = useCallback(() => {
    openBookingDateModal();
  }, [openBookingDateModal]);

  const handleSearchBookingDate = useCallback(() => {
    closeBookingDateModal();
  }, [closeBookingDateModal]);

  const handleCityPress = useCallback(() => {
    setCityModalVisible(true);
  }, []);

  const handleCitySearch = useCallback((city: string) => {
    setSelectedCity(city);
  }, []);

  const handleCityLocateMe = useCallback(() => {
    // TODO: Get user's current location and set city
    console.log("Locate me pressed from city modal");
  }, []);

  const handleFiltersPress = useCallback(() => {
    setFilterModalVisible(true);
  }, []);

  const handleSearchFilters = useCallback((filters: SearchFilterState, count: number) => {
    preservedSearchFilters = filters;
    setSearchFilters(filters);
    setFilterModalVisible(false);
  }, []);

  // Update preserved search filters when they change
  useEffect(() => {
    if (searchFilters) {
      preservedSearchFilters = searchFilters;
    }
  }, [searchFilters]);

  const handleAddPress = useCallback(() => {
    navigation.navigate("AddListing");
  }, [navigation]);

  // Helper function to get numeric price value for sorting
  const getNumericPrice = useCallback(
    (property: Property) => {
      // For daily listings, use dailyPrice
      if (listingType === "daily") {
        const dailyProperty = property as any;
        if (dailyProperty.dailyPrice) {
          return dailyProperty.dailyPrice;
        }
      }

      // For rent/sale, use price field
      const rentSaleProperty = property as any;
      if (rentSaleProperty.price) {
        const priceStr = String(rentSaleProperty.price);
        const numericValue = parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
        const multiplier = priceStr.includes("M")
          ? 1000000
          : priceStr.includes("K")
            ? 1000
            : 1;
        return numericValue * multiplier;
      }

      return 0;
    },
    [listingType]
  );

  // Filter properties by city and dates only (for SearchFilterModal - excludes searchFilters)
  const filteredPropertiesForModal = useMemo(() => {
    if (listingType !== "daily") return properties;
    
    let filtered = [...properties];
    
    // Filter by city if selected
    if (selectedCity && selectedCity !== "City") {
      filtered = filtered.filter((p) => {
        const city = (p as any).city;
        return city && city.toLowerCase() === selectedCity.toLowerCase();
      });
    }
    
    // Filter based on selected dates
    if (
      effectiveSelectedDates.startDate &&
      effectiveSelectedDates.endDate
    ) {
      const days = calculateDays(
        effectiveSelectedDates.startDate,
        effectiveSelectedDates.endDate
      );
      
      // Hide monthly properties if dates are less than 30 days
      if (days < 30) {
        filtered = filtered.filter(
          (p) => !("bookingType" in p && p.bookingType === "monthly")
        );
      }
      
      // Hide weekly properties if dates are less than 7 days
      if (days < 7) {
        filtered = filtered.filter(
          (p) => {
            const dailyProp = p as any;
            return !("bookingType" in p && dailyProp.bookingType === "weekly");
          }
        );
      }
    }

    return filtered;
  }, [properties, listingType, effectiveSelectedDates, selectedCity]);

  // Filter properties based on selected dates (for daily listings), city, and searchFilters
  const filteredProperties = useMemo(() => {
    if (listingType !== "daily") return properties;
    
    let filtered = [...filteredPropertiesForModal];

    // Apply search filters if any
    if (searchFilters) {
      filtered = applySearchFilters(filtered, searchFilters);
    }
    
    return filtered;
  }, [filteredPropertiesForModal, searchFilters, listingType, properties]);

  // Sort properties based on selected filter
  const sortedProperties = useMemo(() => {
    if (!selectedFilter) return filteredProperties;

    const sorted = [...properties];

    switch (selectedFilter) {
      case "latest":
        // Sort by ID descending (assuming higher ID = newer)
        return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));

      case "price":
        // Sort by price ascending
        return sorted.sort((a, b) => {
          const priceA = getNumericPrice(a);
          const priceB = getNumericPrice(b);
          return priceA - priceB;
        });

      case "nearest":
        // For nearest, we'd need user location - for now, keep original order
        // TODO: Implement location-based sorting when user location is available
        return sorted;

      default:
        return sorted;
    }
  }, [filteredProperties, selectedFilter, getNumericPrice]);

  // Memoized property list item component for better performance
  const PropertyListItem = React.memo<{
    item: Property;
    listingType: string;
    selectedDates?: CalendarDates;
    onPress: (item: Property) => void;
    getTypeLabel: (type: string) => string;
    calculateDailyPrice: (property: Property) => number | null;
  }>(
    ({ item, listingType, selectedDates, onPress, getTypeLabel, calculateDailyPrice }) => {
      const typeLabel = getTypeLabel(item.type) || "Property";

      const { title, priceLine } = useMemo(() => {
      let priceLine = "";
      let title = "";

      if (listingType === "daily") {
        title = typeLabel || "Property";
        const calculatedPrice = calculateDailyPrice(item);
        if (calculatedPrice) {
          priceLine = `${calculatedPrice} SAR`;
        } else {
          const dailyProperty = item as any;
          priceLine =
            dailyProperty.bookingType === "daily" ? "Daily" : "Monthly";
        }
      } else if (listingType === "rent") {
        title = `${typeLabel} for rent`;
        const rentProperty = item as any;
        const formattedPrice = rentProperty.price
          ? formatPrice(rentProperty.price)
          : "0";
        priceLine = `${formattedPrice} SAR / Yearly`;
      } else {
        title = `${typeLabel} for sale`;
        const saleProperty = item as any;
        const formattedPrice = saleProperty.price
          ? formatPrice(saleProperty.price)
          : "0";
        priceLine = `${formattedPrice} SAR`;
        }

        return { title, priceLine };
      }, [item, listingType, typeLabel, calculateDailyPrice]);

      const handlePress = useCallback(() => {
        onPress(item);
      }, [item, onPress]);

      // Use DailyBookingListCard for daily listings, PropertyCard for others
      if (listingType === "daily") {
        const calculatedPrice = calculateDailyPrice(item);
        return (
          <DailyBookingListCard
            property={item}
            onPress={handlePress}
            priceLine={priceLine || "Price not available"}
            calculatedPrice={calculatedPrice}
          />
        );
      }

      return (
        <PropertyCard
          property={item}
          onPress={handlePress}
          title={title || "Property"}
          priceLine={priceLine || "Price not available"}
          listingType={listingType}
        />
      );
    },
    (prevProps, nextProps) => {
      // Custom comparison for better performance
      // Return true if props are equal (skip re-render), false if different (re-render)
      if (prevProps.item.id !== nextProps.item.id) return false;
      if (prevProps.listingType !== nextProps.listingType) return false;
      if (prevProps.item !== nextProps.item) return false; // Check object reference
      
      // Compare selectedDates
      const prevStart = prevProps.selectedDates?.startDate;
      const nextStart = nextProps.selectedDates?.startDate;
      const prevEnd = prevProps.selectedDates?.endDate;
      const nextEnd = nextProps.selectedDates?.endDate;
      
      if (prevStart !== nextStart || prevEnd !== nextEnd) return false;
      
      // Compare function references (they should be stable due to useCallback)
      if (prevProps.onPress !== nextProps.onPress) return false;
      if (prevProps.getTypeLabel !== nextProps.getTypeLabel) return false;
      if (prevProps.calculateDailyPrice !== nextProps.calculateDailyPrice) return false;
      
      return true; // All props are equal, skip re-render
    }
  );

  PropertyListItem.displayName = "PropertyListItem";

  const renderProperty = useCallback(
    ({ item }: { item: Property }) => (
      <PropertyListItem
        item={item}
        listingType={listingType}
        selectedDates={effectiveSelectedDates}
        onPress={handlePropertyPress}
        getTypeLabel={getTypeLabel}
        calculateDailyPrice={calculateDailyPrice}
      />
    ),
    [listingType, effectiveSelectedDates, handlePropertyPress, getTypeLabel, calculateDailyPrice]
  );

  const keyExtractor = useCallback((item: Property) => item.id.toString(), []);

  // Handle scroll events - collapse when scrolling, expand when stopped
  const handleScrollBegin = useCallback(() => {
    setIsScrolling(true);
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  }, []);

  const handleScrollEnd = useCallback(() => {
    // Set timeout to expand after scrolling stops
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      scrollTimeoutRef.current = null;
    }, 150);
  }, []);

  const handleScroll = useCallback(() => {
    // Keep scrolling state active while scrolling
    setIsScrolling(true);
    
    // Reset timeout on each scroll event
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      scrollTimeoutRef.current = null;
    }, 150);
  }, []);

  const searchIcon = (
    <TouchableOpacity
      onPress={handleSearchPress}
      style={styles.searchButtonContainer}
      activeOpacity={0.7}
    >
      <View style={styles.searchButton}>
        <Ionicons name="search-outline" size={wp(5)} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  // Custom header with green back button
  const customHeader = (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={handleBackPress}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={wp(6.5)} color={COLORS.backButton} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Listings</Text>
      {searchIcon}
    </View>
  );

  const isDailyListing = listingType === "daily";

  // Memoize ListHeaderComponent to prevent unnecessary re-renders
  const listHeaderComponent = useMemo(() => {
    if (!isDailyListing) return null;
    return (
      <View style={styles.unitsCountContainer}>
        <Text style={styles.unitsCountText}>
          {sortedProperties.length} Units match your search
        </Text>
      </View>
    );
  }, [isDailyListing, sortedProperties.length]);

  return (
    <View style={[styles.container]}>
      {/* Header - Only show for non-daily listings */}
      {!isDailyListing && customHeader}

      {/* Daily Listing Header - Three Fixed White Boxes (Fixed at top) */}
      {isDailyListing && (
        <View style={styles.dailyHeaderFixedContainer}>
          <DailyHeaderBoxes
            reservationText={reservationText}
            onReservationPress={handleChooseReservation}
            onCityPress={handleCityPress}
            onFiltersPress={handleFiltersPress}
            cityText={selectedCity}
          />
        </View>
      )}

      {/* Filter Tabs - Only show for non-daily listings */}
      {!isDailyListing && (
      <View style={styles.filterContainer}>
        <View style={styles.filterTabsWrapper}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === "latest" && styles.filterTabActive,
            ]}
            onPress={() => handleFilterPress("latest")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "latest" && styles.filterTextActive,
              ]}
            >
              Latest
            </Text>
          </TouchableOpacity>

          <View style={styles.filterSeparator} />

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === "price" && styles.filterTabActive,
            ]}
            onPress={() => handleFilterPress("price")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "price" && styles.filterTextActive,
              ]}
            >
              Price
            </Text>
          </TouchableOpacity>

          <View style={styles.filterSeparator} />

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === "nearest" && styles.filterTabActive,
            ]}
            onPress={() => handleFilterPress("nearest")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "nearest" && styles.filterTextActive,
              ]}
            >
              Nearest
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      )}

      <FlatList
        data={sortedProperties}
        renderItem={renderProperty}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          isDailyListing && styles.dailyListContent,
        ]}
        ListHeaderComponent={listHeaderComponent}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollBegin={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}
        updateCellsBatchingPeriod={100}
        getItemLayout={undefined} // Cannot use with variable heights
      />

      {/* Bottom Actions - Show Map and Add buttons */}
      <View style={[
        styles.bottomActions,
        isDailyListing && styles.dailyBottomActions,
      ]}>
        <TouchableOpacity
          style={[
            styles.showMapBtn,
            isScrolling && styles.showMapBtnCompact,
          ]}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="map-sharp" size={wp(6)} color="#617381" />
          {!isScrolling && (
            <Text style={styles.showMapText}>Show map</Text>
          )}
        </TouchableOpacity>

        {/* Add button - Only show for daily listings */}
        {isDailyListing && (
          <TouchableOpacity style={styles.dailyAddBtn} onPress={handleAddPress}>
            <Text style={styles.dailyPlusIcon}>+</Text>
            <Text style={styles.dailyAddText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Booking Date Modal - Only for daily listings */}
      {isDailyListing && (
        <BookingDateModal
          visible={bookingDateModalVisible}
          onClose={closeBookingDateModal}
          onSearch={handleSearchBookingDate}
          selectedDates={effectiveSelectedDates}
          onDayPress={handleDateSelect}
        />
      )}

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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    width: wp(10),
    height: wp(10),
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    flex: 1,
    // textAlign: "center",
    color: "#111827",
  },
  searchButtonContainer: {
    width: wp(10),
    height: wp(10),
    justifyContent: "center",
    alignItems: "center",
  },
  searchButton: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#358dcd",
    backgroundColor: "#0091ea",
  },
  dailyHeaderFixedContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: COLORS.background,
    paddingTop: hp(1),
    // paddingBottom: hp(0.3),
  },
  unitsCountContainer: {
    // paddingHorizontal: wp(4),
    // paddingTop: hp(0.3),
    paddingBottom: hp(1),
    backgroundColor: COLORS.background,
  },
  unitsCountText: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  addBtn: {
    backgroundColor: "#fffefd",
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    borderWidth: 2,
    borderColor: COLORS.addBtnBorder,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  plusIcon: {
    color: COLORS.addBtnText,
    fontSize: wp(8),
    fontWeight: "400",
    marginBottom: hp(-1),
    marginTop: hp(-0.5),
  },
  addText: {
    color: COLORS.addBtnText,
    fontWeight: "400",
    fontSize: wp(4),
    marginTop: hp(0.3),
  },
  filterContainer: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
  },
  filterTabsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: wp(2.5),
    paddingHorizontal: wp(1),
    paddingVertical: hp(0.5),
    borderWidth: 1,
    borderColor: "#dedfe3",
  },
  filterTab: {
    flex: 1,
    paddingVertical: hp(1),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
  },
  filterTabActive: {
    backgroundColor: COLORS.showListFilterTabActive,
  },
  filterSeparator: {
    width: 1,
    height: "60%",
    backgroundColor: "#d1d5db",
    marginHorizontal: wp(1),
  },
  filterText: {
    fontSize: wp(4),
    color: "#6b7280",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(14), // extra space for bottom button
  },
  dailyListContent: {
    paddingTop: hp(12), // Space for fixed header boxes
  },
  bottomActions: {
    position: "absolute",
    bottom: hp(7),
    left: wp(3),
    right: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
  },
  dailyBottomActions: {
    bottom: hp(3), // Lower position for daily listings
  },
  dailyAddBtn: {
    backgroundColor: "#fffefd",
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    borderWidth: 2,
    borderColor: "#0091ea", // Blue border
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dailyPlusIcon: {
    color: "#0091ea", // Blue plus icon
    fontSize: wp(8),
    fontWeight: "400",
    marginBottom: hp(-1),
    marginTop: hp(-0.5),
  },
  dailyAddText: {
    color: "#0091ea", // Blue text
    fontWeight: "400",
    fontSize: wp(4),
    marginTop: hp(0.3),
  },
  showMapBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
  },
  showMapBtnCompact: {
    paddingHorizontal: wp(3.5),
  },
  showMapText: {
    fontSize: wp(3.2),
    color: "#333",
    marginLeft: wp(2),
  },
});
