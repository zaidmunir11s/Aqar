import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface FeatureIconConfig {
  library: "Ionicons" | "MaterialCommunityIcons" | "FontAwesome5";
  name: string;
  color: string;
  backgroundColor: string;
}

/**
 * Get icon for feature based on feature name
 */
const getFeatureIcon = (featureName: string): FeatureIconConfig => {
  const lowerName = featureName.toLowerCase();
  if (lowerName.includes("location") || lowerName.includes("special")) {
    return {
      library: "Ionicons",
      name: "location",
      color: "#6b7280",
      backgroundColor: "#e9efef",
    };
  } else if (lowerName.includes("parking")) {
    return {
      library: "Ionicons",
      name: "car",
      color: "#6b7280",
      backgroundColor: "#e9efef",
    };
  } else if (lowerName.includes("security")) {
    return {
      library: "MaterialCommunityIcons",
      name: "shield-check",
      color: "#6b7280",
      backgroundColor: "#e9efef",
    };
  } else if (lowerName.includes("garden") || lowerName.includes("green")) {
    return {
      library: "MaterialCommunityIcons",
      name: "tree",
      color: "#6b7280",
      backgroundColor: "#e9efef",
    };
  } else if (lowerName.includes("pool") || lowerName.includes("swimming")) {
    return {
      library: "MaterialCommunityIcons",
      name: "pool",
      color: "#6b7280",
      backgroundColor: "#e9efef",
    };
  } else if (lowerName.includes("gym") || lowerName.includes("fitness")) {
    return {
      library: "MaterialCommunityIcons",
      name: "dumbbell",
      color: "#6b7280",
      backgroundColor: "#e9efef",
    };
  } else if (lowerName.includes("kids") || lowerName.includes("playground")) {
    return {
      library: "MaterialCommunityIcons",
      name: "toy-brick",
      color: "#6b7280",
      backgroundColor: "#e9efef",
    };
  } else if (lowerName.includes("design") || lowerName.includes("modern")) {
    return {
      library: "MaterialCommunityIcons",
      name: "palette",
      color: "#6b7280",
      backgroundColor: "#e9efef",
    };
  } else if (lowerName.includes("luxury")) {
    return {
      library: "MaterialCommunityIcons",
      name: "crown",
      color: "#6b7280",
      backgroundColor: "#e9efef",
    };
  } else if (lowerName.includes("prime")) {
    return {
      library: "Ionicons",
      name: "star",
      color: "#6b7280",
      backgroundColor: "#e9efef",
    };
  } else if (lowerName.includes("central")) {
    return {
      library: "Ionicons",
      name: "location",
      color: "#6b7280",
      backgroundColor: "#e9efef",
    };
  }
  // Default icon
  return {
    library: "Ionicons",
    name: "checkmark-circle",
    color: "#6b7280",
    backgroundColor: "#e9efef",
  };
};

export interface ProjectFeaturesProps {
  features?: string[];
}

/**
 * Project features component
 */
const ProjectFeatures = memo<ProjectFeaturesProps>(({ features = [] }) => {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Project Features</Text>
      <View style={styles.featuresRow}>
        {features.map((feature, index) => {
          const iconConfig = getFeatureIcon(feature);
          return (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                {iconConfig.library === "Ionicons" && (
                  <Ionicons
                    name={iconConfig.name as any}
                    size={wp(5)}
                    color={iconConfig.color}
                  />
                )}
                {iconConfig.library === "MaterialCommunityIcons" && (
                  <MaterialCommunityIcons
                    name={iconConfig.name as any}
                    size={wp(5)}
                    color={iconConfig.color}
                  />
                )}
                {iconConfig.library === "FontAwesome5" && (
                  <FontAwesome5
                    name={iconConfig.name as any}
                    size={wp(5)}
                    color={iconConfig.color}
                  />
                )}
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

ProjectFeatures.displayName = "ProjectFeatures";

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
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: wp(4),
    marginBottom: hp(1.5),
  },
  featureIconBox: {
    width: wp(10),
    height: wp(10),
    backgroundColor: "#fff",
    borderRadius: wp(2),
    borderWidth: 1.5,
    borderColor: "#e4e3e8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp(2.5),
  },
  featureText: {
    fontSize: wp(3.8),
    color: "#374151",
    fontWeight: "400",
  },
});

export default ProjectFeatures;
