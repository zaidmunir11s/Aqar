import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type ServicesTabIconProps = {
  color: string;
  isRTL: boolean;
  newLabel: string;
};

const ServicesTabIcon = memo<ServicesTabIconProps>(({ color, isRTL, newLabel }) => (
  <View style={styles.iconWrap}>
    <View style={[styles.badge, isRTL && styles.badgeRTL]}>
      <Text style={styles.badgeText}>{newLabel}</Text>
    </View>
    <Ionicons name="construct" size={wp(6)} color={color} />
  </View>
));

ServicesTabIcon.displayName = "ServicesTabIcon";

const styles = StyleSheet.create({
  iconWrap: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    left: -wp(8),
    backgroundColor: "#ef4444",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(1),
    zIndex: 1,
    marginBottom: hp(0.5),
  },
  badgeRTL: {
    // left: undefined,
    // right: -wp(8),
  },
  badgeText: {
    color: "#fff",
    fontSize: wp(2),
    fontWeight: "bold",
  },
});

export default ServicesTabIcon;
