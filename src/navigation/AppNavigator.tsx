import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Ionicons,
  FontAwesome6,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  getFocusedRouteNameFromRoute,
  Route,
} from "@react-navigation/native";

import { AuthStack, ListingsStack, ProjectsStack, DailyStack } from "./stacks";
import ServicesScreen from "../screens/services/ServicesScreen";
import { COLORS } from "../constants";

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
  return (
    <Tab.Navigator
      initialRouteName="Listings"
      screenOptions={defaultTabBarOptions}
    >
      {/* ---------------- Profile ---------------- */}
      <Tab.Screen
        name="ProfileTab"
        component={AuthStack}
        options={({ route }) => ({
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome6
              name="circle-user"
              size={wp(6)}
              color={color}
            />
          ),
          tabBarStyle: getTabBarStyle(route),
        })}
        listeners={({ navigation }) => ({
          tabPress: () => {
            requestAnimationFrame(() => {
              navigation.navigate("ProfileTab", { screen: "Login" });
            });
          },
        })}
      />

      {/* ---------------- Listings ---------------- */}
      <Tab.Screen
        name="Listings"
        component={ListingsStack}
        options={({ route }) => ({
          tabBarLabel: "Listings",
          tabBarIcon: ({ color }) => (
            <FontAwesome6
              name="map-location-dot"
              size={wp(7)}
              color={color}
            />
          ),
          tabBarStyle: getTabBarStyle(route),
        })}
      />

      {/* ---------------- Projects ---------------- */}
      <Tab.Screen
        name="Projects"
        component={ProjectsStack}
        options={({ route }) => ({
          tabBarLabel: "Projects",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="stats-chart-outline"
              size={wp(6)}
              color={color}
            />
          ),
          tabBarStyle: getTabBarStyle(route),
        })}
      />

      {/* ---------------- Bookings ---------------- */}
      <Tab.Screen
        name="Bookings"
        component={DailyStack}
        options={({ route }) => ({
          tabBarLabel: "Bookings",
          tabBarIcon: ({ color }) => (
            <FontAwesome6
              name="calendar-days"
              size={wp(6)}
              color={color}
            />
          ),
          tabBarStyle: getTabBarStyle(route),
        })}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Get the current navigation state
            const state = navigation.getState();
            const bookingsTabState = state.routes.find((r) => r.name === "Bookings");
            
            // Check if we're currently on PropertyList
            const currentRoute = bookingsTabState?.state?.routes?.[bookingsTabState?.state?.index || 0];
            const isOnPropertyList = currentRoute?.name === "PropertyList";
            
            // Always get preserved filter before any navigation
            const { getPreservedFilter } = require("../screens/listings/PropertyListScreen");
            const preservedFilter = getPreservedFilter();
            
            // If we're not on PropertyList, prevent default and navigate to it
            if (!isOnPropertyList) {
              e.preventDefault();
              // Get filter from current route if available
              interface RouteParams {
                selectedFilter?: string | null;
              }
              const currentRouteParams = currentRoute?.params as RouteParams | undefined;
              const filterFromCurrentRoute = currentRouteParams?.selectedFilter;
              
              // Priority: preservedFilter (module-level, always up-to-date) > filterFromCurrentRoute
              // Always use preservedFilter if it exists, as it's the source of truth
              const filterToPreserve = preservedFilter !== null && preservedFilter !== undefined 
                ? preservedFilter 
                : filterFromCurrentRoute;
              
              // Navigate to PropertyList with preserved filter
              navigation.navigate("Bookings", { 
                screen: "PropertyList",
                params: filterToPreserve ? { selectedFilter: filterToPreserve } : undefined
              });
            } else {
              // We're already on PropertyList - ensure filter is preserved in params
              // This prevents filter from being lost when switching tabs
              interface RouteParams {
                selectedFilter?: string | null;
              }
              const currentRouteParams = currentRoute?.params as RouteParams | undefined;
              if (preservedFilter && currentRouteParams?.selectedFilter !== preservedFilter) {
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
        component={AuthStack}
        options={({ route }) => ({
          tabBarLabel: "Chat",
          tabBarIcon: ({ color }) => (
            <Entypo
              name="chat"
              size={wp(6)}
              color={color}
            />
          ),
          tabBarStyle: getTabBarStyle(route),
        })}
        listeners={({ navigation }) => ({
          tabPress: () => {
            requestAnimationFrame(() => {
              navigation.navigate("Chat", { screen: "Login" });
            });
          },
        })}
      />

      {/* ---------------- Services ---------------- */}
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={({ route }) => ({
          tabBarLabel: "Services",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="dots-grid"
              size={wp(6)}
              color={color}
            />
          ),
          tabBarBadge: "New",
          tabBarBadgeStyle: {
            backgroundColor: "#ef4444",
            color: "#fff",
            fontSize: wp(2),
            fontWeight: "bold",
            maxWidth: wp(10),
          },
          tabBarStyle: getTabBarStyle(route),
        })}
      />
    </Tab.Navigator>
  );
}
