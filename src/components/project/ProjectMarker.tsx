import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import type { ProjectProperty } from "../../types/property";
import { useLocalization } from "../../hooks/useLocalization";

export interface ProjectMarkerProps {
  project: ProjectProperty;
}

/**
 * Format price string that may contain K or M to translated version
 */
const translatePriceString = (priceStr: string, t: (key: string) => string): string => {
  if (!priceStr) return priceStr;
  
  // Replace K with translated thousand
  let translated = priceStr.replace(/\s*K\b/g, ` ${t("listings.thousand")}`);
  // Replace M with translated million
  translated = translated.replace(/\s*M\b/g, ` ${t("listings.million")}`);
  
  return translated;
};

/**
 * Simple project marker component for map
 * No selection logic - just displays project tag
 */
const ProjectMarker = memo<ProjectMarkerProps>(({ project }) => {
  const { t, isRTL } = useLocalization();
  
  // Validate project exists
  if (!project) {
    return null;
  }

  // Use custom color if available, otherwise default purple
  const markerColor = project.markerColor || COLORS.markerProject || "#8b5cf6";

  // Display project name or price if available
  let displayText = project.projectName || project.price || t("listings.project");
  
  // If it's a price string, translate K and M
  if (project.price && !project.projectName) {
    displayText = translatePriceString(displayText, t);
  }

  // Ensure displayText is a string
  const safeDisplayText = typeof displayText === "string" ? displayText : t("listings.project");

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      tagText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  return (
    <View style={styles.markerContainer}>
      <View style={[styles.tagBubble, { backgroundColor: markerColor }]}>
        <Text style={[styles.tagText, rtlStyles.tagText]} numberOfLines={1}>
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
