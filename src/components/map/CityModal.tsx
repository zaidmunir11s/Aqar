import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../constants";
import { useLocation } from "../../hooks";
import LocationSearchModal from "./LocationSearchModal";
import { useLocalization } from "../../hooks/useLocalization";

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
  const { t, isRTL } = useLocalization();
  const [lastLocations, setLastLocations] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [showLocationSearch, setShowLocationSearch] = useState<boolean>(false);
  const [showLocationError, setShowLocationError] = useState<boolean>(false);
  const { getCurrentLocation } = useLocation();
  const insets = useSafeAreaInsets();

  // Helper function to translate city name
  const translateCityName = useCallback((cityName: string): string => {
    if (!cityName || cityName === "City") {
      return t("listings.city");
    }
    
    // Normalize city name for key matching
    const normalized = cityName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .replace(/`/g, "")
      .replace(/'/g, "")
      .replace(/al\s+/gi, "al");
    
    // Map of city names to their translation keys
    const cityKeyMap: { [key: string]: string } = {
      // Major cities
      "riyadh": "riyadh",
      "jeddah": "jeddah",
      "dammam": "dammam",
      "alkhobar": "khobar",
      "medina": "medina",
      "macca": "mecca",
      "buraydah": "buraidah",
      "taif": "taif",
      "jazan": "jazan",
      "abha": "abha",
      "khamismushait": "khamisMushait",
      "hail": "hail",
      "najran": "najran",
      "yanbu": "yanbu",
      "aljubail": "alJubail",
      "tabuk": "tabuk",
      "qatif": "qatif",
      "alkharj": "kharj",
      "hafralbatin": "hafrAlBatin",
      "riyadhalkhabra": "riyadhAlKhabra",
      // Additional cities
      "alhofuf": "alHofuf",
      "unayzah": "unayzah",
      "albukayriyah": "albukayriyah",
      "addiriyah": "addiriyah",
      "dhahran": "dhahran",
      "almajmaah": "almajmaah",
      "ahadrufaidah": "ahadrufaidah",
      "thadiq": "thadiq",
      "alquwaiiyah": "alquwaiiyah",
      "abuarish": "abuArish",
      "albahah": "albahah",
      "shaqra": "shaqra",
      "thuwal": "thuwal",
      "azzulfi": "azzulfi",
      "arrass": "arrass",
      "albadayea": "albadayea",
      "buqayq": "buqayq",
      "alduwadimi": "alduwadimi",
      "nairyah": "nairyah",
      "safwa": "safwa",
      "muhayil": "muhayil",
      "kingabdullaheconomiccity": "kingabdullaheconomiccity",
      "rabigh": "rabigh",
      "alhenakiyah": "alhenakiyah",
      "almajaridah": "almajaridah",
      "sabya": "sabya",
      "annabhaniyah": "annabhaniyah",
      "alqunfudhah": "alqunfudhah",
      "baish": "baish",
      "alhayathem": "alhayathem",
      "alshinana": "alshinana",
      "baqaa": "baqaa",
      "alghazalah": "alghazalah",
      "bisha": "bisha",
      "howtatbanitamin": "howtatbanitamin",
      "rumah": "rumah",
      "saihat": "saihat",
      "khafji": "khafji",
      "arar": "arar",
      "ahadalmasrihah": "ahad almasrihah",
      "alghat": "alghat",
      "almithnab": "al mithnab",
      "alqatif": "qatif",
      "aljumum": "aljumum",
      "samtah": "samtah",
      "addilam": "addilam",
      "afif": "afif",
      "ashshimasiyah": "ashshimasiyah",
      "dumahaljandal": "dumah aljandal",
      "rastanura": "rastanura",
      "sakaka": "sakaka",
      "turbah": "turbah",
      "assulayyil": "assulayyil",
      "allith": "allith",
      "billasmar": "billasmar",
      "tayma": "tayma",
      "mahdadhahab": "mahd adhdhahab",
      "aluyun": "aluyun",
      "alkamil": "alkamil",
      "tarout": "tarout",
      "rafha": "rafha",
      "sharorah": "sharorah",
      "alula": "alula",
      "turaif": "turaif",
      "duba": "duba",
      "alhariq": "alhariq",
      "alkhurma": "alkhurma",
      "tathleeth": "tathleeth",
      "ranyah": "ranyah",
      "alqurayyat": "alqurayyat",
      "anak": "anak",
      "alwajh": "alwajh",
      "umluj": "umluj",
      "alwadiah": "alwadiah",
      "khaybar": "khaybar",
      "badr": "badr",
    };
    
    const translationKey = cityKeyMap[normalized];
    if (translationKey) {
      const translated = t(`listings.cities.${translationKey}`);
      // If translation exists and is different from the key, use it
      if (translated && translated !== `listings.cities.${translationKey}`) {
        return translated;
      }
    }
    
    // Fallback: try direct lookup with normalized name
    const directKey = `listings.cities.${normalized}`;
    const directTranslation = t(directKey);
    if (directTranslation && directTranslation !== directKey) {
      return directTranslation;
    }
    
    return cityName;
  }, [t]);

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
            <View style={[styles.header, isRTL && styles.headerRTL]}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons 
                  name={isRTL ? "arrow-forward" : "arrow-back"} 
                  size={wp(6)} 
                  color={COLORS.arrows} 
                />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, isRTL && styles.headerTitleRTL]}>
                {t("listings.chooseCity")}
              </Text>
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
                style={[styles.inputButton, isRTL && styles.inputButtonRTL]}
                onPress={handleInputPress}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.inputButtonText, 
                  !inputValue && styles.inputButtonPlaceholder,
                  isRTL && styles.inputButtonTextRTL
                ]}>
                  {inputValue ? translateCityName(inputValue) : t("listings.enterHere")}
                </Text>
              </TouchableOpacity>

              {/* Last Locations Section */}
              {lastLocations.length > 0 && (
                <View style={styles.lastLocationsSection}>
                  <Text style={[styles.lastLocationsTitle, isRTL && styles.lastLocationsTitleRTL]}>
                    {t("listings.lastLocations")}
                  </Text>
                  {lastLocations.map((location, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.locationItem, isRTL && styles.locationItemRTL]}
                      onPress={() => handleLastLocationPress(location)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.locationText, isRTL && styles.locationTextRTL]}>
                        {translateCityName(location)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Error Message */}
            {showLocationError && (
              <View style={[styles.errorMessageContainer, isRTL && styles.errorMessageContainerRTL]}>
                <Ionicons name="information-circle" size={wp(5)} color={COLORS.error} />
                <Text style={[styles.errorMessageText, isRTL && styles.errorMessageTextRTL]}>
                  {t("listings.locationError")}
                </Text>
              </View>
            )}

            {/* Bottom Buttons */}
            <View style={[
              styles.buttonContainer, 
              isRTL && styles.buttonContainerRTL,
              { paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? hp(2) : hp(1)) }
            ]}>
              <TouchableOpacity
                style={[styles.locateMeButton, isRTL && styles.locateMeButtonRTL]}
                onPress={handleLocateMe}
                activeOpacity={0.7}
              >
                <FontAwesome6 name="location-crosshairs" size={wp(5)} color="#333" />
                <Text style={[styles.locateMeText, isRTL && styles.locateMeTextRTL]}>
                  {t("listings.locateMe")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                activeOpacity={0.8}
              >
                <Text style={styles.searchButtonText}>{t("common.search")}</Text>
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
  headerRTL: {
    flexDirection: "row-reverse",
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
  headerTitleRTL: {
    marginLeft: 0,
    marginRight: wp(2),
    textAlign: "right",
  },
  headerSpacer: {
    // width: wp(8),
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
    backgroundColor: COLORS.background,
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    minHeight: hp(5),
    justifyContent: "center",
    marginBottom: hp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputButtonRTL: {
    textAlign: "right",
  },
  inputButtonText: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
  },
  inputButtonTextRTL: {
    textAlign: "right",
  },
  inputButtonPlaceholder: {
    color: COLORS.textTertiary,
  },
  lastLocationsSection: {
    // marginTop: hp(2),
  },
  lastLocationsTitle: {
    fontSize: wp(4.5),
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  lastLocationsTitleRTL: {
    textAlign: "right",
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.2),
    gap: wp(2),
  },
  locationItemRTL: {
    flexDirection: "row-reverse",
  },
  locationText: {
    fontSize: wp(4.2),
    color: COLORS.textSecondary,
  },
  locationTextRTL: {
    textAlign: "right",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    gap: wp(3),
  },
  buttonContainerRTL: {
    flexDirection: "row-reverse",
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
  locateMeButtonRTL: {
    flexDirection: "row-reverse",
  },
  locateMeText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: "#111827",
  },
  locateMeTextRTL: {
    textAlign: "right",
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
  errorMessageContainerRTL: {
    flexDirection: "row-reverse",
  },
  errorMessageText: {
    flex: 1,
    fontSize: wp(3.5),
    color: COLORS.error,
    fontWeight: "500",
  },
  errorMessageTextRTL: {
    textAlign: "right",
  },
});

