import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useLocalization } from "../../hooks/useLocalization";

export interface FinancingOptionsCardProps {
  onPress: () => void;
}

/**
 * Financing options card for sale listings
 * Shows "Would you like to own the property?" with financing options button
 */
const FinancingOptionsCard = memo<FinancingOptionsCardProps>(({ onPress }) => {
  const { t, isRTL } = useLocalization();
  
  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      card: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      questionText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        marginRight: isRTL ? 0 : wp(3),
        marginLeft: isRTL ? wp(3) : 0,
      },
    }),
    [isRTL]
  );
  
  return (
    <View style={[styles.card, rtlStyles.card]}>
      <Text style={[styles.questionText, rtlStyles.questionText]}>
        {t("listings.wouldYouLikeToOwnProperty")}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{t("listings.financingOptions")}</Text>
      </TouchableOpacity>
    </View>
  );
});

FinancingOptionsCard.displayName = "FinancingOptionsCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e0f2fe",
    padding: wp(4),
    marginHorizontal: wp(4),
    marginTop: hp(1),
    marginBottom: hp(1),
    borderRadius: wp(3),
    borderWidth: 2,
    borderColor: "#ade4fb",
  },
  questionText: {
    flex: 1,
    fontSize: wp(3.8),
    color: "#374151",
    fontWeight: "400",
    marginRight: wp(3),
  },
  button: {
    backgroundColor: "#fff",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    borderRadius: wp(2),
    borderWidth: 2,
    borderColor: "#1b8fce",
  },
  buttonText: {
    fontSize: wp(3.5),
    color: "#1c8bc0",
    fontWeight: "600",
  },
});

export default FinancingOptionsCard;
