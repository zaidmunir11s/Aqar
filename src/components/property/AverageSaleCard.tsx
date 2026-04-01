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
import { ChartNoAxesColumn } from "lucide-react-native";

export interface AverageSaleCardProps {
  property: Property;
  /** When provided, card is pressable and navigates (e.g. to average detail screen). */
  onPress?: () => void;
  /** 'detail' shows Edit text (no price, no arrow) and uses onEditPress. */
  variant?: "default" | "detail";
  /** Called when Edit is pressed (only when variant is 'detail'). */
  onEditPress?: () => void;
}

/**
 * Average sale card component for sale listings
 * Shows average villa for sale area and price in location
 */
const AverageSaleCard = memo<AverageSaleCardProps>(({ property, onPress, variant = "default", onEditPress }) => {
  const { t, isRTL } = useLocalization();
  
  const parseCompactPrice = (rawPrice?: string): number | null => {
    const raw = (rawPrice ?? "").trim();
    if (!raw) return null;
    const compactMatch = raw.match(/^([\d.,]+)\s*([kKmM])$/);
    if (compactMatch) {
      const amount = Number.parseFloat(compactMatch[1].replace(/,/g, ""));
      if (!Number.isFinite(amount)) return null;
      const multiplier = compactMatch[2].toLowerCase() === "m" ? 1_000_000 : 1_000;
      return Math.round(amount * multiplier);
    }
    const digitsOnly = raw.replace(/[^\d]/g, "");
    if (!digitsOnly) return null;
    const numeric = Number(digitsOnly);
    return Number.isFinite(numeric) ? numeric : null;
  };

  // Calculate average price (in a real app, this would come from API)
  const saleProperty = property as RentSaleProperty;
  const averagePrice = useMemo(() => {
    const parsed = parseCompactPrice(saleProperty.price);
    const fallback = 4810360;
    const numeric = parsed ?? fallback;
    return numeric.toLocaleString(isRTL ? "ar-SA" : "en-US");
  }, [isRTL, saleProperty.price]);
  
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
          {t("listings.averageForSale", { minArea, maxArea, location: translatedLocation })}
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

AverageSaleCard.displayName = "AverageSaleCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: wp(3),
    marginHorizontal: wp(4),
    marginTop: hp(1),
    marginBottom: hp(1),
    borderRadius: wp(3),
    borderWidth: 1.5,
    borderColor: "#d0d5d6",
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
  content: {
    flex: 1,
  },
  label: {
    fontSize: wp(3.2),
    color: "#6b7280",
    marginBottom: hp(0.5),
  },
  labelBold: {
    fontWeight: "700",
    color: "#111827",
  },
  price: {
    fontSize: wp(4.5),
    fontWeight: "500",
    color: "#111827",
  },
  editText: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: "#3b82f6",
  },
});

export default AverageSaleCard;
