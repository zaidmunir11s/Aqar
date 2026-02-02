import type { NavigationProp } from "@react-navigation/native";

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

