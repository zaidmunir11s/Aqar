import React, { memo, useState, useEffect, useMemo } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { getTodayISO, calculateDays } from "../../utils";
import type { CalendarDates, MarkedDates } from "../../hooks/useCalendar";
import type { DailyPriceProperty } from "../../hooks/useDailyPrice";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

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
    const { t, isRTL } = useLocalization();
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const insets = useSafeAreaInsets();
    const [currentMonth, setCurrentMonth] = useState<string>(() => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
    });

    // Calculate bottom padding: safe area + small buffer for tab bar
    const bottomPadding =
      Math.max(insets.bottom, Platform.OS === "ios" ? hp(2) : hp(1)) + hp(2);

    // Configure LocaleConfig for month and day names with translations
    useEffect(() => {
      const localeKey = isRTL ? "ar" : "en";

      // Month names with translations
      const monthNames = [
        t("listings.calendar.months.january"),
        t("listings.calendar.months.february"),
        t("listings.calendar.months.march"),
        t("listings.calendar.months.april"),
        t("listings.calendar.months.may"),
        t("listings.calendar.months.june"),
        t("listings.calendar.months.july"),
        t("listings.calendar.months.august"),
        t("listings.calendar.months.september"),
        t("listings.calendar.months.october"),
        t("listings.calendar.months.november"),
        t("listings.calendar.months.december"),
      ];

      // Day names with translations (Sunday to Saturday - always in this order for LocaleConfig)
      const dayNames = [
        t("listings.calendar.weekdays.sun"),
        t("listings.calendar.weekdays.mon"),
        t("listings.calendar.weekdays.tue"),
        t("listings.calendar.weekdays.wed"),
        t("listings.calendar.weekdays.thu"),
        t("listings.calendar.weekdays.fri"),
        t("listings.calendar.weekdays.sat"),
      ];

      // Short day names
      const dayNamesShort = dayNames.map((day) => day.substring(0, 3));

      // Configure locale
      LocaleConfig.locales[localeKey] = {
        monthNames,
        monthNamesShort: monthNames.map((month) => month.substring(0, 3)),
        dayNames,
        dayNamesShort,
        today: "Today",
      };

      LocaleConfig.defaultLocale = localeKey;
    }, [t, isRTL]);

    // First day of week: 0 = Sunday, 1 = Monday, etc.
    // In RTL, we want Saturday (6) to be first, in LTR Sunday (0) is first
    const firstDay = useMemo(() => {
      return isRTL ? 6 : 0; // Saturday for RTL, Sunday for LTR
    }, [isRTL]);

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        calendarHeader: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        calendarHeaderText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        backButton: {
          // No transform needed, using different icon names
        },
        warningBox: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        warningBoxText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
          marginLeft: isRTL ? 0 : wp(2),
          marginRight: isRTL ? wp(2) : 0,
        },
        startAgainButton: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        startAgainButtonText: {
          marginLeft: isRTL ? 0 : wp(2),
          marginRight: isRTL ? wp(2) : 0,
        },
        chooseDateRangeText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL],
    );
    useEffect(() => {
      if (
        property?.bookingType === "monthly" &&
        selectedDates?.startDate &&
        selectedDates?.endDate
      ) {
        const days = calculateDays(
          selectedDates.startDate,
          selectedDates.endDate,
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
          <View
            style={[styles.calendarContainer, { paddingBottom: bottomPadding }]}
          >
            <View style={[styles.calendarHeader, rtlStyles.calendarHeader]}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.backButton, rtlStyles.backButton]}
              >
                <Ionicons
                  name={isRTL ? "arrow-forward" : "arrow-back"}
                  size={wp(6)}
                  color={COLORS.arrows}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.calendarHeaderText,
                  rtlStyles.calendarHeaderText,
                ]}
              >
                {t("listings.chooseReservation")}
              </Text>
              <TouchableOpacity style={styles.okButton} onPress={onClose}>
                <Text style={styles.okButtonText}>{t("common.ok")}</Text>
              </TouchableOpacity>
            </View>

            <Calendar
              key={currentMonth}
              markingType={"simple" as any}
              markedDates={markedDates}
              onDayPress={onDayPress}
              firstDay={firstDay}
              enableSwipeMonths={true}
              hideArrows={false}
              current={currentMonth}
              onMonthChange={(month) => {
                const newMonth = `${month.year}-${String(month.month).padStart(2, "0")}-01`;
                if (newMonth !== currentMonth) {
                  setCurrentMonth(newMonth);
                }
              }}
              renderArrow={(direction) => {
                // Keep arrow directions the same in both LTR and RTL
                // Left arrow always points left (chevron-back), right arrow always points right (chevron-forward)
                const iconName =
                  direction === "left" ? "chevron-back" : "chevron-forward";
                return (
                  <Ionicons
                    name={iconName}
                    size={wp(5)}
                    color={COLORS.arrows}
                  />
                );
              }}
              onPressArrowLeft={(subtractMonth) => {
                // In RTL: left arrow (visually on right) should go to next month
                // In LTR: left arrow should go to previous month
                if (isRTL) {
                  // For RTL, we need to go forward, so we'll manually update the month
                  const [year, month] = currentMonth.split("-").map(Number);
                  const nextMonth = month === 12 ? 1 : month + 1;
                  const nextYear = month === 12 ? year + 1 : year;
                  const newMonth = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
                  setCurrentMonth(newMonth);
                } else {
                  subtractMonth();
                }
              }}
              onPressArrowRight={(addMonth) => {
                // In RTL: right arrow (visually on left) should go to previous month
                // In LTR: right arrow should go to next month
                if (isRTL) {
                  // For RTL, we need to go backward, so we'll manually update the month
                  const [year, month] = currentMonth.split("-").map(Number);
                  const prevMonth = month === 1 ? 12 : month - 1;
                  const prevYear = month === 1 ? year - 1 : year;
                  const newMonth = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
                  setCurrentMonth(newMonth);
                } else {
                  addMonth();
                }
              }}
              theme={
                {
                  selectedDayBackgroundColor: "#01a3f3",
                  selectedDayTextColor: "#ffffff",
                  todayTextColor: "#0e856a",
                  arrowColor: COLORS.arrows,
                  textDayFontSize: wp(3.8),
                  textMonthFontSize: wp(4.2),
                  textDayHeaderFontSize: wp(3.2),
                  textDayHeaderFontWeight: "500",
                  // RTL support for calendar
                  "stylesheet.calendar.header": {
                    week: {
                      marginTop: 7,
                      flexDirection: isRTL ? "row-reverse" : "row",
                      justifyContent: "space-between",
                    },
                    arrow: {
                      padding: 10,
                    },
                    arrowImage: {
                      tintColor: COLORS.arrows,
                      // Don't transform here, we're using custom renderArrow
                    },
                  },
                  "stylesheet.calendar.main": {
                    container: {
                      paddingLeft: isRTL ? 0 : 5,
                      paddingRight: isRTL ? 5 : 0,
                    },
                    week: {
                      marginTop: 7,
                      flexDirection: isRTL ? "row-reverse" : "row",
                      justifyContent: "space-around",
                    },
                  },
                  "stylesheet.day.basic": {
                    base: {
                      width: 32,
                      height: 32,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    today: {
                      backgroundColor: "transparent",
                    },
                    todayText: {
                      color: COLORS.todayDate,
                      fontWeight: "bold",
                    },
                    selected: {
                      backgroundColor: "#01a3f3",
                      borderRadius: wp(1),
                    },
                  },
                  "stylesheet.day.period": {
                    today: {
                      backgroundColor: "transparent",
                    },
                    todayText: {
                      color: COLORS.todayDate,
                      fontWeight: "bold",
                    },
                  },
                } as any
              }
              minDate={getTodayISO()}
            />

            {/* Warning Message - Red box */}
            {showWarning && (
              <Animated.View
                style={[
                  styles.warningBox,
                  rtlStyles.warningBox,
                  { opacity: fadeAnim },
                ]}
              >
                <Ionicons
                  name="information-circle"
                  size={wp(5)}
                  color="#ef4444"
                />
                <Text style={[styles.warningBoxText, rtlStyles.warningBoxText]}>
                  {t("listings.calendarModal.minimumReservationWarning")}
                </Text>
              </Animated.View>
            )}

            {/* Footer Section */}
            {selectedDates.startDate && selectedDates.endDate ? (
              <View style={styles.calendarFooter}>
                <TouchableOpacity
                  style={[styles.startAgainButton, rtlStyles.startAgainButton]}
                  onPress={onResetDates}
                >
                  <MaterialIcons name="loop" size={wp(5.5)} />
                  <Text
                    style={[
                      styles.startAgainButtonText,
                      rtlStyles.startAgainButtonText,
                    ]}
                  >
                    {t("listings.calendarModal.startAgain")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.calendarFooter}>
                <Text
                  style={[
                    styles.chooseDateRangeText,
                    rtlStyles.chooseDateRangeText,
                  ]}
                >
                  {t("listings.calendarModal.pleaseChooseDateRange")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  },
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
    maxHeight: hp(70),
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp(4),
    // paddingTop: Platform.OS === "ios" ? hp(6) : hp(4),
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
    // textAlign: "center",
    marginHorizontal: wp(2),
  },
  okButton: {
    backgroundColor: COLORS.okButton,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
  },
  okButtonText: {
    color: "#ffffff",
    fontSize: wp(4.5),
    fontWeight: "600",
  },
  calendarFooter: {
    padding: wp(1),
    paddingTop: hp(1.5),
    // paddingBottom: hp(1),
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
    fontWeight: "600",
    fontSize: wp(4.5),
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
