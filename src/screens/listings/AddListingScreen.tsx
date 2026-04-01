import React, { useMemo, useCallback, useState } from "react";
import { View, Text, StyleSheet, BackHandler } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ActionOptionCard, RoleOptionCard, ScreenHeader } from "../../components";
import { navigateToMapScreen } from "../../utils";
import { COLORS } from "@/constants";
import { useLocalization } from "../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

interface RoleOption {
  id: "owner-agent-listing" | "broker-listing";
  title: string;
  icon: "home-account" | "handshake-simple";
  iconLibrary?: "MaterialCommunityIcons" | "FontAwesome6";
}

interface ActionOption {
  id: string;
  title: string;
  description: string;
  icon: "home-plus" | "home-search" | "file-document-edit-outline";
  onPress: () => void;
}

export default function AddListingScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const [selectedRole, setSelectedRole] = useState<RoleOption["id"] | null>(null);

  const handleBackPress = useCallback(() => {
    navigateToMapScreen(navigation);
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, [handleBackPress])
  );

  const handleRolePress = useCallback((optionId: RoleOption["id"]) => {
    setSelectedRole(optionId);
  }, []);

  const handleAddPropertyListing = useCallback(() => {
    if (selectedRole === "broker-listing") {
      navigation.navigate("Licence");
      return;
    }
    navigation.navigate("PublishLicenseAdvertisement");
  }, [navigation, selectedRole]);

  const handleRequestMarketing = useCallback(() => {
    navigation.navigate("MarketingRequestPlaceholder");
  }, [navigation]);

  const handleGetFreeLicense = useCallback(() => {
    navigation.navigate("BrokerGetFreeLicense");
  }, [navigation]);

  const roleOptions = useMemo<RoleOption[]>(
    () => [
      {
        id: "owner-agent-listing",
        title: t("listings.ownerAgentShort"),
        icon: "home-account",
      },
      {
        id: "broker-listing",
        title: t("listings.brokerShort"),
        icon: "handshake-simple",
        iconLibrary: "FontAwesome6",
      },
    ],
    [t]
  );

  const actionOptions = useMemo<ActionOption[]>(() => {
    if (!selectedRole) {
      return [];
    }

    if (selectedRole === "broker-listing") {
      return [
        {
          id: "add-property-listing",
          title: t("listings.addPropertyListingTitle"),
          description: t("listings.addPropertyListingDescription"),
          icon: "home-plus",
          onPress: handleAddPropertyListing,
        },
        {
          id: "free-license-add-ad",
          title: t("listings.getFreeLicenseAndAddAdTitle"),
          description: t("listings.getFreeLicenseAndAddAdDescription"),
          icon: "file-document-edit-outline",
          onPress: handleGetFreeLicense,
        },
      ];
    }

    return [
      {
        id: "add-property-listing",
        title: t("listings.addPropertyListingTitle"),
        description: t("listings.addPropertyListingDescription"),
        icon: "home-plus",
        onPress: handleAddPropertyListing,
      },
      {
        id: "request-property-marketing",
        title: t("listings.requestPropertyMarketingTitle"),
        description: t("listings.requestPropertyMarketingDescription"),
        icon: "home-search",
        onPress: handleRequestMarketing,
      },
    ];
  }, [
    selectedRole,
    t,
    handleAddPropertyListing,
    handleGetFreeLicense,
    handleRequestMarketing,
  ]);

  const rtlStyles = useMemo(
    () => ({
      sectionTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      optionsRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
    }),
    [isRTL]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.publishLicenseAdvertisement")}
        onBackPress={handleBackPress}
        showRightSide={false}
        fontSize={wp(4)}
        titleFontWeight="600"
      />

      <View style={styles.contentContainer}>
        <Text style={[styles.sectionTitle, rtlStyles.sectionTitle]}>
          {t("listings.areYou")}
        </Text>

        <View style={[styles.optionsRow, rtlStyles.optionsRow]}>
          {roleOptions.map((option) => (
            <RoleOptionCard
              key={option.id}
              title={option.title}
              icon={option.icon}
              iconLibrary={option.iconLibrary}
              selected={selectedRole === option.id}
              onPress={() => handleRolePress(option.id)}
            />
          ))}
        </View>

        {selectedRole && (
          <Text style={[styles.actionSectionTitle, rtlStyles.sectionTitle]}>
            {t("listings.whatAreYouTryingToAdvertise")}
          </Text>
        )}

        {actionOptions.map((option) => (
          <ActionOptionCard
            key={option.id}
            title={option.title}
            description={option.description}
            icon={option.icon}
            onPress={option.onPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: wp(3),
    paddingTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.2),
    fontWeight: "400",
    color: COLORS.textPrimary,
    marginBottom: hp(1.2),
  },
  actionSectionTitle: {
    fontSize: wp(4.2),
    color: COLORS.textPrimary,
    marginTop: hp(2.1),
    marginBottom: hp(1.2),
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center",
    gap: wp(2.5),
  },
});
