import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export type ShowMapFloatingButtonProps = {
  onPress: () => void;
  label: string;
  isCompact: boolean;
  isRTL: boolean;
  bottomInset: number;
};

/**
 * Floating “show map” control used on property list (and similar) screens.
 */
const ShowMapFloatingButton = memo<ShowMapFloatingButtonProps>(
  ({ onPress, label, isCompact, isRTL, bottomInset }) => (
    <View
      style={[
        styles.bottomActions,
        { bottom: hp(0.5) + bottomInset },
        isRTL && styles.bottomActionsRTL,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.showMapBtn,
          isCompact && styles.showMapBtnCompact,
          isRTL && styles.showMapBtnRTL,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name="map-sharp" size={Math.min(wp(6), 24)} color="#617381" />
        {!isCompact && (
          <Text style={[styles.showMapText, isRTL && styles.showMapTextRTL]} numberOfLines={1}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
);

ShowMapFloatingButton.displayName = "ShowMapFloatingButton";

const styles = StyleSheet.create({
  bottomActions: {
    position: "absolute",
    left: wp(3),
    right: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
    gap: wp(3),
  },
  bottomActionsRTL: {
    flexDirection: "row-reverse",
  },
  showMapBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    minHeight: 44,
    borderRadius: wp(3),
    flexShrink: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  showMapBtnCompact: {
    paddingHorizontal: wp(3.5),
  },
  showMapText: {
    fontSize: Math.min(wp(3.5), 15),
    color: "#333",
    marginLeft: wp(2),
    flexShrink: 0,
  },
  showMapBtnRTL: {
    flexDirection: "row-reverse",
  },
  showMapTextRTL: {
    marginLeft: 0,
    marginRight: wp(2),
  },
});

export default ShowMapFloatingButton;
