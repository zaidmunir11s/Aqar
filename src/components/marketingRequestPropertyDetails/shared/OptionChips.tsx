import React, { useCallback, useMemo, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "@/constants";
import { useLocalization } from "@/hooks/useLocalization";

interface OptionChipsProps {
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  scrollable?: boolean;
  errorText?: string;
}

const CHIP_HEIGHT = hp(5);
const CONTAINER_PADDING = wp(4);
const SCREEN_WIDTH = wp(100);
const AVAILABLE_WIDTH = SCREEN_WIDTH - CONTAINER_PADDING * 2;
const GAP_BETWEEN = wp(1.6);

function getChipWidth(count: number): number {
  const totalGap = GAP_BETWEEN * (count - 1);
  return (AVAILABLE_WIDTH - totalGap) / count;
}

export default function OptionChips({
  label,
  options,
  selectedValue,
  onSelect,
  scrollable = false,
  errorText,
}: OptionChipsProps): React.JSX.Element {
  const { isRTL } = useLocalization();
  const chipWidth = getChipWidth(options.length);
  const scrollRef = useRef<ScrollView>(null);
  const layoutWidthRef = useRef(0);
  const contentWidthRef = useRef(0);

  const alignRtlScrollStart = useCallback(() => {
    if (!isRTL || !scrollable) return;
    const lw = layoutWidthRef.current;
    const cw = contentWidthRef.current;
    if (cw > lw) {
      scrollRef.current?.scrollTo({ x: Math.max(0, cw - lw), y: 0, animated: false });
    }
  }, [isRTL, scrollable]);

  const rtlStyles = useMemo(
    () => ({
      label: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      chipsWrap: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      scrollContent: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        gap: GAP_BETWEEN,
      },
      chipText: {
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      errorText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
    }),
    [isRTL]
  );

  const chips = options.map((option) => {
    const selected = selectedValue === option;
    return (
      <TouchableOpacity
        key={option}
        style={[
          scrollable
            ? styles.optionChipScrollable
            : [styles.optionChip, { width: chipWidth }],
          selected && styles.optionChipSelected,
        ]}
        activeOpacity={0.75}
        onPress={() => onSelect(option)}
      >
        <Text
          style={[
            styles.optionChipText,
            rtlStyles.chipText,
            selected && styles.optionChipTextSelected,
          ]}
          numberOfLines={1}
        >
          {option}
        </Text>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.section}>
      <Text style={[styles.label, rtlStyles.label]}>{label}</Text>
      {scrollable ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContentBase, rtlStyles.scrollContent]}
          onLayout={(e) => {
            layoutWidthRef.current = e.nativeEvent.layout.width;
            alignRtlScrollStart();
          }}
          onContentSizeChange={(w) => {
            contentWidthRef.current = w;
            alignRtlScrollStart();
          }}
        >
          {chips}
        </ScrollView>
      ) : (
        <View style={[styles.chipsWrap, rtlStyles.chipsWrap]}>{chips}</View>
      )}
      {errorText ? (
        <Text style={[styles.errorText, rtlStyles.errorText]}>{errorText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: wp(3.8),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(0.8),
  },
  chipsWrap: {
    justifyContent: "space-between",
  },
  scrollContentBase: {
    alignItems: "center",
  },
  optionChip: {
    height: CHIP_HEIGHT,
    borderRadius: wp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  optionChipScrollable: {
    height: CHIP_HEIGHT,
    paddingHorizontal: wp(5),
    borderRadius: wp(5),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  optionChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.activeChipBackground,
  },
  optionChipText: {
    fontSize: wp(3.4),
    color: COLORS.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },
  optionChipTextSelected: {
    color: COLORS.primary,
  },
  errorText: {
    marginTop: hp(0.6),
    fontSize: wp(3.3),
    color: COLORS.error,
  },
});
