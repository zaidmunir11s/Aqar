import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../constants";
import { useLocation } from "../../hooks";
import LocationSearchModal from "./LocationSearchModal";

const LAST_LOCATIONS_KEY = "@city_modal_last_locations";
const MAX_LAST_LOCATIONS = 5;

export interface CityModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (city: string) => void;
  onLocateMe: () => void;
  selectedCity?: string;
}

interface CityModalState {
  lastLocations: string[];
  inputValue: string;
}

export default function CityModal({
  visible,
  onClose,
  onSearch,
  onLocateMe,
  selectedCity,
}: CityModalProps): React.JSX.Element {
  const [lastLocations, setLastLocations] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [showLocationSearch, setShowLocationSearch] = useState<boolean>(false);
  const [showLocationError, setShowLocationError] = useState<boolean>(false);
  const { getCurrentLocation } = useLocation();

  // Load last locations from storage
  useEffect(() => {
    if (visible) {
      loadLastLocations();
      setInputValue(selectedCity || "");
    }
  }, [visible, selectedCity]);

  const loadLastLocations = async () => {
    try {
      const stored = await AsyncStorage.getItem(LAST_LOCATIONS_KEY);
      if (stored) {
        const locations = JSON.parse(stored);
        setLastLocations(Array.isArray(locations) ? locations : []);
      }
    } catch (error) {
      console.error("Error loading last locations:", error);
    }
  };

  const saveLocation = async (city: string) => {
    if (!city || city.trim() === "") return;
    
    try {
      const updated = [city, ...lastLocations.filter((loc) => loc !== city)].slice(
        0,
        MAX_LAST_LOCATIONS
      );
      setLastLocations(updated);
      await AsyncStorage.setItem(LAST_LOCATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const handleInputPress = useCallback(() => {
    setShowLocationSearch(true);
  }, []);

  const handleLocationSelect = useCallback(async (city: string) => {
    setInputValue(city);
    setShowLocationSearch(false);
    // Directly search and close the modal when city is selected
    await saveLocation(city);
    onSearch(city);
    onClose();
  }, [onSearch, onClose]);

  const handleLastLocationPress = useCallback((city: string) => {
    setInputValue(city);
  }, []);

  const handleSearch = useCallback(() => {
    const city = inputValue.trim();
    if (city) {
      saveLocation(city);
      onSearch(city);
      onClose();
    }
  }, [inputValue, onSearch, onClose]);

  const handleLocateMe = useCallback(async () => {
    const result = await getCurrentLocation();
    if (result.isOutsideSaudi) {
      setShowLocationError(true);
      // Hide error after 5 seconds
      setTimeout(() => {
        setShowLocationError(false);
      }, 5000);
    } else if (result.region) {
      onLocateMe();
      onClose();
    } else if (result.error) {
      // Handle other errors if needed
      setShowLocationError(false);
    }
  }, [getCurrentLocation, onLocateMe, onClose]);

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
              <Text style={styles.headerTitle}>Choose City</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Text Input Button */}
              <TouchableOpacity
                style={styles.inputButton}
                onPress={handleInputPress}
                activeOpacity={0.8}
              >
                <Text style={[styles.inputButtonText, !inputValue && styles.inputButtonPlaceholder]}>
                  {inputValue || "Enter here..."}
                </Text>
              </TouchableOpacity>

              {/* Last Locations Section */}
              {lastLocations.length > 0 && (
                <View style={styles.lastLocationsSection}>
                  <Text style={styles.lastLocationsTitle}>Last locations:</Text>
                  {lastLocations.map((location, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.locationItem}
                      onPress={() => handleLastLocationPress(location)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.locationText}>{location}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Error Message */}
            {showLocationError && (
              <View style={styles.errorMessageContainer}>
                <Ionicons name="information-circle" size={wp(5)} color={COLORS.error} />
                <Text style={styles.errorMessageText}>
                  Sorry, you cannot search for properties outside the Kingdom of Saudi Arabia
                </Text>
              </View>
            )}

            {/* Bottom Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.locateMeButton}
                onPress={handleLocateMe}
                activeOpacity={0.7}
              >
                <FontAwesome6 name="location-crosshairs" size={wp(5)} color="#333" />
                <Text style={styles.locateMeText}>Locate Me</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                activeOpacity={0.8}
              >
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location Search Modal */}
      <LocationSearchModal
        visible={showLocationSearch}
        onClose={() => setShowLocationSearch(false)}
        onSelect={handleLocationSelect}
        searchQuery={inputValue}
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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    width: "100%",
    height: hp(75),
    paddingBottom: Platform.OS === "ios" ? hp(2) : hp(1),
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === "ios" ? hp(2) : hp(1),
    paddingBottom: hp(2),
  },
  backButton: {
    position: "absolute",
    left: wp(4),
    padding: wp(1),
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#111827",
  },
  headerSpacer: {
    width: wp(12),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(1),
  },
  inputButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    minHeight: hp(7),
    justifyContent: "center",
    marginBottom: hp(3),
  },
  inputButtonText: {
    fontSize: wp(4),
    color: "#111827",
  },
  inputButtonPlaceholder: {
    color: "#9ca3af",
  },
  lastLocationsSection: {
    marginTop: hp(2),
  },
  lastLocationsTitle: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: "#111827",
    marginBottom: hp(1.5),
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.2),
    gap: wp(2),
  },
  locationText: {
    fontSize: wp(4),
    color: "#374151",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: Platform.OS === "ios" ? hp(2) : hp(1),
    gap: wp(3),
  },
  locateMeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: wp(3),
    paddingVertical: hp(1.8),
    gap: wp(2),
  },
  locateMeText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: "#111827",
  },
  searchButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    borderRadius: wp(3),
    paddingVertical: hp(1.8),
    alignItems: "center",
    justifyContent: "center",
    minHeight: hp(6),
  },
  searchButtonText: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#fff",
  },
  errorMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    marginHorizontal: wp(4),
    marginBottom: hp(1.5),
    gap: wp(2),
  },
  errorMessageText: {
    flex: 1,
    fontSize: wp(3.5),
    color: COLORS.error,
    fontWeight: "500",
  },
});

