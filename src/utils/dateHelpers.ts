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

/**
 * Format a date range for display
 * @param startDateStr - Start date string
 * @param endDateStr - End date string
 * @returns Formatted date range
 */
export function formatDateRange(
  startDateStr: string,
  endDateStr: string
): string {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = MONTH_NAMES[start.getMonth()];
  const endMonth = MONTH_NAMES[end.getMonth()];

  if (startMonth === endMonth) {
    return `${startDay}-${endDay} ${startMonth}`;
  } else {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
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
  endDateStr: string
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
