import React, { memo, useState, useMemo, useCallback } from "react";
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
import { useLocalization } from "../../hooks/useLocalization";
import { translateAddress } from "../../utils/addressTranslation";

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
    const { t, isRTL } = useLocalization();
    const [imageError, setImageError] = useState(false);
    const [logoError, setLogoError] = useState(false);

    // Helper function to translate property type
    const getTranslatedTypeLabel = useCallback(
      (type: string, filterOptions: FilterOption[]): string => {
        const opt = filterOptions.find((o) => o.type === type);
        if (!opt) return type;
        
        // Try to find translation in propertyTypes
        const translationKey = `listings.propertyTypes.${type}`;
        const translated = t(translationKey);
        
        // If translation exists and is different from the key, use it
        if (translated && translated !== translationKey) {
          return translated;
        }
        
        // Fallback to filter option label
        return opt.label;
      },
      [t]
    );

    const imageUrl =
      project.images && project.images[0] && !imageError
        ? project.images[0]
        : getDefaultImageUrl("project");

    // Get all types that this project supports (from projectDetails or project type)
    // For now, we'll show the main type and potentially others
    const mainTypeLabel = getTranslatedTypeLabel(project.type, filterOptions);
    const typeLabels = [`${mainTypeLabel} ${t("listings.forSale")}`];

    // Format starting price with translation
    const startingPrice = project.projectDetails.minPrice;
    const formattedPrice =
      startingPrice >= 1000000
        ? `${(startingPrice / 1000000).toFixed(1)} ${t("listings.million")}`
        : `${(startingPrice / 1000).toFixed(0)} ${t("listings.thousand")}`;

    const translatedAddress = useMemo(
      () => translateAddress(project.address, t),
      [project.address, t]
    );

    // Helper function to translate status
    const translateStatus = useCallback((status: string): string => {
      if (!status) return status;
      const lowerStatus = status.toLowerCase().trim();
      
      if (lowerStatus === "available") {
        return t("projects.status.available");
      } else if (lowerStatus === "ready") {
        return t("projects.status.ready");
      } else if (lowerStatus === "under construction") {
        return t("projects.status.underConstruction");
      }
      
      // Fallback to original if no match
      return status;
    }, [t]);

    const translatedAvailableStatus = useMemo(
      () => translateStatus(project.projectDetails.availableStatus),
      [project.projectDetails.availableStatus, translateStatus]
    );

    const translatedReadyStatus = useMemo(
      () => translateStatus(project.projectDetails.readyStatus),
      [project.projectDetails.readyStatus, translateStatus]
    );

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        statusBadgesContainer: {
          left: isRTL ? undefined : wp(4),
          right: isRTL ? wp(4) : undefined,
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        priceContainer: {
          left: isRTL ? undefined : wp(4),
          right: isRTL ? wp(4) : undefined,
        },
        priceText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        nameRow: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        projectName: {
          marginRight: isRTL ? 0 : wp(3),
          marginLeft: isRTL ? wp(3) : 0,
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        typeTagsContainer: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        location: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL]
    );

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
          <View style={[styles.statusBadgesContainer, rtlStyles.statusBadgesContainer]}>
            <View style={[styles.statusBadge, styles.availableBadge]}>
              <Text style={styles.availableBadgeText}>
                {translatedAvailableStatus}
              </Text>
            </View>
            <View style={[styles.statusBadge, styles.readyBadge]}>
              <Text style={styles.readyBadgeText}>
                {translatedReadyStatus}
              </Text>
            </View>
          </View>

          {/* Starting Price - Bottom Left */}
          <View style={[styles.priceContainer, rtlStyles.priceContainer]}>
            <Text style={[styles.priceText, rtlStyles.priceText]}>
              {t("projects.startingFrom")} {formattedPrice}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Project Name and Logo Row */}
          <View style={[styles.nameRow, rtlStyles.nameRow]}>
            <Text style={[styles.projectName, rtlStyles.projectName]} numberOfLines={1}>
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
          <View style={[styles.typeTagsContainer, rtlStyles.typeTagsContainer]}>
            {typeLabels.map((label, index) => (
              <View key={index} style={styles.typeTag}>
                <Text style={styles.typeTagText}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Location */}
          {project.address && (
            <Text style={[styles.location, rtlStyles.location]} numberOfLines={2}>
              {translatedAddress}
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  projectName: {
    flex: 1,
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
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

