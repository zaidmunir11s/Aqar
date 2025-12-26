import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
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
} from "../../../../components";
import { navigateToMapScreen } from "../../../../utils";
import { COLORS } from "../../../../constants";

type NavigationProp = NativeStackNavigationProp<any>;

export default function PublishLicenseAdvertisementScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const steps = [
    "Pay the service fee.",
    "Add real estate deed and ownership information.",
    "Approval of the real estate owner and agent on the Real Estate General Authority platform.",
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleClosePress = () => {
    setShowCancelModal(true);
  };

  const handleCancelBack = () => {
    setShowCancelModal(false);
  };

  const handleCancelYes = () => {
    setShowCancelModal(false);
    navigateToMapScreen(navigation);
  };

  const handleNextPress = () => {
    navigation.navigate("DeedOwnerInformation");
  };

  const handleFooterBackPress = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScreenHeader
        title="Publish & License Advertisement"
        onBackPress={handleBackPress}
        showRightSide={true}
        rightComponent={
          <TouchableOpacity
            onPress={handleClosePress}
            activeOpacity={0.7}
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
        {/* White Card Container */}
        <View style={styles.card}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../../../assets/images/aqar-license.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>
            Aqar issues advertisement licenses for owners and agents
          </Text>

          {/* Steps Section */}
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Steps:</Text>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Table Section */}
          <View style={styles.tableContainer}>
            {/* Header Row */}
            <View style={styles.headerRow}>
              <Text style={styles.headerText}>Listing Type</Text>
              <Text style={styles.headerText}>Price</Text>
              <Text style={styles.headerText}>Commission</Text>
            </View>

            {/* For Rent Row - with different background */}
            <View style={[styles.dataRow, styles.rentRow]}>
              <Text style={styles.dataText}>For Rent</Text>
              <Text style={styles.dataText}>After details</Text>
              <Text style={styles.dataText}>None</Text>
            </View>

            {/* For Sale Row */}
            <View style={styles.dataRow}>
              <Text style={styles.dataText}>For Sale</Text>
              <Text style={styles.dataText}>After details</Text>
              <Text style={styles.dataText}>None</Text>
            </View>
          </View>

          {/* Footer Note */}
          <Text style={styles.footerNote}>*</Text>
        </View>
      </ScrollView>

      <ListingFooter
        currentStep={1}
        totalSteps={2}
        onBackPress={handleFooterBackPress}
        onNextPress={handleNextPress}
        nextText="Continue"
        nextDisabled={false}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(2),
  },
  closeButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: wp(4),
    marginHorizontal: wp(4),
    marginTop: hp(2),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tableContainer: {
    marginTop: hp(2),
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerText: {
    flex: 1,
    fontSize: wp(3.8),
    fontWeight: "600",
    color: "#353f49",
  },
  dataRow: {
    flexDirection: "row",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  rentRow: {
    backgroundColor: "#f3f4f6",
  },
  dataText: {
    flex: 1,
    fontSize: wp(3.8),
    fontWeight: "400",
    color: "#353f49",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(2),
    paddingVertical: hp(2),
  },
  logo: {
    width: wp(50),
    height: hp(15),
  },
  heading: {
    fontSize: wp(4.2),
    fontWeight: "600",
    color: "#353f49",
    textAlign: "center",
    marginBottom: hp(2),
    lineHeight: hp(3),
  },
  stepsContainer: {
    marginTop: hp(1),
  },
  stepsTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#353f49",
    marginBottom: hp(1),
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp(1),
  },
  bulletPoint: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
    backgroundColor: COLORS.primary,
    marginTop: hp(0.8),
    marginRight: wp(2),
  },
  stepText: {
    flex: 1,
    fontSize: wp(3.8),
    fontWeight: "400",
    color: "#353f49",
    lineHeight: hp(2.5),
  },
  footerNote: {
    fontSize: wp(3.5),
    color: "#6b7280",
    marginTop: hp(1),
  },
});


