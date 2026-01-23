import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import type { Property } from "../../types/property";
import { useLocalization } from "../../hooks/useLocalization";

export interface PriceMarkerProps {
  property: Property;
  isSelected?: boolean;
  isVisited?: boolean;
  listingType?: string;
  calculatedPrice?: number | null;
}

/**
 * Format price string that may contain K or M to translated version
 */
const translatePriceString = (priceStr: string, t: (key: string) => string): string => {
  if (!priceStr) return priceStr;
  
  // Replace K with translated thousand
  let translated = priceStr.replace(/\s*K\b/g, ` ${t("listings.thousand")}`);
  // Replace M with translated million
  translated = translated.replace(/\s*M\b/g, ` ${t("listings.million")}`);
  
  return translated;
};

/**
 * Price marker component for map
 */
const PriceMarker = memo<PriceMarkerProps>(
  ({ property, isSelected, isVisited, listingType, calculatedPrice }) => {
    const { t, isRTL } = useLocalization();
    
    // Format number to compact notation with translations
    const formatCompactNumber = (num: number): string => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")} ${t("listings.million")}`;
      }
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1).replace(/\.0$/, "")} ${t("listings.thousand")}`;
      }
      return num.toString();
    };

    let bg: string;
    let displayText: string;

    // Check if it's a project - use custom color or default purple
    if ("isProject" in property && property.isProject) {
      const defaultColor = property.markerColor || COLORS.markerProject;
      bg = isSelected ? COLORS.markerProjectSelected : defaultColor;
      displayText = translatePriceString(property.price || "", t);
    } else if (listingType === "daily") {
      // Daily markers: blue default, green when selected (no gray)
      bg = isSelected ? COLORS.primary : COLORS.info;

      // Show calculated price if dates selected, otherwise show booking type
      if (calculatedPrice !== null && calculatedPrice !== undefined) {
        displayText = formatCompactNumber(calculatedPrice);
      } else {
        const dailyProperty = property as any;
        displayText =
          dailyProperty.bookingType === "daily" 
            ? t("listings.daily") 
            : t("listings.monthly");
      }
    } else {
      bg = isSelected
        ? COLORS.markerSelected
        : isVisited
          ? COLORS.markerVisited
          : COLORS.markerDefault;
      const rentSaleProperty = property as any;
      displayText = translatePriceString(rentSaleProperty.price || "", t);
    }

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        priceText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL]
    );

    return (
      <View style={styles.markerContainer}>
        <View style={[styles.priceBubble, { backgroundColor: bg }]}>
          <Text style={[styles.priceText, rtlStyles.priceText]}>{displayText}</Text>
        </View>
        <View style={[styles.pointer, { borderTopColor: bg }]} />
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: re-render if selection state, visited state, or listing type changes
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isVisited === nextProps.isVisited &&
      prevProps.listingType === nextProps.listingType &&
      prevProps.calculatedPrice === nextProps.calculatedPrice &&
      prevProps.property.id === nextProps.property.id
    );
  }
);

PriceMarker.displayName = "PriceMarker";

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  priceBubble: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.6),
    borderRadius: wp(1),
    alignItems: "center",
    justifyContent: "center",
  },
  priceText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: wp(3.3),
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: wp(1.5),
    borderRightWidth: wp(1.5),
    borderTopWidth: wp(1.5),
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -1,
  },
});

export default PriceMarker;
