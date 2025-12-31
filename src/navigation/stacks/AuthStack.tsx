import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../../screens/Auth/LoginScreen";
import CreateAccountScreen from "../../screens/Auth/CreateAccountScreen";
import ForgotPasswordScreen from "../../screens/Auth/ForgotPasswordScreen";
import ProfileDetailScreen from "../../screens/profile/ProfileDetailScreen";
import UpdateProfileScreen from "../../screens/profile/UpdateProfileScreen";
import UserProfileAdsScreen from "../../screens/profile/UserProfileAdsScreen";
import PayBrokerCommissionScreen from "../../screens/profile/PayBrokerCommissionScreen";

const Stack = createStackNavigator();

export default function AuthStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
      <Stack.Screen name="UserProfileAds" component={UserProfileAdsScreen} />
      <Stack.Screen
        name="PayBrokerCommission"
        component={PayBrokerCommissionScreen}
      />
    </Stack.Navigator>
  );
}
