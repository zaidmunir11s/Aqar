import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "@/constants/colors";

export interface ServiceCardProps {
  iconName: string;
  iconLibrary: "Ionicons" | "MaterialCommunityIcons";
  title: string;
  onPress: () => void;
}

/**
 * Service card component
 */
const ServiceCard = memo<ServiceCardProps>(
  ({ iconName, iconLibrary, title, onPress }) => {
    const renderIcon = () => {
      if (iconLibrary === "MaterialCommunityIcons") {
        return (
          <MaterialCommunityIcons
            name={iconName as any}
            size={wp(8)}
            color={COLORS.primary}
          />
        );
      }
      return (
        <Ionicons name={iconName as any} size={wp(8)} color={COLORS.primary} />
      );
    };

    return (
      <TouchableOpacity
        style={styles.serviceCard}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View style={styles.serviceIconContainer}>{renderIcon()}</View>
        <Text style={styles.serviceCardTitle}>{title}</Text>
      </TouchableOpacity>
    );
  },
);

ServiceCard.displayName = "ServiceCard";

const styles = StyleSheet.create({
  serviceCard: {
    width: wp(31),
    backgroundColor: "#ffffff",
    borderRadius: wp(3.5),
    padding: wp(3),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
        backgroundColor: "#ffffff",
      },
    }),
  },
  serviceIconContainer: {
    width: wp(15),
    height: wp(15),
    backgroundColor: "#f0fdfa",
    borderRadius: wp(4),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  serviceCardTitle: {
    fontSize: wp(3.5),
    fontWeight: "500",
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: hp(2.2),
  },
});

export default ServiceCard;
