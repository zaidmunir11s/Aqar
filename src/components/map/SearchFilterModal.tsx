import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import { TabBarSection, ToggleRow } from "../orderForm";
import { ToggleSwitch } from "../common";
import { PROPERTY_DATA } from "../../data/propertyData";
import { BEDROOM_OPTIONS, LIVING_ROOM_OPTIONS, WC_OPTIONS, VILLA_TYPE_OPTIONS } from "../../constants/orderFormOptions";
import type { Property } from "../../types/property";
import { useLocalization } from "../../hooks/useLocalization";

export interface SearchFilterState {
  fromPrice: string;
  toPrice: string;
  selectedPropertyType: string | null;
  // Apartment/Studio specific
  usageType: "Singles" | "Families" | null;
  bedrooms: string | null;
  livingRooms: string | null;
  wc: string | null;
  furnished: boolean;
  carEntrance: boolean;
  airConditioned: boolean;
  privateRoof: boolean;
  apartmentInVilla: boolean;
  twoEntrances: boolean;
  specialEntrances: boolean;
  nearBus: boolean;
  nearMetro: boolean;
  // Chalet/Lounge specific
  pool: boolean;
  footballPitch: boolean;
  volleyballCourt: boolean;
  tent: boolean;
  kitchen: boolean;
  playground: boolean;
  familySection: boolean;
  // Villa specific
  stairs: boolean;
  driverRoom: boolean;
  maidRoom: boolean;
  basement: boolean;
  villaType: string | null;
  // Tent/Farm/Hall specific (only nearBus, nearMetro, familySection)
}

export interface SearchFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilterState | null, count: number, shouldClose?: boolean) => void;
  properties: Property[];
  initialFilters?: SearchFilterState | null;
}

// Property types will be translated in the component using useLocalization
const PROPERTY_TYPES = [
  { id: "apartment", nameKey: "apartment", icon: "home-outline", iconLibrary: "Ionicons" },
  { id: "chalet", nameKey: "chalet", icon: "umbrella-beach", iconLibrary: "MaterialCommunityIcons" },
  { id: "studio", nameKey: "studio", icon: "tv-outline", iconLibrary: "Ionicons" },
  { id: "villa", nameKey: "villa", icon: "home", iconLibrary: "MaterialCommunityIcons" },
  { id: "tent", nameKey: "tent", icon: "tent", iconLibrary: "MaterialCommunityIcons" },
  { id: "farm", nameKey: "farm", icon: "barn", iconLibrary: "MaterialCommunityIcons" },
  { id: "hall", nameKey: "hall", icon: "storefront-outline", iconLibrary: "MaterialCommunityIcons" },
];

const defaultFilterState: SearchFilterState = {
  fromPrice: "",
  toPrice: "",
  selectedPropertyType: null,
  usageType: null,
  bedrooms: "",
  livingRooms: "",
  wc: "",
  furnished: false,
  carEntrance: false,
  airConditioned: false,
  privateRoof: false,
  apartmentInVilla: false,
  twoEntrances: false,
  specialEntrances: false,
  nearBus: false,
  nearMetro: false,
  pool: false,
  footballPitch: false,
  volleyballCourt: false,
  tent: false,
  kitchen: false,
  playground: false,
  familySection: false,
  stairs: false,
  driverRoom: false,
  maidRoom: false,
  basement: false,
  villaType: null,
};

export default function SearchFilterModal({
  visible,
  onClose,
  onSearch,
  properties,
  initialFilters,
}: SearchFilterModalProps): React.JSX.Element {
  const { t, isRTL } = useLocalization();
  const [filters, setFilters] = useState<SearchFilterState>(initialFilters || defaultFilterState);
  const [focusedPriceInput, setFocusedPriceInput] = useState<"from" | "to" | null>(null);
  const insets = useSafeAreaInsets();
  const propertyTypeScrollRef = React.useRef<ScrollView>(null);

  // Track initial filters when modal opens to avoid auto-applying on initial load
  const initialFiltersRef = useRef<SearchFilterState | null>(null);
  const hasUserInteracted = useRef(false);
  const previousFiltersRef = useRef<string>("");
  const onSearchRef = useRef(onSearch);
  const propertiesRef = useRef(properties);

  // Keep refs updated
  useEffect(() => {
    onSearchRef.current = onSearch;
    propertiesRef.current = properties;
  }, [onSearch, properties]);

  // Initialize filters from props when modal opens
  useEffect(() => {
    if (visible) {
      const filtersToSet = initialFilters || defaultFilterState;
      setFilters(filtersToSet);
      initialFiltersRef.current = JSON.parse(JSON.stringify(filtersToSet)); // Deep copy
      previousFiltersRef.current = JSON.stringify(filtersToSet);
      hasUserInteracted.current = false;
    } else {
      // Reset when modal closes
      hasUserInteracted.current = false;
      initialFiltersRef.current = null;
      previousFiltersRef.current = "";
    }
  }, [visible, initialFilters]);

  // Auto-apply filters when they change (but not on initial load)
  useEffect(() => {
    if (!visible || !hasUserInteracted.current) return;
    
    // Use string comparison but only if it actually changed
    const currentFiltersString = JSON.stringify(filters);
    if (previousFiltersRef.current === currentFiltersString) return;
    
    previousFiltersRef.current = currentFiltersString;
    
    // Use a timeout to debounce rapid changes
    const timeoutId = setTimeout(() => {
      if (!visible) return; // Check if still visible
      const count = filterProperties(propertiesRef.current, filters).length;
      // Auto-apply filters immediately without closing modal
      onSearchRef.current(filters, count, false);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [filters, visible]);

  // Mark that user has interacted when they change any filter
  const updateFilter = useCallback((key: keyof SearchFilterState, value: any) => {
    hasUserInteracted.current = true;
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      header: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      headerTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        marginLeft: isRTL ? 0 : wp(2),
        marginRight: isRTL ? wp(2) : 0,
      },
      backButton: {
        // No transform needed, using different icon names
      },
      priceInputWrapper: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      sectionTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      priceInputsContainer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      priceInput: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      currencyText: {
        marginLeft: isRTL ? 0 : wp(2),
        marginRight: isRTL ? wp(2) : 0,
      },
      propertyTypeScrollContainer: {
        flexDirection: "row" as const,
      },
      propertyTypeButton: {
        marginRight: wp(2),
        marginLeft: 0,
      },
      propertyTypeText: {
        textAlign: "center" as const,
      },
      instructionText: {
        textAlign: "center" as const,
      },
      propertyTypeContent: {
        // Container for property type options
      },
      footer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      searchButtonText: {
        textAlign: "center" as const,
      },
      resetButtonText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  // Reset focused input when modal closes
  useEffect(() => {
    if (!visible) {
      setFocusedPriceInput(null);
    }
  }, [visible]);

  // Scroll property types to start in RTL
  useEffect(() => {
    if (visible && isRTL && propertyTypeScrollRef.current) {
      // In RTL, scroll to the end (which is the start visually) after a short delay
      setTimeout(() => {
        propertyTypeScrollRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } else if (visible && !isRTL && propertyTypeScrollRef.current) {
      // In LTR, scroll to the start
      setTimeout(() => {
        propertyTypeScrollRef.current?.scrollTo({ x: 0, animated: false });
      }, 100);
    }
  }, [visible, isRTL]);

  // Check if any filters are applied
  const hasFilters = useMemo(() => {
    return (
      filters.fromPrice !== "" ||
      filters.toPrice !== "" ||
      filters.selectedPropertyType !== null ||
      filters.usageType !== null ||
      (filters.bedrooms !== "" && filters.bedrooms !== "All") ||
      (filters.livingRooms !== "" && filters.livingRooms !== "All") ||
      (filters.wc !== "" && filters.wc !== "All") ||
      filters.furnished ||
      filters.carEntrance ||
      filters.airConditioned ||
      filters.privateRoof ||
      filters.apartmentInVilla ||
      filters.twoEntrances ||
      filters.specialEntrances ||
      filters.nearBus ||
      filters.nearMetro ||
      filters.pool ||
      filters.footballPitch ||
      filters.volleyballCourt ||
      filters.tent ||
      filters.kitchen ||
      filters.playground ||
      filters.familySection ||
      filters.stairs ||
      filters.driverRoom ||
      filters.maidRoom ||
      filters.basement ||
      filters.villaType !== null
    );
  }, [filters]);

  // Format number for display (1K, 10K, M)
  const formatCount = useCallback((count: number): string => {
    if (count >= 1000000) {
      const millions = count / 1000000;
      return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
    } else if (count >= 1000) {
      const thousands = count / 1000;
      return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
    }
    return count.toString();
  }, []);

  // Calculate matching properties count
  const matchingCount = useMemo(() => {
    return filterProperties(properties, filters).length;
  }, [properties, filters]);

  const handlePropertyTypeSelect = useCallback((typeId: string) => {
    hasUserInteracted.current = true;
    setFilters((prev) => {
      // If selecting a different property type, reset all filters for that property type
      if (prev.selectedPropertyType !== typeId) {
        return {
          ...defaultFilterState,
          selectedPropertyType: typeId,
        };
      }
      // If same property type is already selected, don't change anything (no toggle)
      return prev;
    });
  }, []);

  const handleReset = useCallback(() => {
    setFilters(defaultFilterState);
    initialFiltersRef.current = JSON.parse(JSON.stringify(defaultFilterState)); // Deep copy
    hasUserInteracted.current = true; // Mark as interacted so auto-apply works
    // Immediately apply reset by calling onSearch with null to clear filters
    // This will update the preserved state so both screens see the reset
    // Don't close modal on reset
    onSearch(null, properties.length, false);
  }, [onSearch, properties.length]);

  const handleSearch = useCallback(() => {
    // Filters are already applied automatically
    // When user presses search button, apply filters one more time and close modal
    const count = filterProperties(properties, filters).length;
    onSearch(filters, count, true); // Pass true to close modal
  }, [filters, properties, onSearch]);


  const renderPropertyTypeOptions = () => {
    if (!filters.selectedPropertyType) {
      return (
        <View style={styles.instructionContainer}>
          <Ionicons name="filter" size={wp(6)} color="#9ca3af" />
          <Text style={[styles.instructionText, rtlStyles.instructionText]}>
            {t("listings.searchFilter.selectPropertyType")}
          </Text>
        </View>
      );
    }

    const type = filters.selectedPropertyType;

    // Apartment
    if (type === "apartment") {
      const singlesText = t("listings.searchFilter.singles");
      const familiesText = t("listings.searchFilter.families");
      const usageTypeMap: { [key: string]: "Singles" | "Families" } = {
        [singlesText]: "Singles",
        [familiesText]: "Families",
      };
      const reverseUsageTypeMap: { [key: string]: string } = {
        "Singles": singlesText,
        "Families": familiesText,
      };
      
      return (
        <View style={styles.propertyTypeContent}>
          <TabBarSection
            options={[singlesText, familiesText]}
            selectedValue={filters.usageType ? reverseUsageTypeMap[filters.usageType] || null : null}
            onSelect={(value) => {
              const mappedValue = usageTypeMap[value];
              if (filters.usageType === mappedValue) {
                updateFilter("usageType", null);
              } else {
                updateFilter("usageType", mappedValue);
              }
            }}
            backgroundColor="#fff"
          />
          <TabBarSection
            label={t("listings.bedrooms")}
            options={BEDROOM_OPTIONS}
            selectedValue={filters.bedrooms || null}
            onSelect={(value) => {
              if (filters.bedrooms === value) {
                updateFilter("bedrooms", "");
              } else {
                updateFilter("bedrooms", value);
              }
            }}
            backgroundColor="#fff"
          />
          <TabBarSection
            label={t("listings.livingRooms")}
            options={LIVING_ROOM_OPTIONS}
            selectedValue={filters.livingRooms || null}
            onSelect={(value) => {
              if (filters.livingRooms === value) {
                updateFilter("livingRooms", "");
              } else {
                updateFilter("livingRooms", value);
              }
            }}
            backgroundColor="#fff"
          />
          <TabBarSection
            label={t("listings.searchFilter.wc")}
            options={WC_OPTIONS}
            selectedValue={filters.wc || null}
            onSelect={(value) => {
              if (filters.wc === value) {
                updateFilter("wc", "");
              } else {
                updateFilter("wc", value);
              }
            }}
            backgroundColor="#fff"
          />
          <ToggleRow
            label={t("listings.searchFilter.furnished")}
            value={filters.furnished}
            onValueChange={(value) => updateFilter("furnished", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.carEntrance")}
            value={filters.carEntrance}
            onValueChange={(value) => updateFilter("carEntrance", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.airConditioned")}
            value={filters.airConditioned}
            onValueChange={(value) => updateFilter("airConditioned", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.privateRoof")}
            value={filters.privateRoof}
            onValueChange={(value) => updateFilter("privateRoof", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.apartmentInVilla")}
            value={filters.apartmentInVilla}
            onValueChange={(value) => updateFilter("apartmentInVilla", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.twoEntrances")}
            value={filters.twoEntrances}
            onValueChange={(value) => updateFilter("twoEntrances", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.specialEntrances")}
            value={filters.specialEntrances}
            onValueChange={(value) => updateFilter("specialEntrances", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.nearBus")}
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.nearMetro")}
            value={filters.nearMetro}
            onValueChange={(value) => updateFilter("nearMetro", value)}
          />
        </View>
      );
    }

    // Chalet/Lounge
    if (type === "chalet") {
      return (
        <View style={styles.propertyTypeContent}>
          <ToggleRow
            label={t("listings.searchFilter.pool")}
            value={filters.pool}
            onValueChange={(value) => updateFilter("pool", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.footballPitch")}
            value={filters.footballPitch}
            onValueChange={(value) => updateFilter("footballPitch", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.volleyballCourt")}
            value={filters.volleyballCourt}
            onValueChange={(value) => updateFilter("volleyballCourt", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.tent")}
            value={filters.tent}
            onValueChange={(value) => updateFilter("tent", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.kitchen")}
            value={filters.kitchen}
            onValueChange={(value) => updateFilter("kitchen", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.playground")}
            value={filters.playground}
            onValueChange={(value) => updateFilter("playground", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.familySection")}
            value={filters.familySection}
            onValueChange={(value) => updateFilter("familySection", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.nearBus")}
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.nearMetro")}
            value={filters.nearMetro}
            onValueChange={(value) => updateFilter("nearMetro", value)}
          />
        </View>
      );
    }

    // Studio
    if (type === "studio") {
      const singlesText = t("listings.searchFilter.singles");
      const familiesText = t("listings.searchFilter.families");
      const usageTypeMap: { [key: string]: "Singles" | "Families" } = {
        [singlesText]: "Singles",
        [familiesText]: "Families",
      };
      const reverseUsageTypeMap: { [key: string]: string } = {
        "Singles": singlesText,
        "Families": familiesText,
      };
      
      return (
        <View style={styles.propertyTypeContent}>
          <TabBarSection
            options={[singlesText, familiesText]}
            selectedValue={filters.usageType ? reverseUsageTypeMap[filters.usageType] || null : null}
            onSelect={(value) => {
              const mappedValue = usageTypeMap[value];
              if (filters.usageType === mappedValue) {
                updateFilter("usageType", null);
              } else {
                updateFilter("usageType", mappedValue);
              }
            }}
            backgroundColor="#fff"
          />
          <TabBarSection
            label={t("listings.bedrooms")}
            options={BEDROOM_OPTIONS}
            selectedValue={filters.bedrooms || null}
            onSelect={(value) => {
              if (filters.bedrooms === value) {
                updateFilter("bedrooms", "");
              } else {
                updateFilter("bedrooms", value);
              }
            }}
            backgroundColor="#fff"
          />
          <TabBarSection
            label={t("listings.livingRooms")}
            options={LIVING_ROOM_OPTIONS}
            selectedValue={filters.livingRooms || null}
            onSelect={(value) => {
              if (filters.livingRooms === value) {
                updateFilter("livingRooms", "");
              } else {
                updateFilter("livingRooms", value);
              }
            }}
            backgroundColor="#fff"
          />
          <TabBarSection
            label={t("listings.searchFilter.wc")}
            options={WC_OPTIONS}
            selectedValue={filters.wc || null}
            onSelect={(value) => {
              if (filters.wc === value) {
                updateFilter("wc", "");
              } else {
                updateFilter("wc", value);
              }
            }}
            backgroundColor="#fff"
          />
          <ToggleRow
            label={t("listings.searchFilter.furnished")}
            value={filters.furnished}
            onValueChange={(value) => updateFilter("furnished", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.carEntrance")}
            value={filters.carEntrance}
            onValueChange={(value) => updateFilter("carEntrance", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.airConditioned")}
            value={filters.airConditioned}
            onValueChange={(value) => updateFilter("airConditioned", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.privateRoof")}
            value={filters.privateRoof}
            onValueChange={(value) => updateFilter("privateRoof", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.apartmentInVilla")}
            value={filters.apartmentInVilla}
            onValueChange={(value) => updateFilter("apartmentInVilla", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.twoEntrances")}
            value={filters.twoEntrances}
            onValueChange={(value) => updateFilter("twoEntrances", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.specialEntrances")}
            value={filters.specialEntrances}
            onValueChange={(value) => updateFilter("specialEntrances", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.nearBus")}
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.nearMetro")}
            value={filters.nearMetro}
            onValueChange={(value) => updateFilter("nearMetro", value)}
          />
        </View>
      );
    }

    // Villa
    if (type === "villa") {
      return (
        <View style={styles.propertyTypeContent}>
          <TabBarSection
            label={t("listings.bedrooms")}
            options={BEDROOM_OPTIONS}
            selectedValue={filters.bedrooms || null}
            onSelect={(value) => {
              if (filters.bedrooms === value) {
                updateFilter("bedrooms", "");
              } else {
                updateFilter("bedrooms", value);
              }
            }}
            backgroundColor="#fff"
          />
          <TabBarSection
            label={t("listings.livingRooms")}
            options={LIVING_ROOM_OPTIONS}
            selectedValue={filters.livingRooms || null}
            onSelect={(value) => {
              if (filters.livingRooms === value) {
                updateFilter("livingRooms", "");
              } else {
                updateFilter("livingRooms", value);
              }
            }}
            backgroundColor="#fff"
          />
          <TabBarSection
            label={t("listings.searchFilter.wc")}
            options={WC_OPTIONS}
            selectedValue={filters.wc || null}
            onSelect={(value) => {
              if (filters.wc === value) {
                updateFilter("wc", "");
              } else {
                updateFilter("wc", value);
              }
            }}
            backgroundColor="#fff"
          />
          <ToggleRow
            label={t("listings.searchFilter.stairs")}
            value={filters.stairs}
            onValueChange={(value) => updateFilter("stairs", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.driverRoom")}
            value={filters.driverRoom}
            onValueChange={(value) => updateFilter("driverRoom", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.maidRoom")}
            value={filters.maidRoom}
            onValueChange={(value) => updateFilter("maidRoom", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.pool")}
            value={filters.pool}
            onValueChange={(value) => updateFilter("pool", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.furnished")}
            value={filters.furnished}
            onValueChange={(value) => updateFilter("furnished", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.kitchen")}
            value={filters.kitchen}
            onValueChange={(value) => updateFilter("kitchen", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.carEntrance")}
            value={filters.carEntrance}
            onValueChange={(value) => updateFilter("carEntrance", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.basement")}
            value={filters.basement}
            onValueChange={(value) => updateFilter("basement", value)}
          />
          <TabBarSection
            label={t("listings.searchFilter.villaType")}
            options={VILLA_TYPE_OPTIONS}
            selectedValue={filters.villaType || null}
            onSelect={(value) => {
              if (filters.villaType === value) {
                updateFilter("villaType", null);
              } else {
                updateFilter("villaType", value);
              }
            }}
            backgroundColor="#fff"
          />
          <ToggleRow
            label={t("listings.searchFilter.airConditionedVilla")}
            value={filters.airConditioned}
            onValueChange={(value) => updateFilter("airConditioned", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.nearBus")}
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.nearMetro")}
            value={filters.nearMetro}
            onValueChange={(value) => updateFilter("nearMetro", value)}
          />
        </View>
      );
    }

    // Tent
    if (type === "tent") {
      return (
        <View style={styles.propertyTypeContent}>
          <ToggleRow
            label={t("listings.searchFilter.familySection")}
            value={filters.familySection}
            onValueChange={(value) => updateFilter("familySection", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.nearBus")}
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.nearMetro")}
            value={filters.nearMetro}
            onValueChange={(value) => updateFilter("nearMetro", value)}
          />
        </View>
      );
    }

    // Farm
    if (type === "farm") {
      return (
        <View style={styles.propertyTypeContent}>
          <ToggleRow
            label={t("listings.searchFilter.nearBus")}
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.nearMetro")}
            value={filters.nearMetro}
            onValueChange={(value) => updateFilter("nearMetro", value)}
          />
        </View>
      );
    }

    // Hall
    if (type === "hall") {
      return (
        <View style={styles.propertyTypeContent}>
          <ToggleRow
            label={t("listings.searchFilter.nearBus")}
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label={t("listings.searchFilter.nearMetro")}
            value={filters.nearMetro}
            onValueChange={(value) => updateFilter("nearMetro", value)}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={[styles.header, rtlStyles.header]}>
            <TouchableOpacity onPress={onClose} style={[styles.backButton, rtlStyles.backButton]}>
              <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={wp(6)} color={COLORS.arrows} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, rtlStyles.headerTitle]}>{t("listings.searchFilter.title")}</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Total Price */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, rtlStyles.sectionTitle]}>{t("listings.searchFilter.totalPrice")}</Text>
              <View style={[styles.priceInputsContainer, rtlStyles.priceInputsContainer]}>
                <View
                  style={[
                    styles.priceInputWrapper,
                    rtlStyles.priceInputWrapper,
                    focusedPriceInput === "from" && styles.priceInputWrapperActive,
                  ]}
                >
                  <TextInput
                    style={[styles.priceInput, rtlStyles.priceInput]}
                    placeholder={t("listings.searchFilter.fromPrice")}
                    placeholderTextColor="#9ca3af"
                    value={filters.fromPrice}
                    onChangeText={(value) => {
                      hasUserInteracted.current = true;
                      updateFilter("fromPrice", value);
                    }}
                    keyboardType="numeric"
                    onFocus={() => setFocusedPriceInput("from")}
                    onBlur={() => setFocusedPriceInput(null)}
                    textAlign={isRTL ? "right" : "left"}
                  />
                  <Text style={[styles.currencyText, rtlStyles.currencyText]}>{t("listings.sar")}</Text>
                </View>
                <View
                  style={[
                    styles.priceInputWrapper,
                    rtlStyles.priceInputWrapper,
                    focusedPriceInput === "to" && styles.priceInputWrapperActive,
                  ]}
                >
                  <TextInput
                    style={[styles.priceInput, rtlStyles.priceInput]}
                    placeholder={t("listings.searchFilter.toPrice")}
                    placeholderTextColor="#9ca3af"
                    value={filters.toPrice}
                    onChangeText={(value) => {
                      hasUserInteracted.current = true;
                      updateFilter("toPrice", value);
                    }}
                    keyboardType="numeric"
                    onFocus={() => setFocusedPriceInput("to")}
                    onBlur={() => setFocusedPriceInput(null)}
                    textAlign={isRTL ? "right" : "left"}
                  />
                  <Text style={[styles.currencyText, rtlStyles.currencyText]}>{t("listings.sar")}</Text>
                </View>
              </View>
            </View>

            {/* Property Type */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, rtlStyles.sectionTitle]}>{t("listings.searchFilter.propertyType")}</Text>
              <ScrollView
                ref={propertyTypeScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.propertyTypeScrollContainer, rtlStyles.propertyTypeScrollContainer]}
              >
                {(isRTL ? [...PROPERTY_TYPES].reverse() : PROPERTY_TYPES).map((type) => {
                  const IconComponent =
                    type.iconLibrary === "MaterialCommunityIcons"
                      ? MaterialCommunityIcons
                      : Ionicons;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.propertyTypeButton,
                        rtlStyles.propertyTypeButton,
                        filters.selectedPropertyType === type.id &&
                          styles.propertyTypeButtonActive,
                      ]}
                      onPress={() => handlePropertyTypeSelect(type.id)}
                      activeOpacity={0.7}
                    >
                      <IconComponent
                        name={type.icon as any}
                        size={wp(6)}
                        color={COLORS.textPrimary}
                      />
                      <Text
                        style={[
                          styles.propertyTypeText,
                          rtlStyles.propertyTypeText,
                          filters.selectedPropertyType === type.id &&
                            styles.propertyTypeTextActive,
                        ]}
                      >
                        {t(`listings.searchFilter.propertyTypes.${type.nameKey}`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Property Type Options */}
              {renderPropertyTypeOptions()}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, rtlStyles.footer, { paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? hp(2) : hp(1)) }]}>
            {hasFilters ? (
              <>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resetButtonText, rtlStyles.resetButtonText]}>{t("listings.searchFilter.reset")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearch}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.searchButtonText, rtlStyles.searchButtonText]}>
                    {t("listings.searchFilter.search")} {matchingCount > 0 ? `${formatCount(matchingCount)} ${t("listings.searchFilter.ads")}` : ""}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.footerSpacer} />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearch}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.searchButtonText, rtlStyles.searchButtonText]}>
                    {t("listings.searchFilter.search")} {matchingCount > 0 ? `${formatCount(matchingCount)} ${t("listings.searchFilter.ads")}` : ""}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Filter properties based on search filters
function filterProperties(
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
      } else if ("price" in p) {
        // Parse price string like "90 K" to number
        const priceStr = p.price.replace(/[^\d.]/g, "");
        price = parseFloat(priceStr) * 1000; // Convert K to actual number
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
  // "All" means no filter (show all properties), empty string means unselected (no filter)
  if (filters.bedrooms && filters.bedrooms !== "" && filters.bedrooms !== "All") {
    if (filters.bedrooms === "6+") {
      filtered = filtered.filter((p) => p.bedrooms >= 6);
    } else {
      const bedrooms = parseInt(filters.bedrooms);
      filtered = filtered.filter((p) => p.bedrooms === bedrooms);
    }
  }

  // Filter by living rooms
  // "All" means no filter (show all properties), empty string means unselected (no filter)
  if (filters.livingRooms && filters.livingRooms !== "" && filters.livingRooms !== "All") {
    const livingRooms = parseInt(filters.livingRooms.replace("+", ""));
    filtered = filtered.filter((p) => p.livingRooms >= livingRooms);
  }

  // Filter by WC
  // "All" means no filter (show all properties), empty string means unselected (no filter)
  if (filters.wc && filters.wc !== "" && filters.wc !== "All") {
    const wc = parseInt(filters.wc.replace("+", ""));
    filtered = filtered.filter((p) => p.restrooms >= wc);
  }

  // Filter by features (toggles)
  if (filters.furnished) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Furnished")
    );
  }
  if (filters.carEntrance) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Car Entrance")
    );
  }
  if (filters.airConditioned) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Air Conditioned")
    );
  }
  if (filters.privateRoof) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Private Roof")
    );
  }
  if (filters.apartmentInVilla) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Apartment in Villa")
    );
  }
  if (filters.twoEntrances) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Two Entrances")
    );
  }
  if (filters.specialEntrances) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Special Entrances")
    );
  }
  if (filters.nearBus) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Near Bus")
    );
  }
  if (filters.nearMetro) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Near Metro")
    );
  }
  if (filters.pool) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Pool")
    );
  }
  if (filters.footballPitch) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Football Pitch")
    );
  }
  if (filters.volleyballCourt) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Volleyball Court")
    );
  }
  if (filters.tent) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Tent")
    );
  }
  if (filters.kitchen) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Kitchen")
    );
  }
  if (filters.playground) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Playground")
    );
  }
  if (filters.familySection) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Family Section")
    );
  }
  if (filters.stairs) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Stairs")
    );
  }
  if (filters.driverRoom) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Driver Room")
    );
  }
  if (filters.maidRoom) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Maid Room")
    );
  }
  if (filters.basement) {
    filtered = filtered.filter(
      (p) => p.features && p.features.includes("Basement")
    );
  }

  // Filter by villa type (if applicable)
  // Note: This would require additional property data structure

  return filtered;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    width: "100%",
    height: hp(75),
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(1.5),
  },
  backButton: {
    // position: "absolute",
    // left: wp(4),
    padding: wp(0.5),
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginLeft: wp(2),
  },
  headerSpacer: {
    // width: wp(8),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp(4),
    // paddingTop: hp(2),
    paddingBottom: hp(1),
  },
  section: {
    marginTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: hp(1.5),
  },
  priceInputsContainer: {
    flexDirection: "row",
    gap: wp(3),
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.3),
    backgroundColor: COLORS.background,
  },
  priceInputWrapperActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.activeChipBackground,
  },
  priceInput: {
    flex: 1,
    fontSize: wp(4),
    color: COLORS.textPrimary,
  },
  currencyText: {
    fontSize: wp(4),
    fontWeight: "400",
    color: COLORS.primary,
    marginLeft: wp(2),
  },
  propertyTypeScrollContainer: {
    gap: wp(2),
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2),
  },
  propertyTypeButton: {
    width: wp(30),
    height: wp(24),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginRight: wp(2),
    alignItems: "center",
    justifyContent: "center",
    gap: hp(0.5),
  },
  propertyTypeButtonActive: {
    borderColor: "#3b82f6",
    borderWidth: 2,
  },
  propertyTypeText: {
    fontSize: wp(3.8),
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
  propertyTypeTextActive: {
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
  propertyTypeContent: {
    // marginTop: hp(2),
    backgroundColor: "#fff",
    paddingHorizontal: 0,
    paddingVertical: hp(2),
    borderRadius: wp(2),
  },
  instructionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(4),
    marginTop: hp(2),
  },
  instructionText: {
    fontSize: wp(3.5),
    color: "#9ca3af",
    marginTop: hp(1),
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    justifyContent: "space-between",
    gap: wp(3),
  },
  footerSpacer: {
    flex: 1,
  },
  resetButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    fontSize: wp(4),
    color: COLORS.textSecondary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  searchButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(6),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonFullWidth: {
    width: "100%",
  },
  searchButtonText: {
    fontSize: wp(4.2),
    fontWeight: "600",
    color: "#fff",
  },
});

