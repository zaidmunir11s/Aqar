import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import type { ProjectDetails as ProjectDetailsType } from "../../types/property";
import { useLocalization } from "../../hooks/useLocalization";

export interface ProjectDetailsProps {
  projectDetails: ProjectDetailsType;
  isFirstSection?: boolean;
}

/**
 * Project details component showing unit count, areas, and prices
 */
const ProjectDetails = memo<ProjectDetailsProps>(
  ({ projectDetails, isFirstSection = false }) => {
    const { t, isRTL } = useLocalization();

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        sectionTitle: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        detailItem: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        detailIconContainer: {
          marginRight: isRTL ? 0 : wp(3),
          marginLeft: isRTL ? wp(3) : 0,
        },
        detailLabel: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        detailValue: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL],
    );

    return (
      <View style={[styles.section, isFirstSection && styles.firstSection]}>
        <Text style={[styles.sectionTitle, rtlStyles.sectionTitle]}>
          {t("projects.detailsOfAvailableUnits")}
        </Text>

        <View style={[styles.detailItem, rtlStyles.detailItem]}>
          <View
            style={[styles.detailIconContainer, rtlStyles.detailIconContainer]}
          >
            <MaterialCommunityIcons
              name="office-building"
              size={wp(6)}
              color="#6b7280"
            />
          </View>
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, rtlStyles.detailLabel]}>
              {t("projects.unitNumber")}
            </Text>
            <Text style={[styles.detailValue, rtlStyles.detailValue]}>
              {projectDetails.unitCount} {t("projects.unit")}
            </Text>
          </View>
        </View>

        <View style={[styles.detailItem, rtlStyles.detailItem]}>
          <View
            style={[styles.detailIconContainer, rtlStyles.detailIconContainer]}
          >
            <MaterialCommunityIcons
              name="floor-plan"
              size={wp(6)}
              color="#6b7280"
            />
          </View>
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, rtlStyles.detailLabel]}>
              {t("projects.areas")}
            </Text>
            <Text style={[styles.detailValue, rtlStyles.detailValue]}>
              {t("projects.from")} {projectDetails.minArea} {t("listings.m2")}{" "}
              {t("projects.to")} {projectDetails.maxArea} {t("listings.m2")}
            </Text>
          </View>
        </View>

        <View style={[styles.detailItem, rtlStyles.detailItem]}>
          <View
            style={[styles.detailIconContainer, rtlStyles.detailIconContainer]}
          >
            <MaterialCommunityIcons
              name="cash-multiple"
              size={wp(6)}
              color="#6b7280"
            />
          </View>
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, rtlStyles.detailLabel]}>
              {t("projects.prices")}
            </Text>
            <Text style={[styles.detailValue, rtlStyles.detailValue]}>
              {t("projects.from")} {projectDetails.minPrice.toLocaleString()}{" "}
              {t("listings.sar")} {t("projects.to")}{" "}
              {projectDetails.maxPrice.toLocaleString()} {t("listings.sar")}
            </Text>
          </View>
        </View>
      </View>
    );
  },
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
    alignItems: "flex-start",
    marginBottom: hp(2.5),
  },
  detailIconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
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
