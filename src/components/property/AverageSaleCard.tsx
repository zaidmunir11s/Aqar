import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import type { Property, RentSaleProperty } from "../../types/property";

export interface AverageSaleCardProps {
  property: Property;
}

/**
 * Average sale card component for sale listings
 * Shows average villa for sale area and price in location
 */
const AverageSaleCard = memo<AverageSaleCardProps>(({ property }) => {
  // Calculate average price (in a real app, this would come from API)
  const saleProperty = property as RentSaleProperty;
  const averagePrice = saleProperty.price
    ? saleProperty.price.replace(" M", ",000,000").replace(" K", ",000")
    : "4,810,360";
  const location = property.address || property.city || "عرفة";
  const minArea = 275;
  const maxArea = 400;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name="bar-chart" size={wp(5.5)} color="#3b82f6" />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>
          Average Villa for sale Area ({minArea} - {maxArea})m² in {location}
        </Text>
        <Text style={styles.price}>{averagePrice} SAR</Text>
      </View>
      <Ionicons name="chevron-forward" size={wp(5)} color="#9ca3af" />
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
