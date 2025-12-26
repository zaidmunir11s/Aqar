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

type NavigationProp = NativeStackNavigationProp<any>;

interface BenefitItem {
  id: string;
  text: string;
}

const BENEFITS: BenefitItem[] = [
  {
    id: "1",
    text: "Commission Free Prices!",
  },
  {
    id: "2",
    text: "Earn 5% more on every booking by sharing your referral link with guests",
  },
  {
    id: "3",
    text: "Bookings verified through National Authentication",
  },
  {
    id: "4",
    text: "Comprehensive booking management system (set minimum booking duration, add discounts, update prices and booked days, special rates for events, etc.)",
  },
  {
    id: "5",
    text: "Weekly disbursement of payments every Tuesday",
  },
];

export default function AddRentalUnitOnboardingScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

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
        title="Add bookable unit"
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
            <FontAwesome5 name="calendar-plus" size={wp(8)} color={COLORS.info} />
          </View>
        </View>

        {/* Description Text */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            A service that makes it easy for you to list your unit{"\n"}
            for daily or monthly booking instantly through the{"\n"}
            Aqar platform, with guaranteed rights for both{"\n"}
            parties.
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>
            Benefits of reservations on Aqar platform
          </Text>

          {BENEFITS.map((benefit) => (
            <View key={benefit.id} style={styles.benefitItem}>
              <View style={styles.checkmarkCircle}>
                <Ionicons name="checkmark" size={wp(3)} color="#fff" />
              </View>
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>

        {/* Learn More Link */}
        <TouchableOpacity
          style={styles.learnMoreContainer}
          onPress={handleLearnMorePress}
          activeOpacity={0.7}
        >
          <Text style={styles.learnMoreText}>
            Learn more about the service
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sticky CTA Button */}
      <View
  style={[
    styles.buttonContainer,
    {
      paddingBottom: Platform.OS === 'ios' 
        ? Math.max(insets.bottom, 16) 
        : 12,
    },
  ]}
>
        <PrimaryButton
          onPress={handleAddUnitPress}
          text="Add bookable unit"
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
    alignItems: "center",        // ← Changed to "center" so checkmark aligns vertically with multiline text
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