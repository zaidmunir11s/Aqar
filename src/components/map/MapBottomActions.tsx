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
import { COLORS } from "../../constants";

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
  addButtonColor?: string; // Optional custom color for add button (border and text)
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
    addButtonColor,
  }) => {
    const addBtnBorderColor = addButtonColor || COLORS.addBtnBorder;
    const addBtnTextColor = addButtonColor || COLORS.addBtnText;
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
            name="satellite-alt"
            size={wp(6.5)}
            color={isSatelliteMode ? "#0e856a" : "#617381"}
          />
        </TouchableOpacity>

        {/* Location button */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={onLocatePress}
        >
          <FontAwesome6
            name="location-crosshairs"
            size={wp(6.5)}
            color="#617381"
          />
        </TouchableOpacity>

        {/* Bottom actions row */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[
              styles.showListBtn,
              isMapMoving && styles.showListBtnCompact,
            ]}
            onPress={onShowListPress}
          >
            <Fontisto name="nav-icon-list" size={wp(4)} color="#617381" />
            {!isMapMoving && (
              <Text style={styles.showListText}>Show List</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.addBtn, { borderColor: addBtnBorderColor }]} 
            onPress={onAddPress}
          >
            <Text style={[styles.plusIcon, { color: addBtnTextColor }]}>+</Text>
            <Text style={[styles.addText, { color: addBtnTextColor }]}>Add</Text>
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
    bottom: hp(2),
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
    bottom: hp(7),
    left: wp(4),
    right: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
  },
  showListBtn: {
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
    fontSize: wp(3.2),
    color: "#333",
    marginLeft: wp(2),
  },
  addBtn: {
    backgroundColor: "#fffefd",
    paddingHorizontal: wp(3),
    // paddingVertical: hp(1),
    borderRadius: wp(2),
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  plusIcon: {
    fontSize: wp(8),
    fontWeight: "400",
    marginBottom: hp(-1),
    marginTop: hp(-0.5),
  },
  addText: {
    fontWeight: "400",
    fontSize: wp(4),
    marginTop: hp(0.3),
  },
});

export default MapBottomActions;
