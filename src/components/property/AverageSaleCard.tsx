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

export interface AverageSaleCardProps {
  property: Property;
}

/**
 * Average sale card component for sale listings
 * Shows average villa for sale area and price in location
 */
const AverageSaleCard = memo<AverageSaleCardProps>(({ property }) => {
  const { t, isRTL } = useLocalization();
  
  // Calculate average price (in a real app, this would come from API)
  const saleProperty = property as RentSaleProperty;
  const averagePrice = saleProperty.price
    ? saleProperty.price.replace(" M", ",000,000").replace(" K", ",000")
    : "4,810,360";
  
  // Translate the location/address
  const rawLocation = property.address || property.city || "";
  const translatedLocation = useMemo(
    () => rawLocation ? translateAddress(rawLocation, t) : t("listings.city"),
    [rawLocation, t]
  );
  
  const minArea = 275;
  const maxArea = 400;

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
        <Ionicons name="bar-chart" size={wp(5.5)} color="#3b82f6" />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, rtlStyles.label]}>
          {t("listings.averageForSale", { minArea, maxArea, location: translatedLocation })}
        </Text>
        <Text style={[styles.price, rtlStyles.price]}>{averagePrice} {t("listings.sar")}</Text>
      </View>
      <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={wp(5)} color="#9ca3af" />
    </TouchableOpacity>
  );
});

AverageSaleCard.displayName = "AverageSaleCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: wp(4),
    marginHorizontal: wp(4),
    marginTop: hp(1),
    marginBottom: hp(1),
    borderRadius: wp(3),
    borderWidth: 1.5,
    borderColor: "#d0d5d6",
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
    fontWeight: "500",
    color: "#111827",
  },
});

export default AverageSaleCard;
