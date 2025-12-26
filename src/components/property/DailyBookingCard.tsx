import React, { memo } from "react";
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
import { formatDateRange, calculateDays } from "../../utils";
import type { CalendarDates } from "../../hooks/useCalendar";
import type { DailyPriceProperty } from "../../hooks/useDailyPrice";

export interface DailyBookingCardProps {
  property: DailyPriceProperty;
  selectedDates: CalendarDates;
  onChooseDate: () => void;
  onReserve: () => void;
}

/**
 * Fixed bottom card for daily bookings
 */
const DailyBookingCard = memo<DailyBookingCardProps>(
  ({ property, selectedDates, onChooseDate, onReserve }) => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      return (
        <View style={styles.fixedBottomCard}>
          <Text style={styles.fixedCardText}>Choose date to see price</Text>
          <TouchableOpacity
            style={styles.fixedChooseButton}
            onPress={onChooseDate}
          >
            <Text style={styles.fixedChooseButtonText}>Choose</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const days = calculateDays(selectedDates.startDate, selectedDates.endDate);

    // Check if monthly property
    const isMonthlyProperty = property.bookingType === "monthly";

    // For monthly properties: show monthly price if < 30 days, otherwise calculate and round
    let total: number;
    let priceText: string;
    if (isMonthlyProperty) {
      if (days < 30) {
        // Show monthly price
        total = property.monthlyPrice ?? 0;
        priceText = `Monthly: ${total} SAR`;
      } else {
        // Calculate based on days and round
        total = Math.round((property.dailyPrice ?? 0) * days);
        priceText = `${days} days × ${property.dailyPrice} SAR = ${total} SAR`;
      }
    } else {
      // Daily property: always calculate and round
      total = Math.round((property.dailyPrice ?? 0) * days);
      priceText = `${days} days × ${property.dailyPrice} SAR = ${total} SAR`;
    }

    return (
      <View style={styles.fixedBottomCard}>
        <View style={{ flex: 1 }}>
          <View style={styles.dateEditRow}>
            <Text style={styles.selectedDateText}>
              {formatDateRange(selectedDates.startDate, selectedDates.endDate)}
            </Text>
            <TouchableOpacity onPress={onChooseDate}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.priceInCard}>{priceText}</Text>
        </View>
        <TouchableOpacity style={styles.reserveButton} onPress={onReserve}>
          <Text style={styles.reserveButtonText}>Reserve</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

DailyBookingCard.displayName = "DailyBookingCard";

const styles = StyleSheet.create({
  fixedBottomCard: {
    position: "absolute",
    bottom: hp(11),
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
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  fixedChooseButton: {
    backgroundColor: "#3b82f6",
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
    color: "#0ab739",
  },
  reserveButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.8),
    borderRadius: wp(3),
    marginLeft: wp(3),
  },
  reserveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: wp(4),
  },
});

export default DailyBookingCard;
