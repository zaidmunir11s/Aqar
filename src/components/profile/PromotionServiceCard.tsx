import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";

export interface PromotionServiceCardProps {
  onPress?: () => void;
}

const PromotionServiceCard = memo<PromotionServiceCardProps>(({ onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name="trending-up" size={wp(7)} color={COLORS.white} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Promotion Services</Text>
        <Text style={styles.subtitle}>
          Services that help you speed up the sale and rental of the property
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={wp(5)}
        color={COLORS.textDisabled}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
});

PromotionServiceCard.displayName = "PromotionServiceCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginTop: hp(1.2),
  },
  iconContainer: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(3),
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: hp(0.5),
  },
  subtitle: {
    fontSize: wp(3.1),
    color: COLORS.textSecondary,
    lineHeight: hp(2),
  },
  chevron: {
    marginLeft: wp(2),
  },
});

export default PromotionServiceCard;
