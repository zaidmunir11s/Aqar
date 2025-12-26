import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MapLandingScreen from "../../screens/listings/MapLandingScreen";
import PropertyDetailsScreen from "../../screens/listings/PropertyDetailsScreen";
import PropertyListScreen from "../../screens/listings/PropertyListScreen";
import AddListingScreen from "../../screens/listings/AddListingScreen";
import ProjectDetailsScreen from "../../screens/projects/ProjectDetailsScreen";

const Stack = createStackNavigator();

export default function ListingsStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapLanding" component={MapLandingScreen} />
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
      <Stack.Screen name="PropertyList" component={PropertyListScreen} />
      <Stack.Screen name="AddListing" component={AddListingScreen} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
    </Stack.Navigator>
  );
}
