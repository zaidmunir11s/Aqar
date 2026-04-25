import { useCallback } from "react";
import * as Location from "expo-location";

export interface LocationRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface LocationResult {
  region: LocationRegion | null;
  isOutsideSaudi: boolean;
  error?: string;
}

/**
 * Custom hook for location handling
 * @returns Location functions
 */
export function useLocation() {
  const getCurrentLocation = useCallback(async (): Promise<LocationResult> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return {
          region: null,
          isOutsideSaudi: false,
          error: "Location permission is required to use this feature.",
        };
      }

      // Prefer last known position first (fast, avoids map defaulting to Riyadh).
      const lastKnown = await Location.getLastKnownPositionAsync();
      const loc =
        lastKnown ??
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }));

      const { latitude, longitude } = loc.coords;

      return {
        region: {
          latitude,
          longitude,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        },
        // Legacy field used by some screens; we no longer geo-restrict location.
        isOutsideSaudi: false,
      };
    } catch (e) {
      return {
        region: null,
        isOutsideSaudi: false,
        error: "Unable to get your location. Please try again.",
      };
    }
  }, []);

  return {
    getCurrentLocation,
  };
}
