import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useIsAuthenticated } from "../context/auth-context";
import { useLocalization } from "../hooks/useLocalization";
import { AuthStack, ListingsStack } from "./stacks";
import ServicesScreen from "../screens/services/ServicesScreen";
import {
  bottomTabScreenOptions,
  createProfileTabListeners,
  CustomTabBar,
  ServicesTabIcon,
} from "./tabBar";

const Tab = createBottomTabNavigator();

export default function AppNavigator(): React.JSX.Element {
  const { isAuthenticated, isLoaded } = useIsAuthenticated();
  const { t, isRTL } = useLocalization();

  // DO NOT REMOVE: this is kept for future Bookings tab re-enable.
  // const preservedFilter = useAppSelector((s) => s?.listingsFilters?.preservedFilter ?? null);

  const profileTabListeners = React.useMemo(
    () => createProfileTabListeners(isLoaded, isAuthenticated),
    [isLoaded, isAuthenticated],
  );

  return (
    <Tab.Navigator
      initialRouteName="Listings"
      // Don’t switch tabs on Android hardware back (e.g. Listings → Profile). Let the focused
      // stack/screen handle back so MapLanding can show the exit modal without a tab flash.
      backBehavior="none"
      screenOptions={bottomTabScreenOptions}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="ProfileTab"
        component={AuthStack}
        options={{
          tabBarLabel: t("navigation.profile"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={wp(6)} color={color} />
          ),
        }}
        listeners={profileTabListeners}
      />

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

      {/* DO NOT REMOVE THIS COMMENTED TAB IN ANY FUTURE WORK.
          It will be used again in upcoming releases. */}
      {/* ---------------- Projects ---------------- */}
      {/* <Tab.Screen
        name="Projects"
        component={ProjectsStack}
        options={{
          tabBarLabel: t("navigation.projects"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="business" size={wp(6)} color={color} />
          ),
        }}
      /> */}

      {/* DO NOT REMOVE THESE COMMENTED TABS IN ANY FUTURE WORK.
          They will be used again in upcoming releases. */}
      {/* ---------------- Bookings ---------------- */}
      {/* <Tab.Screen
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
            const isOnBookingList = currentRoute?.name === "BookingList";

            if (!isOnBookingList) {
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
                screen: "BookingList",
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
                  screen: "BookingList",
                  params: { selectedFilter: preservedFilter },
                  merge: true,
                });
              }
            }
          },
        })}
      /> */}

      {/* ---------------- Chat ---------------- */}
      {/* <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          tabBarLabel: t("navigation.chat"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles" size={wp(6)} color={color} />
          ),
        }}
      /> */}

      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          tabBarLabel: t("navigation.services"),
          tabBarIcon: ({ color }) => (
            <ServicesTabIcon
              color={color}
              isRTL={isRTL}
              newLabel={t("navigation.new")}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
