import { Dimensions } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Screen dimensions
export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Dimensions.get("window").height;

/** Same as marketing listing-ad / property-details toggles (ToggleRow + ToggleSwitch). */
export const LISTING_FORM_TOGGLE_TRACK_WIDTH = wp(9);
export const LISTING_FORM_TOGGLE_TRACK_HEIGHT = hp(1.5);
export const LISTING_FORM_TOGGLE_THUMB_SIZE = wp(5.5);
