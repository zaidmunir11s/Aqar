import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
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
import {
  getTypeLabelFromType,
  formatPrice,
  formatDateRange,
  calculateDays,
} from "../../utils";
import {
  PropertyCard,
  DailyBookingListCard,
  BookingDateModal,
  DailyHeaderBoxes,
  CityModal,
  SearchFilterModal,
  ScreenHeader,
  FilterChips,
  ProjectListCard,
  ProjectSearchModal,
} from "../../components";
import type { SearchFilterState } from "../../components/map/SearchFilterModal";
import { COLORS, CITY_REGIONS } from "../../constants";
import { useCalendar, useBookingModal } from "../../hooks";
import type { Property, ProjectProperty } from "../../types/property";
import type { CalendarDates } from "../../hooks/useCalendar";
import { useLocalization } from "../../hooks/useLocalization";

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
let preservedCity: string = "";
let preservedSearchFilters: SearchFilterState | null = null;

// Export getter and setter functions to access preserved filters from other modules
export const getPreservedFilter = (): string | null => preservedFilter;
export const getPreservedDates = (): CalendarDates => preservedDates;
export const getPreservedCity = (): string => preservedCity;
export const getPreservedSearchFilters = (): SearchFilterState | null =>
  preservedSearchFilters;

// Setter functions to update preserved values
export const setPreservedDates = (dates: CalendarDates) => {
  preservedDates = dates;
};
export const setPreservedCity = (city: string) => {
  preservedCity = city;
};
export const setPreservedSearchFilters = (
  filters: SearchFilterState | null
) => {
  preservedSearchFilters = filters;
};

export default function PropertyListScreen(): React.JSX.Element {
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();

  const listingType = params?.listingType || "daily";
  const properties = useMemo(() => {
    if (params?.properties) {
      return params.properties;
    }
    if (listingType === "daily") {
      return PROPERTY_DATA.filter(
        (p) => p.listingType === "daily" && !("isProject" in p && p.isProject)
      );
    }
    if (listingType === "sale") {
      // Include both regular sale properties and projects for sale
      return PROPERTY_DATA.filter(
        (p) => p.listingType === "sale"
      );
    }
    if (listingType === "rent") {
      return PROPERTY_DATA.filter(
        (p) => p.listingType === "rent" && !("isProject" in p && p.isProject)
      );
    }
    return [];
  }, [params?.properties, listingType]);

  const selectedDatesFromParams = params?.selectedDates;
  const [selectedFilter, setSelectedFilter] = useState<string | null>(
    params?.selectedFilter ?? preservedFilter ?? null
  );

  useEffect(() => {
    if (
      params?.selectedFilter !== undefined &&
      params.selectedFilter !== null
    ) {
      preservedFilter = params.selectedFilter;
      if (selectedFilter !== params.selectedFilter) {
        setSelectedFilter(params.selectedFilter);
      }
    } else if (
      params?.selectedFilter === undefined &&
      preservedFilter !== null &&
      selectedFilter === null
    ) {
      setSelectedFilter(preservedFilter);
    }
  }, [params?.selectedFilter]);
  useEffect(() => {
    if (selectedFilter !== null) {
      preservedFilter = selectedFilter;
    }
  }, [selectedFilter]);

  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cityModalVisible, setCityModalVisible] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>(
    params?.selectedCity || preservedCity || t("listings.city")
  );
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilterState | null>(
    params?.searchFilters || preservedSearchFilters
  );
  
  // For projects: activeFilter for FilterChips (All For Sale, Villa, Land, Apartment)
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>("all");
  
  // For projects: search modal and filters
  const [projectSearchModalVisible, setProjectSearchModalVisible] = useState<boolean>(false);
  const [projectSelectedCity, setProjectSelectedCity] = useState<string | null>(null);
  const [projectSelectedPropertyType, setProjectSelectedPropertyType] = useState<string | null>(null);

  useEffect(() => {
    if (params?.selectedCity) {
      preservedCity = params.selectedCity;
      setSelectedCity(params.selectedCity);
    } else if (
      !params?.selectedCity &&
      preservedCity &&
      preservedCity !== t("listings.city")
    ) {
      setSelectedCity(preservedCity);
    }
  }, [params?.selectedCity, t]);

  useEffect(() => {
    if (params?.searchFilters) {
      preservedSearchFilters = params.searchFilters;
      setSearchFilters(params.searchFilters);
    } else if (!params?.searchFilters && preservedSearchFilters) {
      setSearchFilters(preservedSearchFilters);
    }
  }, [params?.searchFilters]);

  useEffect(() => {
    if (selectedCity && selectedCity !== t("listings.city")) {
      preservedCity = selectedCity;
    }
  }, [selectedCity, t]);

  const initialDates = selectedDatesFromParams ||
    preservedDates || { startDate: null, endDate: null };
  const {
    selectedDates: calendarSelectedDates,
    handleDateSelect,
    setSelectedDates,
  } = useCalendar(initialDates);
  const {
    modalVisible: bookingDateModalVisible,
    openModal: openBookingDateModal,
    closeModal: closeBookingDateModal,
  } = useBookingModal();

  // Track if we've shown the calendar modal on first visit
  const hasShownCalendarOnMount = useRef<boolean>(false);

  useEffect(() => {
    if (selectedDatesFromParams) {
      preservedDates = selectedDatesFromParams;
      setSelectedDates(selectedDatesFromParams);
    } else if (
      !selectedDatesFromParams &&
      preservedDates.startDate &&
      preservedDates.endDate
    ) {
      setSelectedDates(preservedDates);
    }
  }, [selectedDatesFromParams, setSelectedDates]);

  useEffect(() => {
    if (calendarSelectedDates.startDate && calendarSelectedDates.endDate) {
      preservedDates = calendarSelectedDates;
    }
  }, [calendarSelectedDates]);

  const effectiveSelectedDates = calendarSelectedDates;
  
  // Show calendar modal automatically on first visit if no dates are selected
  useEffect(() => {
    if (
      listingType === "daily" &&
      !hasShownCalendarOnMount.current &&
      !effectiveSelectedDates.startDate &&
      !effectiveSelectedDates.endDate
    ) {
      hasShownCalendarOnMount.current = true;
      // Small delay to ensure the screen is fully mounted
      setTimeout(() => {
        openBookingDateModal();
      }, 300);
    }
  }, [listingType, effectiveSelectedDates.startDate, effectiveSelectedDates.endDate, openBookingDateModal]);

  const reservationText = useMemo(() => {
    if (
      listingType === "daily" &&
      effectiveSelectedDates.startDate &&
      effectiveSelectedDates.endDate
    ) {
      return formatDateRange(
        effectiveSelectedDates.startDate,
        effectiveSelectedDates.endDate,
        t,
        isRTL
      );
    }
    return t("listings.chooseReservation");
  }, [listingType, effectiveSelectedDates, t]);

  const calculateDailyPrice = useCallback(
    (property: Property) => {
      if (
        !effectiveSelectedDates ||
        !effectiveSelectedDates.startDate ||
        !effectiveSelectedDates.endDate
      )
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

  // Helper function to translate property type
  const getTranslatedTypeLabel = useCallback(
    (type: string, filterOptions: any[]) => {
      const opt = filterOptions.find((o) => o.type === type);
      if (!opt) return type;
      
      // Try to find translation in propertyTypes
      const translationKey = `listings.propertyTypes.${type}`;
      const translated = t(translationKey);
      
      // If translation exists and is different from the key, use it
      if (translated && translated !== translationKey) {
        return translated;
      }
      
      // Fallback to filter option label
      return opt.label;
    },
    [t]
  );

  const getTypeLabel = useCallback(
    (type: string) => {
      let filterOptions;
      if (listingType === "rent") filterOptions = RENT_FILTER_OPTIONS;
      else if (listingType === "sale") filterOptions = SALE_FILTER_OPTIONS;
      else filterOptions = DAILY_FILTER_OPTIONS;

      return getTranslatedTypeLabel(type, filterOptions);
    },
    [listingType, getTranslatedTypeLabel]
  );

  const handlePropertyPress = useCallback(
    (item: Property) => {
      // Check if it's a project and navigate to ProjectDetails instead
      if (listingType === "projects" && "isProject" in item && item.isProject) {
        navigation.navigate("ProjectDetails", {
          propertyId: item.id,
        });
        return;
      }

      const navParams: any = {
        propertyId: item.id,
        visiblePropertyIds: properties.map((p) => p.id),
        listingType: listingType,
      };

      if (listingType === "daily" && effectiveSelectedDates) {
        navParams.selectedDates = effectiveSelectedDates;
      }

      // Navigate to DailyDetails for daily listings, PropertyDetails for rent/sale
      if (listingType === "daily") {
        navigation.navigate("DailyDetails", navParams);
      } else {
      navigation.navigate("PropertyDetails", navParams);
      }
    },
    [properties, listingType, effectiveSelectedDates, navigation]
  );

  const handleBackPress = useCallback(() => {
    if (listingType === "daily") {
      navigation.navigate("DailyMap", {
        shouldZoomOut: true,
        selectedDates: effectiveSelectedDates,
        selectedFilter: selectedFilter,
        selectedCity: selectedCity !== t("listings.city") ? selectedCity : undefined,
        searchFilters: searchFilters,
      });
    } else if (listingType === "projects") {
      navigation.navigate("ProjectsMap");
    } else {
      // Pass listingType to MapLanding to preserve the active tab (rent/sale)
      navigation.navigate("MapLanding", {
        listingType: listingType === "sale" ? "sale" : "rent",
      });
    }
  }, [
    navigation,
    listingType,
    effectiveSelectedDates,
    selectedFilter,
    selectedCity,
    searchFilters,
    t,
  ]);

  const handleFilterPress = useCallback(
    (filterType: string) => {
      const newFilter = selectedFilter === filterType ? null : filterType;
      setSelectedFilter(newFilter);
      preservedFilter = newFilter;
    },
    [selectedFilter]
  );

  const handleSearchPress = useCallback(() => {
    console.log("Search pressed");
  }, []);

  const handleProjectFilterChange = useCallback((filterId: string) => {
    setActiveProjectFilter(filterId);
  }, []);

  const handleProjectSearchPress = useCallback(() => {
    setProjectSearchModalVisible(true);
  }, []);

  const handleProjectSearch = useCallback((city: string | null, propertyType: string | null) => {
    setProjectSelectedCity(city);
    setProjectSelectedPropertyType(propertyType);
    setProjectSearchModalVisible(false);
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
    console.log("Locate me pressed from city modal");
  }, []);

  const handleFiltersPress = useCallback(() => {
    setFilterModalVisible(true);
  }, []);

  const handleSearchFilters = useCallback(
    (filters: SearchFilterState | null, count: number, shouldClose?: boolean) => {
      preservedSearchFilters = filters;
      setSearchFilters(filters);
      // Only close modal if explicitly requested (when user presses search button)
      if (shouldClose) {
        setFilterModalVisible(false);
      }
    },
    []
  );

  // Count active filters - price range counts as 1, property type counts as 1, all sub-options count separately
  const activeFilterCount = useMemo(() => {
    if (!searchFilters || listingType !== "daily") return 0;
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
      
      // Bedrooms
      if (searchFilters.bedrooms !== "" && searchFilters.bedrooms !== "All") count++;
      
      // Living rooms
      if (searchFilters.livingRooms !== "" && searchFilters.livingRooms !== "All") count++;
      
      // WC
      if (searchFilters.wc !== "" && searchFilters.wc !== "All") count++;
      
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
  }, [searchFilters, listingType]);

  useEffect(() => {
    if (searchFilters) {
      preservedSearchFilters = searchFilters;
    }
  }, [searchFilters]);

  const handleAddPress = useCallback(() => {
    navigation.navigate("AddListing");
  }, [navigation]);

  const getNumericPrice = useCallback(
    (property: Property) => {
      if (listingType === "daily") {
        const dailyProperty = property as any;
        if (dailyProperty.dailyPrice) {
          return dailyProperty.dailyPrice;
        }
      }

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

  const filteredPropertiesForModal = useMemo(() => {
    if (listingType !== "daily") return properties;

    let filtered = [...properties];

    if (selectedCity && selectedCity !== t("listings.city")) {
      filtered = filtered.filter((p) => {
        const city = (p as any).city;
        return city && city.toLowerCase() === selectedCity.toLowerCase();
      });
    }

    if (effectiveSelectedDates.startDate && effectiveSelectedDates.endDate) {
      const days = calculateDays(
        effectiveSelectedDates.startDate,
        effectiveSelectedDates.endDate
      );

      if (days < 30) {
        filtered = filtered.filter(
          (p) => !("bookingType" in p && p.bookingType === "monthly")
        );
      }

      if (days < 7) {
        filtered = filtered.filter((p) => {
          const dailyProp = p as any;
          return !("bookingType" in p && dailyProp.bookingType === "weekly");
        });
      }
    }

    return filtered;
  }, [properties, listingType, effectiveSelectedDates, selectedCity]);

  // Filter properties based on selected dates (for daily listings), city, and searchFilters
  const filteredProperties = useMemo(() => {
    if (listingType === "projects") {
      // Filter projects based on activeProjectFilter, city, and property type
      let filtered = [...properties] as ProjectProperty[];
      
      // Filter by city if selected
      if (projectSelectedCity) {
        filtered = filtered.filter((p) => {
          const city = (p as any).city;
          return city && city.toLowerCase() === projectSelectedCity.toLowerCase();
        });
      }
      
      // Filter by property type if selected
      if (projectSelectedPropertyType) {
        filtered = filtered.filter((p) => p.type === projectSelectedPropertyType);
      }
      
      // Filter by activeProjectFilter (All For Sale, Villa, Land, Apartment)
      if (activeProjectFilter !== "all") {
        const filterOptions = SALE_FILTER_OPTIONS; // Projects are typically for sale
        const f = filterOptions.find((x) => x.id === activeProjectFilter);
        if (f?.type) {
          filtered = filtered.filter((p) => p.type === f.type);
        }
      }
      
      return filtered;
    }
    
    if (listingType !== "daily") return properties;

    let filtered = [...filteredPropertiesForModal];

    // Apply search filters if any
    if (searchFilters) {
      filtered = applySearchFilters(filtered, searchFilters);
    }

    return filtered;
  }, [filteredPropertiesForModal, searchFilters, listingType, properties, activeProjectFilter, projectSelectedCity, projectSelectedPropertyType]);

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
    ({
      item,
      listingType,
      selectedDates,
      onPress,
      getTypeLabel,
      calculateDailyPrice,
    }) => {
      const { t } = useLocalization();
      const typeLabel = getTypeLabel(item.type) || t("listings.property");

      const { title, priceLine } = useMemo(() => {
        let priceLine = "";
        let title = "";

        if (listingType === "daily") {
          title = typeLabel || t("listings.property");
          const calculatedPrice = calculateDailyPrice(item);
          if (calculatedPrice) {
            priceLine = `${calculatedPrice} ${t("listings.sar")}`;
          } else {
            const dailyProperty = item as any;
            priceLine =
              dailyProperty.bookingType === "daily" 
                ? t("listings.daily") 
                : t("listings.monthly");
          }
        } else if (listingType === "rent") {
          title = `${typeLabel} ${t("listings.forRent")}`;
          const rentProperty = item as any;
          const formattedPrice = rentProperty.price
            ? formatPrice(rentProperty.price)
            : "0";
          priceLine = `${formattedPrice} ${t("listings.sar")} / ${t("listings.yearly")}`;
        } else {
          title = `${typeLabel} ${t("listings.forSale")}`;
          const saleProperty = item as any;
          const formattedPrice = saleProperty.price
            ? formatPrice(saleProperty.price)
            : "0";
          priceLine = `${formattedPrice} ${t("listings.sar")}`;
        }

        return { title, priceLine };
      }, [item, listingType, typeLabel, calculateDailyPrice, t]);

      const handlePress = useCallback(() => {
        onPress(item);
      }, [item, onPress]);

      if (listingType === "daily") {
        const calculatedPrice = calculateDailyPrice(item);
        return (
          <DailyBookingListCard
            property={item}
            onPress={handlePress}
            priceLine={priceLine || t("listings.priceNotAvailable")}
            calculatedPrice={calculatedPrice}
          />
        );
      }

      // Use ProjectListCard for projects (both in projects listing and sale listing)
      if (("isProject" in item && item.isProject) && (listingType === "projects" || listingType === "sale")) {
        const filterOptions = 
          (item as ProjectProperty).listingType === "sale" 
            ? SALE_FILTER_OPTIONS 
            : RENT_FILTER_OPTIONS;
        return (
          <ProjectListCard
            project={item as ProjectProperty}
            onPress={handlePress}
            filterOptions={filterOptions}
          />
        );
      }

      return (
        <PropertyCard
          property={item}
          onPress={handlePress}
          title={title || t("listings.property")}
          priceLine={priceLine || t("listings.priceNotAvailable")}
          listingType={listingType}
        />
      );
    },
    (prevProps, nextProps) => {
      if (prevProps.item.id !== nextProps.item.id) return false;
      if (prevProps.listingType !== nextProps.listingType) return false;
      if (prevProps.item !== nextProps.item) return false;

      const prevStart = prevProps.selectedDates?.startDate;
      const nextStart = nextProps.selectedDates?.startDate;
      const prevEnd = prevProps.selectedDates?.endDate;
      const nextEnd = nextProps.selectedDates?.endDate;

      if (prevStart !== nextStart || prevEnd !== nextEnd) return false;

      if (prevProps.onPress !== nextProps.onPress) return false;
      if (prevProps.getTypeLabel !== nextProps.getTypeLabel) return false;
      if (prevProps.calculateDailyPrice !== nextProps.calculateDailyPrice)
        return false;

      return true;
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
    [
      listingType,
      effectiveSelectedDates,
      handlePropertyPress,
      getTypeLabel,
      calculateDailyPrice,
    ]
  );

  const keyExtractor = useCallback((item: Property) => item.id.toString(), []);

  const handleScrollBegin = useCallback(() => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  }, []);

  const handleScrollEnd = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      scrollTimeoutRef.current = null;
    }, 150);
  }, []);

  const handleScroll = useCallback(() => {
    setIsScrolling(true);

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

  const isDailyListing = listingType === "daily";
  const isProjectsListing = listingType === "projects";
  
  // Get filter options for projects (based on first project's listingType, or default to sale)
  const projectFilterOptions = useMemo(() => {
    if (!isProjectsListing || properties.length === 0) return SALE_FILTER_OPTIONS;
    const firstProject = properties[0] as ProjectProperty;
    return firstProject.listingType === "sale" ? SALE_FILTER_OPTIONS : RENT_FILTER_OPTIONS;
  }, [isProjectsListing, properties]);

  const listHeaderComponent = useMemo(() => {
    if (!isDailyListing) return null;
    return (
      <View style={styles.unitsCountContainer}>
        <Text style={[styles.unitsCountText, isRTL && styles.unitsCountTextRTL]}>
          {sortedProperties.length} {t("listings.unitsMatchSearch")}
        </Text>
      </View>
    );
  }, [isDailyListing, sortedProperties.length, t, isRTL]);

  const listEmptyComponent = useMemo(() => {
    if (!isProjectsListing) return null;
    if (sortedProperties.length > 0) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, isRTL && styles.emptyTextRTL]}>
          {t("listings.projectNotFound")}
        </Text>
      </View>
    );
  }, [isProjectsListing, sortedProperties.length, t, isRTL]);

  return (
    <View style={[styles.container]}>
      {!isDailyListing && !isProjectsListing && (
        <ScreenHeader
          title={t("navigation.listings")}
          onBackPress={handleBackPress}
          showRightSide={true}
          rightComponent={searchIcon}
          fontWeightBold={true}
        />
      )}

      {isDailyListing && (
        <View style={styles.dailyHeaderFixedContainer}>
          <DailyHeaderBoxes
            reservationText={reservationText}
            onReservationPress={handleChooseReservation}
            onCityPress={handleCityPress}
            onFiltersPress={handleFiltersPress}
            cityText={selectedCity}
            filterCount={activeFilterCount}
          />
        </View>
      )}

      {/* FilterChips for Projects */}
      {isProjectsListing && (
        <View style={styles.projectsFilterContainer}>
          <FilterChips
            filterOptions={projectFilterOptions}
            activeFilter={activeProjectFilter}
            onFilterChange={handleProjectFilterChange}
            onSearchPress={handleProjectSearchPress}
            variant="list"
          />
        </View>
      )}

      {!isDailyListing && !isProjectsListing && (
        <View style={styles.filterContainer}>
          <View style={[styles.filterTabsWrapper, isRTL && styles.filterTabsWrapperRTL]}>
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
                {t("listings.latest")}
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
                {t("listings.price")}
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
                {t("listings.nearest")}
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
        ListEmptyComponent={listEmptyComponent}
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
      <View
        style={[
          styles.bottomActions,
          isDailyListing && styles.dailyBottomActions,
          isRTL && styles.bottomActionsRTL,
        ]}
      >
        <TouchableOpacity
          style={[styles.showMapBtn, isScrolling && styles.showMapBtnCompact, isRTL && styles.showMapBtnRTL]}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="map-sharp" size={wp(6)} color="#617381" />
          {!isScrolling && (
            <Text style={[styles.showMapText, isRTL && styles.showMapTextRTL]}>
              {t("listings.showMap")}
            </Text>
          )}
        </TouchableOpacity>

        {/* Add button - Only show for daily listings */}
        {isDailyListing && (
          <TouchableOpacity 
            style={[styles.dailyAddBtn, isRTL && styles.dailyAddBtnRTL]} 
            onPress={handleAddPress}
          >
            <Text style={styles.dailyPlusIcon}>+</Text>
            <Text style={[styles.dailyAddText, isRTL && styles.dailyAddTextRTL]}>
              {t("listings.add")}
            </Text>
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
        selectedCity={selectedCity !== t("listings.city") ? selectedCity : undefined}
      />

      <SearchFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onSearch={handleSearchFilters}
        properties={filteredPropertiesForModal}
        initialFilters={searchFilters}
      />

      {/* Project Search Modal - Only for projects listings */}
      {isProjectsListing && (
        <ProjectSearchModal
          visible={projectSearchModalVisible}
          onClose={() => setProjectSearchModalVisible(false)}
          onSearch={handleProjectSearch}
          selectedCity={projectSelectedCity || undefined}
          selectedPropertyType={projectSelectedPropertyType}
        />
      )}
    </View>
  );
}

function applySearchFilters(
  properties: Property[],
  filters: SearchFilterState
): Property[] {
  let filtered = [...properties];

  if (filters.selectedPropertyType) {
    filtered = filtered.filter((p) => p.type === filters.selectedPropertyType);
  }

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

  if (filters.livingRooms) {
    const livingRooms = parseInt(filters.livingRooms.replace("+", ""));
    filtered = filtered.filter((p) => p.livingRooms >= livingRooms);
  }

  if (filters.wc) {
    const wc = parseInt(filters.wc.replace("+", ""));
    filtered = filtered.filter((p) => p.restrooms >= wc);
  }

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
    backgroundColor: "#1a253d",
  },
  dailyHeaderFixedContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: COLORS.background,
    paddingTop: hp(1),
  },
  unitsCountContainer: {
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
    // marginTop: hp(-0.5),
  },
  addText: {
    color: COLORS.addBtnText,
    fontWeight: "400",
    fontSize: wp(4),
    marginTop: hp(0.3),
  },
  projectsFilterContainer: {
    paddingTop: hp(1),
    paddingBottom: hp(1.5),
    paddingHorizontal: wp(4),
    backgroundColor: COLORS.background,
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
  filterTabsWrapperRTL: {
    flexDirection: "row-reverse",
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
    paddingTop: hp(9), // Space for fixed header boxes
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
  bottomActionsRTL: {
    flexDirection: "row-reverse",
  },
  dailyBottomActions: {
    bottom: hp(3), // Lower position for daily listings
  },
  dailyAddBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: wp(3),
    // paddingVertical: hp(1),
    borderRadius: wp(2),
    borderWidth: 2,
    borderColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dailyPlusIcon: {
    color: "#3b82f6",
    fontSize: wp(8),
    fontWeight: "400",
    marginBottom: hp(-1),
    marginTop: hp(-0.5),
  },
  dailyAddText: {
    color: "#3b82f6",
    fontWeight: "400",
    fontSize: wp(4),
    marginTop: hp(0.3),
  },
  dailyAddBtnRTL: {
    // flexDirection: "row-reverse",
    
  },
  dailyAddTextRTL: {
    textAlign: "right",
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
  showMapBtnRTL: {
    flexDirection: "row-reverse",
  },
  showMapTextRTL: {
    marginLeft: 0,
    marginRight: wp(2),
  },
  emptyContainer: {
    // paddingTop: hp(1),
    paddingBottom: hp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: wp(4),
    color: "#000000",
    fontWeight: "400",
  },
  unitsCountTextRTL: {
    textAlign: "right",
  },
  emptyTextRTL: {
    textAlign: "right",
  },
});
