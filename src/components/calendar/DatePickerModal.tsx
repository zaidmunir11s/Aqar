import React, { memo, useState, useRef, useEffect, useCallback } from "react";
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

export interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  title: string;
  initialDate?: Date;
}

// Constants for picker dimensions
const ITEM_HEIGHT = hp(5);
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SPACER_HEIGHT = ITEM_HEIGHT * 2;

/**
 * Date picker modal with smooth, controlled scrolling for month and year selection
 */
const DatePickerModal = memo<DatePickerModalProps>(
  ({ visible, onClose, onDateSelect, title, initialDate }) => {
    const currentDate = initialDate || new Date();
    const [selectedMonth, setSelectedMonth] = useState(() => currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(() => currentDate.getFullYear());
    const [selectedDay, setSelectedDay] = useState(() => currentDate.getDate());

    // Update state when initialDate changes
    useEffect(() => {
      if (initialDate) {
        setSelectedMonth(initialDate.getMonth());
        setSelectedYear(initialDate.getFullYear());
        setSelectedDay(initialDate.getDate());
      }
    }, [initialDate]);

    const monthScrollRef = useRef<ScrollView | null>(null);
    const yearScrollRef = useRef<ScrollView | null>(null);
    const dayScrollRef = useRef<ScrollView | null>(null);

    // Track if user is actively scrolling
    const monthIsScrollingRef = useRef(false);
    const yearIsScrollingRef = useRef(false);
    const dayIsScrollingRef = useRef(false);

    // Track scroll timeouts for debouncing
    const monthScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const yearScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dayScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Generate years array - 100 years range centered around current year
    const currentYear = currentDate.getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Update selected day if it exceeds days in month when month/year changes
    useEffect(() => {
      if (selectedDay > daysInMonth) {
        const newDay = daysInMonth;
        setSelectedDay(newDay);
        setTimeout(() => {
          if (!dayIsScrollingRef.current) {
            dayScrollRef.current?.scrollTo({
              y: (newDay - 1) * ITEM_HEIGHT,
              animated: true,
            });
          }
        }, 100);
      }
    }, [selectedMonth, selectedYear, daysInMonth, selectedDay]);

    // Initialize scroll positions when modal opens
    useEffect(() => {
      if (visible) {
        const scrollTimeout = setTimeout(() => {
          // Scroll to selected month
          monthScrollRef.current?.scrollTo({
            y: selectedMonth * ITEM_HEIGHT,
            animated: false,
          });

          // Scroll to selected year
          const yearIndex = years.findIndex((y) => y === selectedYear);
          if (yearIndex >= 0) {
            yearScrollRef.current?.scrollTo({
              y: yearIndex * ITEM_HEIGHT,
              animated: false,
            });
          }

          // Scroll to selected day
          dayScrollRef.current?.scrollTo({
            y: (selectedDay - 1) * ITEM_HEIGHT,
            animated: false,
          });
        }, 100);
        return () => clearTimeout(scrollTimeout);
      }
    }, [visible, selectedMonth, selectedYear, selectedDay, years]);

    const handleOk = () => {
      const date = new Date(selectedYear, selectedMonth, selectedDay);
      const formattedDate = `${String(selectedDay).padStart(2, "0")} / ${String(selectedMonth + 1).padStart(2, "0")} / ${selectedYear}`;
      onDateSelect(formattedDate);
      onClose();
    };

    /**
     * Smooth snap-to-item function that prevents fast scrolling
     */
    const snapToItem = useCallback((
      scrollRef: React.RefObject<ScrollView | null>,
      y: number,
      itemCount: number,
      onSelect: (index: number) => void,
      isScrollingRef: React.MutableRefObject<boolean>,
      timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
      isYearColumn: boolean = false
    ) => {
      // Calculate the nearest item index
      const index = Math.round(y / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, itemCount - 1));
      const targetY = clampedIndex * ITEM_HEIGHT;

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Update selection
      onSelect(clampedIndex);

      // For year column, use faster animation and immediate snap
      if (isYearColumn) {
        isScrollingRef.current = true;
        // Immediate snap with shorter animation
        scrollRef.current?.scrollTo({
          y: targetY,
          animated: true,
        });

        // Reset scrolling flag quickly
        timeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
          // Ensure we're exactly on the item
          scrollRef.current?.scrollTo({
            y: targetY,
            animated: false,
          });
        }, 200);
      } else {
        // Snap to position with smooth animation for other columns
        isScrollingRef.current = true;
        scrollRef.current?.scrollTo({
          y: targetY,
          animated: true,
        });

        // Reset scrolling flag after animation completes
        timeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
          // Ensure we're exactly on the item
          scrollRef.current?.scrollTo({
            y: targetY,
            animated: false,
          });
        }, 300);
      }
    }, []);

    /**
     * Handle scroll events with controlled snapping
     */
    const handleScroll = useCallback((
      event: NativeSyntheticEvent<NativeScrollEvent>,
      itemCount: number,
      onSelect: (index: number) => void,
      scrollRef: React.RefObject<ScrollView | null>,
      isScrollingRef: React.MutableRefObject<boolean>,
      timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
      isYearColumn: boolean = false
    ) => {
      // For year column, we don't need to do anything during scroll
      // We'll handle snapping only on scroll end
      if (isYearColumn) {
        return;
      }

      const y = event.nativeEvent.contentOffset.y;
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // For other columns, debounce the snap operation
      timeoutRef.current = setTimeout(() => {
        if (!isScrollingRef.current) {
          snapToItem(scrollRef, y, itemCount, onSelect, isScrollingRef, timeoutRef);
        }
      }, 100);
    }, [snapToItem]);

    /**
     * Handle scroll end (when user releases)
     */
    const handleScrollEnd = useCallback((
      event: NativeSyntheticEvent<NativeScrollEvent>,
      itemCount: number,
      onSelect: (index: number) => void,
      scrollRef: React.RefObject<ScrollView | null>,
      isScrollingRef: React.MutableRefObject<boolean>,
      timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
      isYearColumn: boolean = false
    ) => {
      const y = event.nativeEvent.contentOffset.y;
      snapToItem(scrollRef, y, itemCount, onSelect, isScrollingRef, timeoutRef, isYearColumn);
    }, [snapToItem]);

    /**
     * Render a picker column with controlled scrolling
     */
    const renderPickerColumn = (
      items: (string | number)[],
      selectedValue: number,
      onSelect: (value: number) => void,
      scrollRef: React.RefObject<ScrollView | null>,
      isScrollingRef: React.MutableRefObject<boolean>,
      timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
      getLabel: (item: string | number) => string = (item) => String(item),
      isYearColumn: boolean = false
    ) => {
      // Use much higher decelerationRate for years (closer to 1.0 = less momentum)
      // 0.998 means almost no momentum, making it very controlled and precise
      // This allows one-by-one dragging without fast jumping
      const decelerationRate = isYearColumn ? 0.998 : (Platform.OS === "ios" ? 0.92 : 0.95);

      return (
        <View style={styles.pickerColumn}>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate={decelerationRate}
            scrollEventThrottle={16}
            pagingEnabled={false}
            bounces={false}
            onScrollBeginDrag={() => {
              isScrollingRef.current = true;
            }}
            onScroll={(e) => {
              handleScroll(e, items.length, onSelect, scrollRef, isScrollingRef, timeoutRef, isYearColumn);
            }}
            onScrollEndDrag={(e) => {
              handleScrollEnd(e, items.length, onSelect, scrollRef, isScrollingRef, timeoutRef, isYearColumn);
            }}
            onMomentumScrollEnd={(e) => {
              handleScrollEnd(e, items.length, onSelect, scrollRef, isScrollingRef, timeoutRef, isYearColumn);
            }}
            // Aggressively stop momentum for year column
            onMomentumScrollBegin={(e) => {
              isScrollingRef.current = true;
              if (isYearColumn) {
                // For years, immediately stop momentum scrolling by snapping to nearest item
                const currentY = e.nativeEvent.contentOffset.y;
                const index = Math.round(currentY / ITEM_HEIGHT);
                const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
                const targetY = clampedIndex * ITEM_HEIGHT;
                
                // Clear any pending timeouts
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                }
                
                // Immediately snap to prevent any momentum
                scrollRef.current?.scrollTo({
                  y: targetY,
                  animated: true,
                });
                
                // Update selection
                onSelect(clampedIndex);
                
                // Reset flag after snap
                timeoutRef.current = setTimeout(() => {
                  isScrollingRef.current = false;
                  scrollRef.current?.scrollTo({
                    y: targetY,
                    animated: false,
                  });
                }, 200);
              }
            }}
          >
            <View style={{ height: SPACER_HEIGHT }} />
            {items.map((item, index) => {
              const isSelected = index === selectedValue;
              return (
                <View key={index} style={[styles.pickerItem, { height: ITEM_HEIGHT }]}>
                  <Text
                    style={[
                      styles.pickerItemText,
                      isSelected && styles.pickerItemTextSelected,
                    ]}
                  >
                    {getLabel(item)}
                  </Text>
                </View>
              );
            })}
            <View style={{ height: SPACER_HEIGHT }} />
          </ScrollView>
        </View>
      );
    };

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
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name="arrow-back" size={wp(6)} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.pickerHeaderText}>{title}</Text>
              <TouchableOpacity style={styles.okButton} onPress={handleOk}>
                <Text style={styles.okButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContent}>
              {renderPickerColumn(
                days,
                Math.min(selectedDay - 1, days.length - 1),
                (index) => setSelectedDay(index + 1),
                dayScrollRef,
                dayIsScrollingRef,
                dayScrollTimeoutRef,
                undefined,
                false
              )}
              {renderPickerColumn(
                months,
                selectedMonth,
                setSelectedMonth,
                monthScrollRef,
                monthIsScrollingRef,
                monthScrollTimeoutRef,
                undefined,
                false
              )}
              {renderPickerColumn(
                years,
                years.findIndex((y) => y === selectedYear),
                (index) => setSelectedYear(years[index]),
                yearScrollRef,
                yearIsScrollingRef,
                yearScrollTimeoutRef,
                undefined,
                true // Mark as year column for special handling
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
