import React, { useMemo } from "react";
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
import { useLocalization } from "../../hooks/useLocalization";
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
  const { t, isRTL } = useLocalization();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If there's no screen to go back to, navigate to Listings tab
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate("Listings");
      } else {
        navigation.navigate("Listings");
      }
    }
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
    // Navigate to AddListing screen in Listings tab
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("Listings", {
        screen: "AddListing",
      });
    } else {
      navigation.navigate("Listings", {
        screen: "AddListing",
      });
    }
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

  // RTL-aware styles (only apply RTL-specific changes, preserve LTR styling)
  const rtlStyles = useMemo(
    () => ({
      walletContainer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      walletText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  const menuItems: MenuItem[] = [
    {
      title: t("profile.myDeals"),
      subtitle: t("profile.verifyDeals"),
      onPress: () => console.log("My Deals pressed"),
    },
    {
      title: t("listings.requests"),
      subtitle: t("profile.getAlertsForOffers"),
      onPress: () => console.log("Requests pressed"),
    },
    {
      title: t("profile.myBookings"),
      subtitle: t("profile.bookingHistory"),
      onPress: () => console.log("My Bookings pressed"),
    },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("profile.title")}
        onBackPress={handleBackPress}
        fontWeightBold={true}
        rightComponent={
          <TouchableOpacity
            style={[styles.walletContainer, rtlStyles.walletContainer]}
            onPress={handleWalletPress}
            activeOpacity={0.7}
          >
            <Ionicons name="wallet-outline" size={wp(5)} color={COLORS.primary} />
            <Text style={[styles.walletText, rtlStyles.walletText]}>{t("profile.noBalance")}</Text>
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
