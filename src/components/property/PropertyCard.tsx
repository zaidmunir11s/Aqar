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
import { getUsageLabel, getDefaultImageUrl } from "../../utils";
import type { Property } from "../../types/property";
import { COLORS } from "../../constants";

export interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  title: string;
  priceLine: string;
  showMetaInfo?: boolean;
  listingType?: string;
  matchedCriteria?: {
    totalCriteria: number;
    matchedCriteria: number;
    matchedItems: string[];
  };
}

/**
 * Property card component for list view
 */
const PropertyCard = memo<PropertyCardProps>(
  ({
    property,
    onPress,
    title,
    priceLine,
    showMetaInfo = true,
    listingType,
    matchedCriteria,
  }) => {
    const usageLabel = getUsageLabel(property.usage);
    const imageUrl =
      property.images && property.images[0]
        ? property.images[0]
        : getDefaultImageUrl();

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <View style={styles.cardContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.price}>{priceLine}</Text>

          {showMetaInfo && (
            <View style={styles.metaRow}>
              {property.area != null && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="arrow-expand-horizontal"
                    size={wp(4)}
                    color="#9ca3af"
                  />
                  <Text style={styles.metaText}>{property.area} m2</Text>
                </View>
              )}
              {property.bedrooms != null && (
                <View style={styles.metaItem}>
                  <FontAwesome name="bed" size={wp(4)} color="#9ca3af" />
                  <Text style={styles.metaText}>{property.bedrooms}</Text>
                </View>
              )}
              {property.restrooms != null && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons
                    name="toilet"
                    size={wp(4)}
                    color="#9ca3af"
                  />
                  <Text style={styles.metaText}>{property.restrooms}</Text>
                </View>
              )}
              {property.usage && (
                <View style={styles.metaItem}>
                  <Ionicons name="pricetag" size={wp(4)} color="#9ca3af" />
                  <Text style={styles.metaText}>Residential</Text>
                </View>
              )}
            </View>
          )}

          {property.address && (
            <View style={styles.addressRow}>
              <Ionicons name="location" size={wp(4)} color={COLORS.showListCardLocation} />
              <Text numberOfLines={1} style={styles.address}>
                {property.address}
              </Text>
            </View>
          )}

          {/* Matched Criteria */}
          {matchedCriteria && matchedCriteria.matchedItems.length > 0 && (
            <View style={styles.criteriaContainer}>
              <View style={styles.matchedItemsContainer}>
                {matchedCriteria.matchedItems.map((item, index) => (
                  <View key={index} style={styles.matchedBadge}>
                    <Ionicons name="checkmark-circle" size={wp(3)} color={COLORS.primary} />
                    <Text style={styles.matchedBadgeText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }
);

PropertyCard.displayName = "PropertyCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: wp(3),
    marginBottom: hp(2),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 4 },
    }),
  },
  cardContent: {
    flex: 1,
    padding: wp(4),
    justifyContent: "space-between",
  },
  image: {
    width: wp(30),
    height: hp(18),
    backgroundColor: "#e5e7eb",
  },
  title: {
    fontSize: wp(4),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hp(0.5),
  },
  price: {
    fontSize: wp(4),
    fontWeight: "700",
    color:COLORS.showListCardPrice,
    marginBottom: hp(1),
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: hp(1),
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: wp(4),
    marginBottom: hp(0.5),
  },
  metaText: {
    marginLeft: wp(1),
    fontSize: wp(3.2),
    color: "#6b7280",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  address: {
    flex: 1,
    fontSize: wp(3.2),
    color: "#6b7280",
    marginLeft: wp(1),
  },
  criteriaContainer: {
    marginTop: hp(1),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  matchedItemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(1.5),
  },
  matchedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6fff6",
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    borderRadius: wp(1),
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: wp(1),
  },
  matchedBadgeText: {
    fontSize: wp(2.8),
    color: COLORS.primary,
    fontWeight: "500",
  },
});

export default PropertyCard;
