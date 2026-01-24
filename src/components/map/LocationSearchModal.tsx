import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS, CITY_REGIONS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

// Get all cities from CITY_REGIONS (in original order)
const SAUDI_CITIES = Object.keys(CITY_REGIONS);

export interface LocationSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: string) => void;
  searchQuery?: string;
}

export default function LocationSearchModal({
  visible,
  onClose,
  onSelect,
  searchQuery = "",
}: LocationSearchModalProps): React.JSX.Element {
  const { t, isRTL } = useLocalization();
  const [searchText, setSearchText] = useState<string>(searchQuery);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Helper function to translate city name
  const translateCityName = useCallback((cityName: string): string => {
    if (!cityName) return cityName;
    
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

  // Sync search query when modal opens
  useEffect(() => {
    if (visible) {
      setSearchText(searchQuery || "");
    }
  }, [visible, searchQuery]);

  const filteredCities = useMemo(
    () => SAUDI_CITIES.filter((city) => city.toLowerCase().includes(searchText.toLowerCase())),
    [searchText]
  );

  const handleSelect = useCallback(
    (city: string) => {
      onSelect(city);
      setSearchText("");
      onClose();
    },
    [onSelect, onClose]
  );

  const handleClose = useCallback(() => {
    setSearchText("");
    onClose();
  }, [onClose]);

  // Memoized city item component for better performance
  const CityItem = memo<{ city: string; index: number; total: number; onSelect: (city: string) => void; translateCity: (city: string) => string; isRTL: boolean }>(
    ({ city, index, total, onSelect, translateCity, isRTL }) => (
      <View>
        <TouchableOpacity
          style={[styles.cityItem, isRTL && styles.cityItemRTL]}
          onPress={() => onSelect(city)}
          activeOpacity={0.7}
        >
          <Text style={[styles.cityText, isRTL && styles.cityTextRTL]}>
            {translateCity(city)}
          </Text>
        </TouchableOpacity>
        {index < total - 1 && <View style={[styles.divider, isRTL && styles.dividerRTL]} />}
      </View>
    )
  );
  CityItem.displayName = "CityItem";

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <CityItem 
        city={item} 
        index={index} 
        total={filteredCities.length} 
        onSelect={handleSelect}
        translateCity={translateCityName}
        isRTL={isRTL}
      />
    ),
    [filteredCities.length, handleSelect, translateCityName, isRTL]
  );

  const keyExtractor = useCallback((item: string) => item, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: hp(1.5) + 1 + hp(1.5), // cityItem padding + divider + next cityItem padding
      offset: (hp(1.5) + 1 + hp(1.5)) * index,
      index,
    }),
    []
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.modalContainer}>
          {/* Search Input */}
          <View style={[
            styles.searchContainer, 
            isFocused && styles.searchContainerFocused,
            isRTL && styles.searchContainerRTL
          ]}>
            <TextInput
              style={[styles.searchInput, isRTL && styles.searchInputRTL]}
              placeholder={t("listings.searchForCity")}
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={false}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              textAlign={isRTL ? "right" : "left"}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText("")}
                style={[styles.clearButton, isRTL && styles.clearButtonRTL]}
              >
                <Ionicons name="close" size={wp(5)} color="#6b7280" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                if (searchText.trim()) {
                  handleSelect(searchText.trim());
                }
              }}
              style={[styles.searchIconButton, isRTL && styles.searchIconButtonRTL]}
            >
              <Ionicons name="search" size={wp(5)} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Results List */}
          <FlatList
            data={filteredCities}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, isRTL && styles.emptyTextRTL]}>
                  {t("listings.noCitiesFound")}
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={15}
            windowSize={5}
          />
        </View>
      </View>
    </Modal>
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
    height: hp(45),
    paddingBottom: Platform.OS === "ios" ? hp(2) : hp(1),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: wp(3),
    marginHorizontal: wp(4),
    marginTop: hp(2),
    marginBottom: hp(1),
    paddingLeft: wp(3),
    paddingRight: wp(2),
    paddingVertical: hp(1),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchContainerRTL: {
    flexDirection: "row-reverse",
  },
  searchContainerFocused: {
    backgroundColor: COLORS.activeChipBackground,
    borderColor: COLORS.activeChipBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: wp(4),
    color: "#111827",
    paddingVertical: 0,
    paddingRight: wp(2),
  },
  searchInputRTL: {
    paddingRight: 0,
    paddingLeft: wp(2),
  },
  clearButton: {
    padding: wp(1),
    marginRight: wp(1),
  },
  clearButtonRTL: {
    marginRight: 0,
    marginLeft: wp(1),
  },
  searchIconButton: {
    padding: wp(1),
  },
  searchIconButtonRTL: {
    // Icon position handled by flexDirection: row-reverse
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  cityItem: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  cityItemRTL: {
    // RTL styles handled by text alignment
  },
  cityText: {
    fontSize: wp(4),
    color: "#374151",
  },
  cityTextRTL: {
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginLeft: wp(4),
  },
  dividerRTL: {
    marginLeft: 0,
    marginRight: wp(4),
  },
  emptyContainer: {
    paddingVertical: hp(4),
    alignItems: "center",
  },
  emptyText: {
    fontSize: wp(4),
    color: "#9ca3af",
  },
  emptyTextRTL: {
    textAlign: "right",
  },
});


