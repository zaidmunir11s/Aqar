import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  /** `large` matches the former marketing `BigSegmentedControl` (taller segments). */
  variant?: "default" | "large";
  /** Only applies when `variant="large"`; defaults to `hp(4.2)`. */
  segmentHeight?: number;
}

const LARGE_DEFAULT_HEIGHT = hp(4.2);

const SegmentedControl = memo<SegmentedControlProps>(
  ({
    options,
    selectedIndex,
    onSelect,
    variant = "default",
    segmentHeight,
  }) => {
    const { isRTL } = useLocalization();
    const isLarge = variant === "large";
    const largeH = segmentHeight ?? LARGE_DEFAULT_HEIGHT;

    const rtlStyles = useMemo(
      () => ({
        container: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        segmentTextDir: {
          writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
        },
      }),
      [isRTL],
    );

    return (
      <View
        style={[
          isLarge ? largeStyles.container : styles.container,
          isLarge
            ? { flexDirection: isRTL ? "row-reverse" : "row" }
            : rtlStyles.container,
        ]}
      >
        {options.map((option, index) => (
          <React.Fragment key={index}>
            <Pressable
              style={({ pressed }) => [
                isLarge ? largeStyles.segment : styles.segment,
                isLarge && { height: largeH },
                index === selectedIndex &&
                  (isLarge ? largeStyles.segmentActive : styles.segmentActive),
                pressed &&
                  (isLarge
                    ? largeStyles.segmentPressed
                    : styles.segmentPressed),
              ]}
              onPress={() => onSelect(index)}
              delayLongPress={300}
            >
              <Text
                style={[
                  isLarge ? largeStyles.segmentText : styles.segmentText,
                  isLarge && rtlStyles.segmentTextDir,
                  index === selectedIndex &&
                    (isLarge
                      ? largeStyles.segmentTextActive
                      : styles.segmentTextActive),
                ]}
              >
                {option}
              </Text>
            </Pressable>
            {index < options.length - 1 ? (
              <View
                style={isLarge ? largeStyles.separator : styles.separator}
              />
            ) : null}
          </React.Fragment>
        ))}
      </View>
    );
  },
);

SegmentedControl.displayName = "SegmentedControl";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: wp(2),
    padding: wp(0.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
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
  separator: {
    width: 1,
    alignSelf: "stretch",
    marginVertical: hp(0.65),
    backgroundColor: COLORS.border,
  },
  segmentPressed: {
    opacity: 0.8,
  },
  segmentText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: "#fff",
    fontWeight: "500",
  },
});

const largeStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: wp(2),
    padding: wp(0.45),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "stretch",
  },
  segment: {
    flex: 1,
    paddingHorizontal: wp(2),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp(2),
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
  },
  segmentPressed: {
    opacity: 0.85,
  },
  separator: {
    width: 1,
    alignSelf: "center",
    height: "68%",
    backgroundColor: COLORS.border,
    opacity: 0.9,
  },
  segmentText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: "#fff",
  },
});

export default SegmentedControl;
