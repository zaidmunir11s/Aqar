import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { View, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MapView, { Marker } from "react-native-maps";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components";
import { COLORS, RIYADH_REGION } from "@/constants";
import { useLocalization } from "@/hooks/useLocalization";
import { openInGoogleMaps, getPropertyById } from "@/utils";
import type { Property } from "@/types/property";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  propertyId?: number;
  latitude?: number;
  longitude?: number;
}

const isValidCoordinate = (value: number | undefined | null): boolean =>
  typeof value === "number" &&
  !isNaN(value) &&
  isFinite(value) &&
  value >= -90 &&
  value <= 90;

const isValidLongitude = (value: number | undefined | null): boolean =>
  typeof value === "number" &&
  !isNaN(value) &&
  isFinite(value) &&
  value >= -180 &&
  value <= 180;

/** Custom property marker: Entypo "home" on solid green circle with semi-transparent green halo */
function PropertyLocationMarker() {
  return (
    <View style={markerStyles.outerHalo}>
      <View style={markerStyles.innerCircle}>
        <Entypo name="home" size={wp(5)} color="#fff" />
      </View>
    </View>
  );
}

const markerStyles = StyleSheet.create({
  outerHalo: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: "rgba(14, 133, 106, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function NearbyServicesScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;
  const { propertyId, latitude: paramLatitude, longitude: paramLongitude } = params;
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocalization();

  const [isSatelliteMode, setIsSatelliteMode] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, [])
  );

  const property = useMemo<Property | undefined>(() => {
    if (!propertyId) return undefined;
    return getPropertyById(propertyId);
  }, [propertyId]);

  const hasParamCoords =
    isValidCoordinate(paramLatitude) &&
    isValidLongitude(paramLongitude);

  const hasValidPropertyCoords =
    property &&
    isValidCoordinate(property.lat) &&
    isValidLongitude(property.lng);

  const latitude = hasParamCoords ? paramLatitude! : hasValidPropertyCoords ? property!.lat : RIYADH_REGION.latitude;
  const longitude = hasParamCoords ? paramLongitude! : hasValidPropertyCoords ? property!.lng : RIYADH_REGION.longitude;

  const initialRegion = useMemo(
    () => ({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
    [latitude, longitude]
  );

  useEffect(() => {
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      400
    );
  }, [latitude, longitude]);

  const satelliteFabStyle = useMemo(
    () => [
      styles.satelliteButton,
      {
        bottom: Math.max(hp(6), insets.bottom + hp(2)),
      },
      isRTL ? styles.satelliteFabRTL : styles.satelliteFabLTR,
    ],
    [isRTL, insets.bottom]
  );

  const handleBackPress = () => navigation.goBack();
  const handleToggleSatellite = () => setIsSatelliteMode((prev) => !prev);
  const handleMarkerPress = () => openInGoogleMaps(latitude, longitude);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.nearbyServices")}
        onBackPress={handleBackPress}
        backButtonColor={COLORS.backButton}
      />
      <View style={styles.mapContainer}>
        {isScreenFocused ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            mapType={isSatelliteMode ? "satellite" : "standard"}
            provider={Platform.OS === "android" ? "google" : undefined}
            showsUserLocation={false}
            showsMyLocationButton={false}
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={true}
            liteMode={false}
            rotateEnabled={false}
          >
            <Marker
              coordinate={{ latitude, longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={handleMarkerPress}
            >
              <PropertyLocationMarker />
            </Marker>
          </MapView>
        ) : (
          <View style={[styles.map, styles.mapPlaceholder]} />
        )}
        <TouchableOpacity style={satelliteFabStyle} onPress={handleToggleSatellite} activeOpacity={0.85}>
          <MaterialIcons
            name="satellite-alt"
            size={wp(6.5)}
            color={isSatelliteMode ? COLORS.primary : "#617381"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    backgroundColor: "#e5e7eb",
  },
  satelliteButton: {
    position: "absolute",
    backgroundColor: "#fff",
    padding: wp(3),
    borderRadius: wp(7.5),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  satelliteFabLTR: {
    left: wp(4),
  },
  satelliteFabRTL: {
    right: wp(4),
  },
});
