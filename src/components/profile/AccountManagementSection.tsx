import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import SectionHeader from "./SectionHeader";
import { useLocalization } from "../../hooks/useLocalization";

export interface AccountManagementSectionProps {
  onUpdateProfilePress?: () => void;
  onChangePasswordPress?: () => void;
  onChangePhoneNumberPress?: () => void;
  onLogoutPress?: () => void;
}

/**
 * Account Management section component with header and menu items
 */
const AccountManagementSection = memo<AccountManagementSectionProps>(
  ({ onUpdateProfilePress, onChangePasswordPress, onChangePhoneNumberPress, onLogoutPress }) => {
    const { t, isRTL } = useLocalization();

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        menuItem: { flexDirection: isRTL ? "row-reverse" : "row" } as ViewStyle,
        menuItemText: { textAlign: isRTL ? "right" : "left" } as TextStyle,
        logoutText: { textAlign: isRTL ? "right" : "left" } as TextStyle,
        chevron: { marginLeft: isRTL ? 0 : wp(2), marginRight: isRTL ? wp(2) : 0 },
      }),
      [isRTL]
    );

    return (
      <View style={styles.container}>
        <SectionHeader title={t("profile.accountManagement", { defaultValue: "Account Management" })} iconName="person" />
        <View style={styles.card}>
          <TouchableOpacity style={[styles.menuItem, rtlStyles.menuItem]} onPress={onUpdateProfilePress} activeOpacity={0.7}>
            <Text style={[styles.menuItemText, rtlStyles.menuItemText]}>
              {t("profile.updateProfile", { defaultValue: "Update profile" })}
            </Text>
            <Ionicons
              name={isRTL ? "chevron-back" : "chevron-forward"}
              size={wp(5)}
              color={COLORS.textDisabled}
              style={[styles.chevron, rtlStyles.chevron]}
            />
          </TouchableOpacity>

          <View style={styles.separator} />
          <TouchableOpacity style={[styles.menuItem, rtlStyles.menuItem]} onPress={onChangePasswordPress} activeOpacity={0.7}>
            <Text style={[styles.menuItemText, rtlStyles.menuItemText]}>
              {t("profile.changePassword", { defaultValue: "Change password" })}
            </Text>
            <Ionicons
              name={isRTL ? "chevron-back" : "chevron-forward"}
              size={wp(5)}
              color={COLORS.textDisabled}
              style={[styles.chevron, rtlStyles.chevron]}
            />
          </TouchableOpacity>

          <View style={styles.separator} />
          <TouchableOpacity style={[styles.menuItem, rtlStyles.menuItem]} onPress={onChangePhoneNumberPress} activeOpacity={0.7}>
            <Text style={[styles.menuItemText, rtlStyles.menuItemText]}>
              {t("profile.changePhoneNumber", { defaultValue: "Change phone number" })}
            </Text>
            <Ionicons
              name={isRTL ? "chevron-back" : "chevron-forward"}
              size={wp(5)}
              color={COLORS.textDisabled}
              style={[styles.chevron, rtlStyles.chevron]}
            />
          </TouchableOpacity>

          <View style={styles.separator} />
          <TouchableOpacity style={[styles.menuItem, rtlStyles.menuItem]} onPress={onLogoutPress} activeOpacity={0.7}>
            <Text style={[styles.logoutText, rtlStyles.logoutText]}>
              {t("auth.logout", { defaultValue: "Log out" })}
            </Text>
            <Ionicons
              name={isRTL ? "chevron-back" : "chevron-forward"}
              size={wp(5)}
              color={COLORS.textDisabled}
              style={[styles.chevron, rtlStyles.chevron]}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

AccountManagementSection.displayName = "AccountManagementSection";

const styles = StyleSheet.create({
  container: {
    marginTop: hp(2),
    marginBottom: hp(1.5),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    marginHorizontal: wp(4),
    overflow: "hidden",
    width: "100%",
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  menuItem: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  menuItemText: {
    fontSize: wp(4),
    fontWeight: "400",
    color: COLORS.textPrimary,
  },
  logoutText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: "#c13234",
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.bgGray,
    marginHorizontal: wp(4),
  },
  chevron: {},
});

export default AccountManagementSection;
