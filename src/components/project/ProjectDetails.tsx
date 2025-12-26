import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import type { ProjectDetails as ProjectDetailsType } from "../../types/property";

export interface ProjectDetailsProps {
  projectDetails: ProjectDetailsType;
  isFirstSection?: boolean;
}

/**
 * Project details component showing unit count, areas, and prices
 */
const ProjectDetails = memo<ProjectDetailsProps>(
  ({ projectDetails, isFirstSection = false }) => {
    return (
      <View style={[styles.section, isFirstSection && styles.firstSection]}>
        <Text style={styles.sectionTitle}>Details of available units</Text>

        <View style={styles.detailItem}>
          <View style={styles.detailIconContainer}>
            <MaterialCommunityIcons
              name="office-building"
              size={wp(6)}
              color="#6b7280"
            />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Unit number</Text>
            <Text style={styles.detailValue}>
              {projectDetails.unitCount} Unit
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIconContainer}>
            <MaterialCommunityIcons
              name="floor-plan"
              size={wp(6)}
              color="#6b7280"
            />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Areas</Text>
            <Text style={styles.detailValue}>
              From {projectDetails.minArea} m2 to {projectDetails.maxArea} m2
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIconContainer}>
            <MaterialCommunityIcons
              name="cash-multiple"
              size={wp(6)}
              color="#6b7280"
            />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>prices</Text>
            <Text style={styles.detailValue}>
              From {projectDetails.minPrice.toLocaleString()} SAR to{" "}
              {projectDetails.maxPrice.toLocaleString()} SAR
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

ProjectDetails.displayName = "ProjectDetails";

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
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp(2.5),
  },
  detailIconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp(3),
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: wp(4.5),
    fontWeight: "400",
    color: "#9ca3af",
    marginBottom: hp(0.3),
  },
  detailValue: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#111827",
  },
  firstSection: {
    borderTopWidth: 0,
  },
});

export default ProjectDetails;
