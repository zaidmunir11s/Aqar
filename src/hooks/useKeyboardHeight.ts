import { useState, useEffect } from "react";
import { Keyboard, Platform } from "react-native";

const SHOW_EVENT =
  Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
const HIDE_EVENT =
  Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

/**
 * Hook to track keyboard height. Use for layout adjustments (padding, etc.)
 */
export function useKeyboardHeight(): {
  keyboardHeight: number;
  isKeyboardVisible: boolean;
} {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(SHOW_EVENT, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(HIDE_EVENT, () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return { keyboardHeight, isKeyboardVisible };
}
