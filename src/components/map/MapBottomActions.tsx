import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Fontisto, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export interface MapBottomActionsProps {
  onShowListPress: () => void;
  onAddPress: () => void;
  onLocatePress: () => void;
  onToggleSatellite: () => void;
  isSatelliteMode: boolean;
  isMapMoving: boolean;
  visibleCount: number;
  totalCount: number;
  counterFadeAnim: Animated.Value;
}

/**
 * Bottom actions component for map screen
 */
const MapBottomActions = memo<MapBottomActionsProps>(
  ({
    onShowListPress,
    onAddPress,
    onLocatePress,
    onToggleSatellite,
    isSatelliteMode,
    isMapMoving,
    visibleCount,
    totalCount,
    counterFadeAnim,
  }) => {
    return (
      <>
        {/* Counter badge */}
        {totalCount > 0 && (
          <Animated.View
            style={[styles.counterBadge, { opacity: counterFadeAnim }]}
          >
            <Text style={styles.counterText}>
              {visibleCount} of {totalCount} shown
            </Text>
          </Animated.View>
        )}

        {/* Satellite mode button */}
        <TouchableOpacity
          style={styles.satelliteButton}
          onPress={onToggleSatellite}
        >
          <MaterialIcons
            name={"satellite-alt"}
            size={wp(6.5)}
            color={isSatelliteMode ? "#0ab539" : "#617381"}
          />
        </TouchableOpacity>

        {/* Location button */}
        <TouchableOpacity style={styles.locationButton} onPress={onLocatePress}>
          <FontAwesome6
            name="location-crosshairs"
            size={wp(6.5)}
            color="#617381"
          />
        </TouchableOpacity>

        {/* Bottom actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[
              styles.showListBtn,
              isMapMoving && styles.showListBtnCompact,
            ]}
            onPress={onShowListPress}
          >
            <Fontisto name="nav-icon-list" size={wp(5)} color="#617381" />
            {!isMapMoving && <Text style={styles.showListText}>Show List</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
            <Text style={styles.addText}>+</Text>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }
);

MapBottomActions.displayName = "MapBottomActions";

const styles = StyleSheet.create({
  counterBadge: {
    position: "absolute",
    bottom: hp(1),
    right: wp(4),
    backgroundColor: "#81888e",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.1),
    borderRadius: wp(5),
  },
  counterText: {
    color: "#fff",
    fontSize: wp(3.4),
    fontWeight: "600",
  },
  satelliteButton: {
    position: "absolute",
    bottom: hp(21),
    left: wp(4),
    backgroundColor: "#fff",
    padding: wp(3),
    borderRadius: wp(7.5),
  },
  locationButton: {
    position: "absolute",
    bottom: hp(14),
    left: wp(4),
    backgroundColor: "#fff",
    padding: wp(3),
    borderRadius: wp(7.5),
  },
  bottomActions: {
    position: "absolute",
    bottom: hp(1.2),
    left: wp(4),
    right: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
  },
  showListBtn: {
    top: hp(-4.5),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
  },
  showListBtnCompact: {
    paddingHorizontal: wp(3.5),
  },
  showListText: {
    fontSize: wp(3.8),
    color: "#333",
    marginLeft: wp(2),
  },
  addBtn: {
    top: hp(-4.5),
    backgroundColor: "#fffefd",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
    borderWidth: 2,
    borderColor: "#2dac52",
  },
  addText: {
    color: "#2dac52",
    fontWeight: "500",
    fontSize: wp(4.5),
    textAlign: "center",
  },
});

export default MapBottomActions;
