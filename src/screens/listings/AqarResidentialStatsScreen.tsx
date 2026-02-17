import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
  TextInput as RNTextInput,
  Keyboard,
  Animated,
} from "react-native";
import { useNavigation, StackActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ScreenHeader from "../../components/common/ScreenHeader";
import { TabBarSection, SingleButtonFooter } from "../../components";
import WheelPickerModal from "../../components/common/WheelPickerModal";
import { COLORS, CITY_REGIONS } from "@/constants";
import { useLocalization } from "../../hooks/useLocalization";
import { translateCityName } from "@/utils/cityTranslation";
import type { RentSaleProperty } from "@/types/property";
import type { PropertyType } from "@/types/property";

type TabType = "rent" | "sale";

type RentPropertyType = "apartments" | "floors" | "villas";
type SalePropertyType = "apartments" | "lands" | "floors" | "villas";

const RENT_OPTIONS: { key: RentPropertyType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "apartments", icon: "business-outline" },
  { key: "floors", icon: "layers-outline" },
  { key: "villas", icon: "home-outline" },
];

const SALE_OPTIONS: { key: SalePropertyType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "apartments", icon: "business-outline" },
  { key: "lands", icon: "map-outline" },
  { key: "floors", icon: "layers-outline" },
  { key: "villas", icon: "home-outline" },
];

const AREA_OPTIONS = [
  "150-275",
  "275-400",
  "400-600",
  "600-900",
  "900-1200",
  "1200+",
];

const DIRECTION_KEYS = ["east", "west", "north", "south"] as const;
const DISTRICT_KEYS = [
  "districtAlOlaya",
  "districtAlMalaz",
  "districtAlNaseem",
  "districtAlMurjan",
  "districtAlSuwaidi",
  "districtAlNarjis",
  "districtAlRawdah",
  "districtAlWurud",
] as const;

export default function AqarResidentialStatsScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const { t, isRTL } = useLocalization();

  const [tab, setTab] = useState<TabType>("rent");
  const [selectedPropertyType, setSelectedPropertyType] = useState<
    RentPropertyType | SalePropertyType | null
  >(null);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [rooms, setRooms] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [directionModalVisible, setDirectionModalVisible] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const [keyboardHeightPx, setKeyboardHeightPx] = useState(0);

  // Move footer above keyboard and allow scroll when keyboard is visible
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (event) => {
      const h = event.endCoordinates.height;
      setKeyboardHeightPx(h);
      Animated.timing(keyboardHeight, {
        toValue: h,
        duration: event.duration ?? 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener(hideEvent, (event) => {
      setKeyboardHeightPx(0);
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: event.duration ?? 250,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardHeight]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const rentLabel = t("listings.rent");
  const saleLabel = t("listings.sale");
  const tabOptions = useMemo(() => [rentLabel, saleLabel], [rentLabel, saleLabel]);
  const selectedTabValue = tab === "rent" ? rentLabel : saleLabel;

  const handleTabSelect = useCallback(
    (value: string) => {
      setTab(value === rentLabel ? "rent" : "sale");
      setSelectedPropertyType(null);
      setSelectedCity("");
      setSelectedArea(null);
      setRooms("");
      setCityModalVisible(false);
      setAreaModalVisible(false);
      setDirectionModalVisible(false);
      setDistrictModalVisible(false);
      setSelectedDirection(null);
      setSelectedDistrict(null);
    },
    [rentLabel, saleLabel]
  );

  const propertyOptions = tab === "rent" ? RENT_OPTIONS : SALE_OPTIONS;

  const handlePropertySelect = useCallback(
    (key: RentPropertyType | SalePropertyType) => {
      if (selectedPropertyType === key) return;
      setRooms("");
      setSelectedArea(null);
      setSelectedPropertyType(key);
    },
    [selectedPropertyType]
  );

  const cityOptions = useMemo(() => Object.keys(CITY_REGIONS), []);
  const translatedCityOptions = useMemo(
    () => cityOptions.map((city) => translateCityName(city, t)),
    [cityOptions, t]
  );

  const handleCityPress = useCallback(() => {
    setCityModalVisible(true);
  }, []);

  const handleCitySelect = useCallback(
    (translatedCity: string) => {
      const originalCity =
        cityOptions.find((city) => translateCityName(city, t) === translatedCity) ??
        translatedCity ??
        "";
      setSelectedCity(originalCity);
      setSelectedDirection(null);
      setSelectedDistrict(null);
      setCityModalVisible(false);
    },
    [cityOptions, t]
  );

  const displayCity = useMemo(
    () => translateCityName(selectedCity, t),
    [selectedCity, t]
  );

  const directionOptions = useMemo(
    () => DIRECTION_KEYS.map((k) => t(`listings.${k}`)),
    [t]
  );
  const districtOptions = useMemo(
    () => DISTRICT_KEYS.map((k) => t(`listings.${k}`)),
    [t]
  );
  const displayDirection = useMemo(
    () => (selectedDirection ? t(`listings.${selectedDirection}`) : ""),
    [selectedDirection, t]
  );
  const displayDistrict = useMemo(
    () => (selectedDistrict ? t(`listings.${selectedDistrict}`) : ""),
    [selectedDistrict, t]
  );

  const showDirectionDistrict =
    selectedCity.length > 0 && selectedPropertyType !== null;

  const handleDirectionPress = useCallback(() => {
    setDirectionModalVisible(true);
  }, []);
  const handleDirectionSelect = useCallback((translated: string) => {
    const key = DIRECTION_KEYS.find((k) => t(`listings.${k}`) === translated);
    setSelectedDirection(key ?? null);
    setDirectionModalVisible(false);
  }, [t]);
  const handleDistrictPress = useCallback(() => {
    setDistrictModalVisible(true);
  }, []);
  const handleDistrictSelect = useCallback((translated: string) => {
    const key = DISTRICT_KEYS.find((k) => t(`listings.${k}`) === translated);
    setSelectedDistrict(key ?? null);
    setDistrictModalVisible(false);
  }, [t]);

  const showRoomsField =
    selectedPropertyType === "apartments" || selectedPropertyType === "floors";
  const showAreaField = selectedPropertyType === "villas";

  const canShowStats = useMemo(() => {
    if (!selectedPropertyType || !selectedCity.trim()) return false;
    if (showDirectionDistrict) {
      if (selectedDirection === null || selectedDistrict === null) return false;
    }
    if (showRoomsField) {
      if (!rooms.trim()) return false;
    }
    if (showAreaField) {
      if (selectedArea === null || selectedArea === "") return false;
    }
    return true;
  }, [
    selectedPropertyType,
    selectedCity,
    showDirectionDistrict,
    selectedDirection,
    selectedDistrict,
    showRoomsField,
    rooms,
    showAreaField,
    selectedArea,
  ]);

  const propertyForNavigation = useMemo((): RentSaleProperty | null => {
    if (!selectedPropertyType || !selectedCity || !canShowStats) return null;
    const typeMap: Record<RentPropertyType | SalePropertyType, PropertyType> = {
      apartments: "apartment",
      floors: "floor",
      villas: "villa",
      lands: "land",
    };
    const addressParts = [selectedCity];
    if (selectedDirection) addressParts.push(t(`listings.${selectedDirection}`));
    if (selectedDistrict) addressParts.push(t(`listings.${selectedDistrict}`));
    const areaNum = showAreaField && selectedArea
      ? parseInt(selectedArea.split("-")[0] ?? "0", 10) || 200
      : 0;
    const bedroomsNum = showRoomsField && rooms.trim()
      ? parseInt(rooms, 10) || 0
      : 0;
    return {
      id: 0,
      lat: 0,
      lng: 0,
      type: typeMap[selectedPropertyType],
      listingType: tab,
      area: areaNum,
      usage: "family",
      bedrooms: bedroomsNum,
      livingRooms: 0,
      restrooms: 0,
      estateAge: 0,
      address: addressParts.join(", "),
      city: selectedCity,
      price: "0",
    };
  }, [
    selectedPropertyType,
    selectedCity,
    selectedDirection,
    selectedDistrict,
    tab,
    showAreaField,
    selectedArea,
    showRoomsField,
    rooms,
    canShowStats,
    t,
  ]);

  const handleShowStatsPress = useCallback(() => {
    if (!propertyForNavigation || !canShowStats) return;
    const state = navigation.getState();
    const routes = state?.routes ?? [];
    const cameFromAveragePriceDetail =
      routes.length >= 2 && routes[routes.length - 2].name === "AveragePriceDetail";
    const nav = navigation as unknown as {
      replace: (name: string, params: object) => void;
      navigate: (name: string, params: object) => void;
      dispatch: (action: { type: string; payload?: { count: number } }) => void;
    };
    if (cameFromAveragePriceDetail) {
      nav.dispatch(StackActions.pop(2));
      nav.navigate("AveragePriceDetail", {
        property: propertyForNavigation,
        averageType: tab,
      });
    } else {
      nav.replace("AveragePriceDetail", {
        property: propertyForNavigation,
        averageType: tab,
      });
    }
  }, [navigation, propertyForNavigation, canShowStats, tab]);

  const handleAreaPress = useCallback(() => {
    setAreaModalVisible(true);
  }, []);

  const handleAreaSelect = useCallback((value: string) => {
    setSelectedArea(value);
    setAreaModalVisible(false);
  }, []);

  const rtlStyles = useMemo(
    () => ({
      label: { textAlign: (isRTL ? "right" : "left") as "left" | "right" },
      fieldContainer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      fieldText: { textAlign: (isRTL ? "right" : "left") as "left" | "right" },
      cardRow: { flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse" },
    }),
    [isRTL]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.aqarResidentialStats")}
        onBackPress={handleBackPress}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: hp(14) + keyboardHeightPx },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
      >
        <TabBarSection
          options={tabOptions}
          selectedValue={selectedTabValue}
          onSelect={handleTabSelect}
          backgroundColor="#fff"
        />

        <View style={[styles.cardRow, rtlStyles.cardRow]}>
          {propertyOptions.map(({ key, icon }) => {
            const label = t(`listings.${key}`);
            const isSelected = selectedPropertyType === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.propertyCard, isSelected && styles.propertyCardSelected]}
                onPress={() => handlePropertySelect(key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={icon}
                  size={wp(6.5)}
                  color={isSelected ? COLORS.textPrimary : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.propertyCardLabel,
                    isSelected && styles.propertyCardLabelSelected,
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.citySection}>
          <View style={[styles.cityDirectionRow, rtlStyles.fieldContainer]}>
            <View style={styles.cityDirectionColumn}>
              <Text style={[styles.sectionLabel, styles.columnLabel, rtlStyles.label]}>
                {t("listings.city")}
              </Text>
              <TouchableOpacity
                style={[styles.fieldContainer, rtlStyles.fieldContainer]}
                onPress={handleCityPress}
                activeOpacity={0.7}
              >
                <Text style={[styles.fieldText, rtlStyles.fieldText]} numberOfLines={1}>
                  {displayCity}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={wp(5)}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
            {showDirectionDistrict && (
              <View style={styles.cityDirectionColumn}>
                <Text style={[styles.sectionLabel, styles.columnLabel, rtlStyles.label]}>
                  {t("listings.direction")}
                </Text>
                <TouchableOpacity
                  style={[styles.fieldContainer, rtlStyles.fieldContainer]}
                  onPress={handleDirectionPress}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.fieldText, rtlStyles.fieldText]} numberOfLines={1}>
                    {displayDirection}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={wp(5)}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
          {showDirectionDistrict && (
            <View style={styles.districtSection}>
              <Text style={[styles.sectionLabel, rtlStyles.label]}>
                {t("listings.district")}
              </Text>
              <TouchableOpacity
                style={[styles.fieldContainer, rtlStyles.fieldContainer]}
                onPress={handleDistrictPress}
                activeOpacity={0.7}
              >
                <Text style={[styles.fieldText, rtlStyles.fieldText]} numberOfLines={1}>
                  {displayDistrict}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={wp(5)}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {showRoomsField && (
          <View style={styles.extraSection}>
            <Text style={[styles.sectionLabel, rtlStyles.label]}>
              {t("listings.rooms")}
            </Text>
            <RNTextInput
              style={[styles.roomsInput, rtlStyles.fieldText]}
              value={rooms}
              onChangeText={setRooms}
              keyboardType="number-pad"
            />
          </View>
        )}

        {showAreaField && (
          <View style={styles.extraSection}>
            <Text style={[styles.sectionLabel, rtlStyles.label]}>
              {t("listings.area")}
            </Text>
            <TouchableOpacity
              style={[styles.fieldContainer, rtlStyles.fieldContainer]}
              onPress={handleAreaPress}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.fieldText, rtlStyles.fieldText]}
                numberOfLines={1}
              >
                {selectedArea ?? ""}
              </Text>
              <Ionicons
                name="chevron-down"
                size={wp(5)}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Animated.View style={[styles.footerWrapper, { bottom: keyboardHeight }]}>
        <SingleButtonFooter
          fixed={false}
          label={t("listings.showStats")}
          onPress={handleShowStatsPress}
          disabled={!canShowStats}
        />
      </Animated.View>

      <WheelPickerModal
        key={`city-${tab}`}
        visible={cityModalVisible}
        onClose={() => setCityModalVisible(false)}
        onSelect={handleCitySelect}
        title={t("listings.selectCity")}
        options={translatedCityOptions}
        initialValue={displayCity}
      />

      <WheelPickerModal
        key={`area-${tab}`}
        visible={areaModalVisible}
        onClose={() => setAreaModalVisible(false)}
        onSelect={handleAreaSelect}
        title={t("listings.area")}
        options={AREA_OPTIONS}
        initialValue={selectedArea ?? undefined}
      />

      <WheelPickerModal
        key={`direction-${tab}`}
        visible={directionModalVisible}
        onClose={() => setDirectionModalVisible(false)}
        onSelect={handleDirectionSelect}
        title={t("listings.direction")}
        options={directionOptions}
        initialValue={displayDirection || undefined}
      />

      <WheelPickerModal
        key={`district-${tab}`}
        visible={districtModalVisible}
        onClose={() => setDistrictModalVisible(false)}
        onSelect={handleDistrictSelect}
        title={t("listings.district")}
        options={districtOptions}
        initialValue={displayDistrict || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  footerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(14),
  },
  cardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    // gap: wp(2.5),
    marginBottom: hp(3),
  },
  propertyCard: {
    width: wp(20.5),
    height: hp(8),
    backgroundColor: COLORS.white,
    borderRadius: wp(2.5),
    paddingVertical: hp(1),
    paddingHorizontal: wp(1.5),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  propertyCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  propertyCardLabel: {
    marginTop: hp(0.6),
    fontSize: wp(3.2),
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  propertyCardLabelSelected: {
    color: COLORS.textPrimary,
  },
  extraSection: {
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  roomsInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: wp(4),
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  citySection: {
    marginTop: hp(1),
  },
  cityDirectionRow: {
    flexDirection: "row",
    gap: wp(2),
    marginBottom: hp(0.5),
  },
  cityDirectionColumn: {
    flex: 1,
  },
  columnLabel: {
    marginBottom: hp(0.8),
  },
  districtSection: {
    marginTop: hp(1.5),
  },
  sectionLabel: {
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
    backgroundColor: COLORS.white,
  },
  fieldText: {
    flex: 1,
    fontSize: wp(4),
    color: COLORS.textPrimary,
  },
});
