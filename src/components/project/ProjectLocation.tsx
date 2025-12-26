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

export interface ProjectLocationProps {
  project: ProjectProperty;
}

/**
 * Project location map component
 */
const ProjectLocation = memo<ProjectLocationProps>(({ project }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Nearby Landmarks</Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: project.lat,
            longitude: project.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{ latitude: project.lat, longitude: project.lng }}
            pinColor="#0ab739"
          />
          <Circle
            center={{ latitude: project.lat, longitude: project.lng }}
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
    backgroundColor: "#0ab739",
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
});

export default ProjectLocation;
