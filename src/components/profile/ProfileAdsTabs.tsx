import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export type ProfileAdsTabKey = "current" | "archived";

/** Match `UserProfileAdsScreen` `listContent.paddingHorizontal` so the tab bar background spans the screen. */
const LIST_CONTENT_HORIZONTAL_PADDING = wp(4);

export interface ProfileAdsTabsProps {
  activeTab: ProfileAdsTabKey;
  onTabChange: (tab: ProfileAdsTabKey) => void;
  currentCount: number;
  archivedCount: number;
}

const ProfileAdsTabs = memo<ProfileAdsTabsProps>(
  ({ activeTab, onTabChange, currentCount, archivedCount }) => {
    const { t, isRTL } = useLocalization();
    const { width: windowWidth } = useWindowDimensions();

    const containerStyle = useMemo(
      () => [
        styles.container,
        {
          width: windowWidth,
          marginHorizontal: -LIST_CONTENT_HORIZONTAL_PADDING,
        },
      ],
      [windowWidth]
    );

    const tabs = useMemo(
      () =>
        [
          {
            key: "current" as const,
            label: t("profile.currentAdsWithCount", { count: currentCount }),
          },
          {
            key: "archived" as const,
            label: t("profile.archivedAdsWithCount", { count: archivedCount }),
          },
        ] as const,
      [t, currentCount, archivedCount]
    );

    return (
      <View style={containerStyle}>
        <View
          style={[
            styles.tabsContainer,
            isRTL && { flexDirection: "row-reverse" },
          ]}
        >
          {tabs.map(({ key, label }, index) => {
            const isActive = key === activeTab;
            const isFirst = index === 0;
            const isLast = index === tabs.length - 1;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.tab,
                  isFirst && styles.tabPadStart,
                  isLast && styles.tabPadEnd,
                ]}
                onPress={() => onTabChange(key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive && styles.activeTabText,
                    isRTL && styles.rtlTabText,
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
                {isActive ? <View style={styles.activeIndicator} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }
);

ProfileAdsTabs.displayName = "ProfileAdsTabs";

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    alignSelf: "center",
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
  /** Align tab labels with list horizontal inset; indicator still spans full half-width. */
  tabPadStart: {
    paddingStart: LIST_CONTENT_HORIZONTAL_PADDING,
  },
  tabPadEnd: {
    paddingEnd: LIST_CONTENT_HORIZONTAL_PADDING,
  },
  tabText: {
    fontSize: wp(3.8),
    color: COLORS.textTertiary,
    fontWeight: "400",
    textAlign: "center",
    paddingHorizontal: wp(1),
  },
  rtlTabText: {},
  activeTabText: {
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
});

export default ProfileAdsTabs;
