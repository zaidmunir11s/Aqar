import { useCallback } from "react";
import * as Location from "expo-location";
import { isInsideSaudi } from "../constants";

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
  const getCurrentLocation =
    useCallback(async (): Promise<LocationResult> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return {
            region: null,
            isOutsideSaudi: false,
            error: "Location permission is required to use this feature.",
          };
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = loc.coords;

        if (!isInsideSaudi(latitude, longitude)) {
          return {
            region: null,
            isOutsideSaudi: true,
          };
        }

        return {
          region: {
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
          },
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
