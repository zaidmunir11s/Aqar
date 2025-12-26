import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import type { Property } from "../../types/property";
import type { CalendarDates } from "../../hooks/useCalendar";
import { COLORS } from "../../constants";

export interface PropertyHeaderProps {
  property: Property;
  typeLabel: string;
  listingText: string;
  displayPrice: string;
  selectedDates?: CalendarDates | null;
  onCalendarPress?: () => void;
}

/**
 * Property header with address, title, and price
 */
const PropertyHeader = memo<PropertyHeaderProps>(
  ({
    property,
    typeLabel,
    listingText,
    displayPrice,
    selectedDates,
    onCalendarPress,
  }) => {
    return (
      <View style={styles.priceSection}>
        <Text style={styles.address}>{property.address}</Text>
        <Text style={styles.title}>
          {property.listingType === "daily"
            ? typeLabel
            : `${typeLabel} ${listingText}`}
        </Text>
        {property.listingType === "daily" ? (
          <TouchableOpacity onPress={onCalendarPress} activeOpacity={0.7}>
            <View style={styles.priceRow}>
              <Text
                style={[
                  styles.price,
                  (!selectedDates?.startDate || !selectedDates?.endDate) &&
                    styles.bookingTypePrice,
                ]}
              >
                {displayPrice}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.priceRow}>
            <Text style={styles.price}>{displayPrice}</Text>
            {property.listingType === "rent" && (
              <Text style={styles.commission}>+ Commission (1,650 Riyals)</Text>
            )}
          </View>
        )}
      </View>
    );
  }
);

PropertyHeader.displayName = "PropertyHeader";

const styles = StyleSheet.create({
  priceSection: {
    padding: wp(4),
    marginHorizontal: wp(1),
    borderRadius: wp(2),
  },
  address: {
    fontSize: wp(3.5),
    color: "#374151",
    marginBottom: hp(0.5),
  },
  title: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hp(1),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: wp(5),
    fontWeight: "700",
    color: COLORS.propertyDetailPrice,
  },
  bookingTypePrice: {
    color: "#10b981",
  },
  commission: {
    fontSize: wp(3),
    color: "#6b7280",
    marginLeft: wp(2),
  },
});

export default PropertyHeader;
