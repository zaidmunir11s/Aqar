import React, { memo, useMemo } from "react";
  import { View, Text, StyleSheet, TouchableOpacity, FlexAlignType, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface MenuItemCardProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
  showNewBadge?: boolean;
}

const MenuItemCard = memo<MenuItemCardProps>(
  ({ title, subtitle, onPress, showNewBadge = false }) => {
    const { isRTL } = useLocalization();

    const rtlStyles = useMemo(() => ({
      content: { flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse" },
      textContainer: {
        marginRight: (isRTL ? 0 : wp(2)) as number,
        marginLeft: (isRTL ? wp(2) : 0) as number,
      },
      titleRow: { flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse", alignItems: "center" as FlexAlignType, gap: wp(2) },
      chevron: { marginLeft: (isRTL ? 0 : wp(2)) as number, marginRight: (isRTL ? wp(2) : 0) as number } as ViewStyle,
      titleText: { textAlign: (isRTL ? "right" : "left") as "left" | "right" },
      subtitleText: { textAlign: (isRTL ? "right" : "left") as "left" | "right" },
    }), [isRTL]
  );

    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.content, rtlStyles.content]}>
          <View style={[styles.textContainer, rtlStyles.textContainer]}>
            <View style={[styles.titleRow, rtlStyles.titleRow]}>
              <Text style={[styles.title, rtlStyles.titleText]}>{title}</Text>
              {showNewBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>New</Text>
                </View>
              )}
            </View>
            <Text style={[styles.subtitle, rtlStyles.subtitleText]}>{subtitle}</Text>
          </View>
          <Ionicons
            name={isRTL ? "chevron-back" : "chevron-forward"}
            size={wp(5)}
            color={COLORS.textDisabled}
            style={[styles.chevron, rtlStyles.chevron]}
          />
        </View>
      </TouchableOpacity>
    );
  }
);

MenuItemCard.displayName = "MenuItemCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgGray,
  },
  content: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    marginBottom: hp(0.5),
  },
  title: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
    fontWeight: "500",
    lineHeight: hp(2),
  },
  badge: {
    backgroundColor: COLORS.activeChipBackground,
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.6),
    borderRadius: wp(2),
  },
  badgeText: {
    fontSize: wp(2.8),
    fontWeight: "600",
    color: COLORS.primary,
  },
  chevron: {},
});

export default MenuItemCard;
