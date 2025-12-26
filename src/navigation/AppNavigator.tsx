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

      {/* ---------------- Daily ---------------- */}
      <Tab.Screen
        name="Daily"
        component={DailyStack}
        options={({ route }) => ({
          tabBarLabel: "Daily",
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
            const dailyTabState = state.routes.find((r) => r.name === "Daily");
            
            // Check if we're currently on PropertyList
            const currentRoute = dailyTabState?.state?.routes?.[dailyTabState?.state?.index || 0];
            const isOnPropertyList = currentRoute?.name === "PropertyList";
            
            // Always get preserved filter before any navigation
            const { getPreservedFilter } = require("../screens/listings/PropertyListScreen");
            const preservedFilter = getPreservedFilter();
            
            // If we're not on PropertyList, prevent default and reset to it
            if (!isOnPropertyList) {
              e.preventDefault();
              // Get the parent navigator (Tab navigator)
              const parent = navigation.getParent();
              if (parent) {
                // Reset the Daily stack to PropertyList
                const tabState = parent.getState();
                const dailyIndex = tabState.routes.findIndex((r) => r.name === "Daily");
                
                if (dailyIndex !== -1) {
                  // Get filter from multiple sources to ensure we don't lose it
                  // 1. Check if there's a filter in the current route (map screen might have it)
                  const currentRouteParams = currentRoute?.params as any;
                  const filterFromCurrentRoute = currentRouteParams?.selectedFilter;
                  
                  // 2. Check if there's a PropertyList route in the stack with a filter
                  const currentDailyState = tabState.routes[dailyIndex]?.state;
                  const propertyListRouteInStack = currentDailyState?.routes?.find(
                    (r: any) => r.name === "PropertyList"
                  );
                  const filterFromStack = propertyListRouteInStack?.params?.selectedFilter;
                  
                  // Priority: preservedFilter (module-level, always up-to-date) > filterFromCurrentRoute > filterFromStack
                  // Always use preservedFilter if it exists, as it's the source of truth
                  // NEVER reset filter - always preserve it if it exists
                  const filterToPreserve = preservedFilter !== null && preservedFilter !== undefined 
                    ? preservedFilter 
                    : (filterFromCurrentRoute ?? filterFromStack);
                  
                  parent.reset({
                    index: dailyIndex,
                    routes: tabState.routes.map((route, idx) => {
                      if (route.name === "Daily") {
                        return {
                          ...route,
                          state: {
                            routes: [{ 
                              name: "PropertyList",
                              // Always pass filter if it exists - never reset it
                              params: filterToPreserve ? { selectedFilter: filterToPreserve } : undefined
                            }],
                            index: 0,
                          },
                        };
                      }
                      return route;
                    }),
                  });
                }
              } else {
                // Fallback: navigate to PropertyList with preserved filter
                navigation.navigate("Daily", { 
                  screen: "PropertyList",
                  params: preservedFilter ? { selectedFilter: preservedFilter } : undefined
                });
              }
            } else {
              // We're already on PropertyList - ensure filter is preserved in params
              // This prevents filter from being lost when switching tabs
              if (preservedFilter && currentRoute?.params?.selectedFilter !== preservedFilter) {
                e.preventDefault();
                navigation.navigate("Daily", {
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
