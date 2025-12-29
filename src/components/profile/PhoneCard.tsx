import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";

export interface PhoneCardProps {
  phoneNumber: string;
  onPress?: () => void;
}

/**
 * Phone card component with user icon in background container
 */
const PhoneCard = memo<PhoneCardProps>(({ phoneNumber, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.phoneCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Image
          source={require("../../../assets/User.png")}
          style={styles.userImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.phoneNumberContainer}>
        <Text style={styles.phoneNumber}>{phoneNumber}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={wp(5)}
        color={COLORS.textDisabled}
        style={styles.arrowIcon}
      />
    </TouchableOpacity>
  );
});

PhoneCard.displayName = "PhoneCard";

const styles = StyleSheet.create({
  phoneCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.4),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  iconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    backgroundColor: COLORS.textTertiary,
    justifyContent: "flex-end",
    alignItems: "center",
    marginRight: wp(3),
  },
  userImage: {
    width: "100%",
    height: "100%",
    bottom: wp(-2),
  },
  phoneNumberContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignSelf: "stretch",
    paddingBottom: wp(0.5),
  },
  phoneNumber: {
    fontSize: wp(4),
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
  arrowIcon: {
    marginLeft: wp(2),
  },
});

export default PhoneCard;
