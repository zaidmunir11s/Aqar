import React, { memo, useMemo, useRef, useEffect } from "react";
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
import { useLocalization } from "../../hooks/useLocalization";

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
    const { t, isRTL } = useLocalization();
    const scrollViewRef = useRef<ScrollView>(null);

    // Helper function to get translated label for filter
    const getTranslatedLabel = useMemo(() => {
      return (filter: FilterOption): string => {
        // Handle "All For Rent" - check both label and id
        if (filter.label === "All For Rent" || (filter.id === "all" && filter.label.toLowerCase().includes("rent"))) {
          const translated = t("listings.allForRent");
          return translated;
        }
        
        // Handle "All For Sale" - check both label and id
        if (filter.label === "All For Sale" || (filter.id === "all" && filter.label.toLowerCase().includes("sale"))) {
          const translated = t("listings.allForSale");
          return translated;
        }
        
        // Handle "All"
        if (filter.label === "All" && filter.id === "all") {
          const translated = t("listings.all");
          return translated;
        }

        // Skip translation if type is null (like "All For Rent" which we already handled)
        if (filter.type === null) {
          return filter.label;
        }

        // Handle booking variants (they have "for booking" in the label)
        if (filter.label.toLowerCase().includes("for booking") && filter.id !== "all") {
          const typeKey = filter.type || filter.id;
          if (typeKey) {
            const bookingKey = `${typeKey}ForBooking`;
            const translationKey = `listings.propertyTypes.${bookingKey}`;
            const translated = t(translationKey);
            // If translation exists and is valid, return it
            if (translated && translated !== translationKey) {
              return translated;
            }
          }
        }

        // Handle regular property types - only if type is not null
        if (filter.type) {
          const translationKey = `listings.propertyTypes.${filter.type}`;
          const translated = t(translationKey);
          // If translation exists and is valid, return it
          if (translated && translated !== translationKey) {
            return translated;
          }
        }
        
        // Fallback to original label
        return filter.label;
      };
    }, [t]);

    // Create a unique key for filterOptions to track changes
    const filterOptionsKey = useMemo(
      () => filterOptions.map(f => f.id).join('-'),
      [filterOptions]
    );

    // Reset scroll position when filterOptions change (tab switch)
    useEffect(() => {
      // Reset scroll position when filter options change
      // Use multiple attempts to ensure scroll happens after content is rendered
      const resetScroll = () => {
        if (scrollViewRef.current) {
          if (isRTL) {
            // For RTL with row-reverse, scroll to end to show first items
            scrollViewRef.current.scrollToEnd({ animated: false });
          } else {
            // For LTR, scroll to start
            scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
          }
        }
      };

      // Try immediately
      requestAnimationFrame(() => {
        resetScroll();
        // Also try after a small delay to ensure content is fully laid out
        setTimeout(() => {
          resetScroll();
        }, 100);
        // One more attempt after a longer delay for safety
        setTimeout(() => {
          resetScroll();
        }, 300);
      });
    }, [filterOptionsKey, isRTL]);

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        chipsContainer: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        searchButton: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
          marginRight: isRTL ? 0 : wp(2),
          marginLeft: isRTL ? wp(2) : 0,
        },
        chip: {
          marginRight: isRTL ? 0 : wp(2),
          marginLeft: isRTL ? wp(2) : 0,
        },
      }),
      [isRTL]
    );

    return (
      <View style={[styles.chipsContainer, rtlStyles.chipsContainer, variant === "list" && styles.chipsContainerList]}>
        <TouchableOpacity style={[styles.searchButton, rtlStyles.searchButton]} onPress={onSearchPress}>
          <Text style={styles.searchText}>{t("common.search")}</Text>
          <Ionicons name="search" size={wp(4.5)} color="#fff" />
        </TouchableOpacity>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={isRTL ? { flexDirection: "row-reverse" as const } : undefined}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.chip,
                rtlStyles.chip,
                activeFilter === filter.id && styles.activeChip,
              ]}
              onPress={() => onFilterChange(filter.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === filter.id && styles.activeChipText,
                ]}
                numberOfLines={1}
              >
                {getTranslatedLabel(filter).trim()}
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
  },
  activeChip: {
    backgroundColor: COLORS.activeChipBackground,
    borderWidth: 1,
    borderColor: COLORS.activeChipBorder,
    paddingHorizontal: wp(5),
  },
  chipText: {
    color: "#666",
    fontSize: wp(3.3),
    textAlign: "center",
  },
  activeChipText: {
    color: COLORS.activeChipText,
  },
});

export default FilterChips;
