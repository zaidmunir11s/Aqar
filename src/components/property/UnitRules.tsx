import React, { memo, useMemo, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import type { DailyProperty } from "../../types/property";
import { InfoItem } from "./PropertyInfo";
import { COLORS } from "@/constants/colors";
import { useLocalization } from "../../hooks/useLocalization";

export interface UnitRulesProps {
  property: DailyProperty;
}

interface RuleItem {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

/**
 * Unit Rules component - displays booking rules based on booking type
 */
const UnitRules = memo<UnitRulesProps>(({ property }) => {
  const { t, isRTL } = useLocalization();

  // Helper function to format time with translated AM/PM
  const formatTime = useCallback(
    (timeString: string): string => {
      // Parse time string like "04:00 pm" or "12:00 am"
      const match = timeString.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
      if (!match) return timeString;

      const [, hours, minutes, period] = match;
      const periodLower = period.toLowerCase();
      const amText = t("listings.time.am");
      const pmText = t("listings.time.pm");

      return `${hours}:${minutes} ${periodLower === "am" ? amText : pmText}`;
    },
    [t],
  );

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      sectionTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      ruleRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      ruleLeftSection: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      ruleLabel: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        marginLeft: isRTL ? 0 : wp(8),
        marginRight: isRTL ? wp(8) : 0,
      },
      ruleValue: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL],
  );

  // Get rules based on booking type
  const getRules = (): RuleItem[] => {
    const { bookingType } = property;

    // Default values - can be extended to use property data when available
    switch (bookingType) {
      case "monthly":
        return [
          {
            icon: "calendar-outline",
            label: t("listings.unitRules.minimumReservableDays"),
            value: `30 ${t("listings.unitRules.days")}`,
          },
          {
            icon: "time-outline",
            label: t("listings.unitRules.arrivalTime"),
            value: formatTime("04:00 pm"),
          },
          {
            label: t("listings.unitRules.departureTime"),
            value: formatTime("01:00 pm"),
          },
          {
            label: t("listings.unitRules.latestTimeToBook"),
            value: formatTime("12:00 am"),
          },
        ];
      case "daily":
        return [
          {
            icon: "calendar-outline",
            label: t("listings.unitRules.minimumReservableDays"),
            value: `1 ${t("listings.unitRules.days")}`,
          },
          {
            icon: "time-outline",
            label: t("listings.unitRules.arrivalTime"),
            value: formatTime("04:00 pm"),
          },
          {
            label: t("listings.unitRules.departureTime"),
            value: formatTime("01:00 pm"),
          },
          {
            label: t("listings.unitRules.latestTimeToBook"),
            value: formatTime("12:00 am"),
          },
        ];
      default:
        // Fallback for any other booking types (e.g., weekly)
        return [
          {
            icon: "calendar-outline",
            label: t("listings.unitRules.minimumReservableDays"),
            value: `7 ${t("listings.unitRules.days")}`,
          },
          {
            icon: "time-outline",
            label: t("listings.unitRules.arrivalTime"),
            value: formatTime("04:00 pm"),
          },
          {
            label: t("listings.unitRules.departureTime"),
            value: formatTime("01:00 pm"),
          },
          {
            label: t("listings.unitRules.latestTimeToBook"),
            value: formatTime("12:00 am"),
          },
        ];
    }
  };

  const rules = getRules();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, rtlStyles.sectionTitle]}>
        {t("listings.unitRules.title")}
      </Text>
      <View style={styles.rulesList}>
        {rules.map((rule, index) => {
          const isFirst = index === 0;
          const isLast = index === rules.length - 1;

          // Use InfoItem for rules with icons
          if (rule.icon) {
            return (
              <View
                key={rule.label}
                style={[isFirst && styles.firstRow, isLast && styles.lastRow]}
              >
                <InfoItem
                  icon={rule.icon}
                  label={rule.label}
                  value={rule.value}
                  backgroundColor={index % 2 === 0 ? "#fff" : COLORS.background}
                />
              </View>
            );
          }
          // Custom row for rules without icons (matches InfoItem styling)
          return (
            <View
              key={rule.label}
              style={[
                styles.ruleRow,
                rtlStyles.ruleRow,
                {
                  backgroundColor: index % 2 === 0 ? "#fff" : COLORS.background,
                },
                isFirst && styles.firstRow,
                isLast && styles.lastRow,
              ]}
            >
              <View style={[styles.ruleLeftSection, rtlStyles.ruleLeftSection]}>
                <Text style={[styles.ruleLabel, rtlStyles.ruleLabel]}>
                  {rule.label}
                </Text>
              </View>
              <View style={styles.ruleValueContainer}>
                <Text style={[styles.ruleValue, rtlStyles.ruleValue]}>
                  {rule.value}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
});

UnitRules.displayName = "UnitRules";

const styles = StyleSheet.create({
  container: {
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
  rulesList: {
    backgroundColor: COLORS.background,
  },
  ruleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  ruleLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ruleLabel: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    marginLeft: wp(8), // Match InfoItem: icon width (wp(5)) + margin (wp(3)) = wp(8) total spacing
  },
  ruleValueContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleValue: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  firstRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  lastRow: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});

export default UnitRules;
