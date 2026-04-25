import React, { memo, useMemo, useState, useEffect } from "react";
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
  /** Shown above the phone line when set (e.g. first + last name). */
  displayName?: string;
  /** Local `file://` or remote URL; falls back to default user art when missing. */
  avatarUri?: string | null;
  onPress?: () => void;
}

/**
 * Profile row: optional avatar, name + phone, chevron.
 */
const PhoneCard = memo<PhoneCardProps>(
  ({ phoneNumber, displayName, avatarUri, onPress }) => {
    const { isRTL } = useLocalization();
    const trimmedName = displayName?.trim() ?? "";
    const trimmedUri = typeof avatarUri === "string" ? avatarUri.trim() : "";
    const [remoteAvatarFailed, setRemoteAvatarFailed] = useState(false);

    useEffect(() => {
      setRemoteAvatarFailed(false);
    }, [trimmedUri]);

    const rtlStyles = useMemo(() => {
      if (!isRTL) return {};

      return {
        phoneCard: {
          flexDirection: "row-reverse" as const,
        },
        textColumn: {
          alignItems: "flex-end" as const,
        },
        nameRow: {
          alignItems: "flex-end" as const,
        },
        displayName: {
          textAlign: "right" as const,
        },
        phoneNumber: {
          textAlign: "right" as const,
        },
      };
    }, [isRTL]);

    const useRemoteAvatar = trimmedUri.length > 0 && !remoteAvatarFailed;

    return (
      <TouchableOpacity
        style={[styles.phoneCard, rtlStyles.phoneCard]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          {useRemoteAvatar ? (
            <Image
              source={{ uri: trimmedUri }}
              style={styles.avatarImage}
              resizeMode="cover"
              onError={() => setRemoteAvatarFailed(true)}
            />
          ) : (
            <Image
              source={require("../../../assets/User.png")}
              style={styles.userImage}
              resizeMode="contain"
            />
          )}
        </View>
        <View style={[styles.textColumn, rtlStyles.textColumn]}>
          <View style={styles.textStack}>
            <View style={[styles.nameRow, rtlStyles.nameRow]}>
              {trimmedName.length > 0 ? (
                <Text
                  style={[styles.displayName, rtlStyles.displayName]}
                  numberOfLines={1}
                >
                  {trimmedName}
                </Text>
              ) : null}
            </View>
            <Text style={[styles.phoneNumber, rtlStyles.phoneNumber]}>
              {phoneNumber}
            </Text>
          </View>
        </View>
        <Ionicons
          name={isRTL ? "chevron-back" : "chevron-forward"}
          size={wp(5)}
          color={COLORS.textDisabled}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>
    );
  },
);

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
    justifyContent: "center",
    alignItems: "center",
    marginEnd: wp(3),
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  userImage: {
    width: "100%",
    height: "100%",
    bottom: wp(-2),
  },
  textColumn: {
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
  },
  textStack: {
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
  },
  nameRow: {
    width: "100%",
    minHeight: wp(5.2),
    justifyContent: "center",
    marginBottom: hp(0.25),
  },
  displayName: {
    fontSize: wp(4.2),
    fontWeight: "600",
    color: COLORS.textPrimary,
    lineHeight: wp(5.2),
  },
  phoneNumber: {
    fontSize: wp(3.8),
    color: COLORS.textSecondary,
    fontWeight: "400",
    lineHeight: wp(4.8),
  },
  arrowIcon: {
    marginStart: wp(2),
  },
});

export default PhoneCard;
