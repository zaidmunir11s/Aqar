import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useLocalization } from "@/hooks";
import { COLORS } from "../../constants";

export interface FilterTabsOption {
  value: string;
  label: string;
}

export interface FilterTabsProps {
  options: FilterTabsOption[];
  selectedValue: string | null;
  onValueChange: (value: string | null) => void;
  containerStyle?: ViewStyle;
}

/**
 * Reusable filter tabs (e.g. Latest | Price | Nearest) with RTL support.
 * Tapping the selected tab again deselects it (calls onValueChange(null)).
 */
const FilterTabs = memo<FilterTabsProps>(
  ({ options, selectedValue, onValueChange, containerStyle }) => {
    const { isRTL } = useLocalization();

    const wrapperStyle = useMemo(
      (): ViewStyle => ({
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      }),
      [isRTL],
    );

    const handlePress = (value: string) => {
      onValueChange(selectedValue === value ? null : value);
    };

    if (!options.length) return null;

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.wrapper, wrapperStyle]}>
          {options.map((option, index) => (
            <React.Fragment key={option.value}>
              {index > 0 && <View style={styles.separator} />}
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedValue === option.value && styles.tabActive,
                ]}
                onPress={() => handlePress(option.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      textAlign: (isRTL ? "right" : "center") as
                        | "left"
                        | "center"
                        | "right",
                    },
                    selectedValue === option.value && styles.tabTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  },
);

FilterTabs.displayName = "FilterTabs";

const styles = StyleSheet.create({
  container: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: wp(2.5),
    paddingHorizontal: wp(1),
    paddingVertical: wp(1),
    borderWidth: 1,
    borderColor: "#dedfe3",
  },
  tab: {
    flex: 1,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: COLORS.showListFilterTabActive,
  },
  separator: {
    width: 1,
    height: "60%",
    backgroundColor: "#d1d5db",
    marginHorizontal: wp(1),
  },
  tabText: {
    fontSize: wp(4.2),
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
});

export default FilterTabs;
