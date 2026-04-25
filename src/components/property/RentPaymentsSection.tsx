import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "@/constants";
import { useLocalization } from "@/hooks/useLocalization";
import type {
  RentPaymentScheduleRow,
  RentPaymentFrequencyId,
} from "@/types/property";

export interface RentPaymentsSectionProps {
  rows: RentPaymentScheduleRow[];
}

function frequencyKey(f: RentPaymentFrequencyId): string {
  switch (f) {
    case "yearly":
      return "listings.rentPaymentYearly";
    case "semiAnnual":
      return "listings.rentPaymentSemiAnnual";
    case "quarterly":
      return "listings.rentPaymentQuarterly";
    case "monthly":
      return "listings.rentPaymentMonthly";
    default:
      return "listings.rentPaymentYearly";
  }
}

function breakdownSuffixKey(f: RentPaymentFrequencyId): string {
  if (f === "monthly") return "listings.rentPaymentEveryMonth";
  return "listings.rentPaymentEachPayment";
}

const RentPaymentsSection = React.memo(function RentPaymentsSection({
  rows,
}: RentPaymentsSectionProps): React.JSX.Element | null {
  const { t, isRTL } = useLocalization();

  const rtlRow = useMemo(
    () => ({
      flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
    }),
    [isRTL],
  );

  const rtlTextEnd = useMemo(
    () => ({
      textAlign: (isRTL ? "left" : "right") as "left" | "right",
    }),
    [isRTL],
  );

  const rtlTextStart = useMemo(
    () => ({
      textAlign: (isRTL ? "right" : "left") as "left" | "right",
    }),
    [isRTL],
  );

  if (rows.length === 0) return null;

  const formatSar = (n: number) =>
    `${n.toLocaleString(isRTL ? "ar-SA" : "en-US")} ${t("listings.sar")}`;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.sectionTitle, rtlTextStart]}>
        {t("listings.rentPayments")}
      </Text>
      <View style={styles.list}>
        {rows.map((row, index) => {
          const hasRight =
            row.installmentAmountSar != null &&
            Number.isFinite(row.installmentAmountSar);
          const suffixKey = breakdownSuffixKey(row.frequency);
          return (
            <View
              key={`${row.frequency}-${index}`}
              style={[
                styles.row,
                rtlRow,
                index === rows.length - 1 && styles.lastListItemBorder,
                {
                  backgroundColor:
                    index % 2 === 0 ? COLORS.white : COLORS.background,
                },
              ]}
            >
              <View style={styles.leftCol}>
                <Text style={[styles.leftLine, rtlTextStart]}>
                  <Text style={styles.amountText}>
                    {formatSar(row.primaryAmountSar)}{" "}
                  </Text>
                  <Text style={styles.frequencyText}>
                    {t(frequencyKey(row.frequency))}
                  </Text>
                </Text>
              </View>
              {hasRight ? (
                <View style={styles.rightCol}>
                  <Text style={[styles.breakdownLine, rtlTextEnd]}>
                    <Text style={styles.breakdownAmount}>
                      {formatSar(row.installmentAmountSar as number)}{" "}
                    </Text>
                    <Text style={styles.breakdownSuffix}>{t(suffixKey)}</Text>
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.background,
    paddingTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: hp(1.5),
    paddingHorizontal: wp(4),
  },
  list: {
    backgroundColor: COLORS.background,
    overflow: "hidden",
  },
  row: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: wp(2),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  lastListItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  leftCol: {
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
  },
  leftLine: {
    flexWrap: "wrap",
  },
  amountText: {
    fontSize: wp(4),
    fontWeight: "400",
    color: COLORS.textPrimary,
  },
  frequencyText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  rightCol: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 0,
  },
  breakdownLine: {
    flexShrink: 1,
  },
  breakdownAmount: {
    fontSize: wp(3.5),
    fontWeight: "400",
    color: COLORS.textSecondary,
  },
  breakdownSuffix: {
    fontSize: wp(3.5),
    fontWeight: "400",
    color: COLORS.textSecondary,
  },
});

export default RentPaymentsSection;
