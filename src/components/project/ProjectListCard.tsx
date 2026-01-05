import React, { memo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { getTypeLabelFromType, getDefaultImageUrl } from "../../utils";
import type { ProjectProperty, FilterOption } from "../../types/property";
import { SALE_FILTER_OPTIONS, RENT_FILTER_OPTIONS } from "../../data/propertyData";
import { COLORS } from "@/constants/colors";

export interface ProjectListCardProps {
  project: ProjectProperty;
  onPress: () => void;
  filterOptions: FilterOption[];
}

/**
 * Project list card component for projects list view
 */
const ProjectListCard = memo<ProjectListCardProps>(
  ({ project, onPress, filterOptions }) => {
    const [imageError, setImageError] = useState(false);
    const [logoError, setLogoError] = useState(false);

    const imageUrl =
      project.images && project.images[0] && !imageError
        ? project.images[0]
        : getDefaultImageUrl("project");

    // Get all types that this project supports (from projectDetails or project type)
    // For now, we'll show the main type and potentially others
    const mainTypeLabel = getTypeLabelFromType(project.type, filterOptions);
    const typeLabels = [`${mainTypeLabel} for sale`];

    // Format starting price
    const startingPrice = project.projectDetails.minPrice;
    const formattedPrice =
      startingPrice >= 1000000
        ? `${(startingPrice / 1000000).toFixed(1)} M`
        : `${(startingPrice / 1000).toFixed(0)} K`;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={onPress}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />

          {/* Status Badges - Top Left */}
          <View style={styles.statusBadgesContainer}>
            <View style={[styles.statusBadge, styles.availableBadge]}>
              <Text style={styles.availableBadgeText}>
                {project.projectDetails.availableStatus}
              </Text>
            </View>
            <View style={[styles.statusBadge, styles.readyBadge]}>
              <Text style={styles.readyBadgeText}>
                {project.projectDetails.readyStatus}
              </Text>
            </View>
          </View>

          {/* Starting Price - Bottom Left */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>Starting from {formattedPrice}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Project Name and Logo Row */}
          <View style={styles.nameRow}>
            <Text style={styles.projectName} numberOfLines={1}>
              {project.projectNameArabic || project.projectName}
            </Text>
            {project.developerLogo && project.developerLogo.trim() !== "" && !logoError && (
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: project.developerLogo }}
                  style={styles.developerLogo}
                  resizeMode="cover"
                  onError={() => {
                    setLogoError(true);
                  }}
                  onLoad={() => {
                    setLogoError(false);
                  }}
                />
              </View>
            )}
          </View>

          {/* Type Tags */}
          <View style={styles.typeTagsContainer}>
            {typeLabels.map((label, index) => (
              <View key={index} style={styles.typeTag}>
                <Text style={styles.typeTagText}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Location */}
          {project.address && (
            <Text style={styles.location} numberOfLines={2}>
              {project.address}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

ProjectListCard.displayName = "ProjectListCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: wp(2.5),
    marginBottom: hp(2.5),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 3 },
    }),
  },
  imageContainer: {
    width: "100%",
    height: hp(16),
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  statusBadgesContainer: {
    position: "absolute",
    top: hp(1.5),
    left: wp(4),
    flexDirection: "row",
    gap: wp(1.5),
  },
  statusBadge: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(1.2),
  },
  availableBadge: {
    backgroundColor: "#e0eef7",
  },
  readyBadge: {
    backgroundColor: "#e8eff2",
  },
  availableBadgeText: {
    color: "#1f85b3",
    fontSize: wp(3.2),
    fontWeight: "600",
  },
  readyBadgeText: {
    color: "#6a747e",
    fontSize: wp(3.2),
    fontWeight: "600",
  },
  priceContainer: {
    position: "absolute",
    bottom: hp(1.5),
    // left: wp(4),
    // backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.9),
    borderRadius: wp(1.5),
  },
  priceText: {
    color: "#fff",
    fontSize: wp(4.5),
    fontWeight: "700",
  },
  contentSection: {
    padding: wp(4),
    backgroundColor: "#fff",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginBottom: hp(1.2),
  },
  projectName: {
    flex: 1,
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
    marginRight: wp(3),
  },
  logoContainer: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: wp(1),
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  developerLogo: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(1),
  },
  logoPlaceholder: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(1),
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholderText: {
    fontSize: wp(2.5),
    color: "#9ca3af",
  },
  typeTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: hp(1.2),
    gap: wp(2),
  },
  typeTag: {
    backgroundColor: "#ebf1f1",
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1),
    borderRadius: wp(1),
  },
  typeTagText: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  location: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    lineHeight: hp(2.2),
  },
});

export default ProjectListCard;

