import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  ScreenHeader,
  ListingFooter,
  CancelModal,
} from "../../../../components";
import { navigateToMapScreen } from "../../../../utils";
import { COLORS } from "../../../../constants";
import { useLocalization } from "../../../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

export default function PublishLicenseAdvertisementScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { t, isRTL } = useLocalization();

  const steps = useMemo(
    () => [
      t("listings.licenseStep1"),
      t("listings.licenseStep2"),
      t("listings.licenseStep3"),
      t("listings.licenseStep4"),
    ],
    [t]
  );

  const requirements = useMemo(
    () => [
      t("listings.licenseReq1"),
      t("listings.licenseReq2"),
      t("listings.licenseReq3"),
    ],
    [t]
  );

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      noticeRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      noticeText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      stepsTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      stepItem: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      bullet: {
        marginRight: isRTL ? 0 : wp(2),
        marginLeft: isRTL ? wp(2) : 0,
      },
      stepText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      linkText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleClosePress = () => {
    setShowCancelModal(true);
  };

  const handleCancelBack = () => {
    setShowCancelModal(false);
  };

  const handleCancelYes = () => {
    setShowCancelModal(false);
    navigateToMapScreen(navigation);
  };

  const handleNextPress = () => {
    navigation.navigate("DeedOwnerInformation");
  };

  const handleFooterBackPress = () => {
    navigation.goBack();
  };

  const handleLearnMorePress = () => {
    // Placeholder until URL is confirmed.
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.publishLicenseAdvertisementFull")}
        onBackPress={handleBackPress}
        showRightSide={true}
        rightComponent={
          <TouchableOpacity
            onPress={handleClosePress}
            activeOpacity={0.7}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={wp(6)} color={COLORS.primary} />
          </TouchableOpacity>
        }
        titleFontWeight="600"
        fontSize={wp(5)}
        titleNumberOfLines={2}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={[styles.noticeCard, rtlStyles.noticeRow]}>
            <Ionicons name="checkmark-circle" size={wp(5)} color={COLORS.primary} />
            <Text style={[styles.noticeText, rtlStyles.noticeText]}>
              {t("listings.licenseExemptNotice")}
            </Text>
          </View>

          <View style={styles.logoContainer}>
            <Image
              source={require("../../../../../assets/images/aqar-license.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.heading}>
            {t("listings.baytIssuesLicenses")}
          </Text>

          <View style={styles.stepsContainer}>
            <Text style={[styles.stepsTitle, rtlStyles.stepsTitle]}>
              {t("listings.steps")}
            </Text>
            {steps.map((step, index) => (
              <View key={index} style={[styles.stepItem, rtlStyles.stepItem]}>
                <View style={[styles.bullet, rtlStyles.bullet]} />
                <Text style={[styles.stepText, rtlStyles.stepText]}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.stepsContainer}>
            <Text style={[styles.stepsTitle, rtlStyles.stepsTitle]}>
              {t("listings.requirements")}
            </Text>
            {requirements.map((item, index) => (
              <View key={index} style={[styles.stepItem, rtlStyles.stepItem]}>
                <View style={[styles.bullet, rtlStyles.bullet]} />
                <Text style={[styles.stepText, rtlStyles.stepText]}>{item}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={handleLearnMorePress} activeOpacity={0.7}>
            <Text style={[styles.linkText, rtlStyles.linkText]}>
              {t("listings.learnAboutLicenses")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ListingFooter
        currentStep={1}
        totalSteps={2}
        onBackPress={handleFooterBackPress}
        onNextPress={handleNextPress}
        backText={t("common.back")}
        nextText={t("auth.continue")}
        nextDisabled={false}
      />

      <CancelModal
        visible={showCancelModal}
        onBack={handleCancelBack}
        onConfirm={handleCancelYes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebf1f1",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(2),
  },
  closeButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: wp(4),
    marginHorizontal: wp(4),
    marginTop: hp(2),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  noticeCard: {
    backgroundColor: COLORS.bgGreen,
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.3),
    marginBottom: hp(2),
    alignItems: "center",
    flexDirection: "row",
    gap: wp(2),
  },
  noticeText: {
    flex: 1,
    fontSize: wp(3.7),
    fontWeight: "500",
    color: COLORS.textPrimary,
    lineHeight: hp(2.4),
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(1.6),
    paddingVertical: hp(0.8),
  },
  logo: {
    width: wp(40),
    height: hp(14),
  },
  heading: {
    fontSize: wp(4.2),
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: hp(1.8),
    lineHeight: hp(3.3),
  },
  stepsContainer: {
    marginTop: hp(0.6),
  },
  stepsTitle: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(0.8),
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp(0.5),
  },
  bullet: {
    width: wp(1.45),
    height: wp(1.45),
    borderRadius: wp(0.8),
    backgroundColor: COLORS.textPrimary,
    marginTop: hp(1.15),
    marginRight: wp(1.6),
  },
  stepText: {
    flex: 1,
    fontSize: wp(4.3),
    fontWeight: "400",
    color: COLORS.textPrimary,
    lineHeight: hp(2.5),
  },
  linkText: {
    fontSize: wp(4.1),
    color: "#0b82a0",
    textDecorationLine: "underline",
    marginTop: hp(0.8),
  },
});


