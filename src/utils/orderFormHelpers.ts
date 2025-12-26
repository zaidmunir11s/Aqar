/**
 * Helper functions for order form handlers
 */

/**
 * Creates a toggle handler for tab bar selections
 */
export function createToggleHandler<T>(
  currentValue: T | null,
  setValue: (value: T | null) => void
) {
  return (value: T) => {
    if (currentValue === value) {
      setValue(null);
    } else {
      setValue(value);
    }
  };
}

/**
 * Creates a rent period handler
 */
export function createRentPeriodHandler(
  currentPeriod: "Yearly" | "Monthly" | null,
  setPeriod: (period: "Yearly" | "Monthly" | null) => void,
  setPayment?: (payment: string | null) => void
) {
  return (period: "Yearly" | "Monthly") => {
    if (currentPeriod === period) {
      setPeriod(null);
      if (setPayment) setPayment(null);
    } else {
      setPeriod(period);
    }
  };
}

