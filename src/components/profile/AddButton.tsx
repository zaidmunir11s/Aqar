import React, { memo } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";

export interface AddButtonProps {
  onPress?: () => void;
  text?: string;
}

/**
 * Add button component with green background and white text
 */
const AddButton = memo<AddButtonProps>(({ onPress, text = "Add" }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={wp(5)} color={COLORS.white} />
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
});

AddButton.displayName = "AddButton";

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: wp(3),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.5),
    gap: wp(2),
  },
  buttonText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.white,
  },
});

export default AddButton;
