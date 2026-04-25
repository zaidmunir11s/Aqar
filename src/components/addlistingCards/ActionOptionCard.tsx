import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface ActionOptionCardProps {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
}

const ActionOptionCard = memo<ActionOptionCardProps>(
  ({ title, description, icon, onPress }) => {
    const { isRTL } = useLocalization();

    const rtlStyles = useMemo(
      () => ({
        row: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        textWrap: {
          marginLeft: isRTL ? 0 : wp(3),
          marginRight: isRTL ? wp(3) : 0,
        },
        textAlign: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL],
    );

    return (
      <TouchableOpacity
        style={[styles.card, rtlStyles.row]}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name={icon}
            size={wp(7)}
            color={COLORS.primary}
          />
        </View>

        <View style={[styles.textWrap, rtlStyles.textWrap]}>
          <Text style={[styles.title, rtlStyles.textAlign]} numberOfLines={1}>
            {title}
          </Text>
          <Text
            style={[styles.description, rtlStyles.textAlign]}
            numberOfLines={2}
          >
            {description}
          </Text>
        </View>

        <Ionicons
          name={isRTL ? "chevron-back" : "chevron-forward"}
          size={wp(5)}
          color={COLORS.textDisabled}
        />
      </TouchableOpacity>
    );
  },
);

ActionOptionCard.displayName = "ActionOptionCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(3),
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    alignItems: "center",
    marginBottom: hp(1.6),
    flexDirection: "row",
  },
  iconWrap: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef5f5",
  },
  textWrap: {
    flex: 1,
    marginLeft: wp(3),
  },
  title: {
    fontSize: wp(4.1),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(0.2),
  },
  description: {
    fontSize: wp(3.8),
    fontWeight: "400",
    color: COLORS.textSecondary,
    lineHeight: hp(2.6),
  },
});

export default ActionOptionCard;
