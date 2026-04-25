// Date formatting utilities
const MONTH_NAMES = [
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
 * Format a date range for display
 * @param startDateStr - Start date string
 * @param endDateStr - End date string
 * @param t - Optional translation function
 * @param isRTL - Optional RTL flag to reverse date order
 * @returns Formatted date range
 */
export function formatDateRange(
  startDateStr: string,
  endDateStr: string,
  t?: (key: string) => string,
  isRTL?: boolean,
): string {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonthIndex = start.getMonth();
  const endMonthIndex = end.getMonth();

  // Use translated month names if translation function is provided
  const startMonth = t
    ? t(`listings.calendar.months.${MONTH_KEYS[startMonthIndex]}`)
    : MONTH_NAMES[startMonthIndex];
  const endMonth = t
    ? t(`listings.calendar.months.${MONTH_KEYS[endMonthIndex]}`)
    : MONTH_NAMES[endMonthIndex];

  // For RTL: reverse only the day numbers within same month, but keep chronological order for different months
  if (isRTL) {
    if (startMonthIndex === endMonthIndex) {
      // Same month: reverse day numbers (e.g., "23-21 January")
      return `${endDay}-${startDay} ${endMonth}`;
    } else {
      // Different months: keep chronological order but use RTL-friendly separator
      // Show as: "23 January - 4 February" (start to end, left to right in RTL)
      return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
    }
  } else {
    if (startMonthIndex === endMonthIndex) {
      return `${startDay}-${endDay} ${startMonth}`;
    } else {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
    }
  }
}

/**
 * Calculate the number of days between two dates
 * @param startDateStr - Start date string
 * @param endDateStr - End date string
 * @returns Number of days
 */
export function calculateDays(
  startDateStr: string,
  endDateStr: string,
): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  return (
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
}

/**
 * Get today's date as ISO string
 * @returns Today's date
 */
export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}
