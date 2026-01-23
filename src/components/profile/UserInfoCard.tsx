import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface UserInfoCardProps {
  sinceDate?: string;
  lastSeen?: string;
}

const UserInfoCard = memo<UserInfoCardProps>(
  ({ sinceDate = "2025/11/27", lastSeen = "now" }) => {
    const { t, isRTL } = useLocalization();

    // Translate "now" only when the value is exactly "now"
    // (you can adjust this logic if lastSeen comes in other formats)
    const displayedLastSeen =
      lastSeen === "now"
        ? t("profile.now", { defaultValue: "now" })
        : lastSeen;

    return (
      <View
        style={[
          styles.card,
          isRTL && { flexDirection: "row-reverse" },
        ]}
      >
        <View style={styles.item}>
          <Ionicons
            name="calendar-outline"
            size={wp(6)}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>
            {t("profile.since", { defaultValue: "Since" })}{" "}
            {sinceDate}
          </Text>
        </View>

        <View style={styles.item}>
          <Ionicons
            name="alarm-outline"
            size={wp(6)}
            color={COLORS.primaryLight}
          />
          <Text style={styles.infoText}>
            {t("profile.lastSeen", { defaultValue: "Last seen" })}:{" "}
            {displayedLastSeen}
          </Text>
        </View>
      </View>
    );
  }
);

UserInfoCard.displayName = "UserInfoCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.bgGray,
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.5),
    marginBottom: hp(2),
    gap: wp(4),
    alignItems: "flex-start",
    width: "100%",
  },
  item: {
    flexDirection: "column",
    alignItems: "center",
    gap: hp(1),
    flex: 1,
  },
  infoText: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    fontWeight: "400",
    textAlign: "center",
  },
});

export default UserInfoCard;