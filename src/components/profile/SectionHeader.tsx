import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";

export interface SectionHeaderProps {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

/**
 * Reusable section header component with icon and title
 */
const SectionHeader = memo<SectionHeaderProps>(({ title, iconName }) => {
  return (
    <View style={styles.header}>
      <Ionicons name={iconName} size={wp(5)} color={COLORS.textSecondary} />
      <Text style={styles.headerText}>{title}</Text>
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
