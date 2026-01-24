import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import type { Property, RentSaleProperty } from "../../types/property";
import { useLocalization } from "../../hooks/useLocalization";
import { translateAddress } from "../../utils/addressTranslation";

export interface AverageCardProps {
  property: Property;
}

/**
 * Average card component for rent listings
 * Shows average price for location, rooms, and property type
 */
const AverageCard = memo<AverageCardProps>(({ property }) => {
  const { t, isRTL } = useLocalization();
  
  // Helper function to translate property type
  const getTranslatedTypeLabel = (type: string): string => {
    const translationKey = `listings.propertyTypes.${type}`;
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }
    return type === "apartment" ? t("listings.propertyTypes.apartment") : type;
  };

  // Calculate average price (in a real app, this would come from API)
  const rentProperty = property as RentSaleProperty;
  const averagePrice = rentProperty.price
    ? rentProperty.price.replace(" K", ",000")
    : "100,950";
  
  // Translate the location/address
  const rawLocation = property.address || property.city || "";
  const translatedLocation = useMemo(
    () => rawLocation ? translateAddress(rawLocation, t) : t("listings.city"),
    [rawLocation, t]
  );
  
  const rooms = property.bedrooms || 3;
  const propertyType = getTranslatedTypeLabel(property.type === "apartment" ? "apartment" : property.type);

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      card: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      iconContainer: {
        marginRight: isRTL ? 0 : wp(3),
        marginLeft: isRTL ? wp(3) : 0,
      },
      label: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      price: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  return (
    <TouchableOpacity style={[styles.card, rtlStyles.card]} activeOpacity={0.7}>
      <View style={[styles.iconContainer, rtlStyles.iconContainer]}>
        <View style={styles.barChart}>
          <View style={[styles.bar, styles.bar1]} />
          <View style={[styles.bar, styles.bar2]} />
          <View style={[styles.bar, styles.bar3]} />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, rtlStyles.label]}>
          {t("listings.averageForRent", { propertyType, rooms, location: translatedLocation })}
        </Text>
        <Text style={[styles.price, rtlStyles.price]}>{averagePrice} {t("listings.sar")}</Text>
      </View>
      <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={wp(5)} color="#9ca3af" />
    </TouchableOpacity>
  );
});

AverageCard.displayName = "AverageCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: wp(4),
    marginHorizontal: wp(4),
    marginTop: hp(1),
    marginBottom: hp(1),
    borderRadius: wp(4),
    borderWidth: 0.5,
    borderColor: "#c0c4c7",
  },
  iconContainer: {
    width: wp(12),
    height: wp(12),
    backgroundColor: "#e0f2fe",
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp(3),
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: wp(6),
    gap: wp(1),
  },
  bar: {
    width: wp(1.5),
    backgroundColor: "#3b82f6",
    borderRadius: wp(0.5),
  },
  bar1: {
    height: wp(3),
  },
  bar2: {
    height: wp(4.5),
  },
  bar3: {
    height: wp(2.5),
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: wp(3.2),
    color: "#6b7280",
    marginBottom: hp(0.5),
  },
  price: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
  },
});

export default AverageCard;
