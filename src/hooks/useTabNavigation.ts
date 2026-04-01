import { useCallback } from "react";
import { CommonActions, useNavigation } from "@react-navigation/native";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { AuthStackParamList, RootTabParamList } from "../navigation/types";

type AuthStackScreenName = keyof AuthStackParamList;

export type TabTarget =
  | "ProfileTab"
  | "Listings"
  | "Projects"
  | "Bookings"
  | "Chat"
  | "Services";

export interface UseTabNavigationReturn {
  /** Navigate to Profile tab, optionally to a specific screen */
  navigateToProfile: (screen?: AuthStackScreenName) => void;
  /** Navigate to Listings tab, optionally to a specific screen with params */
  navigateToListings: (
    screen?: string,
    params?: Record<string, unknown>
  ) => void;
  /** Navigate to Projects tab */
  navigateToProjects: (screen?: string, params?: Record<string, unknown>) => void;
  /** Navigate to Bookings tab */
  navigateToBookings: (
    screen?: string,
    params?: Record<string, unknown>
  ) => void;
  /** Navigate to Chat tab, optionally to a specific screen */
  navigateToChat: (screen?: string, params?: Record<string, unknown>) => void;
  /** Navigate to Services tab */
  navigateToServices: () => void;
  /** Generic: navigate to a tab by name */
  navigateToTab: (
    tab: TabTarget,
    screen?: string,
    params?: Record<string, unknown>
  ) => void;
}

/**
 * Hook that encapsulates tab navigation via getParent().
 * Use this instead of repeating navigation.getParent()?.navigate(...) across screens.
 * Provides consistent fallbacks when parent (tab navigator) is not available.
 */
export function useTabNavigation(): UseTabNavigationReturn {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const getTabNavigator = useCallback((): NavigationProp<RootTabParamList> | undefined => {
    return navigation.getParent<NavigationProp<RootTabParamList>>();
  }, [navigation]);

  const navigateToTab = useCallback(
    (tab: TabTarget, screen?: string, params?: Record<string, unknown>) => {
      const parent = getTabNavigator();
      if (parent) {
        if (screen) {
          parent.dispatch(
            CommonActions.navigate({
              name: tab,
              params: { screen, params },
            })
          );
        } else {
          parent.dispatch(
            CommonActions.navigate({
              name: tab,
            })
          );
        }
      } else {
        if (screen) {
          navigation.dispatch(
            CommonActions.navigate({
              name: screen,
              params,
            })
          );
        } else {
          navigation.dispatch(
            CommonActions.navigate({
              name: tab,
            })
          );
        }
      }
    },
    [getTabNavigator, navigation]
  );

  const navigateToProfile = useCallback(
    (screen?: AuthStackScreenName) => {
      const target = screen ?? "ProfileDetail";
      navigateToTab("ProfileTab", target);
    },
    [navigateToTab]
  );

  const navigateToListings = useCallback(
    (screen?: string, params?: Record<string, unknown>) => {
      navigateToTab("Listings", screen, params);
    },
    [navigateToTab]
  );

  const navigateToProjects = useCallback(
    (screen?: string, params?: Record<string, unknown>) => {
      navigateToTab("Projects", screen, params);
    },
    [navigateToTab]
  );

  const navigateToBookings = useCallback(
    (screen?: string, params?: Record<string, unknown>) => {
      navigateToTab("Bookings", screen, params);
    },
    [navigateToTab]
  );

  const navigateToChat = useCallback(
    (screen?: string, params?: Record<string, unknown>) => {
      navigateToTab("Chat", screen, params);
    },
    [navigateToTab]
  );

  const navigateToServices = useCallback(() => {
    navigateToTab("Services");
  }, [navigateToTab]);

  return {
    navigateToProfile,
    navigateToListings,
    navigateToProjects,
    navigateToBookings,
    navigateToChat,
    navigateToServices,
    navigateToTab,
  };
}
