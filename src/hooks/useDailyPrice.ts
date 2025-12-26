import { useCallback, useMemo } from "react";
import { calculateDays } from "../utils";
import { CalendarDates } from "./useCalendar";

export interface DailyPriceProperty {
  bookingType?: "daily" | "monthly";
  dailyPrice?: number;
  monthlyPrice?: number;
}

/**
 * Custom hook for calculating daily booking prices
 * @param selectedDates - Selected start and end dates
 * @returns Price calculation functions
 */
export function useDailyPrice(selectedDates: CalendarDates | null | undefined) {
  const calculatePrice = useCallback(
    (property: DailyPriceProperty): number | null => {
      if (!selectedDates?.startDate || !selectedDates?.endDate) {
        return null;
      }

      const days = calculateDays(
        selectedDates.startDate,
        selectedDates.endDate
      );

      // For monthly properties: show monthly price if < 30 days, otherwise calculate and round
      if (property.bookingType === "monthly") {
        if (days < 30) {
          return property.monthlyPrice ?? null;
        } else {
          // Calculate and round if decimal
          const calculated = (property.dailyPrice ?? 0) * days;
          return Math.round(calculated);
        }
      }

      // For daily properties: calculate and round if decimal
      const calculated = (property.dailyPrice ?? 0) * days;
      return Math.round(calculated);
    },
    [selectedDates]
  );

  const hasValidDates = useMemo(() => {
    return !!(selectedDates?.startDate && selectedDates?.endDate);
  }, [selectedDates]);

  return {
    calculatePrice,
    hasValidDates,
  };
}
