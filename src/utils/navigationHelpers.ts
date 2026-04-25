import { StackActions, type NavigationProp } from "@react-navigation/native";

const MAP_STACK_SCREEN_NAMES = [
  "MapLanding",
  "DailyMap",
  "ProjectsMap",
] as const;

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
 * Return to the tab’s map without resetting map UI when possible.
 *
 * Used by: **Property list “Show map”**, **Property details** back fallback, and **Add Listing**
 * flows (cancel/close modals on Marketing request, broker licence, owner agent, rental category, etc.).
 *
 * - If the previous screen is the map → `goBack()` (map stays mounted).
 * - If the map is still **stack index 0** (e.g. Map → AddListing → … → cancel) → `popToTop()` so we
 *   don’t `navigate("MapLanding")` and remount (which cleared markers before session restore).
 * - Else → `navigate` to the right map screen for the current tab / stack.
 *
 * Map marker selection/visited state is also persisted in `MapLandingScreen` session refs as a backup.
 */
export function navigateToMapScreen(navigation: NavigationProp<any>): void {
  const state = navigation.getState();
  const index = state?.index ?? 0;
  const routes = state?.routes ?? [];

  if (index > 0) {
    const previous = routes[index - 1];
    if (
      previous &&
      MAP_STACK_SCREEN_NAMES.includes(
        previous.name as (typeof MAP_STACK_SCREEN_NAMES)[number],
      )
    ) {
      navigation.goBack();
      return;
    }
  }

  // Map → List → Details (or Map → Add → …): previous screen isn't the map, but the map is still
  // stack index 0. Pop the whole stack so we don't `navigate(MapLanding)` and remount, which
  // wiped marker selection/visited state.
  const rootName = routes[0]?.name;
  if (
    index > 0 &&
    rootName &&
    MAP_STACK_SCREEN_NAMES.includes(
      rootName as (typeof MAP_STACK_SCREEN_NAMES)[number],
    )
  ) {
    navigation.dispatch(StackActions.popToTop());
    return;
  }

  const routeNames = state?.routeNames || [];

  let mapScreen: string | null = null;

  if (routeNames.includes("DailyMap")) {
    mapScreen = "DailyMap";
  } else if (routeNames.includes("ProjectsMap")) {
    mapScreen = "ProjectsMap";
  } else if (routeNames.includes("MapLanding")) {
    mapScreen = "MapLanding";
  } else {
    mapScreen = getMapScreenName(navigation);
  }

  if (mapScreen) {
    navigation.navigate(mapScreen as never);
  } else if (navigation.canGoBack()) {
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
  navigation: NavigationProp<any>,
): void {
  const tabNav = navigation.getParent();
  if (!tabNav) {
    navigation.navigate("Listings", { screen: "MapLanding" });
    return;
  }

  const state = tabNav.getState();
  const listingsRoute = state?.routes?.find(
    (r: { name: string }) => r.name === "Listings",
  );
  const listingsState = listingsRoute?.state as
    | {
        routes: { name: string; key?: string; params?: object }[];
        index: number;
      }
    | undefined;
  const routes = listingsState?.routes ?? [];
  const firstRoute = routes[0];
  const mapParams =
    firstRoute?.name === "MapLanding" ? firstRoute.params : undefined;

  // Avoid CommonActions.navigate + merged stack `state` — it often triggers
  // "removed natively but didn't get removed from JS state" on native-stack.
  // Nested navigate pops the Listings stack to MapLanding when that route already exists.
  tabNav.navigate("Listings", {
    screen: "MapLanding",
    ...(mapParams !== undefined ? { params: mapParams } : {}),
  });
}
