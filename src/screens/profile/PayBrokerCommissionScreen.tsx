import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, Text, TextStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { ScreenHeader, SegmentedControl } from "../../components";
import { useLocalization } from "../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

export default function PayBrokerCommissionScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSegmentChange = (index: number) => {
    setSelectedIndex(index);
    console.log("Segment changed to:", index);
  };

  const rtlStyles = useMemo(
    () => ({
      label: { textAlign: isRTL ? "right" : "left" },
      descriptionText: { textAlign: "center", },
    }),
    [isRTL]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("profile.yourDepositService", { defaultValue: "Your Deposit Service" })}
        onBackPress={handleBackPress}
        fontWeightBold={true}
        backButtonColor={COLORS.primary}
        showRightSide={false}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="receipt" size={wp(8)} color={COLORS.info} />
        </View>
        <Text style={[styles.descriptionText, rtlStyles.descriptionText as TextStyle]}>
          {t("profile.yourDepositServiceDescription", { defaultValue: "A service that ensures the safe arrival of the commission to the broker by matching all registered official data and passing the national access verification to ensure the rights of all parties." })}
        </Text>
        <View style={styles.separator} />
        <View style={styles.segmentedControlContainer}>
          <SegmentedControl
            options={[t("profile.buy", { defaultValue: "Buy" }), t("profile.rent", { defaultValue: "Rent" }) as string, t("profile.sell", { defaultValue: "Sell" }) as string, t("profile.daily", { defaultValue: "Daily" }) as string]       }
            selectedIndex={selectedIndex}
            onSelect={handleSegmentChange}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: wp(4),
    alignItems: "center",
    paddingTop: hp(3),
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: hp(4),
  },
  descriptionText: {
    fontSize: wp(3.4),
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: hp(2.5),
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    width: "100%",
    marginBottom: hp(3),
  },
  segmentedControlContainer: {
    width: "100%",
    marginTop: hp(2),
  },
});
