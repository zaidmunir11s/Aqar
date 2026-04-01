import React, { useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { COLORS, STORAGE_KEYS } from "../../constants";
import { formatSaudiPhoneForDisplay } from "../../utils/validation";
import { useLocalization, useTabNavigation } from "../../hooks";
import { useAuthContext } from "../../context/auth-context";
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
  const { setHasBackendSession } = useAuthContext();
  const { signOut: clerkSignOut } = useClerk();
  const { user: clerkUser } = useUser();

  const clerkDisplayName = useMemo(() => {
    if (!clerkUser) return undefined;
    const full = clerkUser.fullName?.trim();
    if (full) return full;
    const parts = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .map((s) => String(s).trim());
    return parts.length > 0 ? parts.join(" ") : undefined;
  }, [clerkUser]);

  const { navigateToListings } = useTabNavigation();
  const [profilePhoneDisplay, setProfilePhoneDisplay] = useState<string | undefined>(undefined);
  const [profileDisplayName, setProfileDisplayName] = useState<string | undefined>(undefined);
  const [profileAvatarUri, setProfileAvatarUri] = useState<string | null>(null);

  const handleBackPress = useCallback(() => {
    const AUTH_SCREENS = ["Login", "CreateAccount", "ForgotPassword", "VerifyPhoneNumber"];
    const state = navigation.getState();
    const routes = state?.routes ?? [];
    const currentIndex = state?.index ?? 0;
    const prevRoute = currentIndex > 0 ? routes[currentIndex - 1] : null;
    const prevIsAuth = prevRoute && AUTH_SCREENS.includes(prevRoute.name);

    if (navigation.canGoBack() && !prevIsAuth) {
      navigation.goBack();
    } else {
      navigateToListings();
    }
  }, [navigation, navigateToListings]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, [handleBackPress])
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const [rawPhone, rawName, rawUri] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.loggedInPhoneNumber),
            AsyncStorage.getItem(STORAGE_KEYS.loggedInDisplayName),
            AsyncStorage.getItem(STORAGE_KEYS.loggedInProfileImageUri),
          ]);
          if (!active) return;
          setProfilePhoneDisplay(
            rawPhone ? formatSaudiPhoneForDisplay(rawPhone) : t("profile.phoneNotOnProfile")
          );
          setProfileDisplayName(rawName?.trim() ? rawName.trim() : undefined);
          setProfileAvatarUri(rawUri && rawUri.length > 0 ? rawUri : null);
        } catch {
          if (!active) return;
          setProfilePhoneDisplay(t("profile.phoneNotOnProfile"));
          setProfileDisplayName(undefined);
          setProfileAvatarUri(null);
        }
      })();
      return () => {
        active = false;
      };
    }, [t])
  );

  const handleWalletPress = useCallback(() => {
    // TODO: Navigate to wallet screen
  }, []);

  const handlePhonePress = useCallback(() => {
    navigation.navigate("UserProfileAds");
  }, [navigation]);

  const handleFavoritesPress = useCallback(() => {}, []);
  const handleAlertsPress = useCallback(() => {}, []);
  const handleAqarPress = useCallback(() => {}, []);
  const handleActivityPress = useCallback(() => {}, []);

  const handleAddPress = useCallback(() => {
    navigateToListings("AddListing");
  }, [navigateToListings]);

  const handleMyClientsPress = useCallback(() => {
    // TODO: Navigate to My Clients
  }, []);

  const handleUpdateProfilePress = useCallback(() => {
    navigation.navigate("UpdateProfile");
  }, [navigation]);

  const handleChangePasswordPress = useCallback(() => {
    navigation.navigate("ChangePassword");
  }, [navigation]);

  const handleChangePhoneNumberPress = useCallback(() => {
    navigation.navigate("ChangePhoneNumber");
  }, [navigation]);

  const handleLogoutPress = useCallback(async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.authToken,
      STORAGE_KEYS.refreshToken,
      STORAGE_KEYS.loggedInPhoneNumber,
      STORAGE_KEYS.lastActiveAtMs,
    ]);
    setHasBackendSession(false);
    await clerkSignOut();
    // Reset Auth stack to only Login so back button cannot return to ProfileDetail
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  }, [navigation, setHasBackendSession, clerkSignOut]);

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

  const onMyDealsPress = useCallback(() => {}, []);
  const onRequestsPress = useCallback(() => {}, []);
  const onMyBookingsPress = useCallback(() => {}, []);

  const menuItems: MenuItem[] = useMemo(
    () => [
      { title: t("profile.myDeals"), subtitle: t("profile.verifyDeals"), onPress: onMyDealsPress },
      { title: t("listings.requests"), subtitle: t("profile.getAlertsForOffers"), onPress: onRequestsPress },
      { title: t("profile.myBookings"), subtitle: t("profile.bookingHistory"), onPress: onMyBookingsPress },
    ],
    [t, onMyDealsPress, onRequestsPress, onMyBookingsPress]
  );

  const profileHeaderRight = useMemo(
    () => (
      <TouchableOpacity
        style={[styles.walletContainer, rtlStyles.walletContainer]}
        onPress={handleWalletPress}
        activeOpacity={0.7}
      >
        <Ionicons name="wallet-outline" size={wp(5)} color={COLORS.primary} />
        <Text style={[styles.walletText, rtlStyles.walletText]}>{t("profile.noBalance")}</Text>
      </TouchableOpacity>
    ),
    [handleWalletPress, rtlStyles.walletContainer, rtlStyles.walletText, t]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("profile.title")}
        onBackPress={handleBackPress}
        fontWeightBold={true}
        rightComponent={profileHeaderRight}
        showRightSide={true}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <PhoneCard
          phoneNumber={profilePhoneDisplay ?? t("common.loading")}
          displayName={profileDisplayName ?? clerkDisplayName}
          avatarUri={profileAvatarUri ?? clerkUser?.imageUrl ?? null}
          onPress={handlePhonePress}
        />
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
