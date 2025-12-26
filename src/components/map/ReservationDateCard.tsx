import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { formatDateRange } from "../../utils";
import type { CalendarDates } from "../../hooks/useCalendar";

export interface ReservationDateCardProps {
  selectedDates: CalendarDates;
  onPress: () => void;
}
const ReservationDateCard = memo<ReservationDateCardProps>(
  ({ selectedDates, onPress }) => {
    return (
      <TouchableOpacity
        style={styles.reservationCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <FontAwesome6 name="calendar-days" size={wp(5.5)} color="#3b82f6" />
        {selectedDates.startDate && selectedDates.endDate ? (
          <Text style={styles.reservationTitle}>
            {formatDateRange(selectedDates.startDate, selectedDates.endDate)}
          </Text>
        ) : (
          <Text style={styles.reservationTitle}>Choose Reservation Date</Text>
        )}
      </TouchableOpacity>
    );
  }
);

ReservationDateCard.displayName = "ReservationDateCard";

const styles = StyleSheet.create({
  reservationCard: {
    position: "absolute",
    top: hp(18),
    left: wp(4),
    right: wp(4),
    backgroundColor: "#fff",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    borderRadius: wp(2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 8 },
    }),
    zIndex: 75,
  },
  reservationTitle: {
    fontWeight: "500",
    fontSize: wp(4),
    color: "#3b82f6",
    marginLeft: wp(2),
    textAlign: "center",
  },
});

export default ReservationDateCard;
