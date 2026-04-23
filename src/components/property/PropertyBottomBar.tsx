import React, { memo, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalization } from "../../hooks/useLocalization";

export interface PropertyBottomBarProps {
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrevPress: () => void;
  onNextPress: () => void;
  onCall: () => void;
  onWhatsApp: () => void;
  isDailyListing?: boolean;
  /** When false, Call / WhatsApp are disabled (no valid number on listing). */
  contactActionsEnabled?: boolean;
}

/**
 * Bottom contact bar with navigation arrows
 */
const PropertyBottomBar = memo<PropertyBottomBarProps>(
  ({
    canGoPrev,
    canGoNext,
    onPrevPress,
    onNextPress,
    onCall,
    onWhatsApp,
    isDailyListing = false,
    contactActionsEnabled = true,
  }) => {
    const insets = useSafeAreaInsets();
    const { t, isRTL } = useLocalization();

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        bottomBar: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
      }),
      [isRTL]
    );

    return (
      <View
        style={[
          styles.bottomBar,
          rtlStyles.bottomBar,
          // { paddingBottom: Math.max(insets.bottom, hp(1.5)) },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.bottomBarBtn,
            !canGoPrev && styles.bottomBarBtnDisabled,
          ]}
          onPress={onPrevPress}
          disabled={!canGoPrev}
        >
          <Ionicons
            name={isRTL ? "chevron-forward" : "chevron-back"}
            size={wp(6)}
            color={!canGoPrev ? "#a6abb4" : "#374151"}
          />
        </TouchableOpacity>

        {!isDailyListing && (
          <>
            <TouchableOpacity
              style={[
                styles.bottomBarBtn,
                styles.callBtn,
                !contactActionsEnabled && styles.bottomBarBtnDisabled,
              ]}
              onPress={onCall}
              disabled={!contactActionsEnabled}
            >
              <Ionicons name="call" size={wp(5.5)} color="#0e856a" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.bottomBarBtn,
                styles.waBtn,
                !contactActionsEnabled && styles.bottomBarBtnDisabled,
              ]}
              onPress={onWhatsApp}
              disabled={!contactActionsEnabled}
            >
              <FontAwesome name="whatsapp" size={wp(5.5)} color="#0e856a" />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[
            styles.bottomBarBtn,
            !canGoNext && styles.bottomBarBtnDisabled,
          ]}
          onPress={onNextPress}
          disabled={!canGoNext}
        >
          <Ionicons
            name={isRTL ? "chevron-back" : "chevron-forward"}
            size={wp(6)}
            color={!canGoNext ? "#a6abb4" : "#374151"}
          />
        </TouchableOpacity>
      </View>
    );
  }
);

PropertyBottomBar.displayName = "PropertyBottomBar";

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingTop: hp(1.5),
    paddingHorizontal: wp(2),
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomBarBtn: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(2),
    backgroundColor: "#d2d6e1",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  bottomBarBtnDisabled: {
    opacity: 0.4,
  },
  callBtn: {
    width: wp(18),
    backgroundColor: "#fff",
    borderColor: "#0e856a",
    borderWidth: 2,
  },
  waBtn: {
    width: wp(18),
    backgroundColor: "#fff",
    borderColor: "#0e856a",
    borderWidth: 2,
  },
});

export default PropertyBottomBar;
