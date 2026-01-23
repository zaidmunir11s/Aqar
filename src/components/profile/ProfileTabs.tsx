import React, { memo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface ProfileTabsProps {
  tabs?: string[];                    // English/default keys, e.g. ["Ads", "Deals", "Reviews"]
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const ProfileTabs = memo<ProfileTabsProps>(
  ({ tabs = ["Ads", "Deals", "Reviews"], activeTab, onTabChange }) => {
    const { t, isRTL } = useLocalization();

    const [selectedTab, setSelectedTab] = useState(activeTab || tabs[0]);

    const handleTabPress = (tabKey: string) => {
      setSelectedTab(tabKey);
      onTabChange?.(tabKey);
    };

    // Optional: define translation keys for each tab
    // You can also pass already translated strings if preferred
    const getTabLabel = (tabKey: string) => {
      const keyMap: Record<string, string> = {
        Ads: "profile.ads",
        Deals: "profile.deals",
        Reviews: "listings.reviews",
        // add more tabs here if needed
      };

      const translationKey = keyMap[tabKey];
      return translationKey ? t(translationKey, { defaultValue: tabKey }) : tabKey;
    };

    return (
      <View style={styles.container}>
        <View
          style={[
            styles.tabsContainer,
            isRTL && { flexDirection: "row-reverse" },
          ]}
        >
          {tabs.map((tabKey) => {
            const isActive = tabKey === selectedTab;
            const label = getTabLabel(tabKey);

            return (
              <TouchableOpacity
                key={tabKey}
                style={styles.tab}
                onPress={() => handleTabPress(tabKey)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive && styles.activeTabText,
                    isRTL && styles.rtlTabText, // optional: if you need extra RTL tweaks
                  ]}
                >
                  {label}
                </Text>

                {isActive && (
                  <View
                    style={[
                      styles.activeIndicator,
                      isRTL && { left: 0, right: 0 }, // already full width, but explicit
                    ]}
                  />
                )}
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
    color: COLORS.textTertiary,
    fontWeight: "400",
  },
  rtlTabText: {
    // Usually not needed, but useful if font needs adjustment
    // textAlign: "center", // already centered via alignItems
  },
  activeTabText: {
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
});

export default ProfileTabs;