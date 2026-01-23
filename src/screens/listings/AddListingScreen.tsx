import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader } from "../../components";
import { ADD_SCREEN_SERVICES_LISTING, COLORS } from "@/constants";
import { useLocalization } from "../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

interface ListingOption {
  id: string;
  icon: string;
  iconLibrary?: "Ionicons" | "MaterialCommunityIcons";
  title: string;
  description: string;
  onPress: () => void;
}

export default function AddListingScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();

  const handleBackPress = () => {
    // Get the parent navigator (Tab Navigator) to determine which tab we're in
    const parent = navigation.getParent();
    const rootState = parent?.getState();
    
    // Find the current tab by checking the root navigator state
    const currentTabRoute = rootState?.routes?.[rootState?.index || 0];
    const tabName = currentTabRoute?.name;
    
    // Determine which map screen to navigate to based on the current tab
    const targetMapScreen = 
      tabName === "Listings" ? "MapLanding" :
      tabName === "Projects" ? "ProjectsMap" :
      tabName === "Bookings" ? "DailyMap" : "MapLanding";
    
    // Get the current stack state
    const stackState = navigation.getState();
    const stackRoutes = stackState?.routes || [];
    
    // If there are multiple screens in the stack, pop to the first one (map screen)
    if (stackRoutes.length > 1) {
      try {
        // Pop to the first screen in the stack (should be the map screen)
        navigation.popToTop();
      } catch (error) {
        // If popToTop fails, navigate directly to the map screen using parent navigator
        if (tabName && (tabName === "Listings" || tabName === "Projects" || tabName === "Bookings")) {
          parent?.navigate(tabName, { screen: targetMapScreen });
        } else {
          navigation.navigate(targetMapScreen);
        }
      }
    } else {
      // Only one screen in stack or can't determine, navigate directly to map screen
      try {
        if (tabName && (tabName === "Listings" || tabName === "Projects" || tabName === "Bookings")) {
          // Use parent navigator to navigate to the tab and screen
          parent?.navigate(tabName, { screen: targetMapScreen });
        } else {
          // Fallback: try direct navigation
          navigation.navigate(targetMapScreen);
        }
      } catch (error) {
        // If navigation fails, try going back
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }
    }
  };

  const handleSavePress = () => {
    console.log("Save listing");
  };

  const handleOptionPress = (optionId: string) => {
    if (optionId === "broker-listing") {
      navigation.navigate("Licence");
    } else if (optionId === "owner-agent-listing") {
      navigation.navigate("PublishLicenseAdvertisement");
    } else if (optionId === "rental-unit") {
      navigation.navigate("AddRentalUnitOnboarding");
    } else if(optionId === "marketing-request") {
      navigation.navigate("MarketingRequestPlaceholder");
    } else if(optionId === "search-request") {
      navigation.navigate("SearchRequest");
    }
  };

  const ownerAgentOption = (ADD_SCREEN_SERVICES_LISTING as ListingOption[])[1];
  const requestOptions = (ADD_SCREEN_SERVICES_LISTING as ListingOption[]).slice(3, 5);

  // Map option IDs to translation keys
  const getOptionTitle = (optionId: string): string => {
    const titleMap: Record<string, string> = {
      "broker-listing": t("listings.propertyListingByBroker"),
      "owner-agent-listing": t("listings.propertyListingByOwnerAgent"),
      "rental-unit": t("listings.dailyMonthlyRentalUnit"),
      "marketing-request": t("listings.propertyMarketingRequest"),
      "search-request": t("listings.propertySearchRequest"),
    };
    return titleMap[optionId] || "";
  };

  const getOptionDescription = (optionId: string): string => {
    const descriptionMap: Record<string, string> = {
      "broker-listing": t("listings.brokerListingDescription"),
      "owner-agent-listing": t("listings.ownerAgentListingDescription"),
      "rental-unit": t("listings.rentalUnitDescription"),
      "marketing-request": t("listings.marketingRequestDescription"),
      "search-request": t("listings.searchRequestDescription"),
    };
    return descriptionMap[optionId] || "";
  };

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      welcomeTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      welcomeSubtitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      sectionLabel: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      mainCardContent: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      mainCardIconWrapper: {
        marginRight: isRTL ? 0 : wp(4),
        marginLeft: isRTL ? wp(4) : 0,
      },
      mainCardTextContainer: {
        marginRight: isRTL ? 0 : wp(2),
        marginLeft: isRTL ? wp(2) : 0,
      },
      mainCardTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      mainCardDescription: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      requestCardTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      requestCardDescription: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      requestCardArrow: {
        right: isRTL ? undefined : wp(4.5),
        left: isRTL ? wp(4.5) : undefined,
      },
      requestsGrid: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      requestCardIconWrapper: {
        alignSelf: (isRTL ? "flex-end" : "flex-start") as "flex-start" | "flex-end",
      },
    }),
    [isRTL]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.addNewListing")}
        onBackPress={handleBackPress}
        showRightSide={false}
        onRightPress={handleSavePress}
        fontWeightBold={true}
        fontSize={wp(4.5)}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIconContainer}>
            <MaterialCommunityIcons 
              name="home-plus-outline" 
              size={wp(8)} 
              color={COLORS.primary} 
            />
          </View>
          <Text style={[styles.welcomeTitle, rtlStyles.welcomeTitle]}>
            {t("listings.createYourListing")}
          </Text>
          <Text style={[styles.welcomeSubtitle, rtlStyles.welcomeSubtitle]}>
            {t("listings.chooseListingType")}
          </Text>
        </View>

        {/* Main Service Card */}
        {ownerAgentOption && (
          <View style={styles.mainCardContainer}>
            <Text style={[styles.sectionLabel, rtlStyles.sectionLabel]}>
              {t("listings.listingType")}
            </Text>
            <TouchableOpacity
              style={styles.mainCard}
              onPress={() => handleOptionPress(ownerAgentOption.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.mainCardContent, rtlStyles.mainCardContent]}>
                <View style={[styles.mainCardIconWrapper, rtlStyles.mainCardIconWrapper]}>
                  <MaterialCommunityIcons
                    name={ownerAgentOption.icon as any}
                    size={wp(7)}
                    color={COLORS.white}
                  />
                </View>
                <View style={[styles.mainCardTextContainer, rtlStyles.mainCardTextContainer]}>
                  <Text style={[styles.mainCardTitle, rtlStyles.mainCardTitle]}>
                    {getOptionTitle(ownerAgentOption.id)}
                  </Text>
                  <Text style={[styles.mainCardDescription, rtlStyles.mainCardDescription]}>
                    {getOptionDescription(ownerAgentOption.id)}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={isRTL ? "chevron-left" : "chevron-right"}
                  size={wp(6)}
                  color={COLORS.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Requests Section */}
        <View style={styles.requestsSection}>
          <Text style={[styles.sectionLabel, rtlStyles.sectionLabel]}>
            {t("listings.requests")}
          </Text>
          <View style={[styles.requestsGrid, rtlStyles.requestsGrid]}>
            {requestOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.requestCard}
                onPress={() => handleOptionPress(option.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.requestCardIconWrapper, rtlStyles.requestCardIconWrapper]}>
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={wp(6)}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.requestCardContent}>
                  <Text style={[styles.requestCardTitle, rtlStyles.requestCardTitle]}>
                    {getOptionTitle(option.id)}
                  </Text>
                  <Text 
                    style={[styles.requestCardDescription, rtlStyles.requestCardDescription]} 
                    numberOfLines={3}
                  >
                    {getOptionDescription(option.id)}
                  </Text>
                </View>
                <View style={[styles.requestCardArrow, rtlStyles.requestCardArrow]}>
                  <MaterialCommunityIcons
                    name={isRTL ? "arrow-left" : "arrow-right"}
                    size={wp(4.5)}
                    color={COLORS.primary}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2.5),
    paddingBottom: hp(6),
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: hp(3.5),
    paddingVertical: hp(1.5),
  },
  welcomeIconContainer: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(2.5),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  welcomeTitle: {
    fontSize: wp(5.2),
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: hp(0.8),
    textAlign: "center",
    letterSpacing: 0.3,
  },
  welcomeSubtitle: {
    fontSize: wp(3.6),
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: hp(2.4),
    paddingHorizontal: wp(2),
    fontWeight: "400",
  },
  mainCardContainer: {
    marginBottom: hp(3.5),
  },
  sectionLabel: {
    fontSize: wp(3),
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: hp(1.2),
    textTransform: "uppercase",
  },
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(4.5),
    padding: wp(5.5),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  mainCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mainCardIconWrapper: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp(4),
    flexShrink: 0,
  },
  mainCardTextContainer: {
    flex: 1,
    marginRight: wp(2),
    paddingTop: wp(0.5),
  },
  mainCardTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(0.6),
    lineHeight: hp(2.4),
  },
  mainCardDescription: {
    fontSize: wp(3.3),
    color: COLORS.textSecondary,
    lineHeight: hp(2.1),
    fontWeight: "400",
  },
  requestsSection: {
    marginTop: hp(0.5),
  },
  requestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: wp(3),
  },
  requestCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    padding: wp(4.5),
    marginBottom: hp(2.5),
    minHeight: hp(20),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  requestCardIconWrapper: {
    width: wp(13),
    height: wp(13),
    borderRadius: wp(6.5),
    backgroundColor: COLORS.activeChipBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(2),
  },
  requestCardContent: {
    flex: 1,
    paddingBottom: hp(4),
  },
  requestCardTitle: {
    fontSize: wp(3.7),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(1),
    lineHeight: hp(2.1),
    letterSpacing: 0.2,
  },
  requestCardDescription: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    lineHeight: hp(2),
    fontWeight: "400",
  },
  requestCardArrow: {
    position: "absolute",
    bottom: wp(4.5),
    right: wp(4.5),
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: COLORS.activeChipBackground,
    alignItems: "center",
    justifyContent: "center",
  },
});
