import type { NavigationProp } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";

/**
 * Determines the correct map screen to navigate to based on the current navigation state
 * @param navigation - The navigation object
 * @returns The name of the map screen to navigate to
 */
export function getMapScreenName(navigation: NavigationProp<any>): string {
  // Try to get the parent navigator to determine which tab we're in
  const parent = navigation.getParent();
  
  if (parent) {
    const state = parent.getState();
    const currentRoute = state?.routes[state?.index];
    
    // Check which tab is currently active
    if (currentRoute?.name === "Daily") {
      return "DailyMap";
    } else if (currentRoute?.name === "Projects") {
      return "ProjectsMap";
    } else if (currentRoute?.name === "Listings") {
      return "MapLanding";
    }
  }
  
  // Fallback: check navigation state to see which screens are available
  try {
    const navState = navigation.getState();
    const routeNames = navState?.routeNames || [];
    
    // Check which map screen exists in the current navigator
    if (routeNames.includes("DailyMap")) {
      return "DailyMap";
    } else if (routeNames.includes("ProjectsMap")) {
      return "ProjectsMap";
    } else if (routeNames.includes("MapLanding")) {
      return "MapLanding";
    }
  } catch {
    // If we can't get state, default to MapLanding
  }
  
  // Default to MapLanding as it's the most common
  return "MapLanding";
}

/**
 * Navigates to the appropriate map screen based on the current navigation context
 * @param navigation - The navigation object
 */
export function navigateToMapScreen(navigation: NavigationProp<any>): void {
  // Get the navigation state to check which screens are available
  const state = navigation.getState();
  const routeNames = state?.routeNames || [];
  const routes = state?.routes || [];
  
  // Check which map screen exists in the current navigator
  let mapScreen: string | null = null;
  
  if (routeNames.includes("DailyMap")) {
    mapScreen = "DailyMap";
  } else if (routeNames.includes("ProjectsMap")) {
    mapScreen = "ProjectsMap";
  } else if (routeNames.includes("MapLanding")) {
    mapScreen = "MapLanding";
  } else {
    // Fallback: use the helper function
    mapScreen = getMapScreenName(navigation);
  }
  
  if (mapScreen) {
    // If map screen is the root of the stack, use popToTop to preserve map state
    // (visited markers, region, etc.) instead of navigate which causes a refresh
    const firstRoute = routes[0];
    if (firstRoute?.name === mapScreen && routes.length > 1) {
      (navigation as unknown as { popToTop: () => void }).popToTop();
    } else {
      navigation.navigate(mapScreen);
    }
  } else if (navigation.canGoBack()) {
    // If we can't determine the screen, just go back
    navigation.goBack();
  }
}

/**
 * When navigating back from another tab (e.g. Chat) to the Listings map screen,
 * switch to the Listings tab and pop its stack to the first screen (MapLanding)
 * so map state (region, markers, etc.) is preserved (same idea as AddListingScreen close / navigateToMapScreen).
 * Call this from screens that live outside the Listings stack (e.g. ChatScreen).
 * @param navigation - Navigation from the current screen (e.g. ChatStack); its parent must be the tab navigator
 */
export function navigateToListingsMapFromOtherTab(
  navigation: NavigationProp<any>
): void {
  const tabNav = navigation.getParent();
  if (!tabNav) {
    navigation.navigate("Listings", { screen: "MapLanding" });
    return;
  }  const state = tabNav.getState();
  const listingsRoute = state?.routes?.find(
    (r: { name: string }) => r.name === "Listings"
  );
  const listingsState = listingsRoute?.state as
    | { routes: Array<{ name: string; key?: string; params?: object }>; index: number }
    | undefined;
  const routes = listingsState?.routes ?? [];
  const firstRoute = routes[0];
  const hasStackToPop = routes.length > 1;  if (hasStackToPop && firstRoute) {
    // Navigate to Listings tab with stack state that only shows the root screen.
    // Reusing the existing first route object preserves the MapLanding instance and its state.
    tabNav.dispatch(
      CommonActions.navigate({
        name: "Listings",
        merge: true,
        state: {
          routes: [firstRoute],
          index: 0,
        },
      } as { name: string; merge: boolean; state: object })
    );
  } else {
    tabNav.navigate("Listings", { screen: "MapLanding" });
  }
}