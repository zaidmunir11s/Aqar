import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
        color="#e0e0e0"
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
    backgroundColor: "#fff",
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.4),
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  iconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    backgroundColor: "#c1c1c1",
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
    color: "#545454",
    fontWeight: "400",
  },
  arrowIcon: {
    marginLeft: wp(2),
  },
});

export default PhoneCard;
