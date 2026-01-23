import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useLocalization } from "../../hooks/useLocalization";

export default function ProfileScreen(): React.JSX.Element {
  const { t, isRTL } = useLocalization();

  // RTL-aware styles (only apply RTL-specific changes, preserve LTR styling)
  const rtlStyles = useMemo(
    () => ({
      title: {
        textAlign: (isRTL ? "right" : "center") as "left" | "center" | "right",
      },
      subtitle: {
        textAlign: (isRTL ? "right" : "center") as "left" | "center" | "right",
      },
    }),
    [isRTL]
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, rtlStyles.title]}>{t("navigation.profile")}</Text>
      <Text style={[styles.subtitle, rtlStyles.subtitle]}>{t("common.comingSoon")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: wp(8),
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: hp(1.2),
  },
  subtitle: {
    fontSize: wp(4.5),
    color: "#64748b",
  },
});
