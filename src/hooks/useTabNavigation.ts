import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";

export type TabTarget =
  | "ProfileTab"
  | "Listings"
  | "Projects"
  | "Bookings"
  | "Chat"
  | "Services";

export interface UseTabNavigationReturn {
  /** Navigate to Profile tab, optionally to a specific screen */
  navigateToProfile: (screen?: "ProfileDetail" | "Login") => void;
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
  const navigation = useNavigation<NavigationProp<any>>();

  const getTabNavigator = useCallback(() => {
    return navigation.getParent();
  }, [navigation]);

  const navigateToTab = useCallback(
    (tab: TabTarget, screen?: string, params?: Record<string, unknown>) => {
      const parent = getTabNavigator();
      if (parent) {
        if (screen) {
          (parent as any).navigate(tab, { screen, params });
        } else {
          (parent as any).navigate(tab);
        }
      } else {
        if (screen) {
          navigation.navigate(screen as never, params as never);
        } else {
          navigation.navigate(tab as never);
        }
      }
    },
    [getTabNavigator, navigation]
  );

  const navigateToProfile = useCallback(
    (screen?: "ProfileDetail" | "Login") => {
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
