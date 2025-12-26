import React, { memo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export interface ProfileTabsProps {
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const ProfileTabs = memo<ProfileTabsProps>(
  ({ tabs = ["Ads", "Deals", "Reviews"], activeTab, onTabChange }) => {
    const [selectedTab, setSelectedTab] = useState(activeTab || tabs[0]);

    const handleTabPress = (tab: string) => {
      setSelectedTab(tab);
      onTabChange?.(tab);
    };

    return (
      <View style={styles.container}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = tab === selectedTab;
            return (
              <TouchableOpacity
                key={tab}
                style={styles.tab}
                onPress={() => handleTabPress(tab)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {tab}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }
);

ProfileTabs.displayName = "ProfileTabs";

const styles = StyleSheet.create({
  container: {
    marginTop: hp(2),
    width: "100%",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  tab: {
    paddingVertical: hp(1.5),
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  tabText: {
    fontSize: wp(4),
    color: "#9ca3af",
    fontWeight: "400",
  },
  activeTabText: {
    color: "#1f2937",
    fontWeight: "500",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: 2,
    backgroundColor: "#0ab539",
    borderRadius: 1,
  },
});

export default ProfileTabs;
