import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, CITY_REGIONS } from "../../constants";
import { SALE_FILTER_OPTIONS } from "../../data/propertyData";
import WheelPickerModal from "../common/WheelPickerModal";

export interface ProjectSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (city: string | null, propertyType: string | null) => void;
  selectedCity?: string;
  selectedPropertyType?: string | null;
}

export default function ProjectSearchModal({
  visible,
  onClose,
  onSearch,
  selectedCity,
  selectedPropertyType,
}: ProjectSearchModalProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [cityModalVisible, setCityModalVisible] = useState<boolean>(false);
  const [propertyTypeModalVisible, setPropertyTypeModalVisible] = useState<boolean>(false);
  const [currentCity, setCurrentCity] = useState<string>(selectedCity || "Riyadh");
  const [currentPropertyType, setCurrentPropertyType] = useState<string | null>(
    selectedPropertyType || null
  );

  // Update currentCity when selectedCity prop changes (from map movement)
  useEffect(() => {
    if (selectedCity) {
      setCurrentCity(selectedCity);
    }
  }, [selectedCity]);

  // Get city options from CITY_REGIONS (in original order)
  const cityOptions = useMemo(() => Object.keys(CITY_REGIONS), []);

  // Get property type options from SALE_FILTER_OPTIONS
  const propertyTypeOptions = useMemo(
    () => SALE_FILTER_OPTIONS.map((option) => option.label),
    []
  );

  const handleCityPress = useCallback(() => {
    setCityModalVisible(true);
  }, []);

  const handleCitySelect = useCallback((city: string) => {
    const cityToSet = city || "Riyadh";
    setCurrentCity(cityToSet);
    setCityModalVisible(false);
    // Immediately update the map when city is selected
    onSearch(cityToSet, currentPropertyType);
  }, [currentPropertyType, onSearch]);

  const handlePropertyTypePress = useCallback(() => {
    setPropertyTypeModalVisible(true);
  }, []);

  const handlePropertyTypeSelect = useCallback((label: string) => {
    // Find the corresponding type/id from SALE_FILTER_OPTIONS
    const option = SALE_FILTER_OPTIONS.find((opt) => opt.label === label);
    const type = option?.id === "all" ? null : option?.type || null;
    setCurrentPropertyType(type);
    setPropertyTypeModalVisible(false);
    // Immediately update the map when property type is selected
    onSearch(currentCity || null, type);
  }, [currentCity, onSearch]);

  const handleClear = useCallback(() => {
    // Only clear property type, keep the city
    setCurrentPropertyType(null);
    // Immediately update the map when cleared (reset to "All For Sale" but keep city)
    onSearch(currentCity || null, null);
  }, [currentCity, onSearch]);

  const handleSearch = useCallback(() => {
    onSearch(currentCity || null, currentPropertyType);
    onClose();
  }, [currentCity, currentPropertyType, onSearch, onClose]);

  const getPropertyTypeLabel = useCallback((type: string | null): string => {
    if (!type) return "All For Sale";
    const option = SALE_FILTER_OPTIONS.find((opt) => opt.type === type);
    return option?.label || "All For Sale";
  }, []);

  return (
    <>
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
            <View style={styles.content}>
              {/* City Section */}
              <View style={styles.section}>
                <Text style={styles.label}>City</Text>
                <TouchableOpacity
                  style={styles.fieldContainer}
                  onPress={handleCityPress}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.fieldText,
                      !currentCity && styles.fieldTextPlaceholder,
                    ]}
                  >
                    {currentCity || "Select City"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={wp(5)}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Property Type Section */}
              <View style={styles.section}>
                <Text style={styles.label}>Property Type</Text>
                <TouchableOpacity
                  style={styles.fieldContainer}
                  onPress={handlePropertyTypePress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.fieldText}>
                    {getPropertyTypeLabel(currentPropertyType)}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={wp(5)}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer Buttons */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? hp(2) : hp(1)) }]}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                activeOpacity={0.7}
              >
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* City Modal */}
      <WheelPickerModal
        visible={cityModalVisible}
        onClose={() => setCityModalVisible(false)}
        onSelect={handleCitySelect}
        title="Select City"
        options={cityOptions}
        initialValue={currentCity || undefined}
      />

      {/* Property Type Modal */}
      <WheelPickerModal
        visible={propertyTypeModalVisible}
        onClose={() => setPropertyTypeModalVisible(false)}
        onSelect={handlePropertyTypeSelect}
        title="Property Type"
        options={propertyTypeOptions}
        initialValue={getPropertyTypeLabel(currentPropertyType)}
      />
    </>
  );
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
    maxHeight: hp(40),
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
    padding: wp(0.5),
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginLeft: wp(2),
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  section: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: hp(1),
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: COLORS.background,
  },
  fieldText: {
    flex: 1,
    fontSize: wp(4),
    color: COLORS.textPrimary,
  },
  fieldTextPlaceholder: {
    color: "#9ca3af",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    justifyContent: "space-between",
    gap: wp(3),
  },
  clearButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1d87bc",
    borderRadius: wp(2),
    flex: 1,
  },
  clearButtonText: {
    fontSize: wp(4),
    color: "#1d87bc",
    fontWeight: "500",
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  searchButtonText: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#fff",
  },
});

