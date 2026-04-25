import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface ActionButtonsProps {
  onFavoritesPress?: () => void;
  onAlertsPress?: () => void;
}

const ActionButtons = memo<ActionButtonsProps>(
  ({ onFavoritesPress, onAlertsPress }) => {
    const { isRTL, t } = useLocalization();

    const rtlStyles = useMemo(
      () => ({
        container: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        button: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        text: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL],
    );

    return (
      <View style={[styles.container, rtlStyles.container]}>
        <TouchableOpacity
          style={[styles.button, rtlStyles.button]}
          onPress={onFavoritesPress}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={wp(5)} color={COLORS.textSecondary} />
          <Text style={[styles.buttonText, rtlStyles.text]}>
            {t("common.favorites", { defaultValue: "Favorites" })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, rtlStyles.button]}
          onPress={onAlertsPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="notifications"
            size={wp(5)}
            color={COLORS.textSecondary}
          />
          <Text style={[styles.buttonText, rtlStyles.text]}>
            {t("common.alerts", { defaultValue: "Alerts" })}
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

ActionButtons.displayName = "ActionButtons";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: wp(3),
    paddingTop: hp(1.5),
    marginBottom: hp(2),
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.4),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: wp(2),
  },
  buttonText: {
    fontSize: wp(4),
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
});

export default ActionButtons;
