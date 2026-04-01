import React, { Fragment, memo, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export type ListingTypeFilter = "sale" | "rent" | null;

export interface ListingTypeSegmentFilterProps {
  value: ListingTypeFilter;
  onChange: (next: ListingTypeFilter) => void;
}

/**
 * Sale / Rent segments. Tap active segment again to clear filter (show sale + rent).
 */
const ListingTypeSegmentFilter = memo<ListingTypeSegmentFilterProps>(
  ({ value, onChange }) => {
    const { t, isRTL } = useLocalization();

    const options = useMemo(
      () =>
        [
          { key: "sale" as const, label: t("listings.sale") },
          { key: "rent" as const, label: t("listings.rent") },
        ] as const,
      [t]
    );

    const rtlStyles = useMemo(
      () => ({
        container: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
      }),
      [isRTL]
    );

    return (
      <View style={[styles.container, rtlStyles.container]}>
        {options.map((opt, index) => {
          const isActive = value === opt.key;
          return (
            <Fragment key={opt.key}>
              <Pressable
                style={({ pressed }) => [
                  styles.segment,
                  isActive && styles.segmentActive,
                  pressed && styles.segmentPressed,
                ]}
                onPress={() => {
                  onChange(isActive ? null : opt.key);
                }}
              >
                <Text
                  style={[styles.segmentText, isActive && styles.segmentTextActive]}
                >
                  {opt.label}
                </Text>
              </Pressable>
              {index < options.length - 1 ? <View style={styles.separator} /> : null}
            </Fragment>
          );
        })}
      </View>
    );
  }
);

ListingTypeSegmentFilter.displayName = "ListingTypeSegmentFilter";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: wp(2),
    padding: wp(0.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    width: "100%",
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  segment: {
    flex: 1,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(2),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp(1.3),
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
  },
  segmentPressed: {
    opacity: 0.85,
  },
  separator: {
    width: 1,
    alignSelf: "stretch",
    marginVertical: hp(0.65),
    backgroundColor: COLORS.border,
  },
  segmentText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default ListingTypeSegmentFilter;
