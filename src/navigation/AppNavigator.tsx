import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { getFocusedRouteNameFromRoute, Route } from "@react-navigation/native";
import { useIsAuthenticated } from "../context/auth-context";
import { useAppSelector } from "../redux/hooks";

import { AuthStack, ListingsStack, ProjectsStack, DailyStack, ChatStack } from "./stacks";
import ServicesScreen from "../screens/services/ServicesScreen";
import { COLORS } from "../constants";
import { useLocalization } from "../hooks/useLocalization";

const Tab = createBottomTabNavigator();

/* ---------------------------------- */
/* Centralized Route Configuration */
/* ---------------------------------- */
const ROUTES_TO_HIDE_TAB_BAR = [
  "Login",
  "CreateAccount",
  "PropertyDetails",
  "ListingMedia",
  "NearbyServices",
  "AveragePriceDetail",
  "AqarResidentialStats",
  "DailyDetails",
  "ContactHost",
  "Reserve",
  "ProjectDetails",
  "AddListing",
  "Licence",
  "Step2AdLicense",
  "PublishLicenseAdvertisement",
  "DeedOwnerInformation",
  "MarketingRequestPlaceholder",
  "AddRentalUnitOnboarding",
  "ChooseCategory",
  "SearchRequest",
  "NewOrder",
  "ChooseLocation",
  "Description",
  "MatchedListings",
  "ForgotPassword",
  "VerifyPhoneNumber",
  "UpdateProfile",
  "ChangePassword",
  "ChangePhoneNumber",
  "Conversation",
  "DeveloperProfile",
];

/* ---------------------------------- */
/* Helper to check if tab bar should be visible */
/* ---------------------------------- */
const shouldShowTabBar = (route: Route<string, object | undefined> | any): boolean => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "";
  return !ROUTES_TO_HIDE_TAB_BAR.includes(routeName);
};

/* ---------------------------------- */
/* Custom Tab Bar Component for RTL */
/* ---------------------------------- */
const CustomTabBar = (props: BottomTabBarProps) => {
  const { isRTL } = useLocalization();
  
  // Check if tab bar should be hidden for current route
  const focusedRoute = props.state.routes[props.state.index];
  const shouldShow = shouldShowTabBar(focusedRoute);

  // Return null to completely remove the tab bar and any associated space
  if (!shouldShow) {
    return null;
  }
  
  // For RTL, reverse the visual order but maintain navigation indices
  const displayRoutes = isRTL ? [...props.state.routes].reverse() : props.state.routes;
  
  return (
    <View style={styles.tabBarContainer}>
      <SafeAreaView edges={["bottom"]} style={styles.tabBarSafeArea}>
        <View style={styles.tabBar}>
          {displayRoutes.map((route) => {
            // Find the original index in the state for proper focus detection
            const originalIndex = props.state.routes.findIndex((r) => r.key === route.key);
            const isFocused = props.state.index === originalIndex;
            const { options } = props.descriptors[route.key];

            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const onPress = () => {
              const event = props.navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                props.navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              props.navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            const color = isFocused
              ? options.tabBarActiveTintColor || COLORS.activeTabBar
              : options.tabBarInactiveTintColor || "#999";

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={(options as any).tabBarTestID || undefined}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
              >
                {options.tabBarIcon &&
                  options.tabBarIcon({
                    focused: isFocused,
                    color,
                    size: wp(6),
                  })}
                {typeof label === "string" && (
                  <Text
                    style={[
                      styles.tabLabel,
                      { color },
                      options.tabBarLabelStyle,
                    ]}
                  >
                    {label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
};

/* ---------------------------------- */
/* Default Options */
/* ---------------------------------- */
const defaultTabBarOptions = {
  headerShown: false,
  tabBarLabelStyle: {
    fontSize: wp(2.8),
    marginTop: hp(0.5),
  },
  tabBarActiveTintColor: COLORS.activeTabBar,
  tabBarInactiveTintColor: "#999",
};

export default function AppNavigator(): React.JSX.Element {
  const { isAuthenticated, isLoaded } = useIsAuthenticated();
  const { t, isRTL } = useLocalization();
  const preservedFilter = useAppSelector((s) => s.listingsFilters.preservedFilter);

  return (
    <Tab.Navigator
      initialRouteName="Listings"
      screenOptions={defaultTabBarOptions}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {/* ---------------- Profile ---------------- */}
      <Tab.Screen
        name="ProfileTab"
        component={AuthStack}
        options={{
          tabBarLabel: t("navigation.profile"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={wp(6)} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Check if user is signed in (Clerk e.g. Google, or backend token e.g. phone/password)
            if (isLoaded && isAuthenticated) {
              // User is signed in, go to ProfileDetail
              e.preventDefault();
              requestAnimationFrame(() => {
                navigation.navigate("ProfileTab", { screen: "ProfileDetail" });
              });
            } else {
              // User is not signed in, go to Login
              e.preventDefault();
              requestAnimationFrame(() => {
                navigation.navigate("ProfileTab", { screen: "Login" });
              });
            }
          },
        })}
      />

      {/* ---------------- Listings ---------------- */}
      <Tab.Screen
        name="Listings"
        component={ListingsStack}
        options={{
          tabBarLabel: t("navigation.listings"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="albums" size={wp(6)} color={color} />
          ),
        }}
      />

      {/* ---------------- Projects ---------------- */}
      <Tab.Screen
        name="Projects"
        component={ProjectsStack}
        options={{
          tabBarLabel: t("navigation.projects"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="business" size={wp(6)} color={color} />
          ),
        }}
      />

      {/* ---------------- Bookings ---------------- */}
      <Tab.Screen
        name="Bookings"
        component={DailyStack}
        options={{
          tabBarLabel: t("navigation.bookings"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" size={wp(6)} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const bookingsTabState = state.routes.find(
              (r) => r.name === "Bookings"
            );

            const currentRoute =
              bookingsTabState?.state?.routes?.[
                bookingsTabState?.state?.index || 0
              ];
            const isOnPropertyList = currentRoute?.name === "PropertyList";

            if (!isOnPropertyList) {
              e.preventDefault();
              interface RouteParams {
                selectedFilter?: string | null;
              }
              const currentRouteParams = currentRoute?.params as
                | RouteParams
                | undefined;
              const filterFromCurrentRoute = currentRouteParams?.selectedFilter;
              const filterToPreserve =
                preservedFilter !== null && preservedFilter !== undefined
                  ? preservedFilter
                  : filterFromCurrentRoute;
              navigation.navigate("Bookings", {
                screen: "PropertyList",
                params: filterToPreserve
                  ? { selectedFilter: filterToPreserve }
                  : undefined,
              });
            } else {
              interface RouteParams {
                selectedFilter?: string | null;
              }
              const currentRouteParams = currentRoute?.params as
                | RouteParams
                | undefined;
              if (
                preservedFilter &&
                currentRouteParams?.selectedFilter !== preservedFilter
              ) {
                e.preventDefault();
                navigation.navigate("Bookings", {
                  screen: "PropertyList",
                  params: { selectedFilter: preservedFilter },
                  merge: true,
                });
              }
            }
          },
        })}
      />

      {/* ---------------- Chat ---------------- */}
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          tabBarLabel: t("navigation.chat"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles" size={wp(6)} color={color} />
          ),
        }}
      />

      {/* ---------------- Services ---------------- */}
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          tabBarLabel: t("navigation.services"),
          tabBarIcon: ({ color }) => (
            <View style={styles.servicesIconContainer}>
              <View style={[styles.newBadge, isRTL && styles.newBadgeRTL]}>
                <Text style={styles.newBadgeText}>{t("navigation.new")}</Text>
              </View>
              <Ionicons name="construct" size={wp(6)} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: COLORS.white,
  },
  tabBarSafeArea: {
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    height: hp(8.5),
    paddingTop: hp(1),
    paddingBottom: hp(1.2),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: wp(2.8),
    marginTop: hp(0.5),
  },
  servicesIconContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  newBadge: {
    position: "absolute",
    left: -wp(8),
    backgroundColor: "#ef4444",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(1),
    zIndex: 1,
    marginBottom: hp(0.5),
  },
  newBadgeRTL: {
    // left: undefined,
    // right: -wp(8),
  },
  newBadgeText: {
    color: "#fff",
    fontSize: wp(2),
    fontWeight: "bold",
  },
});