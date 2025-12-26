import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export interface MenuItemCardProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
  showNewBadge?: boolean;
}

/**
 * Menu item card component with title, subtitle, optional badge and chevron
 */
const MenuItemCard = memo<MenuItemCardProps>(
  ({ title, subtitle, onPress, showNewBadge = false }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              {showNewBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>New</Text>
                </View>
              )}
            </View>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={wp(5)}
            color="#e0e0e0"
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>
    );
  }
);

MenuItemCard.displayName = "MenuItemCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  textContainer: {
    flex: 1,
    marginRight: wp(2),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.5),
    gap: wp(2),
  },
  title: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: wp(3.2),
    color: "#6b7280",
    fontWeight: "500",
    lineHeight: hp(2),
  },
  badge: {
    backgroundColor: "rgba(10, 181, 57, 0.1)",
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.6),
    borderRadius: wp(2),
  },
  badgeText: {
    fontSize: wp(2.8),
    fontWeight: "600",
    color: "#0ab539",
  },
  chevron: {
    marginLeft: wp(2),
  },
});

export default MenuItemCard;
