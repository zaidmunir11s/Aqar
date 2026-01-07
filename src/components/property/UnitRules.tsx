import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import type { DailyProperty } from "../../types/property";
import { InfoItem } from "./PropertyInfo";
import { COLORS } from "@/constants/colors";

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
  // Get rules based on booking type
  const getRules = (): RuleItem[] => {
    const { bookingType } = property;
    
    // Default values - can be extended to use property data when available
    switch (bookingType) {
      case "monthly":
        return [
          {
            icon: "calendar-outline",
            label: "Minimum Reservable Days",
            value: "30 Days",
          },
          {
            icon: "time-outline",
            label: "Arrival Time",
            value: "04:00 pm",
          },
          {
            label: "Departure Time",
            value: "01:00 pm",
          },
          {
            label: "Latest Time to Book",
            value: "12:00 am",
          },
        ];
      case "daily":
        return [
          {
            icon: "calendar-outline",
            label: "Minimum Reservable Days",
            value: "1 Days",
          },
          {
            icon: "time-outline",
            label: "Arrival Time",
            value: "04:00 pm",
          },
          {
            label: "Departure Time",
            value: "01:00 pm",
          },
          {
            label: "Latest Time to Book",
            value: "12:00 am",
          },
        ];
      default:
        // Fallback for any other booking types (e.g., weekly)
        return [
          {
            icon: "calendar-outline",
            label: "Minimum Reservable Days",
            value: "7 Days",
          },
          {
            icon: "time-outline",
            label: "Arrival Time",
            value: "04:00 pm",
          },
          {
            label: "Departure Time",
            value: "01:00 pm",
          },
          {
            label: "Latest Time to Book",
            value: "12:00 am",
          },
        ];
    }
  };

  const rules = getRules();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Unit Rules</Text>
      <View style={styles.rulesList}>
        {rules.map((rule, index) => {
          const isFirst = index === 0;
          const isLast = index === rules.length - 1;
          
          // Use InfoItem for rules with icons
          if (rule.icon) {
            return (
              <View
                key={rule.label}
                style={[
                  isFirst && styles.firstRow,
                  isLast && styles.lastRow,
                ]}
              >
                <InfoItem
                  icon={rule.icon}
                  label={rule.label}
                  value={rule.value}
                  backgroundColor={index % 2 === 0 ? "#fff" : "#ebf1f1"}
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
                {
                  backgroundColor: index % 2 === 0 ? "#fff" : "#ebf1f1",
                },
                isFirst && styles.firstRow,
                isLast && styles.lastRow,
              ]}
            >
              <View style={styles.ruleLeftSection}>
                <Text style={styles.ruleLabel}>{rule.label}</Text>
              </View>
              <View style={styles.ruleValueContainer}>
                <Text style={styles.ruleValue}>{rule.value}</Text>
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
    backgroundColor: "#ebf1f1",
    paddingTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hp(1.5),
    paddingHorizontal: wp(4),
  },
  rulesList: {
    backgroundColor: "#ebf1f1",
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
    color: "#374151",
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
    color: "#111827",
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

