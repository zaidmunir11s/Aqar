import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export type TabType = "rent" | "sale" | "daily";

export interface MapTabsProps {
  activeTab: TabType;
  onTabChange: (tabId: TabType) => void;
}

/**
 * Map tabs component for switching between rent/sale/daily
 */
const MapTabs = memo<MapTabsProps>(({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "rent" as TabType, icon: "door-open", label: "For Rent" },
    { id: "sale" as TabType, icon: "key", label: "For Sale" },
    { id: "daily" as TabType, icon: "calendar-days", label: "Daily" },
  ];

  return (
    <View style={styles.topTabs}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabChange(tab.id)}
        >
          {tab.id === "sale" ? (
            <Ionicons
              name="key"
              size={wp(5)}
              color={activeTab === tab.id ? "#0ab539" : "#666"}
            />
          ) : (
            <FontAwesome6
              name={tab.icon as any}
              size={wp(5)}
              color={activeTab === tab.id ? "#0ab539" : "#666"}
            />
          )}
          <Text
            style={[
              styles.tabLabel,
              activeTab === tab.id && styles.activeTabLabel,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

MapTabs.displayName = "MapTabs";

const styles = StyleSheet.create({
  topTabs: {
    position: "absolute",
    top: hp(6),
    left: wp(4),
    right: wp(4),
    backgroundColor: "#fff",
    borderRadius: wp(4),
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: hp(0.8),
  },
  tab: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.7),
    borderRadius: wp(3),
    alignItems: "center",
  },
  activeTab: {
    // Active tab styling handled by activeTabLabel
  },
  tabLabel: {
    fontSize: wp(3.3),
    color: "#666",
    fontWeight: "400",
    marginTop: hp(0.2),
  },
  activeTabLabel: {
    color: "#0ab539",
    fontWeight: "700",
  },
});

export default MapTabs;
