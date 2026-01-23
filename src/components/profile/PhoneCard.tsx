import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface PhoneCardProps {
  phoneNumber: string;
  onPress?: () => void;
}

/**
 * Phone card component with user icon in background container
 */
const PhoneCard = memo<PhoneCardProps>(({ phoneNumber, onPress }) => {
  const { t, isRTL } = useLocalization();

  const rtlStyles = useMemo(() => {
    if (!isRTL) return {};

    return {
      phoneCard: {
        flexDirection: "row-reverse" as const,
      },
      phoneNumber: {
        textAlign: "right" as const,
      },
      arrowIcon: {
        marginRight: wp(2),
        // marginLeft will stay undefined → uses base style or zero
      },
      phoneNumberContainer: {
        alignSelf: "flex-end" as const,
        paddingHorizontal: wp(4),           // usually same, but you can override if needed
        paddingVertical: hp(1.4),
      },
      // phoneNumberContainer usually doesn't need much change
    };
  }, [isRTL]);

  return (
    <TouchableOpacity
      style={[styles.phoneCard, rtlStyles.phoneCard]}
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
      <View style={[styles.phoneNumberContainer, rtlStyles.phoneNumberContainer]}>
        <Text style={[styles.phoneNumber, rtlStyles.phoneNumber]}>{phoneNumber}</Text>
      </View>
      <Ionicons
        name={isRTL ? "chevron-back" : "chevron-forward"}
        size={wp(5)}
        color={COLORS.textDisabled}
        style={[styles.arrowIcon, rtlStyles.arrowIcon]}
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
