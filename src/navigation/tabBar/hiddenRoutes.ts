import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

/**
 * Nested stack screens where the root tab bar should not show.
 * Keep in sync when adding full-screen flows under a tab stack.
 */
export const ROUTES_TO_HIDE_TAB_BAR: readonly string[] = [
  "Login",
  "CreateAccount",
  "PropertyDetails",
  "ListingMedia",
  "NearbyServices",
  "AveragePriceDetail",
  "AqarResidentialStats",
  "DailyDetails",
  "ContactHost",
  "Reserve",
  "ProjectDetails",
  "AddListing",
  "Licence",
  "BrokerIssueAdLicense",
  "BrokerGetFreeLicense",
  "PublishLicenseAdvertisement",
  "DeedOwnerInformation",
  "MarketingRequestPlaceholder",
  "MarketingRequestMedia",
  "AttachMedia",
  "MarketingRequestAlbums",
  "MarketingRequestAlbumAssets",
  "MarketingRequestAttachments",
  "MarketingRequestChooseLocation",
  "MarketingRequestPropertyDetails",
  "MarketingRequestPricingCommission",
  "MarketingRequestPublishAd",
  "AddRentalUnitOnboarding",
  "ChooseCategory",
  "SearchRequest",
  "NewOrder",
  "ChooseLocation",
  "Description",
  "MatchedListings",
  "ForgotPassword",
  "VerifyPhoneNumber",
  "UpdateProfile",
  "ChangePassword",
  "ChangePhoneNumber",
  "UserProfileAds",
  "Conversation",
  "DeveloperProfile",
];

const hiddenSet = new Set(ROUTES_TO_HIDE_TAB_BAR);

type FocusedRouteInput = Parameters<typeof getFocusedRouteNameFromRoute>[0];

export function shouldShowTabBar(route: FocusedRouteInput): boolean {
  const focusedName = getFocusedRouteNameFromRoute(route) ?? "";
  return !hiddenSet.has(focusedName);
}
