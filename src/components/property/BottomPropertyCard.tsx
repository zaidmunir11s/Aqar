import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import {
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  getTypeLabelFromType,
  getUsageLabel,
  getDefaultImageUrl,
} from "../../utils";
import type { Property, FilterOption } from "../../types/property";
import { COLORS } from "../../constants/colors";
import { useLocalization } from "../../hooks/useLocalization";
import { translateAddress } from "../../utils/addressTranslation";

export interface BottomPropertyCardProps {
  property: Property | null;
  onPress: () => void;
  listingType: string;
  filterOptions: FilterOption[];
  calculatedPrice?: number | null;
}

/**
 * Bottom property card component shown on map
 */
const BottomPropertyCard = memo<BottomPropertyCardProps>(
  ({ property, onPress, listingType, filterOptions, calculatedPrice }) => {
    const { t, isRTL } = useLocalization();
    
    if (!property) return null;

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        contentRow: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        bottomCardImage: {
          marginRight: isRTL ? 0 : wp(3),
          marginLeft: isRTL ? wp(3) : 0,
        },
        bottomMetaRow: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        bottomMetaItem: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
          marginRight: isRTL ? 0 : wp(4),
          marginLeft: isRTL ? wp(4) : 0,
        },
        bottomMetaText: {
          marginLeft: isRTL ? 0 : wp(1),
          marginRight: isRTL ? wp(1) : 0,
        },
        bottomPrice: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        bottomTitle: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        bottomAddress: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL]
    );

    // Check if it's a project
    if ("isProject" in property && property.isProject) {
      const imageUrl =
        property.images && property.images[0]
          ? property.images[0]
          : getDefaultImageUrl("project");

      return (
        <TouchableOpacity
          style={styles.bottomCard}
          activeOpacity={0.9}
          onPress={onPress}
        >
          {/* Price on top */}
          <View style={styles.priceContainer}>
            <Text style={[styles.bottomPrice, rtlStyles.bottomPrice]}>
              {t("listings.from")} {property.projectDetails.minPrice.toLocaleString()} {t("listings.sar")}
            </Text>
          </View>

          {/* Image and details row */}
          <View style={[styles.contentRow, rtlStyles.contentRow]}>
            <Image
              source={{ uri: imageUrl }}
              style={[styles.bottomCardImage, rtlStyles.bottomCardImage]}
              resizeMode="cover"
            />

            <View style={styles.bottomCardContent}>
              <Text style={[styles.bottomTitle, rtlStyles.bottomTitle]}>
                {property.projectNameArabic}
              </Text>

              <View style={[styles.bottomMetaRow, rtlStyles.bottomMetaRow]}>
                <View style={[styles.bottomMetaItem, rtlStyles.bottomMetaItem]}>
                  <Ionicons name="business" size={wp(4)} color="#9ca3af" />
                  <Text style={[styles.bottomMetaText, rtlStyles.bottomMetaText]}>
                    {property.projectDetails.unitCount} {t("listings.units")}
                  </Text>
                </View>
                <View style={[styles.bottomMetaItem, rtlStyles.bottomMetaItem]}>
                  <MaterialCommunityIcons
                    name="arrow-expand-horizontal"
                    size={wp(4)}
                    color="#9ca3af"
                  />
                  <Text style={[styles.bottomMetaText, rtlStyles.bottomMetaText]}>
                    {property.projectDetails.minArea}-
                    {property.projectDetails.maxArea} {t("listings.m2")}
                  </Text>
                </View>
              </View>

              <Text numberOfLines={1} style={[styles.bottomAddress, rtlStyles.bottomAddress]}>
                {translateAddress(property.address, t)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    // Helper function to translate property type
    const getTranslatedTypeLabel = (type: string, filterOptions: FilterOption[]): string => {
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
    };

    const typeLabel = getTranslatedTypeLabel(property.type, filterOptions);
    const usageLabel = property.usage === "family" 
      ? t("listings.family") 
      : t("listings.single");

    // Format price based on listing type
    let priceLine = "";
    let title = "";

    if (listingType === "daily") {
      title = typeLabel;
      if (calculatedPrice) {
        priceLine = `${calculatedPrice} ${t("listings.sar")}`;
      } else {
        const dailyProperty = property as any;
        priceLine = dailyProperty.bookingType === "daily" 
          ? t("listings.daily") 
          : t("listings.monthly");
      }
    } else if (listingType === "rent") {
      title = `${typeLabel} ${t("listings.forRent")}`;
      const rentProperty = property as any;
      priceLine = `${rentProperty.price.replace(" K", "000")} ${t("listings.sar")}`;
    } else {
      title = `${typeLabel} ${t("listings.forSale")}`;
      const saleProperty = property as any;
      priceLine = saleProperty.price
        .replace(" M", ",000,000")
        .replace(" K", "000");
      priceLine = `${priceLine} ${t("listings.sar")}`;
    }

    const imageUrl =
      property.images && property.images[0]
        ? property.images[0]
        : getDefaultImageUrl();

    return (
      <TouchableOpacity
        style={styles.bottomCard}
        activeOpacity={0.9}
        onPress={onPress}
      >
        {/* Price on top */}
        <View style={styles.priceContainer}>
          <Text
            style={[
              styles.bottomPrice,
              rtlStyles.bottomPrice,
              !calculatedPrice &&
                listingType === "daily" &&
                styles.bookingTypeText,
            ]}
          >
            {priceLine}
          </Text>
        </View>

        {/* Image and details row */}
        <View style={[styles.contentRow, rtlStyles.contentRow]}>
          <Image
            source={{ uri: imageUrl }}
            style={[styles.bottomCardImage, rtlStyles.bottomCardImage]}
            resizeMode="cover"
          />

          <View style={styles.bottomCardContent}>
            <Text style={[styles.bottomTitle, rtlStyles.bottomTitle]}>{title}</Text>

            <View style={[styles.bottomMetaRow, rtlStyles.bottomMetaRow]}>
              <View style={[styles.bottomMetaItem, rtlStyles.bottomMetaItem]}>
                <MaterialCommunityIcons
                  name="arrow-expand-horizontal"
                  size={wp(4)}
                  color="#9ca3af"
                />
                <Text style={[styles.bottomMetaText, rtlStyles.bottomMetaText]}>
                  {property.area} {t("listings.m2")}
                </Text>
              </View>
              <View style={[styles.bottomMetaItem, rtlStyles.bottomMetaItem]}>
                <FontAwesome name="bed" size={wp(4)} color="#9ca3af" />
                <Text style={[styles.bottomMetaText, rtlStyles.bottomMetaText]}>
                  {property.bedrooms}
                </Text>
              </View>
              <View style={[styles.bottomMetaItem, rtlStyles.bottomMetaItem]}>
                <Ionicons name="person" size={wp(4)} color="#9ca3af" />
                <Text style={[styles.bottomMetaText, rtlStyles.bottomMetaText]}>
                  {usageLabel}
                </Text>
              </View>
            </View>

            <Text numberOfLines={1} style={[styles.bottomAddress, rtlStyles.bottomAddress]}>
              {translateAddress(property.address, t)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

BottomPropertyCard.displayName = "BottomPropertyCard";

const styles = StyleSheet.create({
  bottomCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: hp(10),
    marginHorizontal: wp(3),
    backgroundColor: "#fff",
    borderRadius: wp(4),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.16,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
      },
      android: { elevation: 10 },
    }),
  },
  priceContainer: {
    paddingHorizontal: wp(3),
    paddingTop: wp(3),
    paddingBottom: hp(1),
  },
  bottomPrice: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  contentRow: {
    flexDirection: "row",
    paddingHorizontal: wp(3),
    paddingBottom: wp(3),
  },
  bottomCardImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
    backgroundColor: "#e5e7eb",
  },
  bottomCardContent: {
    flex: 1,
  },
  bottomTitle: {
    fontSize: wp(3.8),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hp(0.5),
  },
  bottomMetaRow: {
    flexDirection: "row",
    marginTop: hp(1),
  },
  bottomMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomMetaText: {
    fontSize: wp(3),
    color: "#6b7280",
  },
  bottomAddress: {
    marginTop: hp(1),
    fontSize: wp(3),
    color: "#4b5563",
  },
  bookingTypeText: {
    color: "#0e856a",
    fontWeight: "700",
  },
});

export default BottomPropertyCard;
