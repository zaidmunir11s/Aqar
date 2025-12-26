import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants/colors";

export interface ListingOptionCardProps {
  icon: string;
  iconLibrary?: "Ionicons" | "MaterialCommunityIcons";
  title: string;
  description: string;
  onPress: () => void;
}

const ListingOptionCard = memo<ListingOptionCardProps>(
  ({ icon, iconLibrary = "MaterialCommunityIcons", title, description, onPress }) => {
    const renderIcon = () => {
      const iconColor = COLORS.primary;
      const iconSize = wp(7);

      if (iconLibrary === "Ionicons") {
        return (
          <Ionicons
            name={icon as any}
            size={iconSize}
            color={iconColor}
          />
        );
      }

      return (
        <MaterialCommunityIcons
          name={icon as any}
          size={iconSize}
          color={iconColor}
        />
      );
    };

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.5}
        onPress={onPress}
      >
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </TouchableOpacity>
    );
  }
);

ListingOptionCard.displayName = "ListingOptionCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(1.5),
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#d3d3d3",
  },
  iconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    backgroundColor: "#ebf1f1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp(4),
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: hp(0.5),
  },
  description: {
    fontSize: wp(3.6),
    color: "#666",
    lineHeight: hp(2.5),
  },
});

export default ListingOptionCard;
