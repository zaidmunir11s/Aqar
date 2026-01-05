import React, { memo } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

export interface SocialMediaIconProps {
  name: string;
  icon: string;
  library: "Ionicons" | "FontAwesome5";
  bgColor?: string | null;
  iconColor?: string;
  onPress: () => void;
}

/**
 * Social media icon component
 */
const SocialMediaIcon = memo<SocialMediaIconProps>(
  ({ name, icon, library, bgColor, iconColor, onPress }) => {
    const renderIcon = () => {
      if (library === "Ionicons") {
        return (
          <Ionicons
            name={icon as any}
            size={wp(6)}
            color={iconColor || "#fff"}
          />
        );
      }
      return (
        <FontAwesome5
          name={icon as any}
          size={wp(6)}
          color={iconColor || "#fff"}
        />
      );
    };

    return (
      <TouchableOpacity
        style={[styles.socialIcon, bgColor && { backgroundColor: bgColor }]}
        onPress={onPress}
      >
        {renderIcon()}
      </TouchableOpacity>
    );
  }
);

SocialMediaIcon.displayName = "SocialMediaIcon";

const styles = StyleSheet.create({
  socialIcon: {
    width: wp(13),
    height: wp(13),
    borderRadius: wp(3),
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: wp(2),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 3 },
    }),
  },
});

export default SocialMediaIcon;
