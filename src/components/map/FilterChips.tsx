import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import type { FilterOption } from "../../types/property";
import { COLORS } from "../../constants";

export interface FilterChipsProps {
  filterOptions: FilterOption[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  onSearchPress?: () => void;
  variant?: "map" | "list"; // Variant for map (absolute) or list (relative) positioning
}

/**
 * Filter chips component for map screen
 */
const FilterChips = memo<FilterChipsProps>(
  ({ filterOptions, activeFilter, onFilterChange, onSearchPress, variant = "map" }) => {
    return (
      <View style={[styles.chipsContainer, variant === "list" && styles.chipsContainerList]}>
        <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
          <Text style={styles.searchText}>Search</Text>
          <Ionicons name="search" size={wp(4.5)} color="#fff" />
        </TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.chip,
                activeFilter === filter.id && styles.activeChip,
              ]}
              onPress={() => onFilterChange(filter.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === filter.id && styles.activeChipText,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }
);

FilterChips.displayName = "FilterChips";

const styles = StyleSheet.create({
  chipsContainer: {
    position: "absolute",
    top: hp(11.5),
    left: wp(4),
    right: wp(4),
    flexDirection: "row",
    alignItems: "center",
    zIndex: 90,
  },
  chipsContainerList: {
    position: "relative",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a253d",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    borderRadius: wp(3.5),
    marginRight: wp(2),
    gap: wp(2),
  },
  searchText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: wp(3.5),
  },
  chip: {
    backgroundColor: "#ffffff",
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(1.2),
    borderRadius: wp(7.5),
    marginRight: wp(2),
  },
  activeChip: {
    backgroundColor: COLORS.activeChipBackground,
    borderWidth: 1,
    borderColor: COLORS.activeChipBorder,
    paddingHorizontal: wp(5),
  },
  chipText: {
    color: "#666",
    // fontWeight: "500",
    fontSize: wp(3.3),
  },
  activeChipText: {
    color: COLORS.activeChipText,
  },
});

export default FilterChips;
