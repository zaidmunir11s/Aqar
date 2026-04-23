import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MapView, { Region } from "react-native-maps";
import { Ionicons, MaterialIcons, FontAwesome6 } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  ScreenHeader,
  ListingFooter,
  WheelPickerModal,
  CancelModal,
} from "../../../../components";
import { COLORS, RIYADH_REGION, CITY_REGIONS } from "@/constants";
import { useLocalization } from "../../../../hooks/useLocalization";
import { useLocation } from "../../../../hooks";
import { STREET_DIRECTION_OPTIONS } from "@/constants/orderFormOptions";
import { translateCityName } from "@/utils/cityTranslation";
import { navigateToMapScreen } from "../../../../utils";
import {
  DistrictField,
  LocationPickerBottomSheet,
} from "../../../../components/map";

type NavigationProp = NativeStackNavigationProp<any>;

type AttachmentItem = {
  id: string;
  uri: string;
  mediaType?: "photo" | "video" | "unknown";
  note?: string;
};

type RouteParams = {
  selectedCategory?: string;
  attachments?: AttachmentItem[];
  virtualTourLink?: string;
};

const FOOTER_CONTENT_HEIGHT = hp(8.5);
const ERROR_GAP_ABOVE_FOOTER = hp(0.8);
const ACCURATE_LOCATION_ZOOM_THRESHOLD = 0.03;
const REVERSE_GEOCODE_DEBOUNCE_MS = 450;

/** Last map region for this flow; keeps position when returning without resetting to a default city. */
let marketingRequestChooseLocationSavedRegion: Region | null = null;

function isValidMapRegion(r: Region | null | undefined): r is Region {
  if (!r) return false;
  return (
    typeof r.latitude === "number" &&
    !Number.isNaN(r.latitude) &&
    typeof r.longitude === "number" &&
    !Number.isNaN(r.longitude) &&
    typeof r.latitudeDelta === "number" &&
    r.latitudeDelta > 0 &&
    typeof r.longitudeDelta === "number" &&
    r.longitudeDelta > 0
  );
}

export default function MarketingRequestChooseLocationScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const params = (route.params ?? {}) as RouteParams;
  const { t, isRTL } = useLocalization();
  const insets = useSafeAreaInsets();
  const { getCurrentLocation } = useLocation();
  const mapRef = useRef<MapView>(null);
  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isSatellite, setIsSatellite] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(() =>
    marketingRequestChooseLocationSavedRegion && isValidMapRegion(marketingRequestChooseLocationSavedRegion)
      ? marketingRequestChooseLocationSavedRegion
      : null
  );
  const [geocodedLabel, setGeocodedLabel] = useState("");
  const [manualLocationLabel, setManualLocationLabel] = useState<string | null>(null);
  const [isOtherLocationModalVisible, setIsOtherLocationModalVisible] = useState(false);
  const [isCityPickerVisible, setIsCityPickerVisible] = useState(false);
  const [isDirectionPickerVisible, setIsDirectionPickerVisible] = useState(false);
  const [isDistrictPickerVisible, setIsDistrictPickerVisible] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDirectionKey, setSelectedDirectionKey] = useState<string | null>(null);
  const [selectedDistrictKey, setSelectedDistrictKey] = useState<string | null>(null);
  const [citySearchText, setCitySearchText] = useState("");
  const [districtSearchText, setDistrictSearchText] = useState("");
  const footerOffset = useRef(
    new Animated.Value(FOOTER_CONTENT_HEIGHT + ERROR_GAP_ABOVE_FOOTER + 0)
  ).current;

  useEffect(() => {
    const total = FOOTER_CONTENT_HEIGHT + ERROR_GAP_ABOVE_FOOTER + insets.bottom;
    footerOffset.setValue(total);
  }, [footerOffset, insets.bottom]);

  const rtlStyles = useMemo(
    () => ({
      locationBar: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      /** Pin + city label: icon on start side, correct margin toward “Other location” */
      locationLeftCluster: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        marginRight: isRTL ? 0 : wp(3),
        marginLeft: isRTL ? wp(3) : 0,
      },
      locationText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      /** Link sits on the opposite end of the bar; align text toward the map center */
      otherLocationText: {
        textAlign: (isRTL ? "left" : "right") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      mapActionsEdge: isRTL ? { left: wp(2.8) } : { right: wp(2.8) },
      errorContainer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      errorText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      modalLabel: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      modalFieldRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      modalFieldText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      modalActionText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      /** RTL: confirm first in tree + flex-start keeps primary on the visual start (right) */
      modalActionsAlign: {
        justifyContent: (isRTL ? "flex-start" : "flex-end") as "flex-start" | "flex-end",
      },
    }),
    [isRTL]
  );

  const locationLabel = useMemo(() => {
    if (manualLocationLabel) return manualLocationLabel;
    if (geocodedLabel.trim().length > 0) return geocodedLabel;
    return t("listings.mapAddressLoading");
  }, [manualLocationLabel, geocodedLabel, t]);

  const runReverseGeocode = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        const r = results[0];
        if (!r) {
          setGeocodedLabel(t("listings.mapAddressUnavailable"));
          return;
        }
        const area =
          (r.district && String(r.district).trim()) ||
          (r.name && String(r.name).trim()) ||
          (r.subregion && String(r.subregion).trim()) ||
          (r.street && String(r.street).trim()) ||
          "";
        const city =
          (r.city && String(r.city).trim()) ||
          (r.region && String(r.region).trim()) ||
          "";
        const parts = [area, city].filter((p) => p.length > 0);
        setGeocodedLabel(parts.length > 0 ? parts.join(", ") : t("listings.mapAddressUnavailable"));
      } catch {
        setGeocodedLabel(t("listings.mapAddressUnavailable"));
      }
    },
    [t]
  );

  const cityOptions = useMemo(() => Object.keys(CITY_REGIONS), []);
  const translatedCityOptions = useMemo(
    () => cityOptions.map((city) => translateCityName(city, t)),
    [cityOptions, t]
  );
  const displayCity = useMemo(
    () => (selectedCity ? translateCityName(selectedCity, t) : ""),
    [selectedCity, t]
  );

  const directionOptionKeys = useMemo(() => ["All", ...STREET_DIRECTION_OPTIONS.slice(1)], []);
  const directionOptions = useMemo(
    () =>
      directionOptionKeys.map((opt) => {
        if (opt === "All") return t("listings.allDirections");
        if (opt === "North") return t("listings.address.north");
        if (opt === "East") return t("listings.address.east");
        if (opt === "West") return t("listings.address.west");
        if (opt === "South") return t("listings.address.south");
        if (opt === "Northeast") return t("listings.address.northeast");
        if (opt === "Southeast") return t("listings.address.southeast");
        if (opt === "Southwest") return t("listings.address.southwest");
        if (opt === "Northwest") return t("listings.address.northwest");
        if (opt === "3 Streets") return t("listings.threeStreets");
        if (opt === "4 Streets") return t("listings.fourStreets");
        return opt;
      }),
    [directionOptionKeys, t]
  );
  const directionMap = useMemo(
    () =>
      directionOptionKeys.reduce<Record<string, string>>((acc, key, index) => {
        acc[key] = directionOptions[index];
        return acc;
      }, {}),
    [directionOptionKeys, directionOptions]
  );
  const displayDirection = selectedDirectionKey ? directionMap[selectedDirectionKey] : "";

  const districtOptionsByCity = useMemo<Record<string, string[]>>(
    () => ({
      Riyadh: [
        "districtAlOlaya",
        "districtAlMalaz",
        "districtAlNaseem",
        "districtAlMurjan",
        "districtAlSuwaidi",
        "districtAlNarjis",
        "districtAlRawdah",
        "districtAlWurud",
      ],
    }),
    []
  );
  const districtKeyOptions = useMemo(() => {
    if (!selectedCity) return [];
    return districtOptionsByCity[selectedCity] ?? districtOptionsByCity.Riyadh;
  }, [districtOptionsByCity, selectedCity]);
  const districtOptions = useMemo(
    () => districtKeyOptions.map((key) => t(`listings.${key}`)),
    [districtKeyOptions, t]
  );
  const districtMap = useMemo(
    () =>
      districtKeyOptions.reduce<Record<string, string>>((acc, key, index) => {
        acc[key] = districtOptions[index];
        return acc;
      }, {}),
    [districtKeyOptions, districtOptions]
  );
  const displayDistrict = selectedDistrictKey ? districtMap[selectedDistrictKey] : "";
  const filteredTranslatedCityOptions = useMemo(() => {
    const q = citySearchText.trim().toLowerCase();
    if (!q) return translatedCityOptions;
    return translatedCityOptions.filter((city) => city.toLowerCase().includes(q));
  }, [citySearchText, translatedCityOptions]);

  const filteredDistrictOptions = useMemo(() => {
    const q = districtSearchText.trim().toLowerCase();
    if (!q) return districtOptions;
    return districtOptions.filter((district) => district.toLowerCase().includes(q));
  }, [districtOptions, districtSearchText]);

  const isLocationAccurate = useMemo(
    () =>
      selectedRegion != null &&
      selectedRegion.latitudeDelta <= ACCURATE_LOCATION_ZOOM_THRESHOLD &&
      selectedRegion.longitudeDelta <= ACCURATE_LOCATION_ZOOM_THRESHOLD,
    [selectedRegion]
  );

  useEffect(() => {
    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
        geocodeTimeoutRef.current = null;
      }
    };
  }, []);

  const centerOnCurrentLocation = useCallback(async () => {
    const result = await getCurrentLocation();
    if (!result.region || !isValidMapRegion(result.region)) return;
    marketingRequestChooseLocationSavedRegion = result.region;
    setManualLocationLabel(null);
    setSelectedRegion(result.region);
    mapRef.current?.animateToRegion(result.region, 700);
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
      geocodeTimeoutRef.current = null;
    }
    void runReverseGeocode(result.region.latitude, result.region.longitude);
  }, [getCurrentLocation, runReverseGeocode]);

  useEffect(() => {
    if (marketingRequestChooseLocationSavedRegion !== null) return;
    (async () => {
      const result = await getCurrentLocation();
      if (result.region && isValidMapRegion(result.region)) {
        marketingRequestChooseLocationSavedRegion = result.region;
        setSelectedRegion(result.region);
        return;
      }
      marketingRequestChooseLocationSavedRegion = RIYADH_REGION;
      setSelectedRegion(RIYADH_REGION);
    })();
  }, [getCurrentLocation]);

  const handleRegionChangeComplete = useCallback(
    (newRegion: Region) => {
      if (!isValidMapRegion(newRegion)) return;
      marketingRequestChooseLocationSavedRegion = newRegion;
      setSelectedRegion(newRegion);
      setManualLocationLabel(null);
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
      geocodeTimeoutRef.current = setTimeout(() => {
        geocodeTimeoutRef.current = null;
        void runReverseGeocode(newRegion.latitude, newRegion.longitude);
      }, REVERSE_GEOCODE_DEBOUNCE_MS);
    },
    [runReverseGeocode]
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleClosePress = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const handleCancelBack = useCallback(() => {
    setShowCancelModal(false);
  }, []);

  const handleCancelYes = useCallback(() => {
    setShowCancelModal(false);
    navigateToMapScreen(navigation);
  }, [navigation]);

  const handleFooterNextPress = useCallback(() => {
    if (!selectedRegion || !isLocationAccurate) {
      setShowLocationError(true);
      setTimeout(() => setShowLocationError(false), 3000);
      return;
    }
    setShowLocationError(false);
    navigation.navigate("MarketingRequestPropertyDetails", {
      selectedCategory: params.selectedCategory,
      attachments: params.attachments ?? [],
      virtualTourLink: params.virtualTourLink ?? "",
      selectedLocation: selectedRegion,
      locationDisplayName: locationLabel,
      ...((params as any)?.deed ? { deed: (params as any).deed } : {}),
    });
  }, [
    isLocationAccurate,
    locationLabel,
    navigation,
    params.attachments,
    params.selectedCategory,
    params.virtualTourLink,
    selectedRegion,
  ]);

  const handleOtherLocationSelect = useCallback(() => {
    if (selectedCity) {
      const region = CITY_REGIONS[selectedCity];
      if (region && mapRef.current) {
        mapRef.current.animateToRegion(region, 700);
        setSelectedRegion(region);
      }
    }
    const nextLabel =
      displayDistrict && selectedCity ? `${displayDistrict}, ${selectedCity}` : selectedCity ?? "";
    setManualLocationLabel(nextLabel || null);
    setIsOtherLocationModalVisible(false);
  }, [displayDistrict, selectedCity]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.chooseLocation")}
        onBackPress={handleBackPress}
        showRightSide
        rightComponent={
          <TouchableOpacity
            onPress={handleClosePress}
            activeOpacity={0.7}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={wp(6)} color={COLORS.primary} />
          </TouchableOpacity>
        }
        titleFontWeight="600"
        fontSize={wp(5)}
      />

      <View style={styles.content}>
        <View style={styles.mapContainer}>
          {selectedRegion && isValidMapRegion(selectedRegion) ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={selectedRegion}
              onRegionChangeComplete={handleRegionChangeComplete}
              showsUserLocation={false}
              showsMyLocationButton={false}
              showsCompass={false}
              toolbarEnabled={false}
              mapType={isSatellite ? "satellite" : "standard"}
              pitchEnabled={false}
              rotateEnabled={false}
            />
          ) : (
            <View style={[styles.map, styles.mapLoadingPlaceholder]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.locationBar, rtlStyles.locationBar]}
            onPress={() => setIsOtherLocationModalVisible(true)}
          >
            <View style={[styles.locationLeft, rtlStyles.locationLeftCluster]}>
              <Ionicons name="location" size={wp(4.8)} color={COLORS.primary} />
              <Text style={[styles.locationText, rtlStyles.locationText]} numberOfLines={1}>
                {locationLabel}
              </Text>
            </View>
            <Text style={[styles.otherLocationText, rtlStyles.otherLocationText]}>
              {t("listings.otherLocation")}
            </Text>
          </TouchableOpacity>

          <View style={styles.centerMarkerContainer} pointerEvents="none">
            <MaterialIcons name="my-location" size={wp(8)} color={COLORS.primary} />
          </View>

          <View style={[styles.rightActions, rtlStyles.mapActionsEdge]}>
            <TouchableOpacity
              style={styles.actionFab}
              activeOpacity={0.8}
              onPress={() => setIsSatellite((prev) => !prev)}
            >
              <MaterialIcons
                name="satellite-alt"
                size={wp(6.5)}
                color={isSatellite ? "#0e856a" : "#617381"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionFab}
              activeOpacity={0.8}
              onPress={centerOnCurrentLocation}
            >
              <FontAwesome6 name="location-crosshairs" size={wp(6)} color="#617381" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showLocationError && (
        <Animated.View
          style={[
            styles.errorContainer,
            rtlStyles.errorContainer,
            {
              bottom: footerOffset,
            },
          ]}
        >
          <Ionicons name="information-circle" size={wp(5)} color={COLORS.error} />
          <Text style={[styles.errorText, rtlStyles.errorText]}>
            {t("listings.zoomInForAccurateLocation")}
          </Text>
        </Animated.View>
      )}

      <ListingFooter
        currentStep={3}
        totalSteps={5}
        onBackPress={handleBackPress}
        onNextPress={handleFooterNextPress}
        backText={t("common.back")}
        nextText={t("common.next")}
      />
      <CancelModal
        visible={showCancelModal}
        onBack={handleCancelBack}
        onConfirm={handleCancelYes}
      />

      <Modal
        visible={isOtherLocationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOtherLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsOtherLocationModalVisible(false)}
          />
          <View style={styles.otherLocationModalCard}>
            <Text style={[styles.modalLabel, rtlStyles.modalLabel]}>{t("listings.city")}</Text>
            <TouchableOpacity
              style={[styles.modalField, rtlStyles.modalFieldRow]}
              activeOpacity={0.8}
              onPress={() => setIsCityPickerVisible(true)}
            >
              <Text
                style={[
                  styles.modalFieldText,
                  rtlStyles.modalFieldText,
                  !selectedCity && styles.modalPlaceholderText,
                ]}
              >
                {displayCity || t("listings.selectCity")}
              </Text>
              <Ionicons name="chevron-down" size={wp(5)} color={COLORS.primary} />
            </TouchableOpacity>

            {selectedCity ? (
              <DistrictField
                label={t("listings.direction")}
                value={displayDirection}
                placeholder={t("listings.allDirections")}
                onPress={() => setIsDirectionPickerVisible(true)}
              />
            ) : null}
            <DistrictField
              label={t("listings.district")}
              value={displayDistrict}
              placeholder={t("listings.selectDistrict")}
              onPress={() => setIsDistrictPickerVisible(true)}
            />

            <View style={[styles.modalActions, rtlStyles.modalActionsAlign]}>
              {isRTL ? (
                <>
                  <TouchableOpacity activeOpacity={0.8} onPress={handleOtherLocationSelect}>
                    <Text style={[styles.modalSelectText, rtlStyles.modalActionText]}>
                      {t("common.confirm")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setIsOtherLocationModalVisible(false)}
                  >
                    <Text style={[styles.modalCancelText, rtlStyles.modalActionText]}>
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setIsOtherLocationModalVisible(false)}
                  >
                    <Text style={[styles.modalCancelText, rtlStyles.modalActionText]}>
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.8} onPress={handleOtherLocationSelect}>
                    <Text style={[styles.modalSelectText, rtlStyles.modalActionText]}>
                      {t("common.confirm")}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <LocationPickerBottomSheet
        visible={isCityPickerVisible}
        title={t("listings.city")}
        searchPlaceholder={t("listings.searchForCity")}
        searchValue={citySearchText}
        options={filteredTranslatedCityOptions}
        onSearchChange={setCitySearchText}
        onClose={() => setIsCityPickerVisible(false)}
        onSelect={(item) => {
          const originalCity =
            cityOptions.find((city) => translateCityName(city, t) === item) ?? item;
          setSelectedCity(originalCity);
          setSelectedDirectionKey("All");
          setSelectedDistrictKey(null);
          setCitySearchText("");
          setIsCityPickerVisible(false);
        }}
      />

      <WheelPickerModal
        visible={isDirectionPickerVisible}
        onClose={() => setIsDirectionPickerVisible(false)}
        onSelect={(translatedDirection) => {
          const selectedKey =
            directionOptionKeys.find((key) => directionMap[key] === translatedDirection) ?? "All";
          setSelectedDirectionKey(selectedKey);
          setSelectedDistrictKey(null);
        }}
        title={t("listings.direction")}
        options={directionOptions}
        initialValue={displayDirection || t("listings.allDirections")}
      />

      <LocationPickerBottomSheet
        visible={isDistrictPickerVisible}
        title={t("listings.district")}
        searchPlaceholder={t("common.search")}
        searchValue={districtSearchText}
        options={filteredDistrictOptions}
        onSearchChange={setDistrictSearchText}
        onClose={() => setIsDistrictPickerVisible(false)}
        onSelect={(item) => {
          const selectedKey =
            districtKeyOptions.find((key) => districtMap[key] === item) ?? null;
          setSelectedDistrictKey(selectedKey);
          setDistrictSearchText("");
          setIsDistrictPickerVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  closeButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  locationBar: {
    position: "absolute",
    top: hp(1.2),
    left: wp(4),
    right: wp(4),
    zIndex: 3,
    height: hp(6.6),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(3.5),
  },
  locationLeft: {
    alignItems: "center",
    flex: 1,
    gap: wp(1.8),
  },
  locationText: {
    flex: 1,
    fontSize: wp(4.2),
    color: COLORS.textPrimary,
  },
  otherLocationText: {
    fontSize: wp(4),
    color: "#0284c7",
    fontWeight: "500",
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapLoadingPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
  },
  centerMarkerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  rightActions: {
    position: "absolute",
    bottom: hp(2.2),
    gap: hp(1.4),
    zIndex: 3,
  },
  actionFab: {
    width: wp(13),
    height: wp(13),
    borderRadius: wp(7.5),
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    position: "absolute",
    left: wp(4),
    right: wp(4),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    backgroundColor: COLORS.bgRed,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: wp(2),
    gap: wp(2),
    zIndex: 10,
  },
  errorText: {
    fontSize: wp(3.8),
    color: COLORS.error,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(6),
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  otherLocationModalCard: {
    width: "100%",
    maxWidth: wp(78),
    backgroundColor: COLORS.white,
    borderRadius: wp(1.8),
    paddingHorizontal: wp(5),
    paddingTop: hp(2.4),
    paddingBottom: hp(1.8),
  },
  modalLabel: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    fontWeight: "500",
    marginBottom: hp(0.8),
  },
  modalField: {
    minHeight: hp(5),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2.1),
  },
  modalFieldText: {
    flex: 1,
    fontSize: wp(4),
    color: COLORS.textPrimary,
  },
  modalPlaceholderText: {
    color: COLORS.textTertiary,
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(7),
  },
  modalCancelText: {
    fontSize: wp(4),
    color: COLORS.textTertiary,
    fontWeight: "500",
  },
  modalSelectText: {
    fontSize: wp(4),
    color: COLORS.primary,
    fontWeight: "500",
  },
});
