import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Platform,
  ViewStyle,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { ScreenHeader, UserInfoCard, ProfileTabs } from "../../components";
import { useLocalization } from "../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

export default function UserProfileAdsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSharePress = () => {
    console.log("Share pressed");
  };

  const handleMorePress = () => {
    console.log("More options pressed");
  };

  const handlePayBrokerCommissionPress = () => {
    navigation.navigate("PayBrokerCommission");
  };

  const handleTabChange = (tab: string) => {
    console.log("Tab changed to:", tab);
  };

  const rtlStyles = useMemo(
    () => ({
      payBrokerButton: { flexDirection: isRTL ? "row-reverse" : "row" } as ViewStyle,
      rightIconsContainer: { flexDirection: isRTL ? "row-reverse" : "row" } as ViewStyle,
    }),
    [isRTL]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("profile.userProfileAds", { defaultValue: "User Profile - Ads (0)" })}
        onBackPress={handleBackPress}
        fontWeightBold={true}
        backButtonColor={COLORS.primary}
        rightComponent={
          <View style={[styles.rightIconsContainer, rtlStyles.rightIconsContainer]}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSharePress}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social" size={wp(6)} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleMorePress}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={wp(6)} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        }
        showRightSide={true}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.profilePlaceholder}>
          <Image
            source={require("../../../assets/User.png")}
            style={styles.userImage}
            resizeMode="cover"
          />
        </View>
        <TouchableOpacity
          style={[styles.payBrokerButton, rtlStyles.payBrokerButton as ViewStyle]}
          onPress={handlePayBrokerCommissionPress}
          activeOpacity={0.7}
        >
          <Ionicons name="receipt-outline" size={wp(5)} color="#2563eb" />
          <Text style={styles.payBrokerText}>{t("profile.payBrokerCommission", { defaultValue: "Pay Broker Commission" })}</Text>
        </TouchableOpacity>
        <UserInfoCard sinceDate="2025/11/27" lastSeen="now" />
        <ProfileTabs onTabChange={handleTabChange} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  rightIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
  iconButton: {
    padding: wp(1),
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  contentContainer: {
    alignItems: "center",
    paddingTop: hp(4),
    paddingBottom: hp(4),
  },
  profilePlaceholder: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    backgroundColor: COLORS.textTertiary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(4),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  userImage: {
    width: "100%",
    height: "100%",
    bottom: wp(-3),
  },
  payBrokerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.info,
    borderRadius: wp(3),
    paddingHorizontal: wp(10),
    paddingVertical: hp(2),
    gap: wp(2),
    marginBottom: hp(2),
  },
  payBrokerText: {
    fontSize: wp(4),
    color: COLORS.info,
    fontWeight: "500",
  },
});
