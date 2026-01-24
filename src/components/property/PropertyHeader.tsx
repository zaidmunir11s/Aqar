import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import type { Property } from "../../types/property";
import type { CalendarDates } from "../../hooks/useCalendar";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";
import { translateAddress } from "../../utils/addressTranslation";

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
    const { t, isRTL } = useLocalization();

    const translatedAddress = useMemo(
      () => translateAddress(property.address, t),
      [property.address, t]
    );

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        priceSection: {
          alignItems: (isRTL ? "flex-end" : "flex-start") as "flex-start" | "flex-end",
        },
        address: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        title: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        priceRow: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        commission: {
          marginLeft: isRTL ? 0 : wp(2),
          marginRight: isRTL ? wp(2) : 0,
        },
      }),
      [isRTL]
    );

    return (
      <View style={[styles.priceSection, rtlStyles.priceSection]}>
        <Text style={[styles.address, rtlStyles.address]}>{translatedAddress}</Text>
        <Text style={[styles.title, rtlStyles.title]}>
          {property.listingType === "daily"
            ? typeLabel
            : `${typeLabel} ${listingText}`}
        </Text>
        {property.listingType === "daily" ? (
          <TouchableOpacity onPress={onCalendarPress} activeOpacity={0.7}>
            <View style={[styles.priceRow, rtlStyles.priceRow]}>
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
          <View style={[styles.priceRow, rtlStyles.priceRow]}>
            <Text style={styles.price}>{displayPrice}</Text>
            {property.listingType === "rent" && (
              <Text style={[styles.commission, rtlStyles.commission]}>
                + {t("listings.commission")} (1,650 {t("listings.riyals")})
              </Text>
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
  },
});

export default PropertyHeader;
