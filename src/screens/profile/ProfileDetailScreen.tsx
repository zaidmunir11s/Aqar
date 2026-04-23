import React, { useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { COLORS, STORAGE_KEYS } from "../../constants";
import { formatSaudiPhoneForDisplay } from "../../utils/validation";
import { useLocalization, useTabNavigation } from "../../hooks";
import { useAuthContext } from "../../context/auth-context";
import { secureGet, secureMultiRemove } from "@/utils/secureStore";
import { backendRequest } from "@/utils/backendApi";
import { useGetMeQuery } from "@/redux/api/userApi";
import {
  ScreenHeader,
  PhoneCard,
  // ActionButtons,
  // AqarCard,
  // ActivityItem,
  AddButton,
  // MenuList,
  // ClientsSection,
  AccountManagementSection,
} from "../../components";
// import type { MenuItem } from "../../components/profile/MenuList";

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
  const { data: meData } = useGetMeQuery();
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
            secureGet(STORAGE_KEYS.loggedInPhoneNumber),
            secureGet(STORAGE_KEYS.loggedInDisplayName),
            secureGet(STORAGE_KEYS.loggedInProfileImageUri),
          ]);
          if (!active) return;
          // Prefer backend phone number when present (stays consistent across devices).
          const backendPhoneDigits = meData?.user?.phoneNumber
            ? String(meData.user.phoneNumber).replace(/\D/g, "")
            : "";
          const effectivePhone = backendPhoneDigits || (rawPhone ?? "");
          setProfilePhoneDisplay(
            effectivePhone
              ? formatSaudiPhoneForDisplay(effectivePhone)
              : t("profile.phoneNotOnProfile")
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
    }, [t, meData?.user?.phoneNumber])
  );

  const handlePhonePress = useCallback(() => {
    navigation.navigate("UserProfileAds");
  }, [navigation]);

  // const handleFavoritesPress = useCallback(() => {}, []);
  // const handleAlertsPress = useCallback(() => {}, []);
  // const handleAqarPress = useCallback(() => {}, []);
  // const handleActivityPress = useCallback(() => {}, []);

  const handleAddPress = useCallback(() => {
    navigateToListings("AddListing");
  }, [navigateToListings]);

  // const handleMyClientsPress = useCallback(() => {
  //   // TODO: Navigate to My Clients
  // }, []);

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
    await secureMultiRemove([
      STORAGE_KEYS.authToken,
      STORAGE_KEYS.refreshToken,
      STORAGE_KEYS.loggedInPhoneNumber,
      STORAGE_KEYS.loggedInDisplayName,
      STORAGE_KEYS.loggedInProfileImageUri,
      STORAGE_KEYS.accountProfileMeta,
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

  const handleDeleteAccountPress = useCallback(() => {
    Alert.alert(
      t("profile.deleteAccount", { defaultValue: "Delete account" }),
      t("profile.deleteAccountConfirm", {
        defaultValue:
          "This will permanently delete your account and all associated data. This action cannot be undone.",
      }),
      [
        { text: t("common.cancel", { defaultValue: "Cancel" }), style: "cancel" },
        {
          text: t("profile.deleteAccount", { defaultValue: "Delete account" }),
          style: "destructive",
          onPress: async () => {
            try {
              await backendRequest("/account/me", { method: "DELETE" });
            } catch (e: any) {
              Alert.alert(
                t("common.error", { defaultValue: "Error" }),
                e?.message ||
                  t("profile.deleteAccountFailed", { defaultValue: "Failed to delete account." })
              );
              return;
            }

            await secureMultiRemove([
              STORAGE_KEYS.authToken,
              STORAGE_KEYS.refreshToken,
              STORAGE_KEYS.loggedInPhoneNumber,
              STORAGE_KEYS.loggedInDisplayName,
              STORAGE_KEYS.loggedInProfileImageUri,
              STORAGE_KEYS.accountProfileMeta,
              STORAGE_KEYS.lastActiveAtMs,
            ]);
            setHasBackendSession(false);
            await clerkSignOut().catch(() => null);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Login" }],
              })
            );
          },
        },
      ]
    );
  }, [t, navigation, setHasBackendSession, clerkSignOut]);

  // (wallet/balance UI removed)

  // NOTE: The following Profile sections are currently not wired to real screens/APIs.
  // Keep commented out until we implement them end-to-end:
  // - Favorites / Alerts shortcuts
  // - Aqar card
  // - Activity section
  // - Deals / Requests / Bookings menu
  // - Clients section
  //
  // const onMyDealsPress = useCallback(() => {}, []);
  // const onRequestsPress = useCallback(() => {}, []);
  // const onMyBookingsPress = useCallback(() => {}, []);
  //
  // const menuItems: MenuItem[] = useMemo(
  //   () => [
  //     { title: t("profile.myDeals"), subtitle: t("profile.verifyDeals"), onPress: onMyDealsPress },
  //     { title: t("listings.requests"), subtitle: t("profile.getAlertsForOffers"), onPress: onRequestsPress },
  //     { title: t("profile.myBookings"), subtitle: t("profile.bookingHistory"), onPress: onMyBookingsPress },
  //   ],
  //   [t, onMyDealsPress, onRequestsPress, onMyBookingsPress]
  // );

  const profileHeaderRight = null;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("profile.title")}
        onBackPress={handleBackPress}
        fontWeightBold={true}
        rightComponent={profileHeaderRight}
        showRightSide={false}
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
        {/*
        <ActionButtons
          onFavoritesPress={handleFavoritesPress}
          onAlertsPress={handleAlertsPress}
        />
        <AqarCard onPress={handleAqarPress} />
        <ActivityItem onPress={handleActivityPress} />
        */}
        <Text style={styles.sectionTitle}>{t("listings.addNewListing")}</Text>
        <AddButton onPress={handleAddPress} />
        {/*
        <MenuList items={menuItems} />
        <ClientsSection onMyClientsPress={handleMyClientsPress} />
        */}
        <AccountManagementSection
          onUpdateProfilePress={handleUpdateProfilePress}
          onChangePasswordPress={handleChangePasswordPress}
          onChangePhoneNumberPress={handleChangePhoneNumberPress}
          onLogoutPress={handleLogoutPress}
          onDeleteAccountPress={handleDeleteAccountPress}
          showChangePassword={!!meData?.user?.hasPassword}
          // Allow SSO users to add a phone number when missing.
          showChangePhoneNumber={true}
          phoneNumberMissing={!meData?.user?.phoneNumber}
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
  sectionTitle: {
    marginTop: hp(1.2),
    marginBottom: hp(1),
    fontSize: wp(4.2),
    fontWeight: "700",
    color: "#111827",
  },
});
