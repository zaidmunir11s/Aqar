import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import type { Property } from "../../types/property";
import { useLocalization } from "../../hooks/useLocalization";
import { translateAddress } from "../../utils/addressTranslation";
import { ChartNoAxesColumn } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { usePropertyMarketPriceInsight } from "@/hooks/usePropertyMarketPriceInsight";
import type { ListingPriceFilters } from "@/utils/listingPriceInsights";

export interface AverageSaleCardProps {
  property: Property;
  /** Optional filters for market stats (area range also narrows the API query when set). */
  insightFilters?: ListingPriceFilters;
  /** Optional filter range shown in label, when available. */
  minArea?: number;
  maxArea?: number;
  /** When provided, card is pressable and navigates (e.g. to average detail screen). */
  onPress?: () => void;
  /** 'detail' shows Edit text (no price, no arrow) and uses onEditPress. */
  variant?: "default" | "detail";
  /** Called when Edit is pressed (only when variant is 'detail'). */
  onEditPress?: () => void;
}

/**
 * Average sale card component for sale listings
 * Shows market average for sale listings in a location
 */
const AverageSaleCard = memo<AverageSaleCardProps>(
  ({
    property,
    insightFilters,
    minArea,
    maxArea,
    onPress,
    variant = "default",
    onEditPress,
  }) => {
    const { t, isRTL } = useLocalization();

    const isDetail = variant === "detail";

    const getTranslatedTypeLabel = (type: string): string => {
      const translationKey = `listings.propertyTypes.${type}`;
      const translated = t(translationKey);
      if (translated && translated !== translationKey) {
        return translated;
      }
      return type;
    };

    const propertyTypeLabel = useMemo(
      () => getTranslatedTypeLabel(property.type),
      [property.type, t],
    );

    const mergedInsightFilters = useMemo((): ListingPriceFilters => {
      const base = insightFilters ?? {};
      const out: ListingPriceFilters = { ...base };
      if (
        typeof minArea === "number" &&
        Number.isFinite(minArea) &&
        minArea > 0
      ) {
        out.minArea = minArea;
      }
      if (
        typeof maxArea === "number" &&
        Number.isFinite(maxArea) &&
        maxArea > 0
      ) {
        out.maxArea = maxArea;
      }
      return out;
    }, [insightFilters, minArea, maxArea]);

    const { avgPrice, isLoading, isFetching } = usePropertyMarketPriceInsight(
      property,
      "sale",
      { variant, filters: mergedInsightFilters },
    );

    const averagePriceText = useMemo(() => {
      if (avgPrice != null && Number.isFinite(avgPrice)) {
        return avgPrice.toLocaleString(isRTL ? "ar-SA" : "en-US");
      }
      return "---";
    }, [avgPrice, isRTL]);

    const showPriceSpinner =
      !isDetail &&
      (isLoading || (isFetching && avgPrice == null));

    // Translate the location/address
    const rawLocation = property.address || property.city || "";
    const translatedLocation = useMemo(
      () =>
        rawLocation ? translateAddress(rawLocation, t) : t("listings.city"),
      [rawLocation, t],
    );

    const hasAreaRange =
      typeof minArea === "number" &&
      Number.isFinite(minArea) &&
      typeof maxArea === "number" &&
      Number.isFinite(maxArea) &&
      minArea > 0 &&
      maxArea > 0;

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        card: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
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
        priceRow: {
          alignItems: (isRTL ? "flex-end" : "flex-start") as
            | "flex-end"
            | "flex-start",
        },
      }),
      [isRTL],
    );

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
          <Text
            style={[
              styles.label,
              rtlStyles.label,
              isDetail && styles.labelBold,
            ]}
          >
            {hasAreaRange
              ? t("listings.averageForSale", {
                  propertyType: propertyTypeLabel,
                  minArea,
                  maxArea,
                  location: translatedLocation,
                })
              : t("listings.averageForSaleNoRange", {
                  defaultValue: "Average {{propertyType}} for sale in {{location}}",
                  propertyType: propertyTypeLabel,
                  location: translatedLocation,
                })}
          </Text>
          {!isDetail && (
            <View style={[styles.priceRow, rtlStyles.priceRow]}>
              {showPriceSpinner ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={[styles.price, rtlStyles.price]}>
                  {averagePriceText} {t("listings.sar")}
                </Text>
              )}
            </View>
          )}
        </View>
        {isDetail ? (
          <TouchableOpacity
            onPress={onEditPress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.editText}>{t("common.edit")}</Text>
          </TouchableOpacity>
        ) : (
          <Ionicons
            name={isRTL ? "chevron-back" : "chevron-forward"}
            size={wp(5)}
            color="#9ca3af"
          />
        )}
      </Wrapper>
    );
  },
);

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
  priceRow: {
    minHeight: hp(3),
    justifyContent: "center",
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
