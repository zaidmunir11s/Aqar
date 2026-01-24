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
import { useLocalization } from "../../hooks/useLocalization";

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
  const { t, isRTL } = useLocalization();
  const [cityModalVisible, setCityModalVisible] = useState<boolean>(false);
  const [propertyTypeModalVisible, setPropertyTypeModalVisible] = useState<boolean>(false);
  const [currentCity, setCurrentCity] = useState<string>(selectedCity || "Riyadh");
  const [currentPropertyType, setCurrentPropertyType] = useState<string | null>(
    selectedPropertyType || null
  );

  // Helper function to translate city names
  const translateCityName = useCallback((cityName: string): string => {
    if (!cityName || cityName === "City") {
      return cityName;
    }
    
    // Normalize city name for key matching - remove spaces, special chars, lowercase
    const normalized = cityName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .replace(/`/g, "")
      .replace(/'/g, "")
      .replace(/al\s+/gi, "al");
    
    // Map of city names to their translation keys (comprehensive list)
    const cityKeyMap: Record<string, string> = {
      // Major cities
      "riyadh": "riyadh",
      "jeddah": "jeddah",
      "dammam": "dammam",
      "alkhobar": "khobar",
      "medina": "medina",
      "macca": "mecca",
      "makkah": "mecca",
      "mecca": "mecca",
      "buraydah": "buraidah",
      "taif": "taif",
      "jazan": "jazan",
      "abha": "abha",
      "khamismushait": "khamisMushait",
      "alhofuf": "alHofuf",
      "unayzah": "unayzah",
      "alkharj": "kharj",
      "hail": "hail",
      "albukayriyah": "albukayriyah",
      "aljubail": "alJubail",
      "addiriyah": "addiriyah",
      "dhahran": "dhahran",
      "tabuk": "tabuk",
      "almajmaah": "almajmaah",
      "ahadrufaidah": "ahadrufaidah",
      "thadiq": "thadiq",
      "hafralbatin": "hafrAlBatin",
      "riyadhalkhabra": "riyadhAlKhabra",
      "alquwaiiyah": "alquwaiiyah",
      "abu`arish": "abuArish",
      "abu'arish": "abuArish",
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
      "qatif": "qatif",
      "aljumum": "aljumum",
      "samtah": "samtah",
      "addilam": "addilam",
      "afif": "afif",
      "ashshimasiyah": "ashshimasiyah",
      "yanbu": "yanbu",
      "dumahaljandal": "dumah aljandal",
      "rastanura": "rastanura",
      "sakaka": "sakaka",
      "turbah": "turbah",
      "assulayyil": "assulayyil",
      "allith": "allith",
      "billasmar": "billasmar",
      "tayma": "tayma",
      "mahdadhdhahab": "mahd adhdhahab",
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
      "qurayyat": "alqurayyat",
      "anak": "anak",
      "alwajh": "alwajh",
      "umluj": "umluj",
      "alwadiah": "alwadiah",
      "khaybar": "khaybar",
      "badr": "badr",
      "najran": "najran",
    };
    
    // Try mapped key first
    const mappedKey = cityKeyMap[normalized];
    if (mappedKey) {
      const translated = t(`listings.cities.${mappedKey}`, { defaultValue: cityName });
      if (translated !== `listings.cities.${mappedKey}`) {
        return translated;
      }
    }
    
    // Try direct lookup with normalized key
    const directTranslated = t(`listings.cities.${normalized}`, { defaultValue: cityName });
    if (directTranslated !== `listings.cities.${normalized}`) {
      return directTranslated;
    }
    
    // Try with original case variations
    const originalNormalized = cityName.toLowerCase().trim().replace(/\s+/g, "");
    const originalTranslated = t(`listings.cities.${originalNormalized}`, { defaultValue: cityName });
    if (originalTranslated !== `listings.cities.${originalNormalized}`) {
      return originalTranslated;
    }
    
    return cityName;
  }, [t]);

  // Update currentCity when selectedCity prop changes (from map movement)
  useEffect(() => {
    if (selectedCity) {
      setCurrentCity(selectedCity);
    }
  }, [selectedCity]);

  // Get city options from CITY_REGIONS (in original order) - keep original names for callback
  const cityOptions = useMemo(() => Object.keys(CITY_REGIONS), []);
  
  // Get translated city options for display in WheelPickerModal
  const translatedCityOptions = useMemo(() => {
    return cityOptions.map(city => translateCityName(city));
  }, [cityOptions, translateCityName]);

  // Get property type options from SALE_FILTER_OPTIONS with translations
  const propertyTypeOptions = useMemo(() => {
    return SALE_FILTER_OPTIONS.map((option) => {
      // Handle "All For Sale" specially
      if (option.id === "all" || option.label === "All For Sale") {
        return t("listings.allForSale");
      }
      // Try to translate property type
      if (option.type) {
        const typeLower = option.type.toLowerCase();
        const translationKey = `listings.propertyTypes.${typeLower}`;
        const translated = t(translationKey, { defaultValue: option.label });
        return translated !== translationKey ? translated : option.label;
      }
      return option.label;
    });
  }, [t]);

  const handleCityPress = useCallback(() => {
    setCityModalVisible(true);
  }, []);

  const handleCitySelect = useCallback((translatedCity: string) => {
    // Map translated city name back to original city name
    const originalCity = cityOptions.find(city => translateCityName(city) === translatedCity) || translatedCity || "Riyadh";
    setCurrentCity(originalCity);
    setCityModalVisible(false);
    // Immediately update the map when city is selected (use original city name)
    onSearch(originalCity, currentPropertyType);
  }, [currentPropertyType, onSearch, cityOptions, translateCityName]);

  const handlePropertyTypePress = useCallback(() => {
    setPropertyTypeModalVisible(true);
  }, []);

  const handlePropertyTypeSelect = useCallback((translatedLabel: string) => {
    // Map translated label back to original option
    // Check if it's "All For Sale"
    if (translatedLabel === t("listings.allForSale")) {
      setCurrentPropertyType(null);
      setPropertyTypeModalVisible(false);
      onSearch(currentCity || null, null);
      return;
    }
    
    // Find the corresponding type/id from SALE_FILTER_OPTIONS by matching translated labels
    const option = SALE_FILTER_OPTIONS.find((opt) => {
      if (opt.id === "all" || opt.label === "All For Sale") {
        return t("listings.allForSale") === translatedLabel;
      }
      if (opt.type) {
        const typeLower = opt.type.toLowerCase();
        const translationKey = `listings.propertyTypes.${typeLower}`;
        const translated = t(translationKey, { defaultValue: opt.label });
        return translated === translatedLabel || opt.label === translatedLabel;
      }
      return opt.label === translatedLabel;
    });
    
    const type = option?.id === "all" ? null : option?.type || null;
    setCurrentPropertyType(type);
    setPropertyTypeModalVisible(false);
    // Immediately update the map when property type is selected
    onSearch(currentCity || null, type);
  }, [currentCity, onSearch, t]);

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
    if (!type) return t("listings.allForSale");
    const option = SALE_FILTER_OPTIONS.find((opt) => opt.type === type);
    if (!option) return t("listings.allForSale");
    
    // Try to translate the property type
    const typeLower = option.type?.toLowerCase() || "";
    const translationKey = `listings.propertyTypes.${typeLower}`;
    const translated = t(translationKey, { defaultValue: option.label });
    
    return translated !== translationKey ? translated : option.label;
  }, [t]);

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
      label: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      fieldContainer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      fieldText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      footer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
    }),
    [isRTL]
  );

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
            <View style={[styles.header, rtlStyles.header]}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={wp(6)} color={COLORS.arrows} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, rtlStyles.headerTitle]}>{t("common.search")}</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* City Section */}
              <View style={styles.section}>
                <Text style={[styles.label, rtlStyles.label]}>{t("listings.city")}</Text>
                <TouchableOpacity
                  style={[styles.fieldContainer, rtlStyles.fieldContainer]}
                  onPress={handleCityPress}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.fieldText,
                      rtlStyles.fieldText,
                      !currentCity && styles.fieldTextPlaceholder,
                    ]}
                  >
                    {currentCity ? translateCityName(currentCity) : t("listings.selectCity")}
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
                <Text style={[styles.label, rtlStyles.label]}>{t("listings.searchFilter.propertyType")}</Text>
                <TouchableOpacity
                  style={[styles.fieldContainer, rtlStyles.fieldContainer]}
                  onPress={handlePropertyTypePress}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.fieldText, rtlStyles.fieldText]}>
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
            <View style={[styles.footer, rtlStyles.footer, { paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? hp(2) : hp(1)) }]}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>{t("common.clear")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                activeOpacity={0.7}
              >
                <Text style={styles.searchButtonText}>{t("common.search")}</Text>
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
        title={t("listings.selectCity")}
        options={translatedCityOptions}
        initialValue={currentCity ? translateCityName(currentCity) : undefined}
      />

      {/* Property Type Modal */}
      <WheelPickerModal
        visible={propertyTypeModalVisible}
        onClose={() => setPropertyTypeModalVisible(false)}
        onSelect={handlePropertyTypeSelect}
        title={t("listings.searchFilter.propertyType")}
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
    minHeight: hp(45),
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

