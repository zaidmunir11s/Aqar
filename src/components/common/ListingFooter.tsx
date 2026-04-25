import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard,
  Animated,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface ListingFooterProps {
  currentStep: number;
  totalSteps: number;
  onBackPress: () => void;
  onNextPress: () => void;
  backText?: string;
  nextText?: string;
  showBack?: boolean;
  showNext?: boolean;
  nextDisabled?: boolean;
}

/**
 * Reusable footer component for listing screens with progress bar and navigation buttons
 */
const ListingFooter = memo<ListingFooterProps>(
  ({
    currentStep,
    totalSteps,
    onBackPress,
    onNextPress,
    backText = "Back",
    nextText = "Next",
    showBack = true,
    showNext = true,
    nextDisabled = false,
  }) => {
    const insets = useSafeAreaInsets();
    const { isRTL } = useLocalization();
    const progressPercentage = (currentStep / totalSteps) * 100;
    const keyboardOffset = useRef(new Animated.Value(0)).current;
    const windowHeightRef = useRef(Dimensions.get("window").height);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
      const showEvent =
        Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
      const hideEvent =
        Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
      const dimensionsSub = Dimensions.addEventListener(
        "change",
        ({ window }) => {
          windowHeightRef.current = window.height;
        },
      );

      const onShow = (event: any) => {
        const screenY = event?.endCoordinates?.screenY;
        const eventHeight = event?.endCoordinates?.height;
        const overlapFromScreenY =
          typeof screenY === "number"
            ? Math.max(0, windowHeightRef.current - screenY)
            : 0;
        const overlapFromHeight =
          typeof eventHeight === "number" ? Math.max(0, eventHeight) : 0;
        const overlapFromMetrics = Keyboard.metrics?.()?.height ?? 0;
        const keyboardHeight = Math.max(
          overlapFromScreenY,
          overlapFromHeight,
          overlapFromMetrics,
        );
        const compensatedHeight =
          keyboardHeight + (Platform.OS === "android" ? insets.bottom : 0);
        setIsKeyboardVisible(true);
        Animated.timing(keyboardOffset, {
          toValue: compensatedHeight,
          duration: event?.duration ?? 250,
          useNativeDriver: false,
        }).start();
      };

      const onHide = (event: any) => {
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: event?.duration ?? 250,
          useNativeDriver: false,
        }).start(() => {
          setIsKeyboardVisible(false);
        });
      };

      const showSub = Keyboard.addListener(showEvent, onShow);
      const hideSub = Keyboard.addListener(hideEvent, onHide);
      return () => {
        dimensionsSub.remove();
        showSub.remove();
        hideSub.remove();
      };
    }, [insets.bottom, keyboardOffset]);

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        progressBarBackground: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        buttonContainer: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
      }),
      [isRTL],
    );

    return (
      <Animated.View
        style={[
          styles.container,
          {
            marginBottom: keyboardOffset,
            paddingBottom: isKeyboardVisible ? hp(1) : insets.bottom + hp(1),
          },
        ]}
      >
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarBackground,
              rtlStyles.progressBarBackground,
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={[styles.buttonContainer, rtlStyles.buttonContainer]}>
          {showBack && (
            <TouchableOpacity
              onPress={onBackPress}
              activeOpacity={0.4}
              style={styles.backButton}
            >
              <Text style={styles.backText}>{backText}</Text>
            </TouchableOpacity>
          )}

          {showNext && (
            <TouchableOpacity
              onPress={onNextPress}
              activeOpacity={0.4}
              disabled={nextDisabled}
              style={[
                styles.nextButton,
                nextDisabled && styles.nextButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.nextText,
                  nextDisabled && styles.nextTextDisabled,
                ]}
              >
                {nextText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  },
);

ListingFooter.displayName = "ListingFooter";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    // paddingBottom: Platform.OS === "ios" ? hp(2) : hp(1),
  },
  progressBarContainer: {
    // paddingHorizontal: wp(4),
    // paddingTop: hp(1.5),
    paddingBottom: hp(1),
  },
  progressBarBackground: {
    height: hp(0.3),
    backgroundColor: "#e5e7eb",
    borderRadius: wp(0.5),
    overflow: "hidden",
    flexDirection: "row",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: wp(0.5),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    // paddingBottom from container safe area
  },
  backButton: {
    paddingVertical: hp(1),
  },
  backText: {
    fontSize: wp(4.5),
    fontWeight: "500",
    color: COLORS.black,
    textDecorationLine: "underline",
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(2),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
  nextText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: "#fff",
  },
  nextTextDisabled: {
    color: "#b0d4c9", // Lighter color when disabled
    opacity: 0.7,
  },
});

export default ListingFooter;
