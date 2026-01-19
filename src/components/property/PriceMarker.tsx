import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import type { Property } from "../../types/property";

export interface PriceMarkerProps {
  property: Property;
  isSelected?: boolean;
  isVisited?: boolean;
  listingType?: string;
  calculatedPrice?: number | null;
}

/**
 * Format number to compact notation (e.g., 1000 -> 1 K, 1000000 -> 1 M)
 */
const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")} M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")} K`;
  }
  return num.toString();
};

/**
 * Price marker component for map
 */
const PriceMarker = memo<PriceMarkerProps>(
  ({ property, isSelected, isVisited, listingType, calculatedPrice }) => {
    let bg: string;
    let displayText: string;

    // Check if it's a project - use custom color or default purple
    if ("isProject" in property && property.isProject) {
      const defaultColor = property.markerColor || COLORS.markerProject;
      bg = isSelected ? COLORS.markerProjectSelected : defaultColor;
      displayText = property.price;
    } else if (listingType === "daily") {
      // Daily markers: blue default, green when selected (no gray)
      bg = isSelected ? COLORS.primary : COLORS.info;

      // Show calculated price if dates selected, otherwise show booking type
      if (calculatedPrice !== null && calculatedPrice !== undefined) {
        const formattedPrice = formatCompactNumber(calculatedPrice);
        displayText = formattedPrice;
      } else {
        const dailyProperty = property as any;
        displayText =
          dailyProperty.bookingType === "daily" ? "Daily" : "Monthly";
      }
    } else {
      bg = isSelected
        ? COLORS.markerSelected
        : isVisited
          ? COLORS.markerVisited
          : COLORS.markerDefault;
      const rentSaleProperty = property as any;
      displayText = rentSaleProperty.price;
    }

    return (
      <View style={styles.markerContainer}>
        <View style={[styles.priceBubble, { backgroundColor: bg }]}>
          <Text style={styles.priceText}>{displayText}</Text>
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
