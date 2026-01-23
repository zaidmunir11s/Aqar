import React, { memo, useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  title: string;
  initialDate?: Date;
}

// Constants
const ITEM_HEIGHT = hp(5);
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SPACER_HEIGHT = ITEM_HEIGHT * 2;
const SNAP_DELAY = 150;

// Month names will be translated dynamically
const MONTH_KEYS = [
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

/**
 * Professional Date Picker Modal with smooth scrolling
 * Best practices: memoization, optimized scroll handling, clean architecture
 */
const DatePickerModal = memo<DatePickerModalProps>(
  ({ visible, onClose, onDateSelect, title, initialDate }) => {
    const { t, isRTL } = useLocalization();
    const currentDate = useMemo(() => initialDate || new Date(), [initialDate]);
    
    // Get translated month names
    const months = useMemo(
      () => MONTH_KEYS.map((key) => t(`listings.calendar.months.${key}`)),
      [t]
    );
    
    // State
    const [selectedMonth, setSelectedMonth] = useState(() => currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(() => currentDate.getFullYear());
    const [selectedDay, setSelectedDay] = useState(() => currentDate.getDate());

    // Refs
    const dayScrollRef = useRef<ScrollView | null>(null);
    const monthScrollRef = useRef<ScrollView | null>(null);
    const yearScrollRef = useRef<ScrollView | null>(null);
    
    const dayScrollTimeoutRef = useRef<number | null>(null);
    const monthScrollTimeoutRef = useRef<number | null>(null);
    const yearScrollTimeoutRef = useRef<number | null>(null);

    // Generate years: 1900 to current year (ascending order)
    const years = useMemo(() => {
      const currentYear = new Date().getFullYear();
      const startYear = 1900;
      return Array.from(
        { length: currentYear - startYear + 1 },
        (_, i) => startYear + i
      );
    }, []);

    // Calculate days in selected month
    const daysInMonth = useMemo(
      () => new Date(selectedYear, selectedMonth + 1, 0).getDate(),
      [selectedYear, selectedMonth]
    );

    // Generate days array
    const days = useMemo(
      () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
      [daysInMonth]
    );

    // Update selected day when month/year changes
    useEffect(() => {
      if (selectedDay > daysInMonth) {
        setSelectedDay(daysInMonth);
      }
    }, [selectedDay, daysInMonth]);

    // Initialize scroll positions when modal opens
    useEffect(() => {
      if (!visible) return;

      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        // Scroll to selected day
        dayScrollRef.current?.scrollTo({
          y: (selectedDay - 1) * ITEM_HEIGHT,
          animated: false,
        });

        // Scroll to selected month
        monthScrollRef.current?.scrollTo({
          y: selectedMonth * ITEM_HEIGHT,
          animated: false,
        });

        // Scroll to selected year
        const yearIndex = years.indexOf(selectedYear);
        if (yearIndex >= 0) {
          yearScrollRef.current?.scrollTo({
            y: yearIndex * ITEM_HEIGHT,
            animated: false,
          });
        }
      }, 50);

      return () => clearTimeout(timer);
    }, [visible, selectedDay, selectedMonth, selectedYear, years]);

    // Update state when initialDate changes
    useEffect(() => {
      if (initialDate) {
        setSelectedMonth(initialDate.getMonth());
        setSelectedYear(initialDate.getFullYear());
        setSelectedDay(initialDate.getDate());
      }
    }, [initialDate]);

    // Cleanup timeouts on unmount
    useEffect(() => {
      return () => {
        [dayScrollTimeoutRef, monthScrollTimeoutRef, yearScrollTimeoutRef].forEach(
          (ref) => {
            if (ref.current) clearTimeout(ref.current);
          }
        );
      };
    }, []);

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        pickerHeader: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        pickerHeaderText: {
          textAlign: (isRTL ? "right" : "center") as "left" | "right" | "center",
        },
        pickerContent: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        pickerItemText: {
          textAlign: (isRTL ? "right" : "center") as "left" | "right" | "center",
        },
      }),
      [isRTL]
    );

    /**
     * Snap scroll to nearest item
     */
    const snapToNearestItem = useCallback((
      scrollRef: React.RefObject<ScrollView | null>,
      y: number,
      itemCount: number,
      onSelect: (index: number) => void
    ) => {
      const index = Math.round(y / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, itemCount - 1));
      const targetY = clampedIndex * ITEM_HEIGHT;

      onSelect(clampedIndex);

      scrollRef.current?.scrollTo({
        y: targetY,
        animated: true,
      });
    }, []);

    /**
     * Handle scroll end with debounced snap
     */
    const handleScrollEnd = useCallback((
      event: NativeSyntheticEvent<NativeScrollEvent>,
      scrollRef: React.RefObject<ScrollView | null>,
      itemCount: number,
      onSelect: (index: number) => void,
      timeoutRef: { current: number | null }
    ) => {
      const y = event.nativeEvent.contentOffset.y;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce snap to prevent janky behavior
      timeoutRef.current = setTimeout(() => {
        snapToNearestItem(scrollRef, y, itemCount, onSelect);
      }, SNAP_DELAY);
    }, [snapToNearestItem]);

    /**
     * Render picker column
     */
    const renderPickerColumn = useCallback((
      items: (string | number)[],
      selectedIndex: number,
      onSelect: (index: number) => void,
      scrollRef: React.RefObject<ScrollView | null>,
      timeoutRef: { current: number | null }
    ) => {
      return (
        <View style={styles.pickerColumn}>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate={Platform.OS === "ios" ? 0.92 : 0.95}
            scrollEventThrottle={16}
            bounces={false}
            onScrollEndDrag={(e) =>
              handleScrollEnd(e, scrollRef, items.length, onSelect, timeoutRef)
            }
            onMomentumScrollEnd={(e) =>
              handleScrollEnd(e, scrollRef, items.length, onSelect, timeoutRef)
            }
          >
            <View style={{ height: SPACER_HEIGHT }} />
            {items.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <View key={index} style={[styles.pickerItem, { height: ITEM_HEIGHT }]}>
                  <Text
                    style={[
                      styles.pickerItemText,
                      isSelected && styles.pickerItemTextSelected,
                      rtlStyles.pickerItemText,
                    ]}
                  >
                    {String(item)}
                  </Text>
                </View>
              );
            })}
            <View style={{ height: SPACER_HEIGHT }} />
          </ScrollView>
        </View>
      );
    }, [handleScrollEnd, rtlStyles]);

    const handleOk = useCallback(() => {
      // Format date based on RTL: DD / MM / YYYY for both, but order columns differently
      const formattedDate = `${String(selectedDay).padStart(2, "0")} / ${String(selectedMonth + 1).padStart(2, "0")} / ${selectedYear}`;
      onDateSelect(formattedDate);
      onClose();
    }, [selectedDay, selectedMonth, selectedYear, onDateSelect, onClose]);

    const yearIndex = useMemo(
      () => years.indexOf(selectedYear),
      [years, selectedYear]
    );

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
          <View style={styles.pickerContainer}>
            <View style={[styles.pickerHeader, rtlStyles.pickerHeader]}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons 
                  name={isRTL ? "arrow-forward" : "arrow-back"} 
                  size={wp(6)} 
                  color={COLORS.primary} 
                />
              </TouchableOpacity>
              <Text style={[styles.pickerHeaderText, rtlStyles.pickerHeaderText]}>
                {title}
              </Text>
              <TouchableOpacity style={styles.okButton} onPress={handleOk}>
                <Text style={styles.okButtonText}>
                  {t("common.confirm")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.pickerContent, rtlStyles.pickerContent]}>
              {renderPickerColumn(
                days,
                Math.min(selectedDay - 1, days.length - 1),
                (index) => setSelectedDay(index + 1),
                dayScrollRef,
                dayScrollTimeoutRef
              )}
              {renderPickerColumn(
                months,
                selectedMonth,
                setSelectedMonth,
                monthScrollRef,
                monthScrollTimeoutRef
              )}
              {renderPickerColumn(
                years,
                yearIndex >= 0 ? yearIndex : 0,
                (index) => setSelectedYear(years[index]),
                yearScrollRef,
                yearScrollTimeoutRef
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);

DatePickerModal.displayName = "DatePickerModal";

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
  pickerContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    paddingBottom: hp(3),
    maxHeight: hp(60),
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp(4),
    paddingBottom: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: wp(1),
  },
  pickerHeaderText: {
    flex: 1,
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#111827",
    marginHorizontal: wp(2),
    textAlign: "center",
  },
  okButton: {
    backgroundColor: COLORS.okButton,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    borderRadius: wp(4),
  },
  okButtonText: {
    color: "#ffffff",
    fontSize: wp(4.5),
    fontWeight: "600",
  },
  pickerContent: {
    flexDirection: "row",
    height: PICKER_HEIGHT,
    position: "relative",
  },
  pickerColumn: {
    flex: 1,
    height: "100%",
  },
  pickerItem: {
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemText: {
    fontSize: wp(4),
    color: "#9ca3af",
  },
  pickerItemTextSelected: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.primary,
  },
});

export default DatePickerModal;
