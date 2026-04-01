import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { EventArg } from "@react-navigation/native";

type TabNav = BottomTabNavigationProp<Record<string, object | undefined>>;

type ListenersParams = {
  navigation: TabNav;
};

/**
 * Profile tab always opens the correct screen (ProfileDetail when logged-in,
 * Login when guest). LoginScreen's own useFocusEffect handles the redirect
 * if it's ever shown to an authenticated user.
 */
export function createProfileTabListeners(
  isLoaded: boolean,
  isAuthenticated: boolean
) {
  return ({ navigation }: ListenersParams) => ({
    tabPress: (e: EventArg<"tabPress", true, undefined>) => {
      if (!isLoaded) return;
      e.preventDefault();
      const screen = isAuthenticated ? "ProfileDetail" : "Login";
      navigation.navigate("ProfileTab", { screen });
    },
  });
}
