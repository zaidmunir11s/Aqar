import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface AqarCardProps {
  onPress?: () => void;
}

/**
 * Aqar+ card component with icon, title, subtitle and chevron
 */
const AqarCard = memo<AqarCardProps>(({ onPress }) => {
  const { isRTL, t } = useLocalization();
  const rtlStyles = useMemo(() => {
    if (!isRTL) return {};
    return {
      card: {
        flexDirection: "row-reverse" as const,
      },
      title: {
        textAlign: "right" as const,
      },
      subtitle: {
        textAlign: "right" as const,
      },
      chevron: {
        marginRight: wp(2),
      },
    };
  }, [isRTL]);
  return (
    <TouchableOpacity style={[styles.card, rtlStyles.card]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name="map" size={wp(8)} color="#fbbf24" />
        <Ionicons
          name="location"
          size={wp(4)}
          color="#fbbf24"
          style={styles.pinIcon}
        />
        <View style={styles.plusIcon}>
          <Ionicons name="add" size={wp(3.5)} color="#fbbf24" />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, rtlStyles.title]}>{t("common.bayt", { defaultValue: "Bayt" })}</Text>
        <Text style={[styles.subtitle, rtlStyles.subtitle]}>{t("common.exploreBaytFeatures", { defaultValue: "Explore Bayt Features" })}</Text>
      </View>
      <Ionicons
        name={isRTL ? "chevron-back" : "chevron-forward"}
        size={wp(5)}
        color={COLORS.textDisabled}
        style={[styles.chevron, rtlStyles.chevron]}
      />
    </TouchableOpacity>
  );
});

AqarCard.displayName = "AqarCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  iconContainer: {
    width: wp(14),
    height: wp(14),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
    position: "relative",
  },
  pinIcon: {
    position: "absolute",
  },
  plusIcon: {
    position: "absolute",
    top: wp(-1),
    right: wp(-1),
    backgroundColor: COLORS.white,
    borderRadius: wp(2),
    width: wp(5),
    height: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    marginBottom: hp(0.3),
  },
  subtitle: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
  chevron: {
    marginLeft: wp(2),
  },
});

export default AqarCard;
