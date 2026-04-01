import type { NavigatorScreenParams, ParamListBase } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  VerifyPhoneNumber: {
    phoneNumber: string;
    otp?: string;
  };
  ForgotPassword: undefined;
  ProfileDetail: undefined;
  UpdateProfile: undefined;
  ChangePassword: undefined;
  ChangePhoneNumber: undefined;
  UserProfileAds: undefined;
  PayBrokerCommission: undefined;
};

export type RootTabParamList = {
  ProfileTab: NavigatorScreenParams<AuthStackParamList> | undefined;
  Listings: NavigatorScreenParams<ParamListBase> | undefined;
  Projects: NavigatorScreenParams<ParamListBase> | undefined;
  Bookings: NavigatorScreenParams<ParamListBase> | undefined;
  Chat: NavigatorScreenParams<ParamListBase> | undefined;
  Services: undefined;
};

