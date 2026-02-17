import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatDateRange, calculateDays } from "../../utils";
import type { CalendarDates } from "../../hooks/useCalendar";
import type { DailyPriceProperty } from "../../hooks/useDailyPrice";
import { COLORS } from "@/constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface DailyBookingCardProps {
  property: DailyPriceProperty;
  selectedDates: CalendarDates;
  onChooseDate: () => void;
  onReserve: () => void;
  /** Height of the bottom bar above which this card sits (for positioning when absolute). Default: hp(10) */
  bottomBarHeight?: number;
}

/**
 * Fixed bottom card for daily bookings
 */
const DailyBookingCard = memo<DailyBookingCardProps>(
  ({ property, selectedDates, onChooseDate, onReserve, bottomBarHeight }) => {
    const { t, isRTL } = useLocalization();
    const insets = useSafeAreaInsets();

    const bottomOffset = (bottomBarHeight ?? hp(9)) + insets.bottom;

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        fixedBottomCard: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        fixedCardText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        dateEditRow: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        selectedDateText: {
          marginRight: isRTL ? 0 : wp(2),
          marginLeft: isRTL ? wp(2) : 0,
        },
        priceInCard: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        reserveButton: {
          marginLeft: isRTL ? 0 : wp(3),
          marginRight: isRTL ? wp(3) : 0,
        },
      }),
      [isRTL]
    );
    
    if (!selectedDates.startDate || !selectedDates.endDate) {
      return (
        <View style={[styles.fixedBottomCard, rtlStyles.fixedBottomCard, { bottom: bottomOffset }]}>
          <Text
            style={[styles.fixedCardText, rtlStyles.fixedCardText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t("listings.chooseDateToSeePrice")}
          </Text>
          <TouchableOpacity
            style={[styles.fixedChooseButton, { flexShrink: 0 }]}
            onPress={onChooseDate}
          >
            <Text style={styles.fixedChooseButtonText}>{t("listings.choose")}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const days = calculateDays(selectedDates.startDate, selectedDates.endDate);

    const isMonthlyProperty = property.bookingType === "monthly";

    let total: number;
    let priceText: string;
    if (isMonthlyProperty) {
      if (days < 30) {
        total = property.monthlyPrice ?? 0;
        priceText = `${t("listings.monthly")}: ${total} ${t("listings.sar")}`;
      } else {
        total = Math.round((property.dailyPrice ?? 0) * days);
        priceText = `${days} ${t("listings.days")} × ${property.dailyPrice} ${t("listings.sar")} = ${total} ${t("listings.sar")}`;
      }
    } else {
      total = Math.round((property.dailyPrice ?? 0) * days);
      priceText = `${days} ${t("listings.days")} × ${property.dailyPrice} ${t("listings.sar")} = ${total} ${t("listings.sar")}`;
    }

    return (
      <View style={[styles.fixedBottomCard, rtlStyles.fixedBottomCard, { bottom: bottomOffset }]}>
        <View style={styles.contentWrapper}>
          <View style={[styles.dateEditRow, rtlStyles.dateEditRow]}>
            <Text
              style={[styles.selectedDateText, rtlStyles.selectedDateText]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {formatDateRange(selectedDates.startDate, selectedDates.endDate, t, isRTL)}
            </Text>
            <TouchableOpacity onPress={onChooseDate} style={{ flexShrink: 0 }}>
              <Text style={styles.editText}>{t("common.edit")}</Text>
            </TouchableOpacity>
          </View>
          <Text
            style={[styles.priceInCard, rtlStyles.priceInCard]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {priceText}
          </Text>
        </View>
        <TouchableOpacity style={[styles.reserveButton, rtlStyles.reserveButton]} onPress={onReserve}>
          <Text style={styles.reserveButtonText}>{t("listings.reserve")}</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

DailyBookingCard.displayName = "DailyBookingCard";

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    minWidth: 0,
  },
  fixedBottomCard: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
      },
      android: { elevation: 10 },
    }),
  },
  fixedCardText: {
    fontSize: wp(4),
    flex: 1,
    minWidth: 0,
  },
  fixedChooseButton: {
    backgroundColor: COLORS.modalButton,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
  },
  fixedChooseButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: wp(3.8),
  },
  dateEditRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  selectedDateText: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: "#111827",
    marginRight: wp(2),
  },
  editText: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: "#3b82f6",
  },
  priceInCard: {
    fontSize: wp(3.2),
    fontWeight: "bold",
    color: COLORS.dailyCardPrice,
  },
  reserveButton: {
    backgroundColor: COLORS.modalButton,
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.8),
    borderRadius: wp(3),
    marginLeft: wp(3),
    flexShrink: 0,
  },
  reserveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: wp(4),
  },
});

export default DailyBookingCard;
