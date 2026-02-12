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
import { COLORS } from "@/constants/colors";
import { ChartNoAxesColumn } from "lucide-react-native";

export interface AverageCardProps {
  property: Property;
  /** When provided, card is pressable and navigates (e.g. to average detail screen). */
  onPress?: () => void;
  /** 'detail' shows Edit text (no price, no arrow) and uses onEditPress. */
  variant?: "default" | "detail";
  /** Called when Edit is pressed (only when variant is 'detail'). */
  onEditPress?: () => void;
}

/**
 * Average card component for rent listings
 * Shows average price for location, rooms, and property type
 */
const AverageCard = memo<AverageCardProps>(({ property, onPress, variant = "default", onEditPress }) => {
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

  const isDetail = variant === "detail";
  const Wrapper = isDetail ? View : TouchableOpacity;
  const wrapperProps = isDetail
    ? { style: [styles.card, rtlStyles.card] }
    : { style: [styles.card, rtlStyles.card], onPress, activeOpacity: 0.7 };

  return (
    <Wrapper {...wrapperProps}>
      <View style={[styles.iconContainer, rtlStyles.iconContainer]}>
        <ChartNoAxesColumn size={wp(7)} color="#3b82f6" strokeWidth={3} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, rtlStyles.label, isDetail && styles.labelBold]}>
          {t("listings.averageForRent", { propertyType, rooms, location: translatedLocation })}
        </Text>
        {!isDetail && (
          <Text style={[styles.price, rtlStyles.price]}>{averagePrice} {t("listings.sar")}</Text>
        )}
      </View>
      {isDetail ? (
        <TouchableOpacity onPress={onEditPress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.editText}>{t("common.edit")}</Text>
        </TouchableOpacity>
      ) : (
        <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={wp(5)} color="#9ca3af" />
      )}
    </Wrapper>
  );
});

AverageCard.displayName = "AverageCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: wp(3),
    marginHorizontal: wp(4),
    marginTop: hp(1),
    marginBottom: hp(1),
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
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
  labelBold: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: "#111827",
  },
  price: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
  },
  editText: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: "#3b82f6",
  },
});

export default AverageCard;
