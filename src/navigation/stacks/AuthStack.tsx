import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useIsAuthenticated } from "../../context/auth-context";
import LoginScreen from "../../screens/Auth/LoginScreen";
import CreateAccountScreen from "../../screens/Auth/CreateAccountScreen";
import VerifyPhoneNumberScreen from "../../screens/Auth/VerifyPhoneNumberScreen";
import ForgotPasswordScreen from "../../screens/Auth/ForgotPasswordScreen";
import ProfileDetailScreen from "../../screens/profile/ProfileDetailScreen";
import UpdateProfileScreen from "../../screens/profile/UpdateProfileScreen";
import ChangePasswordScreen from "../../screens/profile/ChangePasswordScreen";
import ChangePhoneNumberScreen from "../../screens/profile/ChangePhoneNumberScreen";
import UserProfileAdsScreen from "../../screens/profile/UserProfileAdsScreen";
import PayBrokerCommissionScreen from "../../screens/profile/PayBrokerCommissionScreen";

const Stack = createStackNavigator();

export default function AuthStack(): React.JSX.Element {
  const { isAuthenticated, isLoaded } = useIsAuthenticated();

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={isLoaded && isAuthenticated ? "ProfileDetail" : "Login"}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="VerifyPhoneNumber" component={VerifyPhoneNumberScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen
        name="ChangePhoneNumber"
        component={ChangePhoneNumberScreen}
      />
      <Stack.Screen name="UserProfileAds" component={UserProfileAdsScreen} />
      <Stack.Screen
        name="PayBrokerCommission"
        component={PayBrokerCommissionScreen}
      />
    </Stack.Navigator>
  );
}
