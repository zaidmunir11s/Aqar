import React, { useCallback, useMemo } from "react";
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
  LanguageConverter,
} from "../../components";
import { COLORS } from "@/constants/colors";
import { useLocalization } from "@/hooks";

type NavigationProp = NativeStackNavigationProp<any>;

export default function ServicesScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Listings");
    }
  }, [navigation]);

  const headerRightComponent = useMemo(() => <LanguageConverter />, []);

  const services = [
    {
      id: "1",
      title: t("services.customerService"),
      subtitle: t("services.customerServiceSubtitle"),
      icon: "headset",
      iconLib: "Ionicons" as const,
      accent: "#0e856a",
    },
    {
      id: "2",
      title: t("services.commission"),
      subtitle: t("services.commissionSubtitle"),
      icon: "hand-coin-outline",
      iconLib: "MaterialCommunityIcons" as const,
      accent: "#3b82f6",
    },
    {
      id: "5",
      title: t("services.todayAds"),
      icon: "megaphone",
      iconLib: "Ionicons" as const,
      accent: "#8b5cf6",
    },
    {
      id: "10",
      title: t("services.baytBlog"),
      icon: "book",
      iconLib: "Ionicons" as const,
      accent: "#f59e0b",
    },
    {
      id: "11",
      title: t("services.legalDocuments"),
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

  // RTL-aware styles
  const rtlStyles = {
    gridContainer: {
      ...styles.gridContainer,
      flexDirection: (isRTL ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
    },
    socialSection: {
      ...styles.socialSection,
      alignItems: (isRTL ? 'flex-end' : 'flex-start') as 'flex-start' | 'flex-end',
    },
    socialTitle: {
      ...styles.socialTitle,
      textAlign: (isRTL ? 'right' : 'left') as 'left' | 'right',
    },
    socialGrid: {
      ...styles.socialGrid,
      flexDirection: (isRTL ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
    },
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("services.title")}
        onBackPress={handleBackPress}
        showRightSide={true}
        rightComponent={headerRightComponent}
      />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Services Grid */}
        <View style={rtlStyles.gridContainer}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceTile}
              activeOpacity={0.8}
              onPress={() => {
                if (__DEV__) console.log("Service pressed:", service.title);
              }}
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
        <View style={rtlStyles.socialSection}>
          <Text style={rtlStyles.socialTitle}>{t("services.followUs")}</Text>
          <View style={rtlStyles.socialGrid}>
            {socialMediaItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => {
                  if (__DEV__) console.log("Open", item.platform);
                }}
              >
                <SocialMediaIcon
                  name={item.name}
                  icon={item.icon}
                  library={item.library}
                  bgColor={item.bgColor}
                  iconColor={item.iconColor}
                  onPress={() => {
                    if (__DEV__) console.log("Open", item.platform);
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>
            {t("services.version")} 3.4.17
          </Text>
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
    width: "100%",
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
