import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader, ListingFooter, CancelModal } from "../../../../components";
import { openURL, navigateToMapScreen } from "../../../../utils";
import {
  COLORS,
  BROKER_LISTING_TOTAL_STEPS,
  BROKER_STEP_LICENSE_INFORMATION,
} from "@/constants";
import { useLocalization } from "../../../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

export default function Step1LicenseScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseFocused, setLicenseFocused] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isValidLicense = /^(71|72)\d{8}$/.test(licenseNumber.trim());
  const canProceed = isValidLicense;

  const rtlStyles = useMemo(
    () => ({
      labelRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      hint: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleClosePress = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const handleCancelBack = useCallback(() => {
    setShowCancelModal(false);
  }, []);

  const handleCancelYes = useCallback(() => {
    setShowCancelModal(false);
    navigateToMapScreen(navigation);
  }, [navigation]);

  const handleNextPress = useCallback(() => {
    if (!canProceed) return;
    navigation.navigate("BrokerIssueAdLicense");
  }, [canProceed, navigation]);

  const handleFooterBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleWhatIsLicensePress = useCallback(() => {
    openURL("https://rega.gov.sa");
  }, []);

  const handleIssueFreeHintPress = useCallback(() => {
    navigation.navigate("BrokerGetFreeLicense");
  }, [navigation]);

  const headerClose = useMemo(
    () => (
      <TouchableOpacity
        onPress={handleClosePress}
        activeOpacity={0.7}
        style={styles.closeButton}
      >
        <Ionicons name="close" size={wp(6)} color={COLORS.primary} />
      </TouchableOpacity>
    ),
    [handleClosePress]
  );

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.flex}>
          <ScreenHeader
            title={t("listings.brokerLicensingInformationTitle")}
            onBackPress={handleBackPress}
            showRightSide
            rightComponent={headerClose}
            titleFontWeight="600"
            fontSize={wp(5)}
            titleNumberOfLines={2}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <Image
                source={require("../../../../../assets/images/aqar-license.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.intro}>
              {t("listings.brokerAdLicenseIntroRega")}
            </Text>

            <View style={[styles.labelRow, rtlStyles.labelRow]}>
              <Text style={styles.fieldLabel}>
                {t("listings.brokerAdLicenseNumberLabel")}
              </Text>
              <TouchableOpacity
                onPress={handleWhatIsLicensePress}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.linkInline}>
                  {t("listings.brokerWhatIsAdLicense")}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.textInput, licenseFocused && styles.textInputFocused]}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              keyboardType="number-pad"
              placeholder={t("listings.brokerAdLicensePlaceholder")}
              placeholderTextColor={COLORS.textTertiary}
              maxLength={10}
              onFocus={() => setLicenseFocused(true)}
              onBlur={() => setLicenseFocused(false)}
            />

            {licenseNumber.length > 0 && !isValidLicense ? (
              <Text style={styles.errorText}>{t("listings.brokerAdLicenseInvalid")}</Text>
            ) : null}

            <TouchableOpacity
              onPress={handleIssueFreeHintPress}
              activeOpacity={0.7}
              style={styles.hintTouchable}
            >
              <Text style={[styles.hintText, rtlStyles.hint]}>
                {t("listings.brokerIssueFreeAdLicenseHint")}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      <ListingFooter
        currentStep={BROKER_STEP_LICENSE_INFORMATION}
        totalSteps={BROKER_LISTING_TOTAL_STEPS}
        onBackPress={handleFooterBackPress}
        onNextPress={handleNextPress}
        backText={t("common.back")}
        nextText={t("common.next")}
        nextDisabled={!canProceed}
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
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
    flexGrow: 1,
  },
  closeButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  /** Match PublishLicenseAdvertisementScreen image block */
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
  intro: {
    fontSize: wp(4.1),
    fontWeight: "400",
    color: COLORS.textSecondary,
    lineHeight: hp(2.5),
    marginBottom: hp(3),
    textAlign: "center",
    alignSelf: "stretch",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(1.2),
    gap: wp(2),
  },
  fieldLabel: {
    flex: 1,
    fontSize: wp(4.2),
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  linkInline: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.info,
  },
  textInput: {
    minHeight: hp(6.5),
    backgroundColor: COLORS.white,
    borderRadius: wp(2.5),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: wp(4),
    fontSize: wp(4),
    color: COLORS.textPrimary,
  },
  textInputFocused: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.activeChipBackground,
  },
  errorText: {
    color: COLORS.error,
    marginTop: hp(1),
    fontSize: wp(3.5),
  },
  hintTouchable: {
    marginTop: hp(2.5),
  },
  hintText: {
    fontSize: wp(4),
    fontWeight: "400",
    color: COLORS.info,
    lineHeight: hp(2.6),
  },
});
