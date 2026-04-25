/**
 * Helper functions for order form handlers
 */

/**
 * Creates a toggle handler for tab bar selections
 */
import type {
  RentPaymentFrequency,
  RentPaymentFrequencyChoice,
} from "../constants/orderFormOptions";

export function createToggleHandler<T>(
  currentValue: T | null,
  setValue: (value: T | null) => void,
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
 * Creates a rent payment-frequency handler (Yearly / Semi Annual / Quarterly / Monthly).
 */
export function createRentPeriodHandler(
  currentPeriod: RentPaymentFrequency,
  setPeriod: (period: RentPaymentFrequency) => void,
  setPayment?: (payment: string | null) => void,
) {
  return (period: RentPaymentFrequencyChoice) => {
    if (currentPeriod === period) {
      setPeriod(null);
      if (setPayment) setPayment(null);
    } else {
      setPeriod(period);
    }
  };
}
