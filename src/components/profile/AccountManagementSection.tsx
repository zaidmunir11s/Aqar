import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SectionHeader from "./SectionHeader";

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
  ({
    onUpdateProfilePress,
    onChangePasswordPress,
    onChangePhoneNumberPress,
    onLogoutPress,
  }) => {
    return (
      <View style={styles.container}>
        <SectionHeader title="Account Management" iconName="person" />
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onUpdateProfilePress}
            activeOpacity={0.7}
          >
            <Text style={styles.menuItemText}>Update profile</Text>
            <Ionicons
              name="chevron-forward"
              size={wp(5)}
              color="#e0e0e0"
              style={styles.chevron}
            />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onChangePasswordPress}
            activeOpacity={0.7}
          >
            <Text style={styles.menuItemText}>Change password</Text>
            <Ionicons
              name="chevron-forward"
              size={wp(5)}
              color="#e0e0e0"
              style={styles.chevron}
            />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onChangePhoneNumberPress}
            activeOpacity={0.7}
          >
            <Text style={styles.menuItemText}>Change phone number</Text>
            <Ionicons
              name="chevron-forward"
              size={wp(5)}
              color="#e0e0e0"
              style={styles.chevron}
            />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onLogoutPress}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Log out</Text>
            <Ionicons
              name="chevron-forward"
              size={wp(5)}
              color="#e0e0e0"
              style={styles.chevron}
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
    backgroundColor: "#fff",
    borderRadius: wp(3),
    marginHorizontal: wp(4),
    overflow: "hidden",
    width: "100%",
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  menuItemText: {
    fontSize: wp(4),
    fontWeight: "400",
    color: "#1f2937",
  },
  logoutText: {
    fontSize: wp(4),
    fontWeight: "400",
    color: "#ef4444",
  },
  separator: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: wp(4),
  },
  chevron: {
    marginLeft: wp(2),
  },
});

export default AccountManagementSection;
