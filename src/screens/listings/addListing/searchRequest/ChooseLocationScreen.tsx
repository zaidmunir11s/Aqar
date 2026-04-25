import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MapView, { Region } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  ScreenHeader,
  ListingFooter,
  ToggleSwitch,
} from "../../../../components";
import { COLORS } from "@/constants";
import { useLocalization } from "../../../../hooks/useLocalization";
import { useLocation } from "../../../../hooks";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  orderFormData?: any;
}

// Helper functions to validate coordinates
const isValidCoordinate = (value: number | undefined | null): boolean => {
  return (
    typeof value === "number" &&
    !isNaN(value) &&
    isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
};

const isValidLongitude = (value: number | undefined | null): boolean => {
  return (
    typeof value === "number" &&
    !isNaN(value) &&
    isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
};

export default function ChooseLocationScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;
  const mapRef = useRef<MapView>(null);
  const { t, isRTL } = useLocalization();
  const { getCurrentLocation } = useLocation();

  const DEFAULT_REGION: Region = useMemo(
    () => ({
      // Same safe default as main listings map (Riyadh)
      latitude: 24.7136,
      longitude: 46.6753,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    }),
    [],
  );

  const initialSelectedLocation =
    params.orderFormData?.selectedLocation &&
    isValidCoordinate(params.orderFormData.selectedLocation.latitude) &&
    isValidLongitude(params.orderFormData.selectedLocation.longitude)
      ? {
          latitude: params.orderFormData.selectedLocation.latitude,
          longitude: params.orderFormData.selectedLocation.longitude,
        }
      : null;

  // Selected location tracks map center and starts empty unless passed from previous step.
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialSelectedLocation);
  const [mapInitialRegion, setMapInitialRegion] = useState<Region | null>(() =>
    initialSelectedLocation
      ? {
          latitude: initialSelectedLocation.latitude,
          longitude: initialSelectedLocation.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }
      : null,
  );
  const [isResolvingInitialLocation, setIsResolvingInitialLocation] = useState(
    !initialSelectedLocation,
  );

  // Toggle states: true = ON (thumb left), false = OFF (thumb right)
  const [onlyAdsWithPhoto, setOnlyAdsWithPhoto] = useState(false);
  const [assistFromPartners, setAssistFromPartners] = useState(true);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNextPress = useCallback(() => {
    if (!selectedLocation) return;
    navigation.navigate("Description", {
      selectedLocation,
      onlyAdsWithPhoto,
      assistFromPartners,
      orderFormData: params.orderFormData,
    });
  }, [
    navigation,
    selectedLocation,
    onlyAdsWithPhoto,
    assistFromPartners,
    params.orderFormData,
  ]);

  useEffect(() => {
    if (mapInitialRegion) return;
    let cancelled = false;

    (async () => {
      try {
        const result = await getCurrentLocation();
        if (cancelled) return;
        if (
          result.region &&
          isValidCoordinate(result.region.latitude) &&
          isValidLongitude(result.region.longitude) &&
          isValidCoordinate(result.region.latitudeDelta) &&
          isValidLongitude(result.region.longitudeDelta) &&
          result.region.latitudeDelta > 0 &&
          result.region.longitudeDelta > 0
        ) {
          setMapInitialRegion(result.region);
          setSelectedLocation({
            latitude: result.region.latitude,
            longitude: result.region.longitude,
          });
          // Avoid a jump: animate if map is already rendered.
          try {
            mapRef.current?.animateToRegion(result.region, 700);
          } catch {
            // ignore
          }
          return;
        }
      } finally {
        if (!cancelled) {
          setIsResolvingInitialLocation(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getCurrentLocation, mapInitialRegion]);

  // RTL-aware styles (only apply RTL-specific changes, preserve LTR styling)
  const rtlStyles = useMemo(
    () => ({
      sectionTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      toggleRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      toggleLabel: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        marginRight: isRTL ? 0 : wp(3),
        marginLeft: isRTL ? wp(3) : 0,
      },
    }),
    [isRTL],
  );

  // Handle map region change (when user pans/zooms)
  // The marker is fixed at center visually, but we track the center coordinate
  // This ensures we always know the exact location the user is pointing at
  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    // Validate region before setting state
    if (
      isValidCoordinate(newRegion.latitude) &&
      isValidLongitude(newRegion.longitude) &&
      isValidCoordinate(newRegion.latitudeDelta) &&
      isValidLongitude(newRegion.longitudeDelta) &&
      newRegion.latitudeDelta > 0 &&
      newRegion.longitudeDelta > 0
    ) {
      // Update selected location to match the center of the map
      // This is the location that will be used for property search
      setSelectedLocation({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      });
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <ScreenHeader
        title={t("listings.newOrder")}
        onBackPress={handleBackPress}
        fontWeightBold
        fontSize={wp(4.5)}
      />

      <View style={styles.content}>
        {/* Choose Location Title */}
        <Text style={[styles.sectionTitle, rtlStyles.sectionTitle]}>
          {t("listings.chooseLocation")}
        </Text>

        {/* Interactive Map */}
        <View style={styles.mapContainer}>
          {mapInitialRegion ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={mapInitialRegion}
              onRegionChangeComplete={handleRegionChangeComplete}
              showsUserLocation={true}
              showsMyLocationButton={false}
              showsCompass={false}
              toolbarEnabled={false}
              mapType="standard"
              scrollEnabled={true}
              zoomEnabled={true}
              pitchEnabled={false}
              rotateEnabled={false}
            />
          ) : (
            <View style={[styles.map, styles.mapLoadingPlaceholder]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
          {isResolvingInitialLocation ? (
            <View style={styles.mapResolvingBadge} pointerEvents="none">
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.mapResolvingText}>{t("common.loading")}</Text>
            </View>
          ) : null}
          {/* Fixed Center Marker - Always at center of viewport */}
          <View style={styles.centerMarkerContainer} pointerEvents="none">
            <MaterialIcons
              name="my-location"
              size={wp(8)}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* Toggle Options */}
        <View style={styles.togglesContainer}>
          <View style={[styles.toggleRow, rtlStyles.toggleRow]}>
            <Text style={[styles.toggleLabel, rtlStyles.toggleLabel]}>
              {t("listings.onlyAdsWithPhoto")}
            </Text>
            <ToggleSwitch
              value={onlyAdsWithPhoto}
              onValueChange={setOnlyAdsWithPhoto}
            />
          </View>

          <View style={[styles.toggleRow, rtlStyles.toggleRow]}>
            <Text style={[styles.toggleLabel, rtlStyles.toggleLabel]}>
              {t("listings.assistFromPartners")}
            </Text>
            <ToggleSwitch
              value={assistFromPartners}
              onValueChange={setAssistFromPartners}
            />
          </View>
        </View>
      </View>

      {/* Footer */}
      <ListingFooter
        currentStep={2}
        totalSteps={3}
        onBackPress={handleBackPress}
        onNextPress={handleNextPress}
        nextDisabled={!selectedLocation}
        showBack={true}
        showNext={true}
        backText={t("common.back")}
        nextText={t("common.next")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.3),
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: hp(2),
  },
  mapContainer: {
    width: "100%",
    height: hp(50),
    borderRadius: wp(2),
    overflow: "hidden",
    marginBottom: hp(3),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    // backgroundColor: COLORS.white,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  // (deduped) mapLoadingPlaceholder is defined below with flex: 1
  mapResolvingBadge: {
    position: "absolute",
    top: hp(1),
    left: wp(3),
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(3),
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  mapResolvingText: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  mapLoadingPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  centerMarkerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  togglesContainer: {
    // marginTop: hp(1),
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
    // paddingVertical: hp(1.5),
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.border,
  },
  toggleLabel: {
    flex: 1,
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginRight: wp(3),
  },
});
