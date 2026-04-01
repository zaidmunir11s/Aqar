import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface RoleOptionCardProps {
  title: string;
  icon: string;
  iconLibrary?: "MaterialCommunityIcons" | "FontAwesome6";
  selected?: boolean;
  onPress: () => void;
}

const RoleOptionCard = memo<RoleOptionCardProps>(
  ({ title, icon, iconLibrary = "MaterialCommunityIcons", selected = false, onPress }) => {
    const { isRTL } = useLocalization();

    const rtlStyles = useMemo(
      () => ({
        title: {
          textAlign: (isRTL ? "right" : "center") as "center" | "right",
        },
      }),
      [isRTL]
    );

    return (
      <TouchableOpacity
        style={[styles.card, selected && styles.selectedCard]}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <View style={styles.iconWrap}>
          {iconLibrary === "FontAwesome6" ? (
            <FontAwesome6 name={icon as any} size={wp(6.4)} color={COLORS.primary} />
          ) : (
            <MaterialCommunityIcons name={icon as any} size={wp(7)} color={COLORS.primary} />
          )}
        </View>
        <Text style={[styles.title, rtlStyles.title]} numberOfLines={1}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
);

RoleOptionCard.displayName = "RoleOptionCard";

const styles = StyleSheet.create({
  card: {
    width: wp(35),
    height: hp(12),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(3.5),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(2.5),
  },
  selectedCard: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  iconWrap: {
    width: wp(13.5),
    height: wp(13.5),
    borderRadius: wp(3),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef5f5",
    marginBottom: hp(0.7),
  },
  title: {
    fontSize: wp(3.6),
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
});

export default RoleOptionCard;
