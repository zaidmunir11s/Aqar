import React, { useState, useRef, useMemo } from "react";
import { View, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MapView, { Marker } from "react-native-maps";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader } from "../../components";
import { COLORS, RIYADH_REGION } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";
import { openInGoogleMaps } from "../../utils";
import { PROPERTY_DATA } from "../../data/propertyData";
import type { Property } from "../../types/property";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  propertyId: number;
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
  const { propertyId } = params;
  const mapRef = useRef<MapView>(null);
  const { t, isRTL } = useLocalization();

  const [isSatelliteMode, setIsSatelliteMode] = useState(false);

  const property = useMemo<Property | undefined>(
    () => PROPERTY_DATA.find((p) => p.id === propertyId),
    [propertyId]
  );

  const hasValidCoords =
    property &&
    isValidCoordinate(property.lat) &&
    isValidLongitude(property.lng);

  const latitude = hasValidCoords ? property!.lat : RIYADH_REGION.latitude;
  const longitude = hasValidCoords ? property!.lng : RIYADH_REGION.longitude;

  const initialRegion = useMemo(
    () => ({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
    [latitude, longitude]
  );

  const satelliteButtonPosition = useMemo(
    () => ({
      left: isRTL ? undefined : wp(4),
      right: isRTL ? wp(4) : undefined,
    }),
    [isRTL]
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
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          mapType={isSatelliteMode ? "satellite" : "standard"}
          provider={Platform.OS === "android" ? "google" : undefined}
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
        <TouchableOpacity
          style={[styles.satelliteButton, satelliteButtonPosition]}
          onPress={handleToggleSatellite}
        >
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
  satelliteButton: {
    position: "absolute",
    bottom: hp(4),
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
});
