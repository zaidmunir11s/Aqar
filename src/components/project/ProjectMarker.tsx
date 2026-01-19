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
  // Validate project exists
  if (!project) {
    return null;
  }

  // Use custom color if available, otherwise default purple
  const markerColor = project.markerColor || COLORS.markerProject || "#8b5cf6";

  // Display project name or price if available
  const displayText = project.projectName || project.price || "Project";

  // Ensure displayText is a string
  const safeDisplayText = typeof displayText === "string" ? displayText : "Project";

  return (
    <View style={styles.markerContainer}>
      <View style={[styles.tagBubble, { backgroundColor: markerColor }]}>
        <Text style={styles.tagText} numberOfLines={1}>
          {safeDisplayText}
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
    justifyContent: "center",
  },
  tagBubble: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.6),
    borderRadius: wp(1),
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
