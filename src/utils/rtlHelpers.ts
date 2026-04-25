import { I18nManager } from "react-native";

// Explicitly disable auto-flipping - we handle RTL manually through styles
// This prevents React Native from automatically flipping the entire layout
// These settings persist but require app restart to take full effect
I18nManager.allowRTL(false); // Disable RTL support globally
I18nManager.forceRTL(false); // Ensure RTL is not forced
I18nManager.swapLeftAndRightInRTL(false); // Disable automatic left/right swapping

/**
 * Get RTL-aware flex direction
 */
export const getFlexDirection = (isRTL: boolean): "row" | "row-reverse" => {
  return isRTL ? "row-reverse" : "row";
};

/**
 * Get RTL-aware text align
 */
export const getTextAlign = (isRTL: boolean): "left" | "right" => {
  return isRTL ? "right" : "left";
};

/**
 * Get RTL-aware margin/padding start
 */
export const getStart = (isRTL: boolean): "marginLeft" | "marginRight" => {
  return isRTL ? "marginRight" : "marginLeft";
};

/**
 * Get RTL-aware margin/padding end
 */
export const getEnd = (isRTL: boolean): "marginLeft" | "marginRight" => {
  return isRTL ? "marginLeft" : "marginRight";
};
