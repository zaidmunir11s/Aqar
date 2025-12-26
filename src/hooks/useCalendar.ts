import { useState, useCallback } from "react";

export interface CalendarDates {
  startDate: string | null;
  endDate: string | null;
}

export interface MarkedDates {
  [key: string]: {
    selected: boolean;
    selectedColor: string;
    selectedTextColor: string;
  };
}

/**
 * Custom hook for calendar date range selection
 * @param initialDates - Initial date selection
 * @returns Calendar state and functions
 */
export function useCalendar(
  initialDates: CalendarDates = { startDate: null, endDate: null }
) {
  const [selectedDates, setSelectedDates] =
    useState<CalendarDates>(initialDates);
  const [markedDates, setMarkedDates] = useState<MarkedDates>(() => {
    if (initialDates.startDate && initialDates.endDate) {
      return generateMarkedDates(initialDates.startDate, initialDates.endDate);
    }
    return {};
  });

  const handleDateSelect = useCallback(
    (day: { dateString: string }) => {
      const dateString = day.dateString;

      if (
        !selectedDates.startDate ||
        (selectedDates.startDate && selectedDates.endDate)
      ) {
        // Start new selection - single date in blue
        setSelectedDates({ startDate: dateString, endDate: null });
        setMarkedDates({
          [dateString]: {
            selected: true,
            selectedColor: "#3b82f6",
            selectedTextColor: "#ffffff",
          },
        });
      } else {
        // Complete the range
        const start = new Date(selectedDates.startDate);
        const end = new Date(dateString);

        if (end < start) {
          // If end is before start, swap them
          setSelectedDates({
            startDate: dateString,
            endDate: selectedDates.startDate,
          });
          setMarkedDates(
            generateMarkedDates(dateString, selectedDates.startDate)
          );
        } else {
          setSelectedDates({ ...selectedDates, endDate: dateString });
          setMarkedDates(
            generateMarkedDates(selectedDates.startDate, dateString)
          );
        }
      }
    },
    [selectedDates]
  );

  const resetDates = useCallback(() => {
    setSelectedDates({ startDate: null, endDate: null });
    setMarkedDates({});
  }, []);

  return {
    selectedDates,
    markedDates,
    handleDateSelect,
    resetDates,
    setSelectedDates,
    setMarkedDates,
  };
}

/**
 * @param startDateStr - Start date
 * @param endDateStr - End date
 * @returns Marked dates object
 */
function generateMarkedDates(
  startDateStr: string,
  endDateStr: string
): MarkedDates {
  const newMarked: MarkedDates = {};
  let currentDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Use blue color for individual date boxes (not connected range)
  // Each date should be a separate blue square box
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];

    // Each date is an individual selected box (not part of a connected range)
    newMarked[dateStr] = {
      selected: true,
      selectedColor: "#3b82f6",
      selectedTextColor: "#ffffff",
    };
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return newMarked;
}
