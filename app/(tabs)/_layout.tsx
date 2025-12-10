import { Tabs } from "expo-router";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "@/utilities/colors";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

type TabConfig = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: string;
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const tabs: TabConfig[] = [
    {
      name: "profile",
      icon: "person-circle",
      label: "Profile",
    },
    {
      name: "listing",
      icon: "map",
      label: "Listings",
    },
    {
      name: "projects",
      icon: "business",
      label: "Projects",
    },
    { name: "chat", icon: "chatbubbles", label: "Chat" },
    {
      name: "services",
      icon: "apps",
      label: "Services",
      badge: "New",
    },
  ];

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const tab = tabs.find((t) => t.name === route.name);
        if (!tab) return null;

        const isFocused = state.index === index;
        const color = isFocused ? colors.active : colors.inactive;

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View style={styles.tabContent}>
              {tab.badge ? (
                <View style={styles.iconContainer}>
                  <Ionicons name={tab.icon} size={24} color={color} />
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                </View>
              ) : (
                <Ionicons name={tab.icon} size={24} color={color} />
              )}
              <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="listing"
        options={{
          title: "Listings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="apps" size={size} color={color} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>New</Text>
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.background,
    justifyContent: "space-between",
    alignItems: "center",
    height: moderateScale(60),
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    bottom: moderateScale(14),
    left: moderateScale(-14),
    backgroundColor: "#EF4444",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "600",
  },
});
