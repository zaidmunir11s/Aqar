import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "@/constants";
import { useLocalization } from "@/hooks/useLocalization";
import { shouldShowTabBar } from "./hiddenRoutes";

const TAB_ICON_SIZE = wp(6);

export function CustomTabBar(
  props: BottomTabBarProps,
): React.JSX.Element | null {
  const { isRTL } = useLocalization();
  const focusedRoute = props.state.routes[props.state.index];
  const tabBarVisible = shouldShowTabBar(focusedRoute);

  const displayRoutes = useMemo(
    () => (isRTL ? [...props.state.routes].reverse() : props.state.routes),
    [isRTL, props.state.routes],
  );

  if (!tabBarVisible) {
    return null;
  }

  return (
    <View style={styles.tabBarContainer}>
      <SafeAreaView edges={["bottom"]} style={styles.tabBarSafeArea}>
        <View style={styles.tabBar}>
          {displayRoutes.map((route) => (
            <TabBarItem
              key={route.key}
              route={route}
              state={props.state}
              descriptors={props.descriptors}
              navigation={props.navigation}
            />
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

type TabBarItemProps = Pick<
  BottomTabBarProps,
  "state" | "descriptors" | "navigation"
> & {
  route: BottomTabBarProps["state"]["routes"][number];
};

function TabBarItem({
  route,
  state,
  descriptors,
  navigation,
}: TabBarItemProps): React.JSX.Element {
  const originalIndex = state.routes.findIndex((r) => r.key === route.key);
  const isFocused = state.index === originalIndex;
  const { options } = descriptors[route.key];

  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
        ? options.title
        : route.name;

  const onPress = useCallback(() => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  }, [navigation, route.key, route.name, route.params, isFocused]);

  const onLongPress = useCallback(() => {
    navigation.emit({
      type: "tabLongPress",
      target: route.key,
    });
  }, [navigation, route.key]);

  const color = isFocused
    ? options.tabBarActiveTintColor || COLORS.activeTabBar
    : options.tabBarInactiveTintColor || "#999";

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={(options as { tabBarTestID?: string }).tabBarTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
    >
      {options.tabBarIcon?.({
        focused: isFocused,
        color,
        size: TAB_ICON_SIZE,
      })}
      {typeof label === "string" && (
        <Text style={[styles.tabLabel, { color }, options.tabBarLabelStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: COLORS.white,
  },
  tabBarSafeArea: {
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    height: hp(8.5),
    paddingTop: hp(1),
    paddingBottom: hp(1.2),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: wp(2.8),
    marginTop: hp(0.5),
  },
});
