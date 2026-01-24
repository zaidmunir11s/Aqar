import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import {
  ScreenHeader,
  ListingFooter,
  CancelModal,
  SegmentedControl,
} from "../../../../components";
import { navigateToMapScreen } from "../../../../utils";
import { COLORS } from "@/constants";

import {
  CATEGORY_TABS,
  ALL_CATEGORIES,
  FOR_SALE_CATEGORIES,
  FOR_RENT_CATEGORIES,
  TabType,
  CategoryItem,
} from "@/constants/categories";
import { useLocalization } from "../../../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

/**
 * Map category ID to translation key
 */
function getCategoryTranslationKey(categoryId: string): string {
  const categoryMap: Record<string, string> = {
    // For Sale
    "sale-1": "listings.propertyTypes.villaForSale",
    "sale-2": "listings.propertyTypes.landForSale",
    "sale-3": "listings.propertyTypes.apartmentForSale",
    "sale-4": "listings.propertyTypes.buildingForSale",
    "sale-5": "listings.propertyTypes.smallHouseForSale",
    "sale-6": "listings.propertyTypes.loungeForSale",
    "sale-7": "listings.propertyTypes.farmForSale",
    "sale-8": "listings.propertyTypes.storeForSale",
    "sale-9": "listings.propertyTypes.floorForSale",
    // For Rent
    "rent-1": "listings.propertyTypes.apartmentForRent",
    "rent-2": "listings.propertyTypes.villaForRent",
    "rent-3": "listings.propertyTypes.bigFlatForRent",
    "rent-4": "listings.propertyTypes.loungeForRent",
    "rent-5": "listings.propertyTypes.smallHouseForRent",
    "rent-6": "listings.propertyTypes.storeForRent",
    "rent-7": "listings.propertyTypes.buildingForRent",
    "rent-8": "listings.propertyTypes.landForRent",
    "rent-9": "listings.propertyTypes.roomForRent",
    "rent-10": "listings.propertyTypes.officeForRent",
    "rent-11": "listings.propertyTypes.tentForRent",
    "rent-12": "listings.propertyTypes.warehouseForRent",
    "rent-13": "listings.propertyTypes.chaletForRent",
  };
  return categoryMap[categoryId] || "";
}

/* ---------------------------------- */
/* CATEGORY MAP (SCALABLE & CLEAN)     */
/* ---------------------------------- */
const CATEGORY_MAP: Record<TabType, CategoryItem[]> = {
  ALL: ALL_CATEGORIES,
  "For Sale": FOR_SALE_CATEGORIES,
  "For Rent": FOR_RENT_CATEGORIES,
};

export default function MarketingRequestPlaceholderScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = CATEGORY_MAP[selectedTab];

  // Translate tab options
  const translatedTabs = useMemo(
    () =>
      CATEGORY_TABS.map((tab) => {
        if (tab === "ALL") return t("listings.all");
        if (tab === "For Sale") return t("listings.forSale");
        if (tab === "For Rent") return t("listings.forRent");
        return tab;
      }),
    [t]
  );

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      categoryItem: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      categoryText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  /* ------------------ */
  /* Navigation Handlers */
  /* ------------------ */
  const handleBackPress = () => setShowCancelModal(true);
  const handleClosePress = () => setShowCancelModal(true);
  const handleCancelBack = () => setShowCancelModal(false);

  const handleCancelYes = () => {
    setShowCancelModal(false);
    navigateToMapScreen(navigation);
  };

  const handleFooterBackPress = () => setShowCancelModal(true);

  const handleNextPress = () => {
    if (!selectedCategory) return;
    console.log("Selected category:", selectedCategory);
    // navigate to next step
  };

  /* ------------------ */
  /* Tab & Category */
  /* ------------------ */
  const handleTabPress = (index: number) => {
    setSelectedTab(CATEGORY_TABS[index]);
    // setSelectedCategory(null); // enable if you want reset on tab change
  };

  const getSelectedTabIndex = (): number =>
    CATEGORY_TABS.indexOf(selectedTab);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const isSelected = (id: string) => selectedCategory === id;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* HEADER */}
          <ScreenHeader
            title={t("listings.chooseCategory")}
            onBackPress={handleBackPress}
            showRightSide
            rightComponent={
              <TouchableOpacity
                onPress={handleClosePress}
                activeOpacity={0.7}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={wp(6)}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            }
            fontWeightBold
            fontSize={wp(4.5)}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            <View style={styles.tabBarContainer}>
              <SegmentedControl
                options={translatedTabs}
                selectedIndex={getSelectedTabIndex()}
                onSelect={handleTabPress}
              />
            </View>

            {/* CATEGORY LIST */}
            <View style={styles.cardContainer}>
              {categories.map((category, index) => {
                const selected = isSelected(category.id);

                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      rtlStyles.categoryItem,
                      index % 2 === 0
                        ? styles.categoryItemWhite
                        : styles.categoryItemAlt,
                      selected && styles.categoryItemSelected,
                      index < categories.length - 1 &&
                        styles.categoryItemWithBorder,
                    ]}
                    onPress={() => handleCategoryPress(category.id)}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        rtlStyles.categoryText,
                        selected && styles.categoryTextSelected,
                      ]}
                    >
                      {getCategoryTranslationKey(category.id)
                        ? t(getCategoryTranslationKey(category.id))
                        : category.text}
                    </Text>

                    <Ionicons
                      name={isRTL ? "chevron-back" : "chevron-forward"}
                      size={wp(5)}
                      color={selected ? "#fff" : COLORS.primary}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      <ListingFooter
        currentStep={1}
        totalSteps={5}
        onBackPress={handleFooterBackPress}
        onNextPress={handleNextPress}
        nextDisabled={!selectedCategory}
        backText={t("common.back")}
        nextText={t("common.next")}
      />

      <CancelModal
        visible={showCancelModal}
        onBack={handleCancelBack}
        onConfirm={handleCancelYes}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebf1f1",
  },
  closeButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  tabBarContainer: {
    paddingHorizontal: wp(1),
    paddingTop: hp(2),
    paddingBottom: hp(1),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: wp(2.5),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
  },
  categoryItemWhite: {
    backgroundColor: COLORS.white,
  },
  categoryItemAlt: {
    backgroundColor: "#ebf1f1",
  },
  categoryItemWithBorder: {
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.border,
  },
  categoryItemSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    flex: 1,
  },
  categoryTextSelected: {
    color: "#fff",
    fontWeight: "400",
  },
});
