import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ScreenHeader,
  SocialMediaIcon,
} from "../../components";
import { COLORS } from "@/constants/colors";

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
  }, []);


  const services = [
    {
      id: "1",
      title: "Customer Service",
      subtitle: "24/7 Support",
      icon: "headset",
      iconLib: "Ionicons" as const,
      accent: "#0e856a",
    },
    {
      id: "2",
      title: "Commission",
      subtitle: "Selling & Leasing",
      icon: "hand-coin-outline",
      iconLib: "MaterialCommunityIcons" as const,
      accent: "#3b82f6",
    },
    // {
    //   id: "3",
    //   title: "Subscriptions",
    //   icon: "file-document-outline",
    //   iconLib: "MaterialCommunityIcons" as const,
    //   accent: "#6366f1",
    // },
    // {
    //   id: "4",
    //   title: "Developers Services",
    //   icon: "rocket-outline",
    //   iconLib: "Ionicons" as const,
    //   accent: "#ec4899",
    // },
    {
      id: "5",
      title: "Today Ads",
      icon: "megaphone",
      iconLib: "Ionicons" as const,
      accent: "#8b5cf6",
    },
    // {
    //   id: "6",
    //   title: "Lease Contracts",
    //   icon: "document-text-outline",
    //   iconLib: "Ionicons" as const,
    //   accent: "#14b8a6",
    // },
    // {
    //   id: "7",
    //   title: "Search Requests",
    //   icon: "search-outline",
    //   iconLib: "Ionicons" as const,
    //   accent: "#f59e0b",
    // },
    // {
    //   id: "8",
    //   title: "Exclusive marketing services",
    //   icon: "star-outline",
    //   iconLib: "Ionicons" as const,
    //   accent: "#ef4444",
    // },
    // {
    //   id: "9",
    //   title: "StayBid Residential Stats",
    //   icon: "stats-chart-outline",
    //   iconLib: "Ionicons" as const,
    //   accent: "#06b6d4",
    // },
    {
      id: "10",
      title: "StayBid Blog",
      icon: "book",
      iconLib: "Ionicons" as const,
      accent: "#f59e0b",
    },
    {
      id: "11",
      title: "Legal Documents",
      icon: "document-text",
      iconLib: "Ionicons" as const,
      accent: "#10b981",
    },
  ];

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

  const renderIcon = (iconName: string, iconLib: string, size: number, color: string) => {
    if (iconLib === "MaterialCommunityIcons") {
      return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
    }
    return <Ionicons name={iconName as any} size={size} color={color} />;
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Services"
        onBackPress={handleBackPress}
      />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Services Grid */}
        <View style={styles.gridContainer}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceTile}
              activeOpacity={0.8}
              onPress={() => handleServicePress(service.title)}
            >
              <View style={[styles.tileIconWrapper, { backgroundColor: service.accent + "15" }]}>
                {renderIcon(service.icon, service.iconLib, wp(8), service.accent)}
              </View>
              <Text style={styles.tileTitle} numberOfLines={2}>
                {service.title}
              </Text>
              {service.subtitle && (
                <Text style={styles.tileSubtitle} numberOfLines={1}>
                  {service.subtitle}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Social Media Section */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialGrid}>
            {socialMediaItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => handleSocialMedia(item.platform)}
              >
                <SocialMediaIcon
                  name={item.name}
                  icon={item.icon}
                  library={item.library}
                  bgColor={item.bgColor}
                  iconColor={item.iconColor}
                  onPress={() => handleSocialMedia(item.platform)}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 3.4.17</Text>
        </View>

        <View style={{ height: hp(3) }} />
      </ScrollView>
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
  },
  scrollContent: {
    paddingTop: hp(3),
    paddingBottom: hp(2),
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: wp(4),
    justifyContent: "space-between",
  },
  serviceTile: {
    width: wp(43),
    backgroundColor: "#fafbfc",
    borderRadius: wp(4),
    paddingVertical: hp(3),
    paddingHorizontal: wp(4),
    marginBottom: hp(2.5),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tileIconWrapper: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(2),
  },
  tileTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#1a202c",
    textAlign: "center",
    marginBottom: hp(0.5),
    lineHeight: hp(2.5),
  },
  tileSubtitle: {
    fontSize: wp(3.2),
    color: "#64748b",
    textAlign: "center",
    fontWeight: "400",
  },
  socialSection: {
    marginTop: hp(2),
    paddingHorizontal: wp(4),
  },
  socialTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: hp(2),
    textAlign: "center",
  },
  socialGrid: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: wp(4),
    flexWrap: "wrap",
  },
  footer: {
    alignItems: "center",
    marginTop: hp(3),
  },
  versionText: {
    fontSize: wp(3.2),
    color: "#94a3b8",
    fontWeight: "400",
  },
});
