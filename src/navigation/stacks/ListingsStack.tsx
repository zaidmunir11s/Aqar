import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MapLandingScreen from "../../screens/listings/MapLandingScreen";
import PropertyDetailsScreen from "../../screens/listings/PropertyDetailsScreen";
import DailyDetailScreen from "../../screens/listings/DailyDetailScreen";
import ContactHostScreen from "../../screens/listings/ContactHostScreen";
import PropertyListScreen from "../../screens/listings/PropertyListScreen";
import AddListingScreen from "../../screens/listings/AddListingScreen";
import ProjectDetailsScreen from "../../screens/projects/ProjectDetailsScreen";
import Step1LicenseScreen from "../../screens/listings/addListing/brokerListing/Step1LicenseScreen";
import Step2AdLicenseScreen from "../../screens/listings/addListing/brokerListing/Step2AdLicenseScreen";
import PublishLicenseAdvertisementScreen from "../../screens/listings/addListing/ownerAgentListing/PublishLicenseAdvertisementScreen";
import DeedOwnerInformationScreen from "../../screens/listings/addListing/ownerAgentListing/DeedOwnerInformationScreen";
import MarketingRequestPlaceholderScreen from "../../screens/listings/addListing/marketingRequest/MarketingRequestPlaceholderScreen";
import AddRentalUnitOnboardingScreen from "../../screens/listings/addListing/rentalUnit/AddRentalUnitOnboardingScreen";
import ChooseCategoryScreen from "../../screens/listings/addListing/rentalUnit/ChooseCategoryScreen";
import SearchRequestScreen from "../../screens/listings/addListing/searchRequest/SearchRequestScreen";
import NewOrderScreen from "../../screens/listings/addListing/searchRequest/NewOrderScreen";
import ChooseLocationScreen from "../../screens/listings/addListing/searchRequest/ChooseLocationScreen";
import DescriptionScreen from "../../screens/listings/addListing/searchRequest/DescriptionScreen";
import MatchedListingsScreen from "../../screens/listings/addListing/searchRequest/MatchedListingsScreen";



const Stack = createStackNavigator();

export default function ListingsStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapLanding" component={MapLandingScreen} />
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
      <Stack.Screen name="DailyDetails" component={DailyDetailScreen} />
      <Stack.Screen name="ContactHost" component={ContactHostScreen} />
      <Stack.Screen name="PropertyList" component={PropertyListScreen} />
      <Stack.Screen name="AddListing" component={AddListingScreen} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
      <Stack.Screen name="Licence" component={Step1LicenseScreen} />
      <Stack.Screen name="Step2AdLicense" component={Step2AdLicenseScreen} />
      <Stack.Screen name="PublishLicenseAdvertisement" component={PublishLicenseAdvertisementScreen} />
      <Stack.Screen name="DeedOwnerInformation" component={DeedOwnerInformationScreen} />
      <Stack.Screen name="MarketingRequestPlaceholder" component={MarketingRequestPlaceholderScreen} />
      <Stack.Screen name="AddRentalUnitOnboarding" component={AddRentalUnitOnboardingScreen} />
      <Stack.Screen name="ChooseCategory" component={ChooseCategoryScreen} />
      <Stack.Screen name="SearchRequest" component={SearchRequestScreen} />
      <Stack.Screen name="NewOrder" component={NewOrderScreen} />
      <Stack.Screen name="ChooseLocation" component={ChooseLocationScreen} />
      <Stack.Screen name="Description" component={DescriptionScreen} />
      <Stack.Screen name="MatchedListings" component={MatchedListingsScreen} />
    </Stack.Navigator>
  );
}
