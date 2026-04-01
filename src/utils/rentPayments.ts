import type { RentPaymentScheduleRow } from "../types/property";

/** Values from the marketing-request pricing step (user-entered amounts + toggles). */
export type UserRentPaymentPublishInput = {
  /** Annual rent from the main field (contract reference). */
  annualSar: number;
  acceptMonthly?: boolean;
  monthlyInstallmentSar?: number;
  acceptQuarterly?: boolean;
  quarterlyInstallmentSar?: number;
  acceptSemiAnnual?: boolean;
  semiAnnualInstallmentSar?: number;
};

/**
 * Builds the schedule shown on property details from what the user entered.
 * Yearly uses the main annual rent; each installment row uses that option's total (e.g. monthly×12)
 * on the left and the per-period amount on the right, matching the pricing screen.
 */
export function buildRentPaymentScheduleFromPublishForm(
  input: UserRentPaymentPublishInput | undefined
): RentPaymentScheduleRow[] {
  if (!input) return [];
  const annual = input.annualSar;
  if (!Number.isFinite(annual) || annual <= 0) return [];

  const rows: RentPaymentScheduleRow[] = [
    { frequency: "yearly", primaryAmountSar: Math.round(annual) },
  ];

  const pushInstallment = (
    frequency: RentPaymentScheduleRow["frequency"],
    periodsPerYear: number,
    accept: boolean | undefined,
    installmentSar: number | undefined
  ) => {
    if (!accept || installmentSar == null) return;
    if (!Number.isFinite(installmentSar) || installmentSar <= 0) return;
    const per = installmentSar;
    rows.push({
      frequency,
      primaryAmountSar: Math.round(per * periodsPerYear),
      installmentAmountSar: Math.round(per),
    });
  };

  pushInstallment("semiAnnual", 2, input.acceptSemiAnnual, input.semiAnnualInstallmentSar);
  pushInstallment("quarterly", 4, input.acceptQuarterly, input.quarterlyInstallmentSar);
  pushInstallment("monthly", 12, input.acceptMonthly, input.monthlyInstallmentSar);

  return rows;
}

/**
 * Default rows when `rentPaymentSchedule` is not stored on the listing:
 * same annual reference on the left, per-period amount on the right (except yearly).
 */
export function buildDefaultRentPaymentRows(annualSar: number): RentPaymentScheduleRow[] {
  if (!Number.isFinite(annualSar) || annualSar <= 0) return [];
  const a = Math.round(annualSar);
  return [
    { frequency: "yearly", primaryAmountSar: a },
    {
      frequency: "semiAnnual",
      primaryAmountSar: a,
      installmentAmountSar: Math.round(a / 2),
    },
    {
      frequency: "quarterly",
      primaryAmountSar: a,
      installmentAmountSar: Math.round(a / 4),
    },
    {
      frequency: "monthly",
      primaryAmountSar: a,
      installmentAmountSar: Math.round(a / 12),
    },
  ];
}
