import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MapLandingScreen from "../../screens/listings/MapLandingScreen";
import PropertyDetailsScreen from "../../screens/listings/PropertyDetailsScreen";
import NearbyServicesScreen from "../../screens/listings/NearbyServicesScreen";
import AveragePriceDetailScreen from "../../screens/listings/AveragePriceDetailScreen";
import AqarResidentialStatsScreen from "../../screens/listings/AqarResidentialStatsScreen";
import DailyDetailScreen from "../../screens/listings/DailyDetailScreen";
import ContactHostScreen from "../../screens/listings/ContactHostScreen";
import ReserveScreen from "../../screens/listings/ReserveScreen";
import PropertyListScreen from "../../screens/listings/PropertyListScreen";
import AddListingScreen from "../../screens/listings/AddListingScreen";
import TodayAdsScreen from "../../screens/listings/TodayAdsScreen";
import ProjectDetailsScreen from "../../screens/projects/ProjectDetailsScreen";
import DeveloperProfileScreen from "../../screens/projects/DeveloperProfileScreen";
import UserProfileAdsScreen from "../../screens/profile/UserProfileAdsScreen";
import Step1LicenseScreen from "../../screens/listings/addListing/brokerListing/Step1LicenseScreen";
import BrokerIssueAdLicenseScreen from "../../screens/listings/addListing/brokerListing/BrokerIssueAdLicenseScreen";
import BrokerGetFreeLicenseScreen from "../../screens/listings/addListing/brokerListing/BrokerGetFreeLicenseScreen";
import PublishLicenseAdvertisementScreen from "../../screens/listings/addListing/ownerAgentListing/PublishLicenseAdvertisementScreen";
import DeedOwnerInformationScreen from "../../screens/listings/addListing/ownerAgentListing/DeedOwnerInformationScreen";
import MarketingRequestPlaceholderScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestPlaceholderScreen";
import MarketingRequestMediaScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestMediaScreen";
import AttachMediaScreen from "../../screens/listings/addListing/marketingRequest/AttachMediaScreen";
import MarketingRequestAlbumsScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestAlbumsScreen";
import MarketingRequestAlbumAssetsScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestAlbumAssetsScreen";
import MarketingRequestAttachmentsScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestAttachmentsScreen";
import MarketingRequestChooseLocationScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestChooseLocationScreen";
import MarketingRequestPropertyDetailsScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestPropertyDetailsScreen";
import MarketingRequestPricingCommissionScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestPricingCommissionScreen";
import MarketingRequestPublishAdScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestPublishAdScreen";
import AddRentalUnitOnboardingScreen from "../../screens/listings/addListing/rentalUnit/AddRentalUnitOnboardingScreen";
import ChooseCategoryScreen from "../../screens/listings/addListing/rentalUnit/ChooseCategoryScreen";
import SearchRequestScreen from "../../screens/listings/addListing/searchRequest/SearchRequestScreen";
import NewOrderScreen from "../../screens/listings/addListing/searchRequest/NewOrderScreen";
import ChooseLocationScreen from "../../screens/listings/addListing/searchRequest/ChooseLocationScreen";
import DescriptionScreen from "../../screens/listings/addListing/searchRequest/DescriptionScreen";
import MatchedListingsScreen from "../../screens/listings/addListing/searchRequest/MatchedListingsScreen";
import ConversationScreen from "../../screens/chat/ConversationScreen";
import ListingMediaScreen from "../../screens/listings/ListingMediaScreen";

const Stack = createNativeStackNavigator();

export default function ListingsStack(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // Avoid native multi-pop / back-menu desync: "removed natively but didn't get removed from JS state"
        headerBackButtonMenuEnabled: false,
      }}
    >
      <Stack.Screen
        name="MapLanding"
        component={MapLandingScreen}
        options={{
          headerBackButtonMenuEnabled: false,
          // Root stack card: disable full-screen back gesture so iOS doesn’t native-pop past JS stack state.
          fullScreenGestureEnabled: false,
        }}
      />
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
      <Stack.Screen name="ListingMedia" component={ListingMediaScreen} />
      <Stack.Screen name="NearbyServices" component={NearbyServicesScreen} />
      <Stack.Screen
        name="AveragePriceDetail"
        component={AveragePriceDetailScreen}
      />
      <Stack.Screen
        name="AqarResidentialStats"
        component={AqarResidentialStatsScreen}
      />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      <Stack.Screen name="UserProfileAds" component={UserProfileAdsScreen} />
      <Stack.Screen name="DailyDetails" component={DailyDetailScreen} />
      <Stack.Screen name="ContactHost" component={ContactHostScreen} />
      <Stack.Screen name="Reserve" component={ReserveScreen} />
      <Stack.Screen name="PropertyList" component={PropertyListScreen} />
      <Stack.Screen name="TodayAds" component={TodayAdsScreen} />
      <Stack.Screen name="AddListing" component={AddListingScreen} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
      <Stack.Screen
        name="DeveloperProfile"
        component={DeveloperProfileScreen}
      />
      <Stack.Screen name="Licence" component={Step1LicenseScreen} />
      <Stack.Screen
        name="BrokerIssueAdLicense"
        component={BrokerIssueAdLicenseScreen}
      />
      <Stack.Screen
        name="BrokerGetFreeLicense"
        component={BrokerGetFreeLicenseScreen}
      />
      <Stack.Screen
        name="PublishLicenseAdvertisement"
        component={PublishLicenseAdvertisementScreen}
      />
      <Stack.Screen
        name="DeedOwnerInformation"
        component={DeedOwnerInformationScreen}
      />
      <Stack.Screen
        name="MarketingRequestPlaceholder"
        component={MarketingRequestPlaceholderScreen}
      />
      <Stack.Screen
        name="MarketingRequestMedia"
        component={MarketingRequestMediaScreen}
      />
      <Stack.Screen name="AttachMedia" component={AttachMediaScreen} />
      <Stack.Screen
        name="MarketingRequestAlbums"
        component={MarketingRequestAlbumsScreen}
      />
      <Stack.Screen
        name="MarketingRequestAlbumAssets"
        component={MarketingRequestAlbumAssetsScreen}
      />
      <Stack.Screen
        name="MarketingRequestAttachments"
        component={MarketingRequestAttachmentsScreen}
      />
      <Stack.Screen
        name="MarketingRequestChooseLocation"
        component={MarketingRequestChooseLocationScreen}
      />
      <Stack.Screen
        name="MarketingRequestPropertyDetails"
        component={MarketingRequestPropertyDetailsScreen}
      />
      <Stack.Screen
        name="MarketingRequestPricingCommission"
        component={MarketingRequestPricingCommissionScreen}
      />
      <Stack.Screen
        name="MarketingRequestPublishAd"
        component={MarketingRequestPublishAdScreen}
      />
      <Stack.Screen
        name="AddRentalUnitOnboarding"
        component={AddRentalUnitOnboardingScreen}
      />
      <Stack.Screen name="ChooseCategory" component={ChooseCategoryScreen} />
      <Stack.Screen name="SearchRequest" component={SearchRequestScreen} />
      <Stack.Screen name="NewOrder" component={NewOrderScreen} />
      <Stack.Screen name="ChooseLocation" component={ChooseLocationScreen} />
      <Stack.Screen name="Description" component={DescriptionScreen} />
      <Stack.Screen name="MatchedListings" component={MatchedListingsScreen} />
    </Stack.Navigator>
  );
}
