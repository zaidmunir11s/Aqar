import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import type { ProjectProperty } from "../../types/property";

export interface ProjectMarkerProps {
  project: ProjectProperty;
}

/**
 * Simple project marker component for map
 * No selection logic - just displays project tag
 */
const ProjectMarker = memo<ProjectMarkerProps>(({ project }) => {
  // Use custom color if available, otherwise default purple
  const markerColor = project.markerColor || COLORS.markerProject;

  // Display project name or price if available
  const displayText = project.projectName || project.price || "Project";

  return (
    <View style={styles.markerContainer}>
      <View style={[styles.tagBubble, { backgroundColor: markerColor }]}>
        <Text style={styles.tagText} numberOfLines={1}>
          {displayText}
        </Text>
      </View>
      <View style={[styles.pointer, { borderTopColor: markerColor }]} />
    </View>
  );
});

ProjectMarker.displayName = "ProjectMarker";

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
  },
  tagBubble: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.6),
    borderRadius: wp(1),
    minWidth: wp(12),
    maxWidth: wp(20),
    alignItems: "center",
    justifyContent: "center",
  },
  tagText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: wp(3),
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: wp(1.5),
    borderRightWidth: wp(1.5),
    borderTopWidth: wp(1.5),
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -1,
  },
});

export default ProjectMarker;
