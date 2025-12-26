import React, { memo } from "react";
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
    if (!property) return null;

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
          <Image
            source={{ uri: imageUrl }}
            style={styles.bottomCardImage}
            resizeMode="cover"
          />

          <View style={styles.bottomCardContent}>
            <View style={styles.bottomCardHeader}>
              <Text style={styles.bottomTitle}>
                {property.projectNameArabic}
              </Text>
              <Text style={styles.bottomPrice}>
                From {property.projectDetails.minPrice.toLocaleString()} SAR
              </Text>
            </View>

            <View style={styles.bottomMetaRow}>
              <View style={styles.bottomMetaItem}>
                <Ionicons name="business" size={wp(4)} color="#9ca3af" />
                <Text style={styles.bottomMetaText}>
                  {property.projectDetails.unitCount} Units
                </Text>
              </View>
              <View style={styles.bottomMetaItem}>
                <MaterialCommunityIcons
                  name="arrow-expand-horizontal"
                  size={wp(4)}
                  color="#9ca3af"
                />
                <Text style={styles.bottomMetaText}>
                  {property.projectDetails.minArea}-
                  {property.projectDetails.maxArea} m²
                </Text>
              </View>
            </View>

            <Text numberOfLines={1} style={styles.bottomAddress}>
              {property.address}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    const typeLabel = getTypeLabelFromType(property.type, filterOptions);
    const usageLabel = getUsageLabel(property.usage);

    // Format price based on listing type
    let priceLine = "";
    let title = "";

    if (listingType === "daily") {
      title = typeLabel;
      if (calculatedPrice) {
        priceLine = `${calculatedPrice} SAR`;
      } else {
        const dailyProperty = property as any;
        priceLine = dailyProperty.bookingType === "daily" ? "Daily" : "Monthly";
      }
    } else if (listingType === "rent") {
      title = `${typeLabel} for rent`;
      const rentProperty = property as any;
      priceLine = `${rentProperty.price.replace(" K", "000")} SAR / Yearly`;
    } else {
      title = `${typeLabel} for sale`;
      const saleProperty = property as any;
      priceLine = saleProperty.price
        .replace(" M", ",000,000")
        .replace(" K", "000");
      priceLine = `${priceLine} SAR`;
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
        <Image
          source={{ uri: imageUrl }}
          style={styles.bottomCardImage}
          resizeMode="cover"
        />

        <View style={styles.bottomCardContent}>
          <View style={styles.bottomCardHeader}>
            <Text style={styles.bottomTitle}>{title}</Text>
            <Text
              style={[
                styles.bottomPrice,
                !calculatedPrice &&
                  listingType === "daily" &&
                  styles.bookingTypeText,
              ]}
            >
              {priceLine}
            </Text>
          </View>

          <View style={styles.bottomMetaRow}>
            <View style={styles.bottomMetaItem}>
              <MaterialCommunityIcons
                name="arrow-expand-horizontal"
                size={wp(4)}
                color="#9ca3af"
              />
              <Text style={styles.bottomMetaText}>{property.area} m2</Text>
            </View>
            <View style={styles.bottomMetaItem}>
              <FontAwesome name="bed" size={wp(4)} color="#9ca3af" />
              <Text style={styles.bottomMetaText}>{property.bedrooms}</Text>
            </View>
            <View style={styles.bottomMetaItem}>
              <Ionicons name="person" size={wp(4)} color="#9ca3af" />
              <Text style={styles.bottomMetaText}>{usageLabel}</Text>
            </View>
          </View>

          <Text numberOfLines={1} style={styles.bottomAddress}>
            {property.address}
          </Text>
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
    flexDirection: "row",
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
  bottomCardImage: {
    width: wp(30),
    height: "100%",
    backgroundColor: "#e5e7eb",
  },
  bottomCardContent: {
    flex: 1,
    padding: wp(3),
  },
  bottomCardHeader: {
    marginBottom: hp(0.8),
  },
  bottomTitle: {
    fontSize: wp(4),
    fontWeight: "700",
    color: "#111827",
  },
  bottomPrice: {
    marginTop: hp(0.2),
    fontSize: wp(3.5),
    fontWeight: "700",
    color: "#0ab539",
  },
  bottomMetaRow: {
    flexDirection: "row",
    marginTop: hp(1),
  },
  bottomMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: wp(4),
  },
  bottomMetaText: {
    marginLeft: wp(1),
    fontSize: wp(3),
    color: "#6b7280",
  },
  bottomAddress: {
    marginTop: hp(1),
    fontSize: wp(3),
    color: "#4b5563",
  },
  bookingTypeText: {
    color: "#0ab539",
    fontWeight: "700",
  },
});

export default BottomPropertyCard;
