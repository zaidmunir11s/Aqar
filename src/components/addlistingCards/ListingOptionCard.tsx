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
  ({
    icon,
    iconLibrary = "MaterialCommunityIcons",
    title,
    description,
    onPress,
  }) => {
    const renderIcon = () => {
      const iconColor = COLORS.primary;
      const iconSize = wp(7);

      if (iconLibrary === "Ionicons") {
        return (
          <Ionicons name={icon as any} size={iconSize} color={iconColor} />
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
        <View style={styles.iconContainer}>{renderIcon()}</View>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </TouchableOpacity>
    );
  },
);

ListingOptionCard.displayName = "ListingOptionCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(2),
    marginBottom: hp(1.5),
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3),
    backgroundColor: "#ebf1f1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp(4),
    marginLeft: wp(2),
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: wp(3.8),
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: hp(0.5),
  },
  description: {
    fontSize: wp(3.6),
    color: COLORS.textSecondary,
    lineHeight: hp(2.5),
  },
});

export default ListingOptionCard;
