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
import {
  PROPERTY_DATA,
  RENT_FILTER_OPTIONS,
  SALE_FILTER_OPTIONS,
} from "../../data/propertyData";
import { formatPrice, navigateToMapScreen } from "../../utils";
import {
  PropertyCard,
  ScreenHeader,
  FilterChips,
  FilterTabs,
  ProjectListCard,
  ProjectSearchModal,
} from "../../components";
import type { SearchFilterState } from "../../components/map/SearchFilterModal";
import { COLORS } from "../../constants";
import type { Property, ProjectProperty } from "../../types/property";
import { useLocalization } from "../../hooks/useLocalization";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { setPreservedFilter } from "../../redux/slices/listingsFiltersSlice";

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
  const listingsFilters = useAppSelector((s) => s?.listingsFilters);
  const preservedFilter = listingsFilters?.preservedFilter ?? null;
  const { t, isRTL } = useLocalization();
  const insets = useSafeAreaInsets();

  const listingType = params?.listingType || "rent";
  const properties = useMemo(() => {
    if (params?.properties) {
      return params.properties;
    }
    if (listingType === "sale") {
      return PROPERTY_DATA.filter((p) => p.listingType === "sale");
    }
    if (listingType === "rent") {
      return PROPERTY_DATA.filter(
        (p) => p.listingType === "rent" && !("isProject" in p && p.isProject)
      );
    }
    return [];
  }, [params?.properties, listingType]);

  const [selectedFilter, setSelectedFilter] = useState<string | null>(
    params?.selectedFilter ?? preservedFilter ?? null
  );

  useEffect(() => {
    if (
      params?.selectedFilter !== undefined &&
      params.selectedFilter !== null
    ) {
      dispatch(setPreservedFilter(params.selectedFilter));
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
  }, [params?.selectedFilter, preservedFilter, selectedFilter, dispatch]);
  useEffect(() => {
    if (selectedFilter !== null) {
      dispatch(setPreservedFilter(selectedFilter));
    }
  }, [selectedFilter, dispatch]);

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
      });
    },
    [properties, listingType, navigation]
  );

  const handleBackPress = useCallback(() => {
    navigateToMapScreen(navigation);
  }, [navigation]);

  const handleFilterValueChange = useCallback(
    (value: string | null) => {
      setSelectedFilter(value);
      dispatch(setPreservedFilter(value));
    },
    [dispatch]
  );

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

  // Sort properties based on selected filter (sort the filtered list, not the full source)
  const sortedProperties = useMemo(() => {
    if (!selectedFilter) return filteredProperties;

    const sorted = [...filteredProperties];

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
        if (listingType === "rent") {
          title = `${typeLabel} ${t("listings.forRent")}`;
          const rentProperty = item as any;
          priceLine = `${rentProperty?.price ? formatPrice(rentProperty.price) : "0"} ${t("listings.sar")} / ${t("listings.yearly")}`;
        } else {
          title = `${typeLabel} ${t("listings.forSale")}`;
          const saleProperty = item as any;
          priceLine = `${saleProperty?.price ? formatPrice(saleProperty.price) : "0"} ${t("listings.sar")}`;
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
        <FilterTabs
          options={filterTabOptions}
          selectedValue={selectedFilter}
          onValueChange={handleFilterValueChange}
          containerStyle={styles.filterContainer}
        />
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

      <View
        style={[
          styles.bottomActions,
          { bottom: hp(0.5) + insets.bottom },
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
      </View>

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
