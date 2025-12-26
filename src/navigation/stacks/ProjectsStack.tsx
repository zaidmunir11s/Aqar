import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProjectsScreen from "../../screens/projects/ProjectsScreen";
import ProjectDetailsScreen from "../../screens/projects/ProjectDetailsScreen";
import PropertyListScreen from "../../screens/listings/PropertyListScreen";

const Stack = createStackNavigator();

export default function ProjectsStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectsMap" component={ProjectsScreen} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
      <Stack.Screen name="PropertyList" component={PropertyListScreen} />
    </Stack.Navigator>
  );
}
