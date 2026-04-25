import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "@/constants/colors";

export interface ServiceListItemProps {
  text: string;
  onPress: () => void;
  isLast?: boolean;
}

/**
 * Service list item component
 */
const ServiceListItem = memo<ServiceListItemProps>(
  ({ text, onPress, isLast = false }) => {
    return (
      <TouchableOpacity
        style={[styles.listItem, isLast && styles.lastListItem]}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <Text style={styles.listItemText}>{text}</Text>
        <Ionicons
          name="chevron-forward"
          size={wp(5)}
          color={COLORS.textTertiary}
        />
      </TouchableOpacity>
    );
  },
);

ServiceListItem.displayName = "ServiceListItem";

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(2.2),
    paddingHorizontal: wp(4.5),
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#ffffff",
  },
  lastListItem: {
    borderBottomWidth: 0,
  },
  listItemText: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
});

export default ServiceListItem;
