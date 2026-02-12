import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { getFocusedRouteNameFromRoute, Route } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";

import { AuthStack, ListingsStack, ProjectsStack, DailyStack, ChatStack } from "./stacks";
import ServicesScreen from "../screens/services/ServicesScreen";
import { COLORS } from "../constants";
import { useLocalization } from "../hooks/useLocalization";

const Tab = createBottomTabNavigator();

/* ---------------------------------- */
/* Tab Bar Style Helper */
/* ---------------------------------- */
const getTabBarStyle = (route: Route<string, object | undefined>) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "";

  const hideTabBarRoutes = [
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
    // "PropertyList",
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
  ];

  if (hideTabBarRoutes.includes(routeName)) {
    return { display: "none" as const };
  }

  return {
    height: hp(8.5),
    paddingTop: hp(1),
    paddingBottom: hp(1.2),
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  };
};

/* ---------------------------------- */
/* Custom Tab Bar Component for RTL */
/* ---------------------------------- */
const CustomTabBar = (props: BottomTabBarProps) => {
  const { isRTL } = useLocalization();
  
  // Check if tab bar should be hidden for current route
  const focusedRoute = props.state.routes[props.state.index];
  const focusedRouteName = getFocusedRouteNameFromRoute(focusedRoute) ?? "";
  
  const hideTabBarRoutes = [
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
    "ListingMedia",
  ];

  if (hideTabBarRoutes.includes(focusedRouteName)) {
    return null;
  }
  
  // Reverse routes for RTL, but keep original state for navigation logic
  const displayRoutes = isRTL ? [...props.state.routes].reverse() : props.state.routes;
  
  return (
    <View
      style={[
        {
          flexDirection: "row",
          height: hp(8.5),
          paddingTop: hp(1),
          paddingBottom: hp(1.2),
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e5e5",
        },
      ]}
    >
      {displayRoutes.map((route, displayIndex) => {
        // Find the original index in the state
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
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
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
                  {
                    fontSize: wp(2.8),
                    marginTop: hp(0.5),
                    color,
                  },
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
  const { isSignedIn, isLoaded } = useAuth();
  const { t, isRTL } = useLocalization();

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
        options={({ route }) => ({
          tabBarLabel: t("navigation.profile"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={wp(6)} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route),
        })}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Check if user is signed in
            if (isLoaded && isSignedIn) {
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
        options={({ route }) => ({
          tabBarLabel: t("navigation.listings"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="albums" size={wp(6)} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route),
        })}
      />

      {/* ---------------- Projects ---------------- */}
      <Tab.Screen
        name="Projects"
        component={ProjectsStack}
        options={({ route }) => ({
          tabBarLabel: t("navigation.projects"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="business" size={wp(6)} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route),
        })}
      />

      {/* ---------------- Bookings ---------------- */}
      <Tab.Screen
        name="Bookings"
        component={DailyStack}
        options={({ route }) => ({
          tabBarLabel: t("navigation.bookings"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" size={wp(6)} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route),
        })}
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

            const {
              getPreservedFilter,
            } = require("../screens/listings/PropertyListScreen");
            const preservedFilter = getPreservedFilter();

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
        options={({ route }) => ({
          tabBarLabel: t("navigation.chat"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles" size={wp(6)} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route),
        })}
      />

      {/* ---------------- Services ---------------- */}
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={({ route }) => ({
          tabBarLabel: t("navigation.services"),
          tabBarIcon: ({ color }) => (
            <View style={styles.servicesIconContainer}>
              <View style={[styles.newBadge, isRTL && styles.newBadgeRTL]}>
                <Text style={styles.newBadgeText}>{t("navigation.new")}</Text>
              </View>
              <Ionicons name="construct" size={wp(6)} color={color} />
            </View>
          ),
          tabBarStyle: getTabBarStyle(route),
        })}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
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
