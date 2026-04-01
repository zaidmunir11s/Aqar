import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  BackHandler,
} from "react-native";
import { useNavigation, useFocusEffect, StackActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader, ListingFooter, CancelModal } from "../../../../components";
import { navigateToMapScreen } from "../../../../utils";
import {
  COLORS,
  BROKER_LISTING_TOTAL_STEPS,
  BROKER_STEP_FREE_LICENSE_INTRO,
} from "@/constants";
import { useLocalization } from "../../../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

export default function BrokerGetFreeLicenseScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const rtlStyles = useMemo(
    () => ({
      requirementsTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      reqRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      reqText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  /** Always return to role/action picker (not Licence) when opened from Step1 hint or Add Listing. */
  const goToAddListing = useCallback(() => {
    navigation.dispatch(StackActions.popTo("AddListing"));
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    goToAddListing();
  }, [goToAddListing]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        goToAddListing();
        return true;
      });
      return () => sub.remove();
    }, [goToAddListing])
  );

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
    navigation.navigate("BrokerIssueAdLicense");
  }, [navigation]);

  const handleFooterBackPress = useCallback(() => {
    goToAddListing();
  }, [goToAddListing]);

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
      <ScreenHeader
        title={t("listings.brokerGetFreeLicenseTitle")}
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
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../../assets/images/aqar-license.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.intro}>{t("listings.brokerFreeLicenseIntro")}</Text>

        <View style={styles.requirementsBlock}>
          <Text style={[styles.requirementsTitle, rtlStyles.requirementsTitle]}>
            {t("listings.requirements")}
          </Text>
          <View style={[styles.reqRow, rtlStyles.reqRow]}>
            <View style={[styles.bullet, isRTL ? styles.bulletRTL : styles.bulletLTR]} />
            <Text style={[styles.reqItemText, rtlStyles.reqText]}>
              {t("listings.brokerFreeLicenseReqBrokerage")}
            </Text>
          </View>
        </View>
      </ScrollView>

      <ListingFooter
        currentStep={BROKER_STEP_FREE_LICENSE_INTRO}
        totalSteps={BROKER_LISTING_TOTAL_STEPS}
        onBackPress={handleFooterBackPress}
        onNextPress={handleNextPress}
        backText={t("common.back")}
        nextText={t("common.next")}
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
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
    flexGrow: 1,
  },
  closeButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp(1.5),
    marginBottom: hp(1.6),
    paddingVertical: hp(0.8),
  },
  logo: {
    width: wp(45),
    height: hp(16),
  },
  intro: {
    fontSize: wp(4),
    fontWeight: "400",
    color: COLORS.textSecondary,
    lineHeight: hp(2.5),
    textAlign: "center",
    alignSelf: "stretch",
    marginBottom: hp(3.5),
  },
  requirementsBlock: {
    alignSelf: "stretch",
  },
  requirementsTitle: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(1.5),
  },
  reqRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    width: wp(1),
    height: wp(1),
    borderRadius: wp(0.75),
    backgroundColor: COLORS.textSecondary,
    marginTop: hp(1.1),
  },
  bulletLTR: {
    marginRight: wp(2.5),
  },
  bulletRTL: {
    marginLeft: wp(2.5),
  },
  reqItemText: {
    flex: 1,
    fontSize: wp(4.2),
    color: COLORS.textSecondary,
    lineHeight: hp(2.6),
  },
});
