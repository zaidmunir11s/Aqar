import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  onSearch: (filters: SearchFilterState, count: number) => void;
  properties: Property[];
}

const PROPERTY_TYPES = [
  { id: "apartment", name: "Apartment", icon: "home-outline", iconLibrary: "Ionicons" },
  { id: "chalet", name: "Chalet/Lounge", icon: "umbrella-beach", iconLibrary: "MaterialCommunityIcons" },
  { id: "studio", name: "Studio", icon: "tv-outline", iconLibrary: "Ionicons" },
  { id: "villa", name: "Villa", icon: "home", iconLibrary: "MaterialCommunityIcons" },
  { id: "tent", name: "Tent", icon: "tent", iconLibrary: "MaterialCommunityIcons" },
  { id: "farm", name: "Farm", icon: "barn", iconLibrary: "MaterialCommunityIcons" },
  { id: "hall", name: "Hall", icon: "storefront-outline", iconLibrary: "MaterialCommunityIcons" },
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
}: SearchFilterModalProps): React.JSX.Element {
  const [filters, setFilters] = useState<SearchFilterState>(defaultFilterState);
  const [focusedPriceInput, setFocusedPriceInput] = useState<"from" | "to" | null>(null);
  const insets = useSafeAreaInsets();

  // Reset filters when modal closes
  useEffect(() => {
    if (!visible) {
      setFilters(defaultFilterState);
      setFocusedPriceInput(null);
    }
  }, [visible]);

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
  }, []);

  const handleSearch = useCallback(() => {
    onSearch(filters, matchingCount);
    onClose();
  }, [filters, matchingCount, onSearch, onClose]);

  const updateFilter = useCallback((key: keyof SearchFilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const renderPropertyTypeOptions = () => {
    if (!filters.selectedPropertyType) {
      return (
        <View style={styles.instructionContainer}>
          <Ionicons name="filter" size={wp(6)} color="#9ca3af" />
          <Text style={styles.instructionText}>
            Please select property type to show search options
          </Text>
        </View>
      );
    }

    const type = filters.selectedPropertyType;

    // Apartment
    if (type === "apartment") {
      return (
        <View style={styles.propertyTypeContent}>
          <TabBarSection
            options={["Singles", "Families"]}
            selectedValue={filters.usageType || null}
            onSelect={(value) => {
              if (filters.usageType === value) {
                updateFilter("usageType", null);
              } else {
                updateFilter("usageType", value as "Singles" | "Families");
              }
            }}
            backgroundColor="#fff"
          />
          <TabBarSection
            label="Bedrooms"
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
            label="Living rooms"
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
            label="WC"
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
            label="Furnished"
            value={filters.furnished}
            onValueChange={(value) => updateFilter("furnished", value)}
          />
          <ToggleRow
            label="Car entrance"
            value={filters.carEntrance}
            onValueChange={(value) => updateFilter("carEntrance", value)}
          />
          <ToggleRow
            label="Air Conditioned"
            value={filters.airConditioned}
            onValueChange={(value) => updateFilter("airConditioned", value)}
          />
          <ToggleRow
            label="Private roof"
            value={filters.privateRoof}
            onValueChange={(value) => updateFilter("privateRoof", value)}
          />
          <ToggleRow
            label="Apartment in villa"
            value={filters.apartmentInVilla}
            onValueChange={(value) => updateFilter("apartmentInVilla", value)}
          />
          <ToggleRow
            label="Two entrances"
            value={filters.twoEntrances}
            onValueChange={(value) => updateFilter("twoEntrances", value)}
          />
          <ToggleRow
            label="Special entrances"
            value={filters.specialEntrances}
            onValueChange={(value) => updateFilter("specialEntrances", value)}
          />
          <ToggleRow
            label="Near bus"
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label="Near metro"
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
            label="Pool"
            value={filters.pool}
            onValueChange={(value) => updateFilter("pool", value)}
          />
          <ToggleRow
            label="Football pitch"
            value={filters.footballPitch}
            onValueChange={(value) => updateFilter("footballPitch", value)}
          />
          <ToggleRow
            label="Volleyball Court"
            value={filters.volleyballCourt}
            onValueChange={(value) => updateFilter("volleyballCourt", value)}
          />
          <ToggleRow
            label="Tent"
            value={filters.tent}
            onValueChange={(value) => updateFilter("tent", value)}
          />
          <ToggleRow
            label="Kitchen"
            value={filters.kitchen}
            onValueChange={(value) => updateFilter("kitchen", value)}
          />
          <ToggleRow
            label="Playground"
            value={filters.playground}
            onValueChange={(value) => updateFilter("playground", value)}
          />
          <ToggleRow
            label="Family section"
            value={filters.familySection}
            onValueChange={(value) => updateFilter("familySection", value)}
          />
          <ToggleRow
            label="Near bus"
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label="Near metro"
            value={filters.nearMetro}
            onValueChange={(value) => updateFilter("nearMetro", value)}
          />
        </View>
      );
    }

    // Studio
    if (type === "studio") {
      return (
        <View style={styles.propertyTypeContent}>
          <TabBarSection
            options={["Singles", "Families"]}
            selectedValue={filters.usageType || null}
            onSelect={(value) => {
              if (filters.usageType === value) {
                updateFilter("usageType", null);
              } else {
                updateFilter("usageType", value as "Singles" | "Families");
              }
            }}
            backgroundColor="#fff"
          />
          <TabBarSection
            label="Bedrooms"
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
            label="Living rooms"
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
            label="WC"
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
            label="Furnished"
            value={filters.furnished}
            onValueChange={(value) => updateFilter("furnished", value)}
          />
          <ToggleRow
            label="Car entrance"
            value={filters.carEntrance}
            onValueChange={(value) => updateFilter("carEntrance", value)}
          />
          <ToggleRow
            label="Air Conditioned"
            value={filters.airConditioned}
            onValueChange={(value) => updateFilter("airConditioned", value)}
          />
          <ToggleRow
            label="Private roof"
            value={filters.privateRoof}
            onValueChange={(value) => updateFilter("privateRoof", value)}
          />
          <ToggleRow
            label="Apartment in villa"
            value={filters.apartmentInVilla}
            onValueChange={(value) => updateFilter("apartmentInVilla", value)}
          />
          <ToggleRow
            label="Two entrances"
            value={filters.twoEntrances}
            onValueChange={(value) => updateFilter("twoEntrances", value)}
          />
          <ToggleRow
            label="Special entrances"
            value={filters.specialEntrances}
            onValueChange={(value) => updateFilter("specialEntrances", value)}
          />
          <ToggleRow
            label="Near bus"
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label="Near metro"
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
            label="Bedrooms"
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
            label="Living rooms"
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
            label="WC"
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
            label="Stairs"
            value={filters.stairs}
            onValueChange={(value) => updateFilter("stairs", value)}
          />
          <ToggleRow
            label="Driver room"
            value={filters.driverRoom}
            onValueChange={(value) => updateFilter("driverRoom", value)}
          />
          <ToggleRow
            label="Maid room"
            value={filters.maidRoom}
            onValueChange={(value) => updateFilter("maidRoom", value)}
          />
          <ToggleRow
            label="Pool"
            value={filters.pool}
            onValueChange={(value) => updateFilter("pool", value)}
          />
          <ToggleRow
            label="Furnished"
            value={filters.furnished}
            onValueChange={(value) => updateFilter("furnished", value)}
          />
          <ToggleRow
            label="Kitchen"
            value={filters.kitchen}
            onValueChange={(value) => updateFilter("kitchen", value)}
          />
          <ToggleRow
            label="Car entrance"
            value={filters.carEntrance}
            onValueChange={(value) => updateFilter("carEntrance", value)}
          />
          <ToggleRow
            label="Basement"
            value={filters.basement}
            onValueChange={(value) => updateFilter("basement", value)}
          />
          <TabBarSection
            label="Villa Type"
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
            label="Air conditioned"
            value={filters.airConditioned}
            onValueChange={(value) => updateFilter("airConditioned", value)}
          />
          <ToggleRow
            label="Near bus"
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label="Near metro"
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
            label="Family section"
            value={filters.familySection}
            onValueChange={(value) => updateFilter("familySection", value)}
          />
          <ToggleRow
            label="Near bus"
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label="Near metro"
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
            label="Near bus"
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label="Near metro"
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
            label="Near bus"
            value={filters.nearBus}
            onValueChange={(value) => updateFilter("nearBus", value)}
          />
          <ToggleRow
            label="Near metro"
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
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={wp(6)} color={COLORS.arrows} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Search</Text>
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
              <Text style={styles.sectionTitle}>Total Price</Text>
              <View style={styles.priceInputsContainer}>
                <View
                  style={[
                    styles.priceInputWrapper,
                    focusedPriceInput === "from" && styles.priceInputWrapperActive,
                  ]}
                >
                  <TextInput
                    style={styles.priceInput}
                    placeholder="From price"
                    placeholderTextColor="#9ca3af"
                    value={filters.fromPrice}
                    onChangeText={(value) => updateFilter("fromPrice", value)}
                    keyboardType="numeric"
                    onFocus={() => setFocusedPriceInput("from")}
                    onBlur={() => setFocusedPriceInput(null)}
                  />
                  <Text style={styles.currencyText}>SAR</Text>
                </View>
                <View
                  style={[
                    styles.priceInputWrapper,
                    focusedPriceInput === "to" && styles.priceInputWrapperActive,
                  ]}
                >
                  <TextInput
                    style={styles.priceInput}
                    placeholder="To price"
                    placeholderTextColor="#9ca3af"
                    value={filters.toPrice}
                    onChangeText={(value) => updateFilter("toPrice", value)}
                    keyboardType="numeric"
                    onFocus={() => setFocusedPriceInput("to")}
                    onBlur={() => setFocusedPriceInput(null)}
                  />
                  <Text style={styles.currencyText}>SAR</Text>
                </View>
              </View>
            </View>

            {/* Property Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Property type</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.propertyTypeScrollContainer}
              >
                {PROPERTY_TYPES.map((type) => {
                  const IconComponent =
                    type.iconLibrary === "MaterialCommunityIcons"
                      ? MaterialCommunityIcons
                      : Ionicons;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.propertyTypeButton,
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
                          filters.selectedPropertyType === type.id &&
                            styles.propertyTypeTextActive,
                        ]}
                      >
                        {type.name}
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
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? hp(2) : hp(1)) }]}>
            {hasFilters ? (
              <>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearch}
                  activeOpacity={0.8}
                >
                  <Text style={styles.searchButtonText}>
                    Search {matchingCount > 0 ? `${formatCount(matchingCount)} ads` : ""}
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
                  <Text style={styles.searchButtonText}>
                    Search {matchingCount > 0 ? `${formatCount(matchingCount)} ads` : ""}
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

