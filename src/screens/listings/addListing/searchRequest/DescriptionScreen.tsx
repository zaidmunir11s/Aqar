import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  Platform,
  Animated,
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
import { useLocalization } from "../../../../hooks/useLocalization";

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
  const { t, isRTL } = useLocalization();
  
  const [description, setDescription] = useState("");
  const [showCategoryError, setShowCategoryError] = useState(false);
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const footerHeightValue = useRef(new Animated.Value(hp(12))).current; // Approximate footer height

  // Check if category is selected
  const isCategorySelected = !!params.orderFormData?.category;

  // RTL-aware styles (only apply RTL-specific changes, preserve LTR styling)
  const rtlStyles = useMemo(
    () => ({
      sectionTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      errorContainer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      errorText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Listen to keyboard show/hide events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        // Set keyboard height to position footer just above keyboard
        Animated.timing(keyboardHeight, {
          toValue: event.endCoordinates.height,
          duration: event.duration || 250,
          useNativeDriver: false, // Can't use native driver for bottom positioning
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (event) => {
        // Reset keyboard height to 0 to bring footer back to original position
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: event.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardHeight]);

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
        title={t("listings.newOrder")}
        onBackPress={handleBackPress}
        fontWeightBold
        fontSize={wp(4.5)}
      />

      <View style={styles.content}>
        {/* Description Title */}
        <Text style={[styles.sectionTitle, rtlStyles.sectionTitle]}>{t("listings.description")}</Text>

        {/* Text Input Field */}
          <TextInput
          value={description}
          onChangeText={setDescription}
            placeholder={t("listings.descriptionPlaceholder")}
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
        <Animated.View
          style={[
            styles.errorContainer,
            rtlStyles.errorContainer,
            {
              bottom: Animated.add(keyboardHeight, footerHeightValue), // Position above footer
            },
          ]}
        >
          <Ionicons name="information-circle" size={wp(5)} color={COLORS.error} />
          <Text style={[styles.errorText, rtlStyles.errorText]}>{t("listings.invalidCategory")}</Text>
        </Animated.View>
      )}

      {/* Footer */}
      <Animated.View
        style={[
          styles.footerContainer,
          {
            bottom: keyboardHeight,
          },
        ]}
      >
        <ListingFooter
          currentStep={3}
          totalSteps={3}
          onBackPress={handleBackPress}
          onNextPress={handleSubmitPress}
          backText={t("common.back")}
          nextText={t("common.submit")}
          showBack={true}
          showNext={true}
        />
      </Animated.View>
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
    paddingBottom: hp(12), // Extra padding for footer
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
    position: "absolute",
    left: wp(5),
    right: wp(5),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    backgroundColor: COLORS.bgRed,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: wp(2),
    gap: wp(2),
    zIndex: 10,
  },
  errorText: {
    fontSize: wp(3.8),
    color: COLORS.error,
    fontWeight: "500",
  },
  footerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});
