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
            size={wp(10)}
            color="#6b7280"
          />
        );
      }
      return <Ionicons name={iconName as any} size={wp(10)} color="#6b7280" />;
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
  }
);

ServiceCard.displayName = "ServiceCard";

const styles = StyleSheet.create({
  serviceCard: {
    width: wp(28),
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: wp(3),
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 3 },
    }),
  },
  serviceIconContainer: {
    width: wp(18),
    height: wp(18),
    backgroundColor: "#f3f4f6",
    borderRadius: wp(3),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(1.5),
  },
  serviceCardTitle: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    lineHeight: hp(2.2),
  },
});

export default ServiceCard;
