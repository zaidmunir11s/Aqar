import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader, PrimaryButton } from "../../../../components";
import { COLORS } from "@/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalization } from "../../../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

interface BenefitItem {
  id: string;
  text: string;
}

const BENEFITS: BenefitItem[] = [
  {
    id: "1",
    text: "rentalUnit.benefits.commissionFreePrices",
  },
  {
    id: "2",
    text: "rentalUnit.benefits.earnMoreReferral",
  },
  {
    id: "3",
    text: "rentalUnit.benefits.verifiedBookings",
  },
  {
    id: "4",
    text: "rentalUnit.benefits.managementSystem",
  },
  {
    id: "5",
    text: "rentalUnit.benefits.weeklyPayments",
  },
];

export default function AddRentalUnitOnboardingScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { t } = useLocalization();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAddUnitPress = () => {
    navigation.navigate("ChooseCategory");
  };

  const handleLearnMorePress = () => {
    console.log("Learn more pressed");
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("rentalUnit.addBookableUnitTitle")}
        onBackPress={handleBackPress}
        showRightSide={false}
        fontWeightBold={true}
        fontSize={wp(4.5)}
      />

      {/* Removed ScrollView – content now in regular View */}
      <View style={styles.contentContainer}>
        {/* Calendar Icon Section */}
        <View style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <FontAwesome5
              name="calendar-plus"
              size={wp(8)}
              color={COLORS.info}
            />
          </View>
        </View>

        {/* Description Text */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            {t("rentalUnit.description")}
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>
            {t("rentalUnit.benefitsTitle")}
          </Text>

          {BENEFITS.map((benefit) => (
            <View key={benefit.id} style={styles.benefitItem}>
              <View style={styles.checkmarkCircle}>
                <Ionicons name="checkmark" size={wp(3)} color="#fff" />
              </View>
              <Text style={styles.benefitText}>{t(benefit.text)}</Text>
            </View>
          ))}
        </View>

        {/* Learn More Link */}
        <TouchableOpacity
          style={styles.learnMoreContainer}
          onPress={handleLearnMorePress}
          activeOpacity={0.7}
        >
          <Text style={styles.learnMoreText}>{t("rentalUnit.learnMore")}</Text>
        </TouchableOpacity>
      </View>

      {/* Sticky CTA Button */}
      <View
        style={[
          styles.buttonContainer,
          {
            paddingBottom:
              Platform.OS === "ios" ? Math.max(insets.bottom, 16) : 12,
          },
        ]}
      >
        <PrimaryButton
          onPress={handleAddUnitPress}
          text={t("rentalUnit.addBookableUnitCta")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebf1f1",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: hp(3),
  },
  iconWrapper: {
    width: wp(16),
    height: wp(16),
    backgroundColor: "#e2eff7",
    borderRadius: wp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionContainer: {
    marginBottom: hp(6.5),
  },
  descriptionText: {
    fontSize: wp(4.2),
    color: "#000",
    fontWeight: "300",
    lineHeight: wp(5),
    textAlign: "center",
  },
  benefitsContainer: {
    marginBottom: hp(3),
  },
  benefitsTitle: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: hp(2),
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center", // ← Changed to "center" so checkmark aligns vertically with multiline text
    marginBottom: hp(2),
  },
  checkmarkCircle: {
    width: wp(4),
    height: wp(4),
    borderRadius: wp(3),
    backgroundColor: "#0292e4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp(3),
  },
  benefitText: {
    flex: 1,
    fontSize: wp(3.9),
    color: "#000",
    fontWeight: "300",
    lineHeight: wp(5.5),
  },
  learnMoreContainer: {
    marginBottom: hp(2),
  },
  learnMoreText: {
    fontSize: wp(4),
    color: COLORS.info,
  },
  buttonContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(3),
    paddingTop: hp(1),
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
  },
});
