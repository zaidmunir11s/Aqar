import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PROPERTY_DATA, DAILY_FILTER_OPTIONS } from "../../data/propertyData";
import { calculateDays } from "../../utils";
import { ScreenHeader, SingleButtonFooter } from "../../components";
import type { DailyProperty } from "../../types/property";
import type { CalendarDates } from "../../hooks/useCalendar";
import { COLORS } from "@/constants";
import { useLocalization } from "../../hooks/useLocalization";
import { translateAddress } from "../../utils/addressTranslation";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  propertyId: number;
  selectedDates?: CalendarDates;
}

export default function ReserveScreen(): React.JSX.Element {
  const route = useRoute();
  const params = route.params as RouteParams;
  const { propertyId, selectedDates } = params;
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();

  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(true); // Default checked
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const [keyboardHeightPx, setKeyboardHeightPx] = useState(0);

  // Move footer above keyboard and allow scroll when keyboard is visible
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (event) => {
      const h = event.endCoordinates.height;
      setKeyboardHeightPx(h);
      Animated.timing(keyboardHeight, {
        toValue: h,
        duration: event.duration ?? 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener(hideEvent, (event) => {
      setKeyboardHeightPx(0);
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: event.duration ?? 250,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardHeight]);

  const property = useMemo(
    () => PROPERTY_DATA.find((p) => p.id === propertyId) as DailyProperty | undefined,
    [propertyId]
  );

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleContinue = useCallback(() => {
    if (!isTermsAccepted) return;
    // Handle continue action
    console.log("Continue pressed");
  }, [isTermsAccepted]);

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

  // Format dates for display (keep numbers as Western numerals, not Arabic-Indic)
  const formattedCheckIn = useMemo(() => {
    if (!selectedDates?.startDate) return t("listings.notSelected");
    const date = new Date(selectedDates.startDate);
    const formatted = date.toLocaleDateString(isRTL ? "ar-SA" : "en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
    // Convert Arabic-Indic numerals (٠-٩) to Western numerals (0-9) if needed
    const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
    return formatted.replace(/[٠-٩]/g, (d) => arabicIndic.indexOf(d).toString());
  }, [selectedDates?.startDate, t, isRTL]);

  const formattedCheckOut = useMemo(() => {
    if (!selectedDates?.endDate) return t("listings.notSelected");
    const date = new Date(selectedDates.endDate);
    const formatted = date.toLocaleDateString(isRTL ? "ar-SA" : "en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
    // Convert Arabic-Indic numerals (٠-٩) to Western numerals (0-9) if needed
    const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
    return formatted.replace(/[٠-٩]/g, (d) => arabicIndic.indexOf(d).toString());
  }, [selectedDates?.endDate, t, isRTL]);

  // Calculate nights
  const nights = useMemo(() => {
    if (!selectedDates?.startDate || !selectedDates?.endDate) return 0;
    return calculateDays(selectedDates.startDate, selectedDates.endDate);
  }, [selectedDates]);

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
      bottomAddress: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      ruleRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      ruleLeftSection: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      ruleLabel: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      ruleValue: {
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

  // Calculate total price based on selected dates
  const totalPrice = useMemo(() => {
    if (!selectedDates?.startDate || !selectedDates?.endDate || !property) {
      return 0;
    }

    const days = calculateDays(selectedDates.startDate, selectedDates.endDate);
    const isMonthlyProperty = property.bookingType === "monthly";

    if (isMonthlyProperty) {
      if (days < 30) {
        return property.monthlyPrice ?? 0;
      } else {
        return Math.round((property.dailyPrice ?? 0) * days);
      }
    } else {
      return Math.round((property.dailyPrice ?? 0) * days);
    }
  }, [selectedDates, property]);

  if (!property) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={t("listings.reservationSummary")} onBackPress={handleBackPress} />
        <View style={[styles.center, rtlStyles.center]}>
          <Text style={rtlStyles.ruleLabel}>{t("listings.propertyNotFound")}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={t("listings.reservationSummary")} onBackPress={handleBackPress} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: hp(20) + keyboardHeightPx },
        ]}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
      >
        {/* Booking Card - Same as ContactHostScreen */}
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

                <Text numberOfLines={1} style={[styles.bottomAddress, rtlStyles.bottomAddress]}>
                  {translateAddress(property.address, t)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reservation Details Section - UnitRules style */}
        <View style={styles.reservationSection}>
          <View style={styles.rulesList}>
            <View style={styles.firstRow}>
              <View style={[styles.ruleRow, rtlStyles.ruleRow, { backgroundColor: "#fff" }]}>
                <View style={[styles.ruleLeftSection, rtlStyles.ruleLeftSection]}>
                  <Text style={[styles.ruleLabel, rtlStyles.ruleLabel]}>{t("listings.checkInDate")}</Text>
                </View>
                <View style={styles.ruleValueContainer}>
                  <Text style={[styles.ruleValue, rtlStyles.ruleValue]}>{formattedCheckIn}</Text>
                </View>
              </View>
            </View>
            <View>
              <View style={[styles.ruleRow, rtlStyles.ruleRow, { backgroundColor: "#ebf1f1" }]}>
                <View style={[styles.ruleLeftSection, rtlStyles.ruleLeftSection]}>
                  <Text style={[styles.ruleLabel, rtlStyles.ruleLabel]}>{t("listings.checkOutDate")}</Text>
                </View>
                <View style={styles.ruleValueContainer}>
                  <Text style={[styles.ruleValue, rtlStyles.ruleValue]}>{formattedCheckOut}</Text>
                </View>
              </View>
            </View>
            <View>
              <View style={[styles.ruleRow, rtlStyles.ruleRow, { backgroundColor: "#fff" }]}>
                <View style={[styles.ruleLeftSection, rtlStyles.ruleLeftSection]}>
                  <Text style={[styles.ruleLabel, rtlStyles.ruleLabel]}>{t("listings.nights")}</Text>
                </View>
                <View style={styles.ruleValueContainer}>
                  <Text style={[styles.ruleValue, rtlStyles.ruleValue]}>
                    {nights > 0 
                      ? nights === 1 
                        ? `1 ${t("listings.night")}`
                        : `${nights} ${t("listings.nights")}`
                      : `0 ${t("listings.nights")}`}
                  </Text>
                </View>
              </View>
            </View>
            <View>
              <View style={[styles.ruleRow, rtlStyles.ruleRow, { backgroundColor: "#ebf1f1" }]}>
                <View style={[styles.ruleLeftSection, rtlStyles.ruleLeftSection]}>
                  <Text style={[styles.ruleLabel, rtlStyles.ruleLabel]}>{t("listings.cancellationPossibility")}</Text>
                </View>
                <View style={styles.ruleValueContainer}>
                  <Text style={[styles.ruleValue, rtlStyles.ruleValue]}>{t("listings.nonrefundable")}</Text>
                </View>
              </View>
            </View>
            <View>
              <View style={[styles.ruleRow, rtlStyles.ruleRow, { backgroundColor: "#fff" }]}>
                <View style={[styles.ruleLeftSection, rtlStyles.ruleLeftSection]}>
                  <Text style={[styles.ruleLabel, rtlStyles.ruleLabel]}>{t("listings.insuranceAmount")}</Text>
                </View>
                <View style={styles.ruleValueContainer}>
                  <Text style={[styles.ruleValue, rtlStyles.ruleValue]}>0 {t("listings.riyals")}</Text>
                </View>
              </View>
            </View>
            <View style={styles.lastRow}>
              <View style={[styles.ruleRow, rtlStyles.ruleRow, { backgroundColor: "#ebf1f1" }]}>
                <View style={[styles.ruleLeftSection, rtlStyles.ruleLeftSection]}>
                  <Text style={[styles.ruleLabel, rtlStyles.ruleLabel]}>{t("listings.totalPrice")}</Text>
                </View>
                <View style={styles.ruleValueContainer}>
                  <Text style={[styles.ruleValue, styles.totalPriceValue, rtlStyles.ruleValue]}>
                    {totalPrice > 0 ? `${totalPrice} ${t("listings.sar")}` : `0 ${t("listings.sar")}`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Terms and Conditions Checkbox */}
        <View style={[styles.checkboxContainer, rtlStyles.checkboxContainer]}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              isTermsAccepted && styles.checkboxChecked,
              rtlStyles.checkbox,
            ]}
            onPress={() => setIsTermsAccepted(!isTermsAccepted)}
            activeOpacity={0.7}
          >
            {isTermsAccepted && (
              <Ionicons name="checkmark" size={wp(4.5)} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={[styles.checkboxText, rtlStyles.checkboxText]}>
            {t("listings.acceptTermsAndConditions")}
          </Text>
        </View>
      </ScrollView>

      <Animated.View style={[styles.footerWrapper, { bottom: keyboardHeight }]}>
        <SingleButtonFooter
          fixed={false}
          label={t("common.next")}
          onPress={handleContinue}
          disabled={!isTermsAccepted}
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
  footerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(20), // Space for footer
  },
  bookingCardContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
  },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: wp(4),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
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
  reservationSection: {
    backgroundColor: "#ebf1f1",
    paddingTop: hp(2),
    marginTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hp(1.5),
    paddingHorizontal: wp(4),
  },
  rulesList: {
    backgroundColor: "#ebf1f1",
  },
  ruleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  ruleLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ruleLabel: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
  },
  ruleValueContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleValue: {
    fontSize: wp(3.5),
    fontWeight: "500",
    color: "#111827",
  },
  firstRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  lastRow: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkboxContainer: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
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
  totalPriceValue: {
    color: COLORS.primary,
  },
});

