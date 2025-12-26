import { useCallback } from "react";
import * as Location from "expo-location";
import { isInsideSaudi } from "../constants";

export interface LocationRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/**
 * Custom hook for location handling
 * @returns Location functions
 */
export function useLocation() {
  const getCurrentLocation =
    useCallback(async (): Promise<LocationRegion | null> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Location permission is required to use this feature.");
          return null;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = loc.coords;

        if (!isInsideSaudi(latitude, longitude)) {
          alert(
            "Sorry, you cannot search for properties outside the Kingdom of Saudi Arabia."
          );
        }

        return {
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
      } catch (e) {
        alert("Unable to get your location. Please try again.");
        return null;
      }
    }, []);

  return {
    getCurrentLocation,
  };
}
