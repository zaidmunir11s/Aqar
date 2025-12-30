import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader, ListingFooter, TextInput } from "../../../../components";
import { COLORS } from "@/constants";
import { useSearchRequest } from "@/context/searchRequest-context";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  selectedLocation?: { latitude: number; longitude: number };
  onlyAdsWithPhoto?: boolean;
  assistFromPartners?: boolean;
  orderFormData?: any;
}

export default function DescriptionScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;
  const { addRequest } = useSearchRequest();
  
  const [description, setDescription] = useState("");
  const [showCategoryError, setShowCategoryError] = useState(false);

  // Check if category is selected
  const isCategorySelected = !!params.orderFormData?.category;

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSubmitPress = async () => {
    // Always allow click, but validate
    if (!isCategorySelected) {
      setShowCategoryError(true);
      // Hide error after 3 seconds
      setTimeout(() => setShowCategoryError(false), 3000);
      return;
    }
    
    setShowCategoryError(false);
    
    try {
      await addRequest({
        category: params.orderFormData?.category || "",
        location: params.selectedLocation || { latitude: 0, longitude: 0 },
        description,
        onlyAdsWithPhoto: params.onlyAdsWithPhoto || false,
        assistFromPartners: params.assistFromPartners || false,
        orderFormData: params.orderFormData || {},
      });
      
      // Navigate back to SearchRequestScreen
      navigation.navigate("SearchRequest");
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <ScreenHeader
        title="New Order"
        onBackPress={handleBackPress}
        fontWeightBold
        fontSize={wp(4.5)}
      />

      <View style={styles.content}>
        {/* Description Title */}
        <Text style={styles.sectionTitle}>Description</Text>

        {/* Text Input Field */}
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Please enter any additional details about the desired property"
          multiline
          numberOfLines={10}
          containerStyle={styles.inputContainerStyle}
          inputWrapperStyle={styles.inputContainer}
          inputStyle={styles.textInput}
          showFocusStates={true}
        />

      </View>

      {/* Category Error Message - Positioned above footer */}
      {showCategoryError && (
        <View style={styles.errorContainer}>
          <Ionicons name="information-circle" size={wp(5)} color={COLORS.error} />
          <Text style={styles.errorText}>Invalid Category</Text>
        </View>
      )}

      {/* Footer */}
      <ListingFooter
        currentStep={3}
        totalSteps={3}
        onBackPress={handleBackPress}
        onNextPress={handleSubmitPress}
        backText="Back"
        nextText="Submit"
        showBack={true}
        showNext={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: hp(2),
  },
  inputContainerStyle: {
    marginBottom: 0,
  },
  inputContainer: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: wp(2),
    borderWidth: 1.2,
    borderColor: "#ccc",
    minHeight: hp(32),
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  textInput: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    minHeight: hp(40),
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
    marginHorizontal: wp(5),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    backgroundColor: COLORS.bgRed,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: wp(2),
    gap: wp(2),
  },
  errorText: {
    fontSize: wp(3.8),
    color: COLORS.error,
    fontWeight: "500",
  },
});
