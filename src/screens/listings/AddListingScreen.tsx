import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader, ListingOptionCard } from "../../components";
import { ADD_SCREEN_SERVICES_LISTING } from "@/constants";

type NavigationProp = NativeStackNavigationProp<any>;

interface ListingOption {
  id: string;
  icon: string;
  iconLibrary?: "Ionicons" | "MaterialCommunityIcons";
  title: string;
  description: string;
  onPress: () => void;
}

export default function AddListingScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  const handleBackPress = () => {
    // Navigate back - will go to appropriate map screen based on which stack we're in
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Try to navigate to the appropriate map screen
      try {
        navigation.navigate("DailyMap");
      } catch {
        try {
          navigation.navigate("ProjectsMap");
        } catch {
          try {
    navigation.navigate("MapLanding");
          } catch {
            // If none work, just go back
            navigation.goBack();
          }
        }
      }
    }
  };

  const handleSavePress = () => {
    console.log("Save listing");
  };

  const handleOptionPress = (optionId: string) => {
    if (optionId === "broker-listing") {
      navigation.navigate("Licence");
    } else if (optionId === "owner-agent-listing") {
      navigation.navigate("PublishLicenseAdvertisement");
    } else if (optionId === "rental-unit") {
      navigation.navigate("AddRentalUnitOnboarding");
    } else if(optionId === "marketing-request") {
      navigation.navigate("MarketingRequestPlaceholder");
    } else if(optionId === "search-request") {
      navigation.navigate("SearchRequest");
    }

    // Navigate to appropriate screen based on option
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Add New Listing"
        onBackPress={handleBackPress}
        showRightSide={false}
        onRightPress={handleSavePress}
        fontWeightBold={true}
        fontSize={wp(4.5)}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What type of service are you looking for ?
          </Text>
          {(ADD_SCREEN_SERVICES_LISTING as ListingOption[]).slice(0, 3).map((option) => (
            <ListingOptionCard
              key={option.id}
              icon={option.icon}
              iconLibrary={option.iconLibrary}
              title={option.title}
              description={option.description}
              onPress={() => handleOptionPress(option.id)}
            />
          ))}
        </View>

        {/* <View style={styles.section}> */}
          <Text style={styles.sectionTitle}>Requests</Text>
          {(ADD_SCREEN_SERVICES_LISTING as ListingOption[]).slice(3,5).map((option) => (
            <ListingOptionCard
              key={option.id}
              icon={option.icon}
              iconLibrary={option.iconLibrary}
              title={option.title}
              description={option.description}
              onPress={() => handleOptionPress(option.id)}
            />
          ))}
        {/* </View> */}
      </ScrollView>
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
  contentContainer: {
    padding: wp(4),
    paddingBottom: hp(4),
  },
  section: {
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "400",
    color: "#353f49",
    marginBottom: hp(1.5),
  },
});
