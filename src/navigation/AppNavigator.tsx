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
import { getFocusedRouteNameFromRoute, Route } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthStack, ListingsStack, ProjectsStack } from "./stacks";

import ServicesScreen from "../screens/services/ServicesScreen";

const Tab = createBottomTabNavigator();

const getTabBarStyle = (
  route: Route<string, object | undefined>,
  bottomInset: number
) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "";

  const hideTabBarRoutes = [
    "Login",
    "CreateAccount",
    "ProfileDetail",
    "UserProfileAds",
    "PayBrokerCommission",
    "PropertyDetails",
    "PropertyList",
    "ProjectDetails",
    "AddListing",
  ];
  const shouldHide = hideTabBarRoutes.includes(routeName);

  if (shouldHide) {
    return { display: "none" as const };
  }

  const bottomPadding = Math.max(bottomInset, hp(2.5));
  const baseHeight = hp(8.5);

  return {
    height: baseHeight + bottomPadding,
    paddingBottom: bottomPadding,
    paddingTop: hp(1.2),
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  };
};

const defaultTabBarOptions = {
  headerShown: false,
  tabBarLabelStyle: { fontSize: wp(2.8), marginTop: hp(0.5) },
  tabBarActiveTintColor: "#0ab539",
  tabBarInactiveTintColor: "#999",
};

export default function AppNavigator(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Listings"
      screenOptions={defaultTabBarOptions}
    >
      <Tab.Screen
        name="ProfileTab"
        component={AuthStack}
        options={({ route }) => ({
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }: { color: string }) => (
            <FontAwesome6 name="circle-user" size={wp(6)} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route, insets.bottom),
        })}
        listeners={({ navigation }) => ({
          tabPress: () => {
            setTimeout(() => {
              navigation.navigate("ProfileTab", { screen: "Login" });
            }, 0);
          },
        })}
      />

      <Tab.Screen
        name="Listings"
        component={ListingsStack}
        options={({ route }) => ({
          tabBarLabel: "Listings",
          tabBarIcon: ({ color }: { color: string }) => (
            <FontAwesome6 name="map-location-dot" size={wp(7)} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route, insets.bottom),
        })}
      />

      <Tab.Screen
        name="Projects"
        component={ProjectsStack}
        options={({ route }) => ({
          tabBarLabel: "Projects",
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="stats-chart-outline" size={wp(6)} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route, insets.bottom),
        })}
      />

      <Tab.Screen
        name="Chat"
        component={AuthStack}
        options={({ route }) => ({
          tabBarLabel: "Chat",
          tabBarIcon: ({ color }: { color: string }) => (
            <Entypo name="chat" size={wp(6)} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route, insets.bottom),
        })}
        listeners={({ navigation }) => ({
          tabPress: () => {
            setTimeout(() => {
              navigation.navigate("Chat", { screen: "Login" });
            }, 0);
          },
        })}
      />

      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={({ route }) => ({
          tabBarLabel: "Services",
          tabBarIcon: ({ color }: { color: string }) => (
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
            marginHorizontal: wp(-2),
          },
          tabBarStyle: getTabBarStyle(route, insets.bottom),
        })}
      />
    </Tab.Navigator>
  );
}
