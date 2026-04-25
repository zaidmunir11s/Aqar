import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DailyScreen from "../../screens/listings/DailyScreen";
import DailyDetailScreen from "../../screens/listings/DailyDetailScreen";
import NearbyServicesScreen from "../../screens/listings/NearbyServicesScreen";
import ContactHostScreen from "../../screens/listings/ContactHostScreen";
import ReserveScreen from "../../screens/listings/ReserveScreen";
import PropertyDetailsScreen from "../../screens/listings/PropertyDetailsScreen";
import PropertyListScreen from "../../screens/listings/PropertyListScreen";
import BookingListScreen from "../../screens/listings/BookingListScreen";
import AddListingScreen from "../../screens/listings/AddListingScreen";
import ProjectDetailsScreen from "../../screens/projects/ProjectDetailsScreen";
import Step1LicenseScreen from "../../screens/listings/addListing/brokerListing/Step1LicenseScreen";
import BrokerIssueAdLicenseScreen from "../../screens/listings/addListing/brokerListing/BrokerIssueAdLicenseScreen";
import PublishLicenseAdvertisementScreen from "../../screens/listings/addListing/ownerAgentListing/PublishLicenseAdvertisementScreen";
import DeedOwnerInformationScreen from "../../screens/listings/addListing/ownerAgentListing/DeedOwnerInformationScreen";
import MarketingRequestPlaceholderScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestPlaceholderScreen";
import MarketingRequestMediaScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestMediaScreen";
import AttachMediaScreen from "../../screens/listings/addListing/marketingRequest/AttachMediaScreen";
import MarketingRequestAlbumsScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestAlbumsScreen";
import MarketingRequestAlbumAssetsScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestAlbumAssetsScreen";
import MarketingRequestAttachmentsScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestAttachmentsScreen";
import AddRentalUnitOnboardingScreen from "../../screens/listings/addListing/rentalUnit/AddRentalUnitOnboardingScreen";
import ChooseCategoryScreen from "../../screens/listings/addListing/rentalUnit/ChooseCategoryScreen";
import SearchRequestScreen from "../../screens/listings/addListing/searchRequest/SearchRequestScreen";
import NewOrderScreen from "../../screens/listings/addListing/searchRequest/NewOrderScreen";
import ChooseLocationScreen from "../../screens/listings/addListing/searchRequest/ChooseLocationScreen";
import DescriptionScreen from "../../screens/listings/addListing/searchRequest/DescriptionScreen";
import MatchedListingsScreen from "../../screens/listings/addListing/searchRequest/MatchedListingsScreen";
import ListingMediaScreen from "../../screens/listings/ListingMediaScreen";

const Stack = createNativeStackNavigator();

export default function DailyStack(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="BookingList"
    >
      <Stack.Screen name="BookingList" component={BookingListScreen} />
      <Stack.Screen name="DailyMap" component={DailyScreen} />
      <Stack.Screen name="DailyDetails" component={DailyDetailScreen} />
      <Stack.Screen name="ListingMedia" component={ListingMediaScreen} />
      <Stack.Screen name="NearbyServices" component={NearbyServicesScreen} />
      <Stack.Screen name="ContactHost" component={ContactHostScreen} />
      <Stack.Screen name="Reserve" component={ReserveScreen} />
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
      <Stack.Screen name="PropertyList" component={PropertyListScreen} />
      <Stack.Screen name="AddListing" component={AddListingScreen} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
      <Stack.Screen name="Licence" component={Step1LicenseScreen} />
      <Stack.Screen
        name="BrokerIssueAdLicense"
        component={BrokerIssueAdLicenseScreen}
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
