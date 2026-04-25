import React, { memo, useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
// import { getTodayISO } from "../../utils";
import type { CalendarDates } from "../../hooks/useCalendar";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

const PRIMARY = "#304050"; // Black for selected start/end dates
const RANGE_BG = "#e5e7eb"; // Light grey for range background
const MUTED = "#9ca3af"; // Muted color for disabled dates
const BLUE = "#3b82f6"; // Blue for search button
const BORDER = "#e5e7eb"; // Border color

export interface BookingDateModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: () => void;
  selectedDates: CalendarDates;
  onDayPress: (day: { dateString: string }) => void;
}

// Helper function to check if two dates are the same day
const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

// Helper function to get month days
function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return days;
}

// Helper function to get 6 months starting from current month (current + next 5)
const getSixMonths = (
  t: any,
): { year: number; month: number; label: string }[] => {
  const months: { year: number; month: number; label: string }[] = [];
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Always show current month + next 5 months
  for (let i = 0; i < 6; i++) {
    const month = new Date(currentMonth);
    month.setMonth(currentMonth.getMonth() + i);
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const monthKeys = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    months.push({
      year,
      month: monthIndex,
      label: `${t(`listings.calendar.months.${monthKeys[monthIndex]}`)} ${year}`,
    });
  }

  return months;
};

const BookingDateModal = memo<BookingDateModalProps>(
  ({ visible, onClose, onSearch, selectedDates, onDayPress }) => {
    const { t, isRTL } = useLocalization();
    const [months, setMonths] = useState<
      { year: number; month: number; label: string }[]
    >(getSixMonths(t));
    const hasInitialized = useRef<boolean>(false);
    const hasSetTomorrow = useRef<boolean>(false);

    // Week days with translations
    const WEEK_DAYS = useMemo(
      () => [
        t("listings.calendar.weekdays.sun"),
        t("listings.calendar.weekdays.mon"),
        t("listings.calendar.weekdays.tue"),
        t("listings.calendar.weekdays.wed"),
        t("listings.calendar.weekdays.thu"),
        t("listings.calendar.weekdays.fri"),
        t("listings.calendar.weekdays.sat"),
      ],
      [t],
    );

    // Initialize with today and tomorrow selected when modal first opens
    useEffect(() => {
      if (
        visible &&
        !hasInitialized.current &&
        !selectedDates.startDate &&
        !selectedDates.endDate
      ) {
        hasInitialized.current = true;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const formatDateString = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const todayStr = formatDateString(today);
        const tomorrowStr = formatDateString(tomorrow);

        // Set default dates - first set today, then tomorrow
        // The hook will handle setting startDate first, then endDate
        onDayPress({ dateString: todayStr });
      }

      // Reset initialization flags when modal closes
      if (!visible) {
        hasInitialized.current = false;
        hasSetTomorrow.current = false;
      }
    }, [visible, selectedDates.startDate, selectedDates.endDate, onDayPress]);

    // Handle setting tomorrow after today is set (when startDate becomes today)
    useEffect(() => {
      if (
        visible &&
        hasInitialized.current &&
        !hasSetTomorrow.current &&
        selectedDates.startDate &&
        !selectedDates.endDate
      ) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const formatDateString = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        // Parse the startDate to check if it's today
        const parseDateString = (dateStr: string): Date => {
          const [year, month, day] = dateStr.split("-").map(Number);
          const date = new Date(year, month - 1, day);
          date.setHours(0, 0, 0, 0);
          return date;
        };

        const startDate = parseDateString(selectedDates.startDate);

        // Only set tomorrow if startDate is today and we haven't set it yet
        if (isSameDay(startDate, today)) {
          hasSetTomorrow.current = true;
          const tomorrowStr = formatDateString(tomorrow);
          // Use a small delay to ensure the state update from the first call is processed
          setTimeout(() => {
            onDayPress({ dateString: tomorrowStr });
          }, 50);
        }
      }
    }, [visible, selectedDates.startDate, selectedDates.endDate, onDayPress]);

    // Update months when modal opens, when a new month starts, or when language changes
    useEffect(() => {
      const updateMonths = () => {
        const newMonths = getSixMonths(t);
        setMonths(newMonths);
      };

      if (visible) {
        // Update immediately when modal opens or language changes
        updateMonths();

        // Check daily if we need to update (when a new month starts)
        const interval = setInterval(updateMonths, 24 * 60 * 60 * 1000); // Check once per day

        return () => clearInterval(interval);
      } else {
        // Also update when language changes even if modal is closed
        updateMonths();
      }
    }, [visible, t]);

    // Get today's date (normalized to start of day)
    const today = useMemo(() => {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      return t;
    }, []);

    // Parse start and end dates - parse from YYYY-MM-DD string to avoid timezone issues
    const [startDate, endDate] = useMemo(() => {
      if (!selectedDates.startDate) return [null, null];

      // Parse YYYY-MM-DD string directly
      const parseDateString = (dateStr: string): Date => {
        const [year, month, day] = dateStr.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        return date;
      };

      const start = parseDateString(selectedDates.startDate);

      if (!selectedDates.endDate) return [start, null];

      const end = parseDateString(selectedDates.endDate);

      // Ensure start is before end
      return start < end ? [start, end] : [end, start];
    }, [selectedDates]);

    // Helper functions for date checking
    const isInRange = (date: Date): boolean => {
      if (!startDate || !endDate) return false;
      // Don't show range if start and end are the same date
      if (isSameDay(startDate, endDate)) return false;
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d > startDate && d < endDate;
    };

    const isStart = (date: Date): boolean => {
      if (!startDate) return false;
      return isSameDay(date, startDate);
    };

    const isEnd = (date: Date): boolean => {
      if (!endDate) return false;
      return isSameDay(date, endDate);
    };

    const isPast = (date: Date): boolean => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d < today;
    };

    const isToday = (date: Date): boolean => {
      return isSameDay(date, today);
    };

    // Helper function to format date as YYYY-MM-DD without timezone issues
    const formatDateString = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const handleDatePress = (date: Date) => {
      if (isPast(date)) return;

      // Format date string directly to avoid timezone issues
      const dateString = formatDateString(date);

      // Handle clicking the same date when only startDate is selected
      // Just ignore it - don't do anything, keep the selection as is
      if (startDate && !endDate && isSameDay(date, startDate)) {
        return; // Don't do anything, keep the start date selected
      }

      // Normal date selection - the hook handles the rest
      onDayPress({ dateString });
    };

    if (!visible) {
      return null;
    }

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={styles.modal}>
            <Text style={[styles.title, isRTL && styles.titleRTL]}>
              {t("listings.bookingDate")}
            </Text>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {months.map((m) => {
                const days = getMonthDays(m.year, m.month);

                return (
                  <View key={m.label} style={styles.monthContainer}>
                    <Text style={[styles.month, isRTL && styles.monthRTL]}>
                      {m.label}
                    </Text>

                    <View style={[styles.weekRow, isRTL && styles.weekRowRTL]}>
                      {WEEK_DAYS.map((d) => (
                        <Text
                          key={d}
                          style={[styles.weekText, isRTL && styles.weekTextRTL]}
                        >
                          {d}
                        </Text>
                      ))}
                    </View>

                    <View
                      style={[styles.daysGrid, isRTL && styles.daysGridRTL]}
                    >
                      {days.map((day, idx) => {
                        if (day === null) {
                          return <View key={idx} style={styles.dayCell} />;
                        }

                        // Create date at local midnight to avoid timezone issues
                        const date = new Date(m.year, m.month, day);
                        date.setHours(0, 0, 0, 0);

                        const past = isPast(date);
                        const inRange = isInRange(date);
                        const start = isStart(date);
                        const end = isEnd(date);
                        const todayDate = isToday(date);
                        // Only show connectors when there's a range AND start and end are different dates
                        const hasRange =
                          startDate &&
                          endDate &&
                          !isSameDay(startDate, endDate);

                        return (
                          <TouchableOpacity
                            key={idx}
                            disabled={past}
                            onPress={() => handleDatePress(date)}
                            style={styles.dayCell}
                          >
                            {/* CONNECTORS - Visual range connection - only show when there's a range */}
                            {hasRange && (inRange || end) && (
                              <View
                                style={[
                                  styles.leftConnector,
                                  isRTL && styles.leftConnectorRTL,
                                ]}
                              />
                            )}
                            {hasRange && (inRange || start) && (
                              <View
                                style={[
                                  styles.rightConnector,
                                  isRTL && styles.rightConnectorRTL,
                                ]}
                              />
                            )}

                            {/* DAY CIRCLE */}
                            <View
                              style={[
                                styles.circle,
                                (start || end) && styles.edgeCircle,
                                inRange && styles.midCircle,
                                todayDate &&
                                  !start &&
                                  !end &&
                                  !inRange &&
                                  styles.todayCircle,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.dayText,
                                  past && styles.mutedText,
                                  (start || end) && styles.edgeText,
                                  todayDate &&
                                    !start &&
                                    !end &&
                                    !inRange &&
                                    styles.todayText,
                                ]}
                              >
                                {day}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={[styles.footer, isRTL && styles.footerRTL]}>
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={onSearch}
                activeOpacity={0.8}
              >
                <Text style={styles.searchText}>{t("common.search")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

BookingDateModal.displayName = "BookingDateModal";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    width: wp(90),
    maxWidth: 400,
    maxHeight: hp(70),
    backgroundColor: "#fff",
    borderRadius: wp(3.5),
    overflow: "hidden",
  },
  title: {
    fontSize: wp(4.5),
    fontWeight: "600",
    padding: wp(5),
    paddingBottom: hp(1),
    color: "#111827",
  },
  titleRTL: {
    textAlign: "right",
  },
  scrollView: {
    maxHeight: hp(60),
    minHeight: hp(40),
  },
  scrollContent: {
    paddingBottom: hp(1),
  },
  monthContainer: {
    marginBottom: hp(1.5),
  },
  month: {
    fontSize: wp(4),
    fontWeight: "500",
    marginTop: hp(1),
    marginBottom: hp(1.5),
    paddingHorizontal: wp(5),
    color: "#111827",
  },
  monthRTL: {
    textAlign: "right",
  },
  weekRow: {
    flexDirection: "row",
    paddingHorizontal: wp(3),
    marginBottom: hp(1),
  },
  weekRowRTL: {
    flexDirection: "row-reverse",
  },
  weekText: {
    width: "14.28%",
    textAlign: "center",
    fontSize: wp(3.5),
    color: "#000000",
    fontWeight: "500",
  },
  weekTextRTL: {
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: wp(4),
  },
  daysGridRTL: {
    flexDirection: "row-reverse",
  },
  dayCell: {
    width: "14.28%",
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  leftConnector: {
    position: "absolute",
    left: 0,
    width: "50%",
    height: wp(8.5),
    backgroundColor: RANGE_BG,
    zIndex: 0,
  },
  leftConnectorRTL: {
    left: undefined,
    right: 0,
  },
  rightConnector: {
    position: "absolute",
    right: 0,
    width: "50%",
    height: wp(8.5),
    backgroundColor: RANGE_BG,
    zIndex: 0,
  },
  rightConnectorRTL: {
    right: undefined,
    left: 0,
  },
  circle: {
    width: wp(8.5),
    height: wp(8.5),
    borderRadius: wp(4.25),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "transparent",
  },
  edgeCircle: {
    backgroundColor: PRIMARY,
  },
  midCircle: {
    // backgroundColor: "#f5f7f9",
  },
  todayCircle: {
    // backgroundColor: "transparent",
    // borderWidth: 1,
    // borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: wp(4),
    color: "#111827",
  },
  edgeText: {
    color: "#fff",
    fontWeight: "400",
  },
  todayText: {
    color: COLORS.primary,
    fontWeight: "400",
  },
  mutedText: {
    color: MUTED,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: BORDER,
    padding: wp(4),
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  footerRTL: {
    justifyContent: "flex-start",
  },
  searchBtn: {
    width: "50%",
    backgroundColor: COLORS.primary,
    height: hp(6),
    borderRadius: wp(7),
    justifyContent: "center",
    alignItems: "center",
  },
  searchText: {
    color: "#fff",
    fontSize: wp(4.5),
    fontWeight: "600",
  },
});

export default BookingDateModal;
