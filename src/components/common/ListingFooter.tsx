import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
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
    const { isRTL } = useLocalization();
    const progressPercentage = (currentStep / totalSteps) * 100;

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        progressBarBackground: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        buttonContainer: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
      }),
      [isRTL]
    );

    return (
      <View style={styles.container}>
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBackground, rtlStyles.progressBarBackground]}>
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
              style={[styles.nextButton, nextDisabled && styles.nextButtonDisabled]}
            >
              <Text style={[styles.nextText, nextDisabled && styles.nextTextDisabled]}>
                {nextText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
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
    paddingBottom: hp(1.5),
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
