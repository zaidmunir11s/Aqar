import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Ionicons,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type TabType = "rent" | "sale";

export interface MapTabsProps {
  activeTab: TabType;
  onTabChange: (tabId: TabType) => void;
}

/**
 * Map tabs component for switching between rent/sale
 */
const MapTabs = memo<MapTabsProps>(({ activeTab, onTabChange }) => {
  const { t, isRTL } = useLocalization();
  const insets = useSafeAreaInsets();
  // Memoize tabs with translations
  const tabs = useMemo(
    () => [
      {
        id: "rent" as TabType,
        icon: "door-open",
        label: t("listings.forRent"),
      },
      { id: "sale" as TabType, icon: "key", label: t("listings.forSale") },
    ],
    [t],
  );

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      topTabs: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      tab: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
    }),
    [isRTL],
  );

  return (
    <View
      style={[styles.topTabs, rtlStyles.topTabs, { top: hp(1) + insets.top }]}
    >
      {tabs.map((tab, index) => (
        <React.Fragment key={tab.id}>
          <TouchableOpacity
            style={[
              styles.tab,
              rtlStyles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => onTabChange(tab.id)}
          >
            {tab.id === "sale" ? (
              <MaterialCommunityIcons
                name="key-chain-variant"
                size={wp(5)}
                color={activeTab === tab.id ? COLORS.activeTopTabBar : "#666"}
                style={{
                  transform: [{ scaleX: -1 }, { rotate: "-20deg" }],
                }}
              />
            ) : (
              <FontAwesome6
                name={tab.icon as any}
                size={wp(5)}
                color={activeTab === tab.id ? COLORS.activeTopTabBar : "#666"}
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

          {/* Add separator except after last item */}
          {index < tabs.length - 1 && <View style={styles.separator} />}
        </React.Fragment>
      ))}
    </View>
  );
});

MapTabs.displayName = "MapTabs";

const styles = StyleSheet.create({
  topTabs: {
    position: "absolute",
    // top: hp(2),
    left: wp(4),
    right: wp(4),
    backgroundColor: "#fff",
    borderRadius: wp(4),
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: hp(1.5),
  },
  tab: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.7),
    borderRadius: wp(3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
  },
  activeTab: {
    // Active tab styling handled by activeTabLabel
  },
  tabLabel: {
    fontSize: wp(3.7),
    color: "#666",
    fontWeight: "400",
  },
  activeTabLabel: {
    color: COLORS.activeTopTabBar,
    // fontWeight: "700",
  },
  separator: {
    width: 1,
    height: hp(3),
    backgroundColor: "#d1d5db",
    marginHorizontal: wp(1),
  },
});

export default MapTabs;
