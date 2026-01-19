import React, { memo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import MapView, { Marker } from "react-native-maps";
import type { Property } from "../../types/property";
import { COLORS, RIYADH_REGION } from "../../constants";
  
export interface PropertyLocationProps {
  property: Property;
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

/**
 * Property location map component
 */
const PropertyLocation = memo<PropertyLocationProps>(({ property }) => {
  // Validate coordinates and use fallback if invalid
  const isValidLat = isValidCoordinate(property.lat);
  const isValidLng = isValidLongitude(property.lng);
  const hasValidCoords = isValidLat && isValidLng;

  // Use fallback coordinates (Riyadh center) if property coordinates are invalid
  const latitude = hasValidCoords ? property.lat : RIYADH_REGION.latitude;
  const longitude = hasValidCoords ? property.lng : RIYADH_REGION.longitude;

  // Don't render map if coordinates are completely invalid
  if (!hasValidCoords) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.mapWrapper}>
          <View style={styles.mapContainer}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Location data unavailable</Text>
            </View>
          </View>
        </View>
        <View style={styles.locationAlert}>
          <Ionicons name="information-circle" size={wp(5)} color="#3b82f6" />
          <Text style={styles.locationAlertText}>
            Location on the map with the location according to the title deed:
            Please match the location on the map with the location
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Location</Text>
      <View style={styles.mapWrapper}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            provider={Platform.OS === "android" ? "google" : undefined}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude,
                longitude,
              }}
              pinColor={COLORS.PinColor}
            />
          </MapView>
        </View>
      </View>
      <View style={styles.locationAlert}>
        <Ionicons name="information-circle" size={wp(5)} color="#3b82f6" />
        <Text style={styles.locationAlertText}>
          Location on the map with the location according to the title deed:
          Please match the location on the map with the location
        </Text>
      </View>
    </View>
  );
});

PropertyLocation.displayName = "PropertyLocation";

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#ebf1f1",
    padding: wp(4),
    paddingTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hp(2),
  },
  mapWrapper: {
    backgroundColor: "#fff",
    borderRadius: wp(2),
    overflow: "hidden",
    marginBottom: hp(2),
    borderWidth: 2,
    borderColor: "#dadee8",
  },
  mapContainer: {
    height: hp(25),
    borderRadius: wp(2),
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  locationAlert: {
    flexDirection: "row",
    backgroundColor: "#ebf1f1",
    padding: wp(3),
    borderRadius: wp(2),
    borderWidth: 2,
    borderColor: "#dadee8",
  },
  locationAlertText: {
    flex: 1,
    fontSize: wp(3),
    color: "#374151",
    marginLeft: wp(2),
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  errorText: {
    fontSize: wp(3.5),
    color: "#6b7280",
    textAlign: "center",
  },
});

export default PropertyLocation;
