import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { COLORS } from "@/constants";

export const bottomTabScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarLabelStyle: {
    fontSize: wp(2.8),
    marginTop: hp(0.5),
  },
  tabBarActiveTintColor: COLORS.activeTabBar,
  tabBarInactiveTintColor: "#999",
};
