import React, { memo, useMemo } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "@/hooks/useLocalization";

export interface AddButtonProps {
  onPress?: () => void;
  text?: string; // ← keep as optional override
}

/**
 * Add button component with green background and white text
 */
const AddButton = memo<AddButtonProps>(({ onPress, text }) => {
  const { t, isRTL } = useLocalization();

  // Use translation with fallback to "Add"
  const buttonText = text ?? t("listings.add") ?? "Add";

  const rtlStyles = useMemo(() => {
    if (!isRTL) return {};

    return {
      button: {
        flexDirection: "row-reverse" as const,
      },
    };
  }, [isRTL]);

  return (
    <TouchableOpacity
      style={[styles.button, rtlStyles.button]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={wp(5)} color={COLORS.white} />
      <Text style={[styles.buttonText]}>{buttonText}</Text>
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
    gap: wp(2), // ← gap already handles nice spacing
  },
  buttonText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.white,
  },
});

export default AddButton;
