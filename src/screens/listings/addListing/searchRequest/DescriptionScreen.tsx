import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  StackActions,
} from "@react-navigation/native";
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

/** Footer content height (progress + buttons + padding) so error sits just above it */
const FOOTER_CONTENT_HEIGHT = hp(8.5);
const ERROR_GAP_ABOVE_FOOTER = hp(0.8);

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

  const insets = useSafeAreaInsets();
  const [description, setDescription] = useState("");
  const [showCategoryError, setShowCategoryError] = useState(false);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const footerOffset = useRef(
    new Animated.Value(FOOTER_CONTENT_HEIGHT + ERROR_GAP_ABOVE_FOOTER + 0),
  ).current;

  useEffect(() => {
    const total =
      FOOTER_CONTENT_HEIGHT + ERROR_GAP_ABOVE_FOOTER + insets.bottom;
    footerOffset.setValue(total);
  }, [insets.bottom, footerOffset]);

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
    [isRTL],
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
      },
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
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardHeight]);

  const handleSubmitPress = useCallback(async () => {
    // Always allow click, but validate
    if (!isCategorySelected) {
      setShowCategoryError(true);
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(
        () => setShowCategoryError(false),
        3000,
      );
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

      // Pop NewOrder, ChooseLocation, Description so back button doesn't return to this flow
      navigation.dispatch(StackActions.pop(3));
    } catch (error) {
      if (__DEV__) {
        console.warn("Error submitting request:", error);
      }
    }
  }, [
    isCategorySelected,
    addRequest,
    params.orderFormData,
    params.selectedLocation,
    params.onlyAdsWithPhoto,
    params.assistFromPartners,
    description,
    navigation,
  ]);

  useEffect(
    () => () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    },
    [],
  );

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
        <Text style={[styles.sectionTitle, rtlStyles.sectionTitle]}>
          {t("listings.description")}
        </Text>

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

      {/* Category Error Message - Positioned just above footer */}
      {showCategoryError && (
        <Animated.View
          style={[
            styles.errorContainer,
            rtlStyles.errorContainer,
            {
              bottom: Animated.add(keyboardHeight, footerOffset),
            },
          ]}
        >
          <Ionicons
            name="information-circle"
            size={wp(5)}
            color={COLORS.error}
          />
          <Text style={[styles.errorText, rtlStyles.errorText]}>
            {t("listings.invalidCategory")}
          </Text>
        </Animated.View>
      )}

      {/* Footer */}
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
    paddingBottom: hp(14), // Space for footer + error strip
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
    left: wp(4),
    right: wp(4),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
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
});
