import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

interface DailyHeaderBoxesProps {
  reservationText: string;
  onReservationPress: () => void;
  onCityPress: () => void;
  onFiltersPress: () => void;
  containerStyle?: object;
  cityText?: string;
  filterCount?: number;
}

export default function DailyHeaderBoxes({
  reservationText,
  onReservationPress,
  onCityPress,
  onFiltersPress,
  containerStyle,
  cityText,
  filterCount = 0,
}: DailyHeaderBoxesProps): React.JSX.Element {
  const { t, isRTL } = useLocalization();

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      boxes: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      box: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      filterContent: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      boxText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.boxes, rtlStyles.boxes]}>
        <TouchableOpacity
          style={[styles.box, styles.boxFirst, rtlStyles.box]}
          onPress={onReservationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={wp(5)} color="#333" />
          <Text 
            style={[styles.boxText, rtlStyles.boxText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {reservationText}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.box, rtlStyles.box]}
          onPress={onCityPress}
          activeOpacity={0.7}
        >
          <Ionicons name="location-outline" size={wp(5)} color="#333" />
          <Text 
            style={[styles.boxText, rtlStyles.boxText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {(() => {
              if (!cityText || cityText === "City") {
                return t("listings.city");
              }
              // Translate city name if translation exists
              // Handle various city name formats
              const cityKey = cityText
                .toLowerCase()
                .replace(/\s+/g, "")
                .replace(/al\s+/gi, "")
                .replace(/`/g, "");
              
              // Try direct match first
              let translationKey = `listings.cities.${cityKey}`;
              let translated = t(translationKey);
              
              // If no direct match, try common variations
              if (translated === translationKey) {
                // Handle "Al Khobar" -> "khobar", "Macca" -> "mecca", etc.
                const cityVariations: { [key: string]: string } = {
                  "alkhobar": "khobar",
                  "macca": "mecca",
                  "buraydah": "buraidah",
                  "khamismushait": "khamisMushait",
                  "alkharj": "kharj",
                  "hafralbatin": "hafrAlBatin",
                  "riyadhalkhabra": "riyadhAlKhabra",
                  "aljubail": "alJubail",
                };
                
                const variation = cityVariations[cityKey];
                if (variation) {
                  translationKey = `listings.cities.${variation}`;
                  translated = t(translationKey);
                }
              }
              
              // If translation exists and is different from the key, use it
              return translated !== translationKey ? translated : cityText;
            })()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.box,
            rtlStyles.box,
            filterCount > 0 && styles.boxWithFilters,
            filterCount > 0 && { borderColor: COLORS.primary, borderWidth: 2 }
          ]}
          onPress={onFiltersPress}
          activeOpacity={0.7}
        >
          <View style={[styles.filterContent, rtlStyles.filterContent]}>
            <Ionicons name="filter-outline" size={wp(5)} color="#333" />
            <Text 
              style={[styles.boxText, rtlStyles.boxText]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {t("listings.filters")}
            </Text>
          </View>
          {filterCount > 0 && (
            <View style={[
              styles.filterBadge,
              isRTL ? styles.filterBadgeRTL : styles.filterBadgeLTR
            ]}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Container styles can be customized via containerStyle prop
  },
  boxes: {
    paddingHorizontal: wp(2),
    gap: wp(2),
  },
  box: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: wp(2.5),
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: hp(6),
    gap: wp(1),
    borderWidth: 1,
    borderColor: "transparent",
    position: "relative",
  },
  boxWithFilters: {
    borderColor: COLORS.primary,
  },
  filterContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1),
    flex: 1,
  },
  filterBadge: {
    position: "absolute",
    top: -wp(2),
    backgroundColor: COLORS.primary,
    borderRadius: wp(3),
    minWidth: wp(5),
    height: wp(5),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(1.5),
    borderWidth: 2,
    borderColor: "#fff",
  },
  filterBadgeLTR: {
    right: wp(1),
  },
  filterBadgeRTL: {
    left: wp(1),
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: wp(3),
    fontWeight: "bold",
  },
  boxFirst: {
    flex: 2,
  },
  boxText: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    fontWeight: "500",
    flex: 1,
  },
});

