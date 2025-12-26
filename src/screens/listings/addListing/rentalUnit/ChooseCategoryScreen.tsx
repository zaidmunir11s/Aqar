import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader, ListingFooter, CancelModal } from "../../../../components";
import { navigateToMapScreen } from "../../../../utils";
import { COLORS } from "@/constants";
import { FOR_BOOKING_CATEGORIES as CATEGORIES } from "@/constants";

type NavigationProp = NativeStackNavigationProp<any>;

export default function ChooseCategoryScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleBackPress = () => navigation.goBack();

  const handleClosePress = () => setShowCancelModal(true);

  const handleCancelBack = () => setShowCancelModal(false);

  const handleCancelYes = () => {
    setShowCancelModal(false);
    navigateToMapScreen(navigation);
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleNextPress = () => {
    if (selectedCategory) {
      console.log("Selected category:", selectedCategory);
      // navigation.navigate("NextScreen");
    }
  };

  const handleBottomBackPress = () => navigation.goBack();

  const isSelected = (id: string) => selectedCategory === id;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Choose category"
        onBackPress={handleBackPress}
        showRightSide={true}
        rightComponent={
          <TouchableOpacity
            onPress={handleClosePress}
            activeOpacity={0.4}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={wp(6)} color={COLORS.primary} />
          </TouchableOpacity>
        }
        fontWeightBold={true}
        fontSize={wp(4.5)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          {CATEGORIES.map((category, index) => {
            const selected = isSelected(category.id);

            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  // Base alternating background
                  index % 2 === 0 ? styles.categoryItemWhite : styles.categoryItemAlt,
                  // Selected state overrides everything
                  selected && styles.categoryItemSelected,
                  // Border except last item
                  index < CATEGORIES.length - 1 && styles.categoryItemWithBorder,
                ]}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.5}
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

      <ListingFooter
        currentStep={1}
        totalSteps={4}
        onBackPress={handleBottomBackPress}
        onNextPress={handleNextPress}
        nextDisabled={!selectedCategory}
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
    backgroundColor: "#ebf1f1",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
    paddingBottom: hp(2),
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: wp(2.5),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
  // Selected style
  categoryItemSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    flex: 1,
  },
  categoryTextSelected: {
    color: "#fff", // White text when selected
    fontWeight: "400", // Optional: make it bold for emphasis
  },
  closeButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
});