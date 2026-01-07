import React, { memo } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface PropertyBottomBarProps {
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrevPress: () => void;
  onNextPress: () => void;
  onCall: () => void;
  onWhatsApp: () => void;
  onChat: () => void;
  isDailyListing?: boolean;
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
    onChat,
    isDailyListing = false,
  }) => {
    const insets = useSafeAreaInsets();

    return (
      <View
        style={[
          styles.bottomBar,
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
            name="chevron-back"
            size={wp(6)}
            color={!canGoPrev ? "#a6abb4" : "#374151"}
          />
        </TouchableOpacity>

        {!isDailyListing && (
          <>
            <TouchableOpacity
              style={[styles.bottomBarBtn, styles.callBtn]}
              onPress={onCall}
            >
              <Ionicons name="call" size={wp(5.5)} color="#0e856a" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bottomBarBtn, styles.waBtn]}
              onPress={onWhatsApp}
            >
              <FontAwesome name="whatsapp" size={wp(5.5)} color="#0e856a" />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.bottomBarBtn, styles.chatBtnBottom, isDailyListing && styles.chatBtnWithText]}
          onPress={onChat}
        >
          <MaterialIcons name="chat" size={wp(5.5)} color="#3b82f6" />
          {isDailyListing && (
            <Text style={styles.chatButtonText}>Contact Advertiser</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.bottomBarBtn,
            !canGoNext && styles.bottomBarBtnDisabled,
          ]}
          onPress={onNextPress}
          disabled={!canGoNext}
        >
          <Ionicons
            name="chevron-forward"
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
  chatBtnBottom: {
    width: wp(18),
    backgroundColor: "#fff",
    borderColor: "#3b82f6",
    borderWidth: 2,
  },
  chatBtnWithText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(3),
    flex: 1,
    marginHorizontal: wp(2),
  },
  chatButtonText: {
    fontSize: wp(4),
    color: "#3b82f6",
    fontWeight: "600",
    marginLeft: wp(2),
  },
});

export default PropertyBottomBar;
