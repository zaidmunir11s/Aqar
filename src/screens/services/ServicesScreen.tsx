import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ScreenHeader,
  ServiceCard,
  ServiceListItem,
  SocialMediaIcon,
} from "../../components";

type NavigationProp = NativeStackNavigationProp<any>;

export default function ServicesScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  const handleSocialMedia = useCallback((platform: string) => {
    console.log("Open", platform);
  }, []);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Listings");
    }
  }, [navigation]);

  const handleServicePress = useCallback((service: string) => {
    console.log("Service pressed:", service);
    // TODO: Navigate to service details
  }, []);

  const handleLanguagePress = useCallback(() => {
    handleServicePress("Language");
  }, [handleServicePress]);

  const handleCartPress = useCallback(() => {
    handleServicePress("Cart");
  }, [handleServicePress]);

  const handleCustomerServicePress = useCallback(() => {
    handleServicePress("Customer Service");
  }, [handleServicePress]);

  const services: Array<{
    icon: string;
    library: "Ionicons" | "MaterialCommunityIcons";
    title: string;
  }> = [
    {
      icon: "file-document-outline",
      library: "MaterialCommunityIcons",
      title: "Subscriptions",
    },
    {
      icon: "hand-coin-outline",
      library: "MaterialCommunityIcons",
      title: "Selling and leasing Commission",
    },
    {
      icon: "rocket-outline",
      library: "Ionicons",
      title: "Developers Services",
    },
  ];

  const serviceListItems = [
    "Today Ads",
    "Lease Contracts",
    "Search Requests",
    "Exclusive marketing services",
    "Aqar Residential Stats",
  ];

  const aqarAppItems = ["AQAR blog", "Legal documents"];

  const socialMediaItems: Array<{
    name: string;
    icon: string;
    library: "Ionicons" | "FontAwesome5";
    bgColor: string | null;
    iconColor: string;
    platform: string;
  }> = [
    {
      name: "share",
      icon: "share-social",
      library: "Ionicons",
      bgColor: null,
      iconColor: "#10b981",
      platform: "share",
    },
    {
      name: "snapchat",
      icon: "snapchat-ghost",
      library: "FontAwesome5",
      bgColor: "#FFFC00",
      iconColor: "#000",
      platform: "snapchat",
    },
    {
      name: "x",
      icon: "times",
      library: "FontAwesome5",
      bgColor: "#000",
      iconColor: "#fff",
      platform: "x",
    },
    {
      name: "instagram",
      icon: "instagram",
      library: "FontAwesome5",
      bgColor: "#E4405F",
      iconColor: "#fff",
      platform: "instagram",
    },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Services"
        onBackPress={handleBackPress}
        rightComponent={
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleLanguagePress}
            >
              <Text style={styles.arabicText}>العربية</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCartPress}
            >
              <Ionicons name="cart-outline" size={wp(6)} color="#10b981" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.customerServiceCard}
          activeOpacity={0.7}
          onPress={handleCustomerServicePress}
        >
          <Ionicons name="headset" size={wp(7)} color="#10b981" />
          <Text style={styles.customerServiceText}>Customer Service</Text>
        </TouchableOpacity>

        <View style={styles.topCardsRow}>
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              iconName={service.icon}
              iconLibrary={service.library}
              title={service.title}
              onPress={() => handleServicePress(service.title)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="hand-heart-outline"
              size={wp(6)}
              color="#6b7280"
            />
            <Text style={styles.sectionTitle}>Services</Text>
          </View>

          <View style={styles.listContainer}>
            {serviceListItems.map((item, index) => (
              <ServiceListItem
                key={index}
                text={item}
                onPress={() => handleServicePress(item)}
                isLast={index === serviceListItems.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Aqar App Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag-outline" size={wp(6)} color="#6b7280" />
            <Text style={styles.sectionTitle}>Aqar App</Text>
          </View>

          <View style={styles.listContainer}>
            {aqarAppItems.map((item, index) => (
              <ServiceListItem
                key={index}
                text={item}
                onPress={() => handleServicePress(item)}
                isLast={index === aqarAppItems.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Social Media Icons */}
        <View style={styles.socialMediaContainer}>
          {socialMediaItems.map((item) => (
            <SocialMediaIcon
              key={item.name}
              name={item.name}
              icon={item.icon}
              library={item.library}
              bgColor={item.bgColor}
              iconColor={item.iconColor}
              onPress={() => handleSocialMedia(item.platform)}
            />
          ))}
        </View>

        {/* Certification Badges */}
        <View style={styles.badgesContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/80x80.png?text=VAT" }}
            style={styles.badge}
            resizeMode="contain"
          />
          <Image
            source={{ uri: "https://via.placeholder.com/80x80.png?text=REGA" }}
            style={styles.badge}
            resizeMode="contain"
          />
        </View>

        {/* Quick Donation */}
        <View style={styles.donationContainer}>
          <Text style={styles.donationText}>Quick Donation</Text>
          <Image
            source={{ uri: "https://via.placeholder.com/60x60.png?text=Ehsan" }}
            style={styles.donationLogo}
            resizeMode="contain"
          />
        </View>

        {/* Version */}
        <Text style={styles.versionText}>V 3.4.17</Text>

        <View style={{ height: hp(3) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: wp(3),
  },
  arabicText: {
    fontSize: wp(4),
    color: "#10b981",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  customerServiceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: wp(4),
    marginTop: hp(2),
    marginBottom: hp(2),
    paddingVertical: hp(2),
    borderRadius: wp(3),
    borderWidth: 2,
    borderColor: "#10b981",
    ...Platform.select({
      ios: {
        shadowColor: "#10b981",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  customerServiceText: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#10b981",
    marginLeft: wp(2),
  },
  topCardsRow: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    justifyContent: "space-between",
  },
  section: {
    marginTop: hp(2),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    marginBottom: hp(1.5),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: "#6b7280",
    marginLeft: wp(2),
  },
  listContainer: {
    backgroundColor: "#fff",
    marginHorizontal: wp(4),
    borderRadius: wp(3),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 2 },
    }),
  },
  socialMediaContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(3),
    marginBottom: hp(2),
    paddingHorizontal: wp(4),
  },
  badgesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  badge: {
    width: wp(20),
    height: wp(20),
    marginHorizontal: wp(2),
  },
  donationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  donationText: {
    fontSize: wp(4),
    color: "#6b7280",
    marginRight: wp(2),
  },
  donationLogo: {
    width: wp(12),
    height: wp(12),
  },
  versionText: {
    fontSize: wp(3.5),
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: hp(2),
  },
});
