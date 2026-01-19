import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import MapView, { Marker, Circle } from "react-native-maps";
import type { ProjectProperty } from "../../types/property";
import { COLORS, RIYADH_REGION } from "../../constants";
export interface ProjectLocationProps {
  project: ProjectProperty;
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
 * Project location map component
 */
const ProjectLocation = memo<ProjectLocationProps>(({ project }) => {
  // Validate coordinates and use fallback if invalid
  const isValidLat = isValidCoordinate(project.lat);
  const isValidLng = isValidLongitude(project.lng);
  const hasValidCoords = isValidLat && isValidLng;

  // Use fallback coordinates (Riyadh center) if project coordinates are invalid
  const latitude = hasValidCoords ? project.lat : RIYADH_REGION.latitude;
  const longitude = hasValidCoords ? project.lng : RIYADH_REGION.longitude;

  // Don't render map if coordinates are completely invalid
  if (!hasValidCoords) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearby Landmarks</Text>
        <View style={styles.mapContainer}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Location data unavailable</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Nearby Landmarks</Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          provider={Platform.OS === "android" ? "google" : undefined}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            pinColor={COLORS.PinColor}  
          />
          <Circle
            center={{ latitude, longitude }}
            radius={1000}
            strokeColor="#0b7f33"
            fillColor="rgba(16, 185, 129, 0.2)"
            strokeWidth={2}
          />
        </MapView>
        <TouchableOpacity style={styles.getLocationButton}>
          <Ionicons name="location" size={wp(5)} color="#fff" />
          <Text style={styles.getLocationText}>Get the location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

ProjectLocation.displayName = "ProjectLocation";

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    padding: wp(4),
    borderTopWidth: 1,
    borderTopColor: "#dcdcde",
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hp(2),
  },
  mapContainer: {
    height: hp(55),
    borderRadius: wp(1.5),
    borderWidth: 1.5,
    borderColor: "#e4e3e8",
    overflow: "hidden",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  getLocationButton: {
    position: "absolute",
    bottom: hp(2),
    alignSelf: "center",
    backgroundColor: COLORS.getLocation,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 8 },
    }),
  },
  getLocationText: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "600",
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

export default ProjectLocation;
