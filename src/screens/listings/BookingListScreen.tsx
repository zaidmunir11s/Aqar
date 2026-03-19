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
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { PROPERTY_DATA } from "../../data/propertyData";
import {
  formatDateRange,
  getFilteredDailyProperties,
  filterDailyPropertiesByCityAndDates,
} from "../../utils";
import {
  DailyBookingListCard,
  BookingDateModal,
  DailyHeaderBoxes,
  CityModal,
  SearchFilterModal,
} from "../../components";
import type { SearchFilterState } from "../../components/map/SearchFilterModal";
import { COLORS } from "../../constants";
import { useCalendar, useBookingModal, useLocation } from "../../hooks";
import type { Property } from "../../types/property";
import type { CalendarDates } from "../../hooks/useCalendar";
import { useLocalization } from "../../hooks/useLocalization";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import {
  setPreservedFilter,
  setPreservedDates,
  setPreservedCity,
  setPreservedSearchFilters,
  setPreservedRegion,
} from "../../redux/slices/listingsFiltersSlice";

type NavigationProp = NativeStackNavigationProp<any>;

export interface BookingListRouteParams {
  selectedDates?: CalendarDates;
  selectedFilter?: string | null;
  selectedCity?: string;
  searchFilters?: SearchFilterState | null;
  /** IDs of property markers currently visible on the map viewport */
  visiblePropertyIds?: number[];
}

export default function BookingListScreen(): React.JSX.Element {
  const route = useRoute();
  // Memoize so params has a stable reference; only recomputes when route.params changes.
  // This prevents the params useEffect from firing on every render.
  const params = useMemo(
    () => (route.params ?? {}) as BookingListRouteParams,
    [route.params]
  );
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const listingsFilters = useAppSelector((s) => s?.listingsFilters);
  const { getCurrentLocation } = useLocation();
  const { t, isRTL } = useLocalization();

  // ─── State — initialized once from params (params take priority over Redux) ───
  const [selectedFilter, setSelectedFilter] = useState<string | null>(
    params?.selectedFilter ?? listingsFilters?.preservedFilter ?? null
  );
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    const city =
      params?.selectedCity ||
      (listingsFilters?.preservedCity &&
      listingsFilters.preservedCity !== "Current Location"
        ? listingsFilters.preservedCity
        : "");
    return city || t("listings.city");
  });
  const [searchFilters, setSearchFilters] = useState<SearchFilterState | null>(
    params?.searchFilters !== undefined
      ? (params.searchFilters ?? null)
      : (listingsFilters?.preservedSearchFilters ?? null)
  );
  /**
   * When non-null: restrict displayed list to these property IDs (from map viewport).
   * Cleared whenever the user manually changes city, dates, or search filters.
   */
  const [visiblePropertyIds, setVisiblePropertyIds] = useState<number[] | null>(
    params?.visiblePropertyIds ?? null
  );

  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitializedLocationRef = useRef(false);
  const hasShownCalendarOnMount = useRef(false);

  const initialDates =
    params?.selectedDates ??
    listingsFilters?.preservedDates ?? { startDate: null, endDate: null };
  const { selectedDates, handleDateSelect, setSelectedDates } = useCalendar(initialDates);
  const {
    modalVisible: bookingDateModalVisible,
    openModal: openBookingDateModal,
    closeModal: closeBookingDateModal,
  } = useBookingModal();

  // ─── One-time location init ────────────────────────────────────────────────
  // Only fetches GPS once; saves region to Redux so DailyMap can center on it.
  useEffect(() => {
    if (hasInitializedLocationRef.current || listingsFilters?.preservedRegion != null) return;
    hasInitializedLocationRef.current = true;
    getCurrentLocation().then((result) => {
      if (result.region) dispatch(setPreservedRegion(result.region));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Params → local state (ONLY reacts to param reference changes, not Redux) ──
  // Using individual effects per param keeps deps minimal and prevents cross-loops.
  const prevParamsRef = useRef(params);
  useEffect(() => {
    const prev = prevParamsRef.current;
    prevParamsRef.current = params;

    if (params?.selectedCity && params.selectedCity !== prev?.selectedCity) {
      setSelectedCity(params.selectedCity);
      dispatch(setPreservedCity(params.selectedCity));
    }
    if (
      params?.searchFilters !== prev?.searchFilters &&
      params?.searchFilters !== undefined
    ) {
      setSearchFilters(params.searchFilters ?? null);
      dispatch(setPreservedSearchFilters(params.searchFilters));
    }
    if (
      params?.selectedFilter !== prev?.selectedFilter &&
      params?.selectedFilter !== undefined &&
      params.selectedFilter !== null
    ) {
      setSelectedFilter(params.selectedFilter);
      dispatch(setPreservedFilter(params.selectedFilter));
    }
    if (params?.selectedDates && params.selectedDates !== prev?.selectedDates) {
      setSelectedDates(params.selectedDates);
      dispatch(setPreservedDates(params.selectedDates));
    }
    if (params?.visiblePropertyIds !== prev?.visiblePropertyIds) {
      setVisiblePropertyIds(params?.visiblePropertyIds ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // ─── Redux → local state on screen focus (ONE-DIRECTIONAL — no loops) ────
  // This ref mirrors the latest Redux values so the stable useFocusEffect callback
  // can read them without needing to be recreated.
  const reduxRef = useRef({
    city: listingsFilters?.preservedCity ?? "",
    filters: listingsFilters?.preservedSearchFilters ?? null,
    dates: listingsFilters?.preservedDates ?? { startDate: null, endDate: null },
    filter: listingsFilters?.preservedFilter ?? null,
  });
  reduxRef.current = {
    city: listingsFilters?.preservedCity ?? "",
    filters: listingsFilters?.preservedSearchFilters ?? null,
    dates: listingsFilters?.preservedDates ?? { startDate: null, endDate: null },
    filter: listingsFilters?.preservedFilter ?? null,
  };

  useFocusEffect(
    useCallback(() => {
      const { city, filters, dates, filter } = reduxRef.current;
      // Sync city (skip invalid/placeholder values)
      if (city && city !== "Current Location") setSelectedCity(city);
      // Sync filters
      if (filters !== undefined) setSearchFilters(filters);
      // Sync dates
      if (dates?.startDate && dates?.endDate) setSelectedDates(dates);
      // Sync sort filter
      if (filter !== null) setSelectedFilter(filter);
      // Cleanup on blur: clear the viewport-restricted view so that stale IDs from a
      // previous "Show List" navigation don't persist when the user returns via tab or
      // back button. If user returns via "Show List", the params effect will re-set it.
      return () => setVisiblePropertyIds(null);
    }, [])
  );

  // ─── Calendar dates → Redux (one-way — Redux never writes local dates back) ─
  useEffect(() => {
    if (selectedDates?.startDate && selectedDates?.endDate) {
      dispatch(setPreservedDates(selectedDates));
    }
  }, [selectedDates.startDate, selectedDates.endDate, dispatch]);

  // ─── Auto-open calendar if no dates selected on mount ─────────────────────
  useEffect(() => {
    if (
      !hasShownCalendarOnMount.current &&
      !selectedDates?.startDate &&
      !selectedDates?.endDate
    ) {
      hasShownCalendarOnMount.current = true;
      setTimeout(() => openBookingDateModal(), 300);
    }
  }, [selectedDates?.startDate, selectedDates?.endDate, openBookingDateModal]);

  // ─── Derived data ──────────────────────────────────────────────────────────
  const reservationText = useMemo(() => {
    if (selectedDates?.startDate && selectedDates?.endDate) {
      return formatDateRange(
        selectedDates.startDate,
        selectedDates.endDate,
        t,
        isRTL
      );
    }
    return t("listings.chooseReservation");
  }, [selectedDates, t, isRTL]);

  const filterDates = useMemo(
    () => ({
      startDate: selectedDates?.startDate ?? null,
      endDate: selectedDates?.endDate ?? null,
    }),
    [selectedDates?.startDate, selectedDates?.endDate]
  );

  const filteredPropertiesForModal = useMemo(
    () => filterDailyPropertiesByCityAndDates(PROPERTY_DATA, selectedCity, filterDates),
    [selectedCity, filterDates.startDate, filterDates.endDate]
  );

  const filteredProperties = useMemo(
    () =>
      getFilteredDailyProperties(PROPERTY_DATA, selectedCity, filterDates, searchFilters),
    [selectedCity, filterDates.startDate, filterDates.endDate, searchFilters]
  );

  const getNumericPrice = useCallback((property: Property) => {
    return (property as any)?.dailyPrice ?? 0;
  }, []);

  const sortedProperties = useMemo(() => {
    if (!selectedFilter) return filteredProperties;
    const sorted = [...filteredProperties];
    switch (selectedFilter) {
      case "latest":
        return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
      case "price":
        return sorted.sort((a, b) => getNumericPrice(a) - getNumericPrice(b));
      default:
        return sorted;
    }
  }, [filteredProperties, selectedFilter, getNumericPrice]);

  /**
   * Whether the user has explicitly chosen a city (not the default placeholder).
   * Used to gate the list: we never show "all properties" from an implicit/default
   * location — the user must either pick a city or come from the map.
   */
  const hasExplicitCity = useMemo(
    () => !!selectedCity && selectedCity !== t("listings.city"),
    [selectedCity, t]
  );

  /**
   * Final list shown to user.
   * Rules (in priority order):
   *  1. visiblePropertyIds set → show exactly those IDs (from map viewport).
   *     Empty array = map had no visible markers → show nothing.
   *  2. No visiblePropertyIds AND no explicit city → show nothing.
   *     Prevents test-data / all-properties from leaking through as a
   *     "predefined Riyadh" default when the user hasn't chosen a location.
   *  3. Explicit city selected → show full filtered & sorted results.
   */
  const displayedProperties = useMemo(() => {
    if (visiblePropertyIds != null) {
      const idSet = new Set(visiblePropertyIds);
      return sortedProperties.filter((p) => idSet.has(p.id));
    }
    if (!hasExplicitCity) return [];
    return sortedProperties;
  }, [sortedProperties, visiblePropertyIds, hasExplicitCity]);

  const calculateDailyPrice = useCallback(
    (property: Property) => {
      if (!selectedDates?.startDate || !selectedDates?.endDate) return null;
      const start = new Date(selectedDates.startDate);
      const end = new Date(selectedDates.endDate);
      const days =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return ((property as any).dailyPrice || 0) * days;
    },
    [selectedDates]
  );

  const activeFilterCount = useMemo(() => {
    if (!searchFilters) return 0;
    let count = 0;
    if (searchFilters.fromPrice !== "" || searchFilters.toPrice !== "") count++;
    if (searchFilters.selectedPropertyType !== null) {
      count++;
      if (searchFilters.usageType !== null) count++;
      if (searchFilters.bedrooms !== "") count++;
      if (searchFilters.livingRooms !== "") count++;
      if (searchFilters.wc !== "") count++;
      if (searchFilters.villaType !== null) count++;
      const booleanFilters = [
        "furnished", "carEntrance", "airConditioned", "privateRoof",
        "apartmentInVilla", "twoEntrances", "specialEntrances", "nearBus",
        "nearMetro", "pool", "footballPitch", "volleyballCourt", "tent",
        "kitchen", "playground", "familySection", "stairs", "driverRoom",
        "maidRoom", "basement",
      ];
      booleanFilters.forEach((key) => {
        if (searchFilters[key as keyof SearchFilterState] === true) count++;
      });
    }
    return count;
  }, [searchFilters]);

  // ─── Action handlers — always update BOTH local state AND Redux ───────────

  /** City selected in modal → persist and clear viewport restriction */
  const handleCitySearch = useCallback(
    (city: string) => {
      setSelectedCity(city);
      dispatch(setPreservedCity(city));
      setVisiblePropertyIds(null); // user changed city → show full filtered results
    },
    [dispatch]
  );

  /** Locate-me in city modal → save region; city label stays unchanged */
  const handleCityLocateMe = useCallback(async () => {
    setCityModalVisible(false);
    const result = await getCurrentLocation();
    if (result.region) dispatch(setPreservedRegion(result.region));
  }, [getCurrentLocation, dispatch]);

  const handleSearchFilters = useCallback(
    (filters: SearchFilterState | null, _count: number, shouldClose?: boolean) => {
      dispatch(setPreservedSearchFilters(filters));
      setSearchFilters(filters);
      setVisiblePropertyIds(null); // user changed filters → show full filtered results
      if (shouldClose) setFilterModalVisible(false);
    },
    [dispatch]
  );

  const handleChooseReservation = useCallback(() => openBookingDateModal(), [openBookingDateModal]);

  /** Confirm date selection → clear viewport restriction */
  const handleSearchBookingDate = useCallback(() => {
    closeBookingDateModal();
    setVisiblePropertyIds(null); // user changed dates → show full filtered results
  }, [closeBookingDateModal]);

  const handlePropertyPress = useCallback(
    (item: Property) => {
      const navParams: any = {
        propertyId: item.id,
        visiblePropertyIds: displayedProperties.map((p) => p.id),
        listingType: "daily",
      };
      if (selectedDates?.startDate && selectedDates?.endDate) {
        navParams.selectedDates = selectedDates;
      }
      const calculatedPrice = calculateDailyPrice(item);
      if (calculatedPrice != null) navParams.calculatedPrice = calculatedPrice;
      navigation.navigate("DailyDetails", navParams);
    },
    [displayedProperties, selectedDates, calculateDailyPrice, navigation]
  );

  const handleBackPress = useCallback(() => {
    const mapParams: Record<string, unknown> = {
      shouldZoomOut: true,
      selectedDates,
      searchFilters: searchFilters ?? undefined,
    };
    if (selectedCity && selectedCity !== t("listings.city")) {
      mapParams.selectedCity = selectedCity;
    }
    navigation.navigate("DailyMap", mapParams);
  }, [navigation, selectedCity, selectedDates, searchFilters, t]);

  const handleAddPress = useCallback(() => navigation.navigate("AddListing"), [navigation]);
  const handleCityPress = useCallback(() => setCityModalVisible(true), []);
  const handleFiltersPress = useCallback(() => setFilterModalVisible(true), []);
  const closeCityModal = useCallback(() => setCityModalVisible(false), []);
  const closeFilterModal = useCallback(() => setFilterModalVisible(false), []);

  // ─── Scroll handlers ───────────────────────────────────────────────────────
  const handleScrollBegin = useCallback(() => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  }, []);

  const handleScrollEnd = useCallback(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      scrollTimeoutRef.current = null;
    }, 150);
  }, []);

  // ─── Render helpers ────────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: Property }) => {
      const calculatedPrice = calculateDailyPrice(item);
      return (
        <DailyBookingListCard
          property={item}
          onPress={() => handlePropertyPress(item)}
          priceLine={
            calculatedPrice != null
              ? `${calculatedPrice} ${t("listings.sar")}`
              : (item as any).bookingType === "daily"
                ? t("listings.daily")
                : t("listings.monthly")
          }
          calculatedPrice={calculatedPrice}
        />
      );
    },
    [calculateDailyPrice, handlePropertyPress, t]
  );

  const keyExtractor = useCallback((item: Property) => item.id.toString(), []);

  const listHeaderComponent = useMemo(
    () => (
      <View style={styles.unitsCountContainer}>
        <Text style={[styles.unitsCountText, isRTL && styles.unitsCountTextRTL]}>
          {displayedProperties.length} {t("listings.unitsMatchSearch")}
        </Text>
      </View>
    ),
    [displayedProperties.length, t, isRTL]
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={[styles.dailyHeaderFixedContainer, { paddingTop: insets.top + hp(1) }]}>
        <DailyHeaderBoxes
          reservationText={reservationText}
          onReservationPress={handleChooseReservation}
          onCityPress={handleCityPress}
          onFiltersPress={handleFiltersPress}
          cityText={selectedCity}
          filterCount={activeFilterCount}
        />
      </View>

      <FlatList
        data={displayedProperties}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          styles.dailyListContent,
          { paddingTop: insets.top + hp(9) },
        ]}
        ListHeaderComponent={listHeaderComponent}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollBegin={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}
      />

      <View
        style={[
          styles.bottomActions,
          { bottom: hp(1) + insets.bottom },
          isRTL && styles.bottomActionsRTL,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.showMapBtn,
            isScrolling && styles.showMapBtnCompact,
            isRTL && styles.showMapBtnRTL,
          ]}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="map-sharp" size={Math.min(wp(6), 24)} color="#617381" />
          {!isScrolling && (
            <Text style={[styles.showMapText, isRTL && styles.showMapTextRTL]} numberOfLines={1}>
              {t("listings.showMap")}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dailyAddBtn, isRTL && styles.dailyAddBtnRTL]}
          onPress={handleAddPress}
        >
          <Text style={styles.dailyPlusIcon}>+</Text>
          <Text style={[styles.dailyAddText, isRTL && styles.dailyAddTextRTL]}>
            {t("listings.add")}
          </Text>
        </TouchableOpacity>
      </View>

      <BookingDateModal
        visible={bookingDateModalVisible}
        onClose={closeBookingDateModal}
        onSearch={handleSearchBookingDate}
        selectedDates={selectedDates ?? { startDate: null, endDate: null }}
        onDayPress={handleDateSelect}
      />

      <CityModal
        visible={cityModalVisible}
        onClose={closeCityModal}
        onSearch={handleCitySearch}
        onLocateMe={handleCityLocateMe}
        selectedCity={selectedCity !== t("listings.city") ? selectedCity : undefined}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  unitsCountTextRTL: {
    textAlign: "right",
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(14),
  },
  dailyListContent: {
    paddingTop: hp(9),
  },
  bottomActions: {
    position: "absolute",
    left: wp(3),
    right: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
    gap: wp(3),
  },
  bottomActionsRTL: {
    flexDirection: "row-reverse",
  },
  dailyAddBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: wp(3),
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
  dailyAddBtnRTL: {},
  dailyAddTextRTL: {
    textAlign: "right",
  },
  showMapBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    minHeight: 44,
    borderRadius: wp(3),
    flexShrink: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  showMapBtnCompact: {
    paddingHorizontal: wp(3.5),
  },
  showMapText: {
    fontSize: Math.min(wp(3.5), 15),
    color: "#333",
    marginLeft: wp(2),
    flexShrink: 0,
  },
  showMapBtnRTL: {
    flexDirection: "row-reverse",
  },
  showMapTextRTL: {
    marginLeft: 0,
    marginRight: wp(2),
  },
});
