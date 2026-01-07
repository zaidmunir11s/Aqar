import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import {
  ScreenHeader,
  PhoneCard,
  ActionButtons,
  AqarCard,
  ActivityItem,
  AddButton,
  MenuList,
  ClientsSection,
  AccountManagementSection,
} from "../../components";
import type { MenuItem } from "../../components/profile/MenuList";

type NavigationProp = NativeStackNavigationProp<any>;

export default function ProfileDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleWalletPress = () => {
    // TODO: Navigate to wallet screen
    console.log("Wallet pressed");
  };

  const handlePhonePress = () => {
    navigation.navigate("UserProfileAds");
  };

  const handleFavoritesPress = () => {
    console.log("Favorites pressed");
  };

  const handleAlertsPress = () => {
    console.log("Alerts pressed");
  };

  const handleAqarPress = () => {
    console.log("Aqar+ pressed");
  };

  const handleActivityPress = () => {
    console.log("Activity pressed");
  };

  const handleAddPress = () => {
    console.log("Add pressed");
  };

  const handleMyClientsPress = () => {
    console.log("My Clients pressed");
  };

  const handleUpdateProfilePress = () => {
    navigation.navigate("UpdateProfile");
  };

  const handleChangePasswordPress = () => {
    navigation.navigate("ChangePassword");
  };

  const handleChangePhoneNumberPress = () => {
    navigation.navigate("ChangePhoneNumber");
  };

  const handleLogoutPress = () => {
    console.log("Log out pressed");
  };

  const menuItems: MenuItem[] = [
    {
      title: "My Deals",
      subtitle: "Verify the deals you have completed",
      onPress: () => console.log("My Deals pressed"),
    },
    {
      title: "Requests",
      subtitle: "Get alerts for offers similar to your wishes",
      onPress: () => console.log("Requests pressed"),
    },
    {
      title: "My Bookings",
      subtitle: "Booking history for daily/monthly rental units",
      onPress: () => console.log("My Bookings pressed"),
    },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Profile"
        onBackPress={handleBackPress}
        fontWeightBold={true}
        rightComponent={
          <TouchableOpacity
            style={styles.walletContainer}
            onPress={handleWalletPress}
            activeOpacity={0.7}
          >
            <Ionicons name="wallet-outline" size={wp(5)} color={COLORS.primary} />
            <Text style={styles.walletText}>No balance</Text>
          </TouchableOpacity>
        }
        showRightSide={true}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <PhoneCard phoneNumber="0542 932 681" onPress={handlePhonePress} />
        <ActionButtons
          onFavoritesPress={handleFavoritesPress}
          onAlertsPress={handleAlertsPress}
        />
        <AqarCard onPress={handleAqarPress} />
        <ActivityItem onPress={handleActivityPress} />
        <AddButton onPress={handleAddPress} />
        <MenuList items={menuItems} />
        <ClientsSection onMyClientsPress={handleMyClientsPress} />
        <AccountManagementSection
          onUpdateProfilePress={handleUpdateProfilePress}
          onChangePasswordPress={handleChangePasswordPress}
          onChangePhoneNumberPress={handleChangePhoneNumberPress}
          onLogoutPress={handleLogoutPress}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgGray,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: wp(4),
  },
  walletContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  walletText: {
    fontSize: wp(3.8),
    color: COLORS.primary,
    fontWeight: "500",
  },
});
