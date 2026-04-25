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
  Feather,
} from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  getDefaultImageUrl,
  formatRentPropertyCardPriceLine,
  isPublishedListingProperty,
  buildPropertyInfoRows,
  pickCorePropertyInfoRowsForMapCard,
  type DetailIconSpec,
} from "../../utils";
import type { Property } from "../../types/property";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";
import { translateAddress } from "../../utils/addressTranslation";

function ListCardMetaIcon({
  spec,
  size,
}: {
  spec: DetailIconSpec | null;
  size: number;
}): React.JSX.Element | null {
  if (spec == null) {
    return null;
  }
  const color = "#9ca3af";
  if (spec.library === "MaterialCommunityIcons") {
    return (
      <MaterialCommunityIcons
        name={spec.name as any}
        size={size}
        color={color}
      />
    );
  }
  if (spec.library === "Feather") {
    return <Feather name={spec.name as any} size={size} color={color} />;
  }
  return <Ionicons name={spec.name as any} size={size} color={color} />;
}

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
    const { t, isRTL, i18n } = useLocalization();

    const resolvedPriceLine = useMemo(() => {
      if (property.listingType === "rent") {
        return formatRentPropertyCardPriceLine(property, t, i18n.language);
      }
      return priceLine;
    }, [property, priceLine, t, i18n.language]);
    const usageLabel =
      property.usage === "family" ? t("listings.family") : t("listings.single");
    const imageUrl =
      property.images && property.images[0]
        ? property.images[0]
        : getDefaultImageUrl();

    const publishedListMetaRows = useMemo(() => {
      if (!isPublishedListingProperty(property)) return null;
      const rows = buildPropertyInfoRows(property, t);
      return pickCorePropertyInfoRowsForMapCard(rows, property, t);
    }, [property, t]);

    // Helper function to translate matched criteria items (property types)
    const translateMatchedItem = (item: string): string => {
      // Normalize the item to match translation key format (lowercase, underscores)
      const normalizedType = item.toLowerCase().replace(/\s+/g, "_");

      // Try to find translation in propertyTypes
      const translationKey = `listings.propertyTypes.${normalizedType}`;
      const translated = t(translationKey);

      // If translation exists and is different from the key, use it
      if (translated && translated !== translationKey) {
        return translated;
      }

      // Try with original lowercase format
      const altKey = `listings.propertyTypes.${item.toLowerCase()}`;
      const altTranslated = t(altKey);
      if (altTranslated && altTranslated !== altKey) {
        return altTranslated;
      }

      // Fallback to original item
      return item;
    };

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        card: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        imageContainer: {
          marginRight: isRTL ? 0 : wp(3),
          marginLeft: isRTL ? wp(3) : 0,
        },
        metaRow: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        metaItem: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
          marginRight: isRTL ? 0 : wp(4),
          marginLeft: isRTL ? wp(4) : 0,
        },
        metaText: {
          marginLeft: isRTL ? 0 : wp(1),
          marginRight: isRTL ? wp(1) : 0,
        },
        addressRow: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        address: {
          marginLeft: isRTL ? 0 : wp(1),
          marginRight: isRTL ? wp(1) : 0,
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        matchedItemsContainer: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        matchedBadge: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        title: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        price: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL],
    );

    return (
      <TouchableOpacity
        style={[styles.card, rtlStyles.card]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        {/* Image Container */}
        <View style={[styles.imageContainer, rtlStyles.imageContainer]}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Content Section */}
        <View style={styles.cardContent}>
          <Text style={[styles.title, rtlStyles.title]}>{title}</Text>

          <Text style={[styles.price, rtlStyles.price]}>
            {resolvedPriceLine}
          </Text>

          {showMetaInfo &&
            (publishedListMetaRows != null &&
            publishedListMetaRows.length > 0 ? (
              <View style={[styles.metaRow, rtlStyles.metaRow]}>
                {publishedListMetaRows.map((row, idx) => (
                  <View
                    key={`${row.label}-${idx}`}
                    style={[styles.metaItem, rtlStyles.metaItem]}
                  >
                    <ListCardMetaIcon spec={row.icon} size={wp(4)} />
                    <Text
                      style={[styles.metaText, rtlStyles.metaText]}
                      numberOfLines={1}
                    >
                      {row.value}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.metaRow, rtlStyles.metaRow]}>
                {property.area != null && property.area > 0 && (
                  <View style={[styles.metaItem, rtlStyles.metaItem]}>
                    <MaterialCommunityIcons
                      name="arrow-expand-horizontal"
                      size={wp(4)}
                      color="#9ca3af"
                    />
                    <Text style={[styles.metaText, rtlStyles.metaText]}>
                      {property.area} {t("listings.m2")}
                    </Text>
                  </View>
                )}
                {property.bedrooms != null && property.bedrooms > 0 && (
                  <View style={[styles.metaItem, rtlStyles.metaItem]}>
                    <FontAwesome name="bed" size={wp(4)} color="#9ca3af" />
                    <Text style={[styles.metaText, rtlStyles.metaText]}>
                      {property.bedrooms}
                    </Text>
                  </View>
                )}
                {property.restrooms != null && property.restrooms > 0 && (
                  <View style={[styles.metaItem, rtlStyles.metaItem]}>
                    <MaterialCommunityIcons
                      name="toilet"
                      size={wp(4)}
                      color="#9ca3af"
                    />
                    <Text style={[styles.metaText, rtlStyles.metaText]}>
                      {property.restrooms}
                    </Text>
                  </View>
                )}
                {!isPublishedListingProperty(property) && property.usage ? (
                  <View style={[styles.metaItem, rtlStyles.metaItem]}>
                    <Ionicons name="pricetag" size={wp(4)} color="#9ca3af" />
                    <Text style={[styles.metaText, rtlStyles.metaText]}>
                      {usageLabel}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}

          {property.address && (
            <View style={[styles.addressRow, rtlStyles.addressRow]}>
              <Ionicons
                name="location"
                size={wp(4)}
                color={COLORS.showListCardLocation}
              />
              <Text
                numberOfLines={1}
                style={[styles.address, rtlStyles.address]}
              >
                {translateAddress(property.address, t)}
              </Text>
            </View>
          )}

          {/* Matched Criteria */}
          {matchedCriteria && matchedCriteria.matchedItems.length > 0 && (
            <View style={styles.criteriaContainer}>
              <View
                style={[
                  styles.matchedItemsContainer,
                  rtlStyles.matchedItemsContainer,
                ]}
              >
                {matchedCriteria.matchedItems.map((item, index) => (
                  <View
                    key={index}
                    style={[styles.matchedBadge, rtlStyles.matchedBadge]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={wp(3)}
                      color={COLORS.primary}
                    />
                    <Text style={styles.matchedBadgeText}>
                      {translateMatchedItem(item)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  },
);

PropertyCard.displayName = "PropertyCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: wp(3),
    marginBottom: hp(2),
    overflow: "hidden",
    padding: wp(3),
    alignItems: "center",
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
  imageContainer: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(3),
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: wp(3.2),
    fontWeight: "700",
    color: "#000000",
    marginBottom: hp(0.3),
  },
  price: {
    fontSize: wp(3),
    fontWeight: "700",
    color: COLORS.showListCardPrice,
    marginBottom: hp(0.5),
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  metaText: {
    fontSize: wp(2.9),
    color: "#6b7280",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  address: {
    flex: 1,
    fontSize: wp(2.9),
    color: "#6b7280",
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
    fontSize: wp(2.6),
    color: COLORS.primary,
    fontWeight: "500",
  },
});

export default PropertyCard;
