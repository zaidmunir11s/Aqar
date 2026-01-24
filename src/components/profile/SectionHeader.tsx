import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface SectionHeaderProps {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

/**
 * Reusable section header component with icon and title
 */
const SectionHeader = memo<SectionHeaderProps>(({ title, iconName }) => {
  const { isRTL } = useLocalization();
  const rtlStyles = useMemo(() => {
    if (!isRTL) return {};
    return {
      header: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      headerText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    };
  }, [isRTL]);
  return (
    <View style={[styles.header, rtlStyles.header]}>
      <Ionicons name={iconName} size={wp(5)} color={COLORS.textSecondary} />
      <Text style={[styles.headerText, rtlStyles.headerText]}>{title}</Text>
    </View>
  );
});

SectionHeader.displayName = "SectionHeader";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
    paddingHorizontal: wp(4),
    gap: wp(2),
  },
  headerText: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
});

export default SectionHeader;
