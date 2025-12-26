import React, { useState } from "react";
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

type NavigationProp = NativeStackNavigationProp<any>;

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

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = CATEGORY_MAP[selectedTab];

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
            title="Choose Category"
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
                options={CATEGORY_TABS}
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
                        selected && styles.categoryTextSelected,
                      ]}
                    >
                      {category.text}
                    </Text>

                    <Ionicons
                      name="chevron-forward"
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
