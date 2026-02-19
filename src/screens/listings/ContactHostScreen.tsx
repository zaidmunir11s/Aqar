import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
  Keyboard,
  Animated,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DAILY_FILTER_OPTIONS } from "../../data/propertyData";
import { calculateDays, getPropertyById } from "../../utils";
import { ScreenHeader, UnitRules, SingleButtonFooter } from "../../components";
import type { DailyProperty } from "../../types/property";
import type { CalendarDates } from "../../hooks/useCalendar";
import { COLORS } from "@/constants";
import { useLocalization, useTabNavigation } from "../../hooks";
import { translateAddress } from "../../utils/addressTranslation";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  propertyId: number;
  selectedDates?: CalendarDates;
}

export default function ContactHostScreen(): React.JSX.Element {
  const route = useRoute();
  const params = route.params as RouteParams;
  const { propertyId, selectedDates } = params;
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocalization();

  const [message, setMessage] = useState<string>("");
  const [isPledgeChecked, setIsPledgeChecked] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [keyboardHeightValue, setKeyboardHeightValue] = useState<number>(0);
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const { navigateToChat } = useTabNavigation();

  const property = useMemo(
    () => getPropertyById(propertyId) as DailyProperty | undefined,
    [propertyId]
  );

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);


  const handleSend = useCallback(() => {
    if (!isPledgeChecked || !property) return;
    
    // Create default message
    const defaultMessage = t("listings.inRegardOfAdNumber", { id: property.id });
    
    // Combine default message with user's custom message if they wrote something
    const combinedMessage = message.trim()
      ? `${defaultMessage}\n${message.trim()}`
      : defaultMessage;
    
    // Get advertiser name from property data, fallback to default (don't translate - keep as is)
    const advertiserName = property.advertiserName || "Property Owner";
    const advertiserId = property.advertiserId || `advertiser-${property.id}`;
    
    navigateToChat("Conversation", {
      propertyId: property.id,
      advertiserName,
      advertiserId,
      defaultMessage: combinedMessage,
    });
  }, [isPledgeChecked, message, property, navigateToChat, t]);

  // Listen to keyboard show/hide events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        setIsKeyboardVisible(true);
        const height = event.endCoordinates.height;
        setKeyboardHeightValue(height);
        // Set keyboard height to position footer just above keyboard
        Animated.timing(keyboardHeight, {
          toValue: height,
          duration: event.duration || 250,
          useNativeDriver: false, // Can't use native driver for bottom positioning
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (event) => {
        setIsKeyboardVisible(false);
        setKeyboardHeightValue(0);
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
  }, [keyboardHeight, insets.bottom]);

  // Function to get translated property type label
  const getPropertyTypeLabel = useCallback(() => {
    if (!property) return "";
    
    const type = property.type?.toLowerCase() || "";
    
    // Map property types to translation keys
    const typeMap: Record<string, string> = {
      "apartment": "apartmentForBooking",
      "villa": "villaForBooking",
      "studio": "studioForBooking",
      "chalet": "chaletForBooking",
      "lounge": "chaletForBooking",
      "tent": "tentForBooking",
      "farm": "farmForBooking",
      "hall": "hallForBooking",
    };
    
    const translationKey = typeMap[type];
    if (translationKey) {
      return t(`listings.propertyTypes.${translationKey}`);
    }
    
    // Fallback: try direct translation
    const directKey = `listings.propertyTypes.${type}`;
    const translated = t(directKey, { defaultValue: "" });
    if (translated && translated !== directKey) {
      return translated;
    }
    
    // Final fallback: use the label from DAILY_FILTER_OPTIONS or property type
    return DAILY_FILTER_OPTIONS.find((opt) => opt.type === property.type)?.label || property.type;
  }, [property, t]);

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      bookingTypeText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      contentRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      bottomCardImage: {
        marginRight: isRTL ? 0 : wp(3),
        marginLeft: isRTL ? wp(3) : 0,
      },
      bottomTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      bottomMetaRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      bottomMetaItem: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        marginRight: isRTL ? 0 : wp(4),
        marginLeft: isRTL ? wp(4) : 0,
      },
      bottomMetaText: {
        marginLeft: isRTL ? 0 : wp(1),
        marginRight: isRTL ? wp(1) : 0,
      },
      questionText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      input: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      checkboxContainer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      checkbox: {
        marginRight: isRTL ? 0 : wp(3),
        marginLeft: isRTL ? wp(3) : 0,
      },
      checkboxText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      center: {
        alignItems: "center" as const,
        justifyContent: "center" as const,
      },
    }),
    [isRTL]
  );

  if (!property) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={t("navigation.contactHost")} onBackPress={handleBackPress} />
        <View style={[styles.center, rtlStyles.center]}>
          <Text style={rtlStyles.questionText}>{t("listings.propertyNotFound")}</Text>
        </View>
      </View>
    );
  }

  // Calculate price based on selected dates
  const calculatedPrice = useMemo(() => {
    if (!selectedDates?.startDate || !selectedDates?.endDate || !property) {
      return null;
    }

    const days = calculateDays(selectedDates.startDate, selectedDates.endDate);
    const isMonthlyProperty = property.bookingType === "monthly";

    if (isMonthlyProperty) {
      if (days < 30) {
        return property.monthlyPrice ?? null;
      } else {
        return Math.round((property.dailyPrice ?? 0) * days);
      }
    } else {
      return Math.round((property.dailyPrice ?? 0) * days);
    }
  }, [selectedDates, property]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScreenHeader title={t("listings.contactHost")} onBackPress={handleBackPress} />
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingBottom: isKeyboardVisible 
              ? Math.max(keyboardHeightValue + hp(15), hp(30)) 
              : hp(12) 
          },
        ]}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        nestedScrollEnabled={true}
        scrollEnabled={true}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* Booking Card - Same as map card */}
        <View style={styles.bookingCardContainer}>
          <View style={styles.bookingCard}>
            {/* Booking Type on top */}
            <View style={styles.priceContainer}>
              <Text style={[styles.bottomPrice, styles.bookingTypeText, rtlStyles.bookingTypeText]}>
                {property.bookingType === "daily"
                  ? t("listings.daily")
                  : property.bookingType === "monthly"
                    ? t("listings.monthly")
                    : t("listings.weekly")}
              </Text>
            </View>

            {/* Image and details row */}
            <View style={[styles.contentRow, rtlStyles.contentRow]}>
              <Image
                source={{
                  uri:
                    property.images && property.images[0]
                      ? property.images[0]
                      : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                }}
                style={[styles.bottomCardImage, rtlStyles.bottomCardImage]}
                resizeMode="cover"
              />

              <View style={styles.bottomCardContent}>
                <Text style={[styles.bottomTitle, rtlStyles.bottomTitle]}>
                  {getPropertyTypeLabel()}
                </Text>

                <View style={[styles.bottomMetaRow, rtlStyles.bottomMetaRow]}>
                  <View style={[styles.bottomMetaItem, rtlStyles.bottomMetaItem]}>
                    <MaterialCommunityIcons
                      name="arrow-expand-horizontal"
                      size={wp(4)}
                      color="#9ca3af"
                    />
                    <Text style={[styles.bottomMetaText, rtlStyles.bottomMetaText]}>{property.area} {t("listings.m2")}</Text>
                  </View>
                  <View style={[styles.bottomMetaItem, rtlStyles.bottomMetaItem]}>
                    <FontAwesome name="bed" size={wp(4)} color="#9ca3af" />
                    <Text style={[styles.bottomMetaText, rtlStyles.bottomMetaText]}>
                      {property.bedrooms}
                    </Text>
                  </View>
                  <View style={[styles.bottomMetaItem, rtlStyles.bottomMetaItem]}>
                    <Ionicons name="person" size={wp(4)} color="#9ca3af" />
                    <Text style={[styles.bottomMetaText, rtlStyles.bottomMetaText]}>
                      {property.usage === "family" ? t("listings.family") : t("listings.single")}
                    </Text>
                  </View>
                </View>

                <Text numberOfLines={1} style={[styles.bottomAddress, rtlStyles.questionText]}>
                  {translateAddress(property.address, t)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Unit Rules */}
        <View style={styles.unitRulesContainer}>
          <UnitRules property={property} />
        </View>

        {/* Question Text */}
        <View style={styles.questionContainer}>
          <Text style={[styles.questionText, rtlStyles.questionText]}>
            {t("listings.doYouHaveAnyOtherQuestions")}
          </Text>
        </View>

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              isInputFocused && styles.inputFocused,
              rtlStyles.input,
            ]}
            placeholder={t("listings.writeDetailsHere")}
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={8}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
        </View>

        {/* Checkbox */}
        <View style={[styles.checkboxContainer, rtlStyles.checkboxContainer]}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              isPledgeChecked && styles.checkboxChecked,
              rtlStyles.checkbox,
            ]}
            onPress={() => setIsPledgeChecked(!isPledgeChecked)}
            activeOpacity={0.7}
          >
            {isPledgeChecked && (
              <Ionicons name="checkmark" size={wp(4.5)} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={[styles.checkboxText, rtlStyles.checkboxText]}>
            {t("listings.pledgeNotToShareCommunication")}
          </Text>
        </View>
      </ScrollView>

        {/* Footer with Send Button - Responsive to keyboard */}
        <Animated.View style={[styles.footerWrapper, { bottom: keyboardHeight }]}>
          <SingleButtonFooter
            fixed={false}
            label={t("chat.send")}
            onPress={handleSend}
            disabled={!isPledgeChecked}
          />
        </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: hp(2),
    paddingBottom: hp(12), // Space for footer
  },
  bookingCardContainer: {
    paddingHorizontal: wp(3),
    paddingBottom: hp(2),
  },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: wp(4),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.16,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
      },
      android: { elevation: 10 },
    }),
  },
  priceContainer: {
    paddingHorizontal: wp(3),
    paddingTop: wp(3),
    paddingBottom: hp(1),
  },
  bottomPrice: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  bookingTypeText: {
    color: "#0e856a",
    fontWeight: "700",
  },
  contentRow: {
    flexDirection: "row",
    paddingHorizontal: wp(3),
    paddingBottom: wp(3),
  },
  bottomCardImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
    backgroundColor: "#e5e7eb",
    marginRight: wp(3),
  },
  bottomCardContent: {
    flex: 1,
  },
  bottomTitle: {
    fontSize: wp(3.8),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hp(0.5),
  },
  bottomMetaRow: {
    flexDirection: "row",
    marginTop: hp(1),
  },
  bottomMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: wp(4),
  },
  bottomMetaText: {
    marginLeft: wp(1),
    fontSize: wp(3),
    color: "#6b7280",
  },
  bottomAddress: {
    marginTop: hp(1),
    fontSize: wp(3),
    color: "#4b5563",
  },
  unitRulesContainer: {
    paddingBottom: hp(2),
  },
  questionContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  questionText: {
    fontSize: wp(4.2),
    fontWeight: "500",
  },
  inputContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(3),
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: wp(2),
    padding: wp(4),
    fontSize: wp(3.8),
    minHeight: hp(18),
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  checkboxContainer: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    alignItems: "flex-start",
  },
  checkbox: {
    width: wp(5),
    height: wp(5),
    borderRadius: wp(1),
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "#fff",
    marginRight: wp(3),
    marginTop: hp(0.2),
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: wp(3.5),
    color: "#374151",
    lineHeight: hp(2.5),
  },
  footerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});

