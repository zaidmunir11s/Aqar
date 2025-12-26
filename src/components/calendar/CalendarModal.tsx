import React, { memo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Calendar } from "react-native-calendars";
import { getTodayISO, calculateDays } from "../../utils";
import type { CalendarDates, MarkedDates } from "../../hooks/useCalendar";
import type { DailyPriceProperty } from "../../hooks/useDailyPrice";

export interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  markedDates: MarkedDates;
  onDayPress: (day: { dateString: string }) => void;
  selectedDates: CalendarDates;
  onResetDates: () => void;
  property?: DailyPriceProperty;
}

const CalendarModal = memo<CalendarModalProps>(
  ({
    visible,
    onClose,
    markedDates,
    onDayPress,
    selectedDates,
    onResetDates,
    property,
  }) => {
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const fadeAnim = useState(new Animated.Value(0))[0];
    useEffect(() => {
      if (
        property?.bookingType === "monthly" &&
        selectedDates?.startDate &&
        selectedDates?.endDate
      ) {
        const days = calculateDays(
          selectedDates.startDate,
          selectedDates.endDate
        );
        if (days < 30) {
          setShowWarning(true);
          // Fade in
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setShowWarning(false);
            });
          }, 2500);
          return () => clearTimeout(timer);
        } else {
          setShowWarning(false);
        }
      } else {
        setShowWarning(false);
      }
    }, [selectedDates, property, fadeAnim]);

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name="arrow-back" size={wp(6)} color="#0ab739" />
              </TouchableOpacity>
              <Text style={styles.calendarHeaderText}>
                Choose Reservation Date
              </Text>
              <TouchableOpacity style={styles.okButton} onPress={onClose}>
                <Text style={styles.okButtonText}>Ok</Text>
              </TouchableOpacity>
            </View>

            <Calendar
              markingType={"simple" as any}
              markedDates={markedDates}
              onDayPress={onDayPress}
              theme={
                {
                  selectedDayBackgroundColor: "#01a3f3",
                  selectedDayTextColor: "#ffffff",
                  todayTextColor: "#3b82f6",
                  arrowColor: "#0ab739",
                  monthTextColor: "#111827",
                  textMonthFontWeight: "bold",
                  textDayFontSize: wp(3.8),
                  textMonthFontSize: wp(4.2),
                  textDayHeaderFontSize: wp(3.2),
                  textDayHeaderFontWeight: "500",
                  "stylesheet.day.basic": {
                    today: {
                      backgroundColor: "transparent",
                    },
                    todayText: {
                      color: "#0ab739",
                      fontWeight: "bold",
                    },
                    selected: {
                      backgroundColor: "#01a3f3",
                      borderRadius: wp(1),
                    },
                  },
                } as any
              }
              minDate={getTodayISO()}
            />

            {/* Warning Message - Red box */}
            {showWarning && (
              <Animated.View style={[styles.warningBox, { opacity: fadeAnim }]}>
                <Ionicons
                  name="information-circle"
                  size={wp(5)}
                  color="#ef4444"
                />
                <Text style={styles.warningBoxText}>
                  Please change the reservation date, as the minimum reservation
                  is 30 days.
                </Text>
              </Animated.View>
            )}

            {/* Footer Section */}
            {selectedDates.startDate && selectedDates.endDate ? (
              <View style={styles.calendarFooter}>
                <TouchableOpacity
                  style={styles.startAgainButton}
                  onPress={onResetDates}
                >
                  <MaterialIcons name="loop" size={wp(6)} color="#ff0000" />
                  <Text style={styles.startAgainButtonText}>Start Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.calendarFooter}>
                <Text style={styles.chooseDateRangeText}>
                  Please choose date range:
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }
);

CalendarModal.displayName = "CalendarModal";

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    paddingBottom: hp(3),
    maxHeight: hp(70),
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp(4),
    paddingTop: Platform.OS === "ios" ? hp(6) : hp(4),
    paddingBottom: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: wp(1),
  },
  calendarHeaderText: {
    flex: 1,
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginHorizontal: wp(2),
  },
  okButton: {
    backgroundColor: "#0ab739",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    borderRadius: wp(1.5),
  },
  okButtonText: {
    color: "#ffffff",
    fontSize: wp(4),
    fontWeight: "600",
  },
  calendarFooter: {
    padding: wp(1),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "center",
  },
  chooseDateRangeText: {
    fontSize: wp(3.8),
    color: "#6b7280",
    textAlign: "center",
  },
  startAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  startAgainButtonText: {
    color: "#ef4444",
    fontWeight: "bold",
    fontSize: wp(5),
    marginLeft: wp(2),
  },
  warningBox: {
    marginHorizontal: wp(4),
    marginTop: hp(2),
    backgroundColor: "#f8dadc",
    borderWidth: 1.5,
    borderColor: "#ef4444",
    borderRadius: wp(2),
    flexDirection: "row",
    alignItems: "center",
    padding: wp(2),
  },
  warningBoxText: {
    flex: 1,
    fontSize: wp(3.8),
    color: "#111827",
    fontWeight: "500",
    marginLeft: wp(2),
    lineHeight: hp(2.5),
  },
});

export default CalendarModal;
