import React, { useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PROPERTY_DATA, DAILY_FILTER_OPTIONS } from "../../data/propertyData";
import { calculateDays } from "../../utils";
import { ScreenHeader } from "../../components";
import type { DailyProperty } from "../../types/property";
import type { CalendarDates } from "../../hooks/useCalendar";
import { COLORS } from "@/constants";

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
  const insets = useSafeAreaInsets();

  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(true); // Default checked

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

  // Format dates for display
  const formattedCheckIn = useMemo(() => {
    if (!selectedDates?.startDate) return "Not selected";
    const date = new Date(selectedDates.startDate);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  }, [selectedDates?.startDate]);

  const formattedCheckOut = useMemo(() => {
    if (!selectedDates?.endDate) return "Not selected";
    const date = new Date(selectedDates.endDate);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  }, [selectedDates?.endDate]);

  // Calculate nights
  const nights = useMemo(() => {
    if (!selectedDates?.startDate || !selectedDates?.endDate) return 0;
    return calculateDays(selectedDates.startDate, selectedDates.endDate);
  }, [selectedDates]);

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
        <ScreenHeader title="Reservation Summary" onBackPress={handleBackPress} />
        <View style={styles.center}>
          <Text>Property not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Reservation Summary" onBackPress={handleBackPress} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Booking Card - Same as ContactHostScreen */}
        <View style={styles.bookingCardContainer}>
          <View style={styles.bookingCard}>
            {/* Booking Type on top */}
            <View style={styles.priceContainer}>
              <Text style={[styles.bottomPrice, styles.bookingTypeText]}>
                {property.bookingType === "daily"
                  ? "Daily"
                  : property.bookingType === "monthly"
                    ? "Monthly"
                    : "Weekly"}
              </Text>
            </View>

            {/* Image and details row */}
            <View style={styles.contentRow}>
              <Image
                source={{
                  uri:
                    property.images && property.images[0]
                      ? property.images[0]
                      : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                }}
                style={styles.bottomCardImage}
                resizeMode="cover"
              />

              <View style={styles.bottomCardContent}>
                <Text style={styles.bottomTitle}>
                  {DAILY_FILTER_OPTIONS.find((opt) => opt.type === property.type)
                    ?.label || property.type}
                </Text>

                <View style={styles.bottomMetaRow}>
                  <View style={styles.bottomMetaItem}>
                    <MaterialCommunityIcons
                      name="arrow-expand-horizontal"
                      size={wp(4)}
                      color="#9ca3af"
                    />
                    <Text style={styles.bottomMetaText}>{property.area} m2</Text>
                  </View>
                  <View style={styles.bottomMetaItem}>
                    <FontAwesome name="bed" size={wp(4)} color="#9ca3af" />
                    <Text style={styles.bottomMetaText}>
                      {property.bedrooms}
                    </Text>
                  </View>
                  <View style={styles.bottomMetaItem}>
                    <Ionicons name="person" size={wp(4)} color="#9ca3af" />
                    <Text style={styles.bottomMetaText}>
                      {property.usage === "family" ? "Family" : "Single"}
                    </Text>
                  </View>
                </View>

                <Text numberOfLines={1} style={styles.bottomAddress}>
                  {property.address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reservation Details Section - UnitRules style */}
        <View style={styles.reservationSection}>
          <View style={styles.rulesList}>
            <View style={styles.firstRow}>
              <View style={[styles.ruleRow, { backgroundColor: "#fff" }]}>
                <View style={styles.ruleLeftSection}>
                  <Text style={styles.ruleLabel}>Check-in Date</Text>
                </View>
                <View style={styles.ruleValueContainer}>
                  <Text style={styles.ruleValue}>{formattedCheckIn}</Text>
                </View>
              </View>
            </View>
            <View>
              <View style={[styles.ruleRow, { backgroundColor: "#ebf1f1" }]}>
                <View style={styles.ruleLeftSection}>
                  <Text style={styles.ruleLabel}>Check-out Date</Text>
                </View>
                <View style={styles.ruleValueContainer}>
                  <Text style={styles.ruleValue}>{formattedCheckOut}</Text>
                </View>
              </View>
            </View>
            <View>
              <View style={[styles.ruleRow, { backgroundColor: "#fff" }]}>
                <View style={styles.ruleLeftSection}>
                  <Text style={styles.ruleLabel}>Night(s)</Text>
                </View>
                <View style={styles.ruleValueContainer}>
                  <Text style={styles.ruleValue}>
                    {nights > 0 ? `${nights} Night${nights > 1 ? "s" : ""}` : "0 Nights"}
                  </Text>
                </View>
              </View>
            </View>
            <View>
              <View style={[styles.ruleRow, { backgroundColor: "#ebf1f1" }]}>
                <View style={styles.ruleLeftSection}>
                  <Text style={styles.ruleLabel}>Cancelation possibility</Text>
                </View>
                <View style={styles.ruleValueContainer}>
                  <Text style={styles.ruleValue}>Nonrefundable</Text>
                </View>
              </View>
            </View>
            <View>
              <View style={[styles.ruleRow, { backgroundColor: "#fff" }]}>
                <View style={styles.ruleLeftSection}>
                  <Text style={styles.ruleLabel}>Insurance Amount</Text>
                </View>
                <View style={styles.ruleValueContainer}>
                  <Text style={styles.ruleValue}>0 Riyals</Text>
                </View>
              </View>
            </View>
            <View style={styles.lastRow}>
              <View style={[styles.ruleRow, { backgroundColor: "#ebf1f1" }]}>
                <View style={styles.ruleLeftSection}>
                  <Text style={styles.ruleLabel}>Total price</Text>
                </View>
                <View style={styles.ruleValueContainer}>
                  <Text style={[styles.ruleValue, styles.totalPriceValue]}>
                    {totalPrice > 0 ? `${totalPrice} SAR` : "0 SAR"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Terms and Conditions Checkbox */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              isTermsAccepted && styles.checkboxChecked,
            ]}
            onPress={() => setIsTermsAccepted(!isTermsAccepted)}
            activeOpacity={0.7}
          >
            {isTermsAccepted && (
              <Ionicons name="checkmark" size={wp(4.5)} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            I accept the terms and conditions for the instant rental service.
          </Text>
        </View>
      </ScrollView>

      {/* Footer with Continue Button */}
      <View style={[styles.footer]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isTermsAccepted && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isTermsAccepted}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.continueButtonText,
              !isTermsAccepted && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: -2 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(1),
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  continueButtonText: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#fff",
  },
  continueButtonTextDisabled: {
    color: COLORS.textDisabled,
  },
  totalPriceValue: {
    color: COLORS.primary,
  },
});

