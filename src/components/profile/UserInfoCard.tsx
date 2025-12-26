import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export interface UserInfoCardProps {
  sinceDate?: string;
  lastSeen?: string;
}

const UserInfoCard = memo<UserInfoCardProps>(
  ({ sinceDate = "2025/11/27", lastSeen = "now" }) => {
    return (
      <View style={styles.card}>
        <View style={styles.item}>
          <Ionicons name="calendar-outline" size={wp(6)} color="#0ab539" />
          <Text style={styles.infoText}>Since {sinceDate}</Text>
        </View>
        <View style={styles.item}>
          <Ionicons name="alarm-outline" size={wp(6)} color="#14b8a6" />
          <Text style={styles.infoText}>Last seen: {lastSeen}</Text>
        </View>
      </View>
    );
  }
);

UserInfoCard.displayName = "UserInfoCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#d2d8d6",
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
  },
  infoText: {
    fontSize: wp(3.5),
    color: "#6b7280",
    fontWeight: "400",
  },
});

export default UserInfoCard;
