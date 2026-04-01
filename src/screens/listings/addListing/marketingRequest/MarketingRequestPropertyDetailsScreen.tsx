import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import {
  ScreenHeader,
  ListingFooter,
  PropertyDetailsCategoryRenderer,
  CancelModal,
} from "../../../../components";
import { COLORS } from "@/constants";
import { useLocalization } from "../../../../hooks/useLocalization";
import { Ionicons } from "@expo/vector-icons";
import { PropertyDetailsDisplayItem } from "@/components/marketingRequestPropertyDetails/shared/CategoryFormProps";
import { navigateToMapScreen } from "../../../../utils";

type NavigationProp = NativeStackNavigationProp<any>;
type AttachmentItem = {
  id: string;
  uri: string;
  mediaType?: "photo" | "video" | "unknown";
  note?: string;
};
type RouteParams = {
  selectedCategory?: string;
  attachments?: AttachmentItem[];
  virtualTourLink?: string;
  /** Human-readable area/city (or modal selection) from choose-location step */
  locationDisplayName?: string;
  selectedLocation?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
};

const CATEGORIES_REQUIRING_STREET_DIRECTION = new Set([
  "sale-1",
  "sale-2",
  "sale-3",
  "sale-4",
  "sale-5",
  "sale-8",
  "sale-9",
  "rent-2",
  "rent-3",
  "rent-5",
  "rent-6",
  "rent-7",
  "rent-8",
  "rent-10",
  "rent-12",
]);

export default function MarketingRequestPropertyDetailsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { t } = useLocalization();
  const params = (route.params as RouteParams | undefined) ?? {};
  const selectedCategory = params.selectedCategory ?? "";
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [propertyDetailsItems, setPropertyDetailsItems] = useState<PropertyDetailsDisplayItem[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    setSubmitAttempted(false);
    setIsFormValid(!CATEGORIES_REQUIRING_STREET_DIRECTION.has(selectedCategory));
    setPropertyDetailsItems([]);
  }, [selectedCategory]);

  const handleClosePress = () => setShowCancelModal(true);
  const handleCancelBack = () => setShowCancelModal(false);
  const handleCancelYes = () => {
    setShowCancelModal(false);
    navigateToMapScreen(navigation);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.propertyDetails")}
        onBackPress={() => navigation.goBack()}
        showRightSide
        rightComponent={
          <TouchableOpacity onPress={handleClosePress} style={styles.closeButton}>
            <Ionicons name="close" size={wp(6)} color={COLORS.primary} />
          </TouchableOpacity>
        }
        titleFontWeight="700"
        fontSize={wp(5)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <PropertyDetailsCategoryRenderer
          selectedCategory={selectedCategory}
          submitAttempted={submitAttempted}
          onValidityChange={setIsFormValid}
          onFormDataChange={setPropertyDetailsItems}
        />
      </ScrollView>

      <ListingFooter
        currentStep={4}
        totalSteps={5}
        onBackPress={() => navigation.goBack()}
        onNextPress={() => {
          if (!isFormValid) {
            setSubmitAttempted(true);
            return;
          }
          navigation.navigate("MarketingRequestPricingCommission", {
            selectedCategory,
            attachments: params.attachments ?? [],
            virtualTourLink: params.virtualTourLink ?? "",
            selectedLocation: params.selectedLocation,
            locationDisplayName: params.locationDisplayName,
            propertyDetailsItems,
          });
        }}
        nextDisabled={submitAttempted && !isFormValid}
        backText={t("common.back")}
        nextText={t("common.next")}
      />
      <CancelModal
        visible={showCancelModal}
        onBack={handleCancelBack}
        onConfirm={handleCancelYes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  closeButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingVertical: wp(4),
  },
});
