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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RENT_FILTER_OPTIONS, SALE_FILTER_OPTIONS } from "../../data/propertyData";
import {
  formatPrice,
  navigateToMapScreen,
  isPublishedListingProperty,
  ensurePropertyCardListingSuffix,
} from "../../utils";
import { filterRentSaleFromPropertyData } from "@/utils/listingPropertyFilters";
import {
  PropertyCard,
  ScreenHeader,
  FilterChips,
  FilterTabs,
  ProjectListCard,
  ProjectSearchModal,
  ShowMapFloatingButton,
} from "../../components";
import type { SearchFilterState } from "../../components/map/SearchFilterModal";
import { COLORS } from "../../constants";
import type { Property, ProjectProperty, RentSaleProperty } from "../../types/property";
import { useLocalization } from "../../hooks/useLocalization";
import { useLocation } from "../../hooks/useLocation";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { setPreservedFilter } from "../../redux/slices/listingsFiltersSlice";
import { useGetPublicListingsQuery } from "@/redux/api";
import { mapApiListingToProperty } from "@/utils/apiListingMapper";
import { registerApiListingProperties } from "@/utils/propertyLookup";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  properties?: Property[];
  listingType: string;
  selectedFilter?: string | null;
  selectedCity?: string;
  searchFilters?: SearchFilterState | null;
}

export default function PropertyListScreen(): React.JSX.Element {
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const preservedFilter = useAppSelector(
    (s) => s.listingsFilters.preservedFilter
  );
  const { t, isRTL } = useLocalization();
  const insets = useSafeAreaInsets();
  const { getCurrentLocation } = useLocation();
  const [nearestRegion, setNearestRegion] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [nearestLocationError, setNearestLocationError] = useState<string>("");
  const [isResolvingNearest, setIsResolvingNearest] = useState(false);

  const listingType = params?.listingType || "rent";

  const { data: publicListingsData } = useGetPublicListingsQuery({
    page: 1,
    limit: 200,
    listingType: listingType === "sale" ? "SALE" : "RENT",
  });

  const apiListingProperties = useMemo(() => {
    const rows = publicListingsData?.listings ?? [];
    return rows.map(mapApiListingToProperty);
  }, [publicListingsData]);

  useEffect(() => {
    if (apiListingProperties.length > 0) {
      registerApiListingProperties(apiListingProperties);
    }
  }, [apiListingProperties]);

  const properties = useMemo(() => {
    if (params?.properties) {
      return params.properties;
    }
    const tab = listingType === "sale" ? "sale" : "rent";
    if (listingType === "sale" || listingType === "rent") {
      return filterRentSaleFromPropertyData(tab, {
        extraProperties: apiListingProperties,
      });
    }
    return [];
  }, [params?.properties, listingType, apiListingProperties]);

  const [selectedFilter, setSelectedFilter] = useState<string | null>(
    params?.selectedFilter ?? preservedFilter ?? null
  );

  useEffect(() => {
    const paramFilter = params?.selectedFilter;

    if (paramFilter !== undefined && paramFilter !== null) {
      if (preservedFilter !== paramFilter) {
        dispatch(setPreservedFilter(paramFilter));
      }
      setSelectedFilter((prev) => (prev !== paramFilter ? paramFilter : prev));
      return;
    }

    if (paramFilter === undefined && preservedFilter !== null) {
      setSelectedFilter((prev) => (prev === null ? preservedFilter : prev));
    }
  }, [params?.selectedFilter, preservedFilter, dispatch]);

  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // For projects: activeFilter for FilterChips (All For Sale, Villa, Land, Apartment)
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>("all");
  const [projectSearchModalVisible, setProjectSearchModalVisible] = useState<boolean>(false);
  const [projectSelectedCity, setProjectSelectedCity] = useState<string | null>(null);
  const [projectSelectedPropertyType, setProjectSelectedPropertyType] = useState<string | null>(null);

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
      const filterOptions =
        listingType === "rent" ? RENT_FILTER_OPTIONS : SALE_FILTER_OPTIONS;
      return getTranslatedTypeLabel(type, filterOptions);
    },
    [listingType, getTranslatedTypeLabel]
  );

  const handlePropertyPress = useCallback(
    (item: Property) => {
      if (listingType === "projects" && "isProject" in item && item.isProject) {
        navigation.navigate("ProjectDetails", { propertyId: item.id });
        return;
      }
      navigation.navigate("PropertyDetails", {
        propertyId: item.id,
        visiblePropertyIds: properties.map((p) => p.id),
        listingType,
        ...(item.serverListingId
          ? { listingId: item.serverListingId }
          : {}),
      });
    },
    [properties, listingType, navigation]
  );

  const handleBackPress = useCallback(() => {
    navigateToMapScreen(navigation);
  }, [navigation]);

  const handleFilterValueChange = useCallback(
    async (value: string | null) => {
      if (value !== "nearest") {
        setNearestLocationError("");
        setIsResolvingNearest(false);
        setSelectedFilter(value);
        dispatch(setPreservedFilter(value));
        return;
      }

      // Nearest must be based on user location. If we can't resolve location,
      // we do NOT apply a fallback sort.
      setNearestLocationError("");
      setIsResolvingNearest(true);
      let loc: Awaited<ReturnType<typeof getCurrentLocation>> | null = null;
      try {
        loc = await Promise.race([
          getCurrentLocation(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
        ]);
      } finally {
        setIsResolvingNearest(false);
      }

      if (!loc?.region) {
        setNearestRegion(null);
        setSelectedFilter(null);
        dispatch(setPreservedFilter(null));
        setNearestLocationError(
          loc?.error ||
            (t("errors.networkError") ?? "Unable to get your location. Please try again.")
        );
        return;
      }

      setNearestRegion({ latitude: loc.region.latitude, longitude: loc.region.longitude });
      setSelectedFilter("nearest");
      dispatch(setPreservedFilter("nearest"));
    },
    [dispatch, getCurrentLocation, t]
  );

  // If state restores with "nearest" selected (e.g., preserved filter),
  // resolve location before applying the sort.
  useEffect(() => {
    if (selectedFilter !== "nearest") return;
    if (nearestRegion) return;
    if (isResolvingNearest) return;
    void handleFilterValueChange("nearest");
  }, [handleFilterValueChange, isResolvingNearest, nearestRegion, selectedFilter]);

  const filterTabOptions = useMemo(
    () => [
      { value: "latest", label: t("listings.latest") },
      { value: "price", label: t("listings.price") },
      { value: "nearest", label: t("listings.nearest") },
    ],
    [t]
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

  const closeProjectSearchModal = useCallback(() => setProjectSearchModalVisible(false), []);

  const getCreatedAtMs = useCallback((property: Property) => {
    const raw = (property as any)?.createdAt;
    if (typeof raw !== "string" || !raw.trim()) return null;
    const ms = new Date(raw).getTime();
    return Number.isFinite(ms) ? ms : null;
  }, []);

  const getNumericPrice = useCallback((property: Property) => {
    const rentSaleProperty = property as any;
    if (rentSaleProperty?.price) {
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
  }, []);

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
    return properties;
  }, [listingType, properties, activeProjectFilter, projectSelectedCity, projectSelectedPropertyType]);

  // Nearest filter location resolution is handled in handleFilterValueChange.

  const distanceKm = useCallback(
    (p: Property) => {
      if (!nearestRegion) return null;
      const lat = (p as any)?.lat;
      const lng = (p as any)?.lng;
      if (typeof lat !== "number" || typeof lng !== "number") return null;

      const toRad = (x: number) => (x * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(lat - nearestRegion.latitude);
      const dLng = toRad(lng - nearestRegion.longitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(nearestRegion.latitude)) *
          Math.cos(toRad(lat)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [nearestRegion]
  );

  // Sort properties based on selected filter (sort the filtered list, not the full source)
  const sortedProperties = useMemo(() => {
    if (!selectedFilter) return filteredProperties;

    const sorted = [...filteredProperties];

    switch (selectedFilter) {
      case "latest":
        // Prefer API createdAt when present; otherwise fall back to id.
        return sorted.sort((a, b) => {
          const am = getCreatedAtMs(a);
          const bm = getCreatedAtMs(b);
          if (am != null && bm != null) return bm - am;
          if (am != null) return -1;
          if (bm != null) return 1;
          return (b.id || 0) - (a.id || 0);
        });

      case "price":
        // Sort by price ascending
        return sorted.sort((a, b) => {
          const priceA = getNumericPrice(a);
          const priceB = getNumericPrice(b);
          return priceA - priceB;
        });

      case "nearest":
        // Sort by distance from user's current location.
        if (!nearestRegion) return [];
        return sorted.sort((a, b) => {
          const da = distanceKm(a);
          const db = distanceKm(b);
          if (da == null && db == null) return 0;
          if (da == null) return 1;
          if (db == null) return -1;
          return da - db;
        });

      default:
        return sorted;
    }
  }, [filteredProperties, selectedFilter, getNumericPrice, getCreatedAtMs, nearestRegion, distanceKm]);

  const PropertyListItem = React.memo<{
    item: Property;
    listingType: string;
    onPress: (item: Property) => void;
    getTypeLabel: (type: string) => string;
  }>(
    ({ item, listingType, onPress, getTypeLabel }) => {
      const { t } = useLocalization();
      const typeLabel = getTypeLabel(item.type) || t("listings.property");

      const { title, priceLine } = useMemo(() => {
        let priceLine = "";
        let title = "";
        const published = isPublishedListingProperty(item);
        const categoryTitle = item.categoryLabel?.trim();

        if (listingType === "rent") {
          const core = published && categoryTitle ? categoryTitle : typeLabel;
          title = ensurePropertyCardListingSuffix(core, "rent", t);
          priceLine = "";
        } else {
          const core = published && categoryTitle ? categoryTitle : typeLabel;
          title = ensurePropertyCardListingSuffix(core, "sale", t);
          const saleProperty = item as RentSaleProperty;
          const rawPrice = saleProperty?.price?.trim();
          if (published && rawPrice) {
            priceLine = `${rawPrice} ${t("listings.sar")}`;
          } else {
            priceLine = `${rawPrice ? formatPrice(saleProperty.price) : "0"} ${t("listings.sar")}`;
          }
        }
        return { title, priceLine };
      }, [item, listingType, typeLabel, t]);

      const handlePress = useCallback(() => onPress(item), [item, onPress]);

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
    (prevProps, nextProps) =>
      prevProps.item.id === nextProps.item.id &&
      prevProps.listingType === nextProps.listingType &&
      prevProps.item === nextProps.item &&
      prevProps.onPress === nextProps.onPress &&
      prevProps.getTypeLabel === nextProps.getTypeLabel
  );

  PropertyListItem.displayName = "PropertyListItem";

  const renderProperty = useCallback(
    ({ item }: { item: Property }) => (
      <PropertyListItem
        item={item}
        listingType={listingType}
        onPress={handlePropertyPress}
        getTypeLabel={getTypeLabel}
      />
    ),
    [listingType, handlePropertyPress, getTypeLabel]
  );

  const keyExtractor = useCallback(
    (item: Property) =>
      item.serverListingId ? `api-${item.serverListingId}` : item.id.toString(),
    []
  );

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

  const searchIcon = useMemo(
    () => (
      <TouchableOpacity
        onPress={handleSearchPress}
        style={styles.searchButtonContainer}
        activeOpacity={0.7}
      >
        <View style={styles.searchButton}>
          <Ionicons name="search-outline" size={wp(5)} color="#fff" />
        </View>
      </TouchableOpacity>
    ),
    [handleSearchPress]
  );

  const isProjectsListing = listingType === "projects";

  const projectFilterOptions = useMemo(() => {
    if (!isProjectsListing || properties.length === 0) return SALE_FILTER_OPTIONS;
    const firstProject = properties[0] as ProjectProperty;
    return firstProject.listingType === "sale" ? SALE_FILTER_OPTIONS : RENT_FILTER_OPTIONS;
  }, [isProjectsListing, properties]);

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
    <View style={styles.container}>
      {!isProjectsListing && (
        <ScreenHeader
          title={t("navigation.listings")}
          onBackPress={handleBackPress}
          showRightSide={true}
          rightComponent={searchIcon}
          fontWeightBold={true}
        />
      )}

      {isProjectsListing && (
        <View style={[styles.projectsFilterContainer, { paddingTop: insets.top + hp(1) }]}>
          <View style={{ marginTop: -(hp(9) + insets.top) }}>
            <FilterChips
              filterOptions={projectFilterOptions}
              activeFilter={activeProjectFilter}
              onFilterChange={handleProjectFilterChange}
              onSearchPress={handleProjectSearchPress}
              variant="list"
            />
          </View>
        </View>
      )}

      {!isProjectsListing && (
        <>
          <FilterTabs
            options={filterTabOptions}
            selectedValue={selectedFilter}
            onValueChange={handleFilterValueChange}
            containerStyle={styles.filterContainer}
          />
          {isResolvingNearest && (
            <View style={styles.nearestBanner}>
              <Text style={styles.nearestBannerText}>
                {t("common.loading")} {t("listings.nearest")}
              </Text>
            </View>
          )}
          {!!nearestLocationError && (
            <View style={styles.nearestBannerError}>
              <Text style={styles.nearestBannerText}>{nearestLocationError}</Text>
            </View>
          )}
        </>
      )}

      <FlatList
        data={sortedProperties}
        renderItem={renderProperty}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          isProjectsListing && styles.projectsListContent,
        ]}
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
      />

      <ShowMapFloatingButton
        onPress={handleBackPress}
        label={t("listings.showMap")}
        isCompact={isScrolling}
        isRTL={isRTL}
        bottomInset={insets.bottom}
      />

      {isProjectsListing && (
        <ProjectSearchModal
          visible={projectSearchModalVisible}
          onClose={closeProjectSearchModal}
          onSearch={handleProjectSearch}
          selectedCity={projectSelectedCity || undefined}
          selectedPropertyType={projectSelectedPropertyType}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  nearestBanner: {
    marginTop: -hp(0.5),
    marginHorizontal: wp(4),
    marginBottom: hp(1),
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  nearestBannerError: {
    marginTop: -hp(0.5),
    marginHorizontal: wp(4),
    marginBottom: hp(1),
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  nearestBannerText: {
    color: "#374151",
    fontSize: wp(3.7),
    textAlign: "center",
    fontWeight: "600",
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
  },
  addText: {
    color: COLORS.addBtnText,
    fontWeight: "400",
    fontSize: wp(4),
    marginTop: hp(0.3),
  },
  projectsFilterContainer: {
    paddingHorizontal: wp(4),
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(14),
  },
  projectsListContent: {
    paddingTop: hp(7),
  },
  emptyContainer: {
    paddingBottom: hp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: wp(4),
    color: "#000000",
    fontWeight: "400",
  },
  emptyTextRTL: {
    textAlign: "right",
  },
});
