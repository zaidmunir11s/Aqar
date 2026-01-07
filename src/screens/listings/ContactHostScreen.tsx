import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
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
import { ScreenHeader, UnitRules } from "../../components";
import type { DailyProperty } from "../../types/property";
import type { CalendarDates } from "../../hooks/useCalendar";
import { COLORS } from "@/constants";

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

  const [message, setMessage] = useState<string>("");
  const [isPledgeChecked, setIsPledgeChecked] = useState<boolean>(false);

  const property = useMemo(
    () => PROPERTY_DATA.find((p) => p.id === propertyId) as DailyProperty | undefined,
    [propertyId]
  );

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleBookingCardPress = useCallback(() => {
    // Touchable but doesn't navigate anywhere
    console.log("Booking card pressed");
  }, []);

  const handleSend = useCallback(() => {
    if (!isPledgeChecked || !message.trim()) return;
    console.log("Send message:", message);
    // TODO: Implement send message functionality
  }, [isPledgeChecked, message]);

  if (!property) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Contact Host" onBackPress={handleBackPress} />
        <View style={styles.center}>
          <Text>Property not found</Text>
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
    <View style={styles.container}>
      <ScreenHeader title="Contact Host" onBackPress={handleBackPress} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking Card - Same as map card */}
        <View style={styles.bookingCardContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleBookingCardPress}
            style={styles.bookingCard}
          >
            {/* Price on top */}
            <View style={styles.priceContainer}>
              <Text
                style={[
                  styles.bottomPrice,
                  !calculatedPrice && styles.bookingTypeText,
                ]}
              >
                {calculatedPrice
                  ? `${calculatedPrice} SAR`
                  : property.bookingType === "daily"
                    ? "Daily"
                    : "Monthly"}
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
          </TouchableOpacity>
        </View>

        {/* Unit Rules */}
        <View style={styles.unitRulesContainer}>
          <UnitRules property={property} />
        </View>

        {/* Question Text */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            Do you have any other questions?
          </Text>
        </View>

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write details here..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={8}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />
        </View>

        {/* Checkbox */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setIsPledgeChecked(!isPledgeChecked)}
            activeOpacity={0.7}
          >
            {isPledgeChecked ? (
              <Ionicons name="checkbox" size={wp(6)} color={COLORS.primary} />
            ) : (
              <Ionicons
                name="checkbox-outline"
                size={wp(6)}
                color="#9ca3af"
              />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            I pledge not to share any means of communication outside the Aqar
            platform before completing the booking process.
          </Text>
        </View>

        {/* Extra spacing for footer */}
        <View style={{ height: hp(12) }} />
      </ScrollView>

      {/* Footer with Send Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!isPledgeChecked || !message.trim()) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!isPledgeChecked || !message.trim()}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.sendButtonText,
              (!isPledgeChecked || !message.trim()) &&
                styles.sendButtonTextDisabled,
            ]}
          >
            Send
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
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: hp(2),
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

    
  },
  checkboxContainer: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    alignItems: "flex-start",
  },
  checkbox: {
    marginRight: wp(3),
    marginTop: hp(0.2),
  },
  checkboxText: {
    flex: 1,
    fontSize: wp(3.5),
    color: "#374151",
    lineHeight: hp(2.5),
  },
  footer: {
    backgroundColor: "#fff",
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(3),
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
  sendButton: {
    backgroundColor: COLORS.modalButton,
    paddingVertical: hp(2),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  sendButtonText: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#fff",
  },
  sendButtonTextDisabled: {
    color: COLORS.textDisabled,
  },
});

