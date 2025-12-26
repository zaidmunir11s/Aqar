import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../../screens/Auth/LoginScreen";
import CreateAccountScreen from "../../screens/Auth/CreateAccountScreen";

const Stack = createStackNavigator();

export default function AuthStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
    </Stack.Navigator>
  );
}
