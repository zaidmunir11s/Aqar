import React, { useCallback, useMemo, useEffect } from "react";
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useLocalization } from "@/hooks/useLocalization";
import { ScreenHeader, PropertyCard } from "@/components";
import type { Property } from "@/types/property";
import { useGetPublicListingsQuery } from "@/redux/api";
import { mapApiListingToProperty } from "@/utils/apiListingMapper";
import { registerApiListingProperties } from "@/utils/propertyLookup";
import { COLORS } from "@/constants";
import { getTranslatedPropertyTypeLabel } from "@/utils";
import { formatPrice } from "@/utils/propertyHelpers";

type NavigationProp = NativeStackNavigationProp<any>;

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function TodayAdsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();

  const { data: publicListingsData, isFetching } = useGetPublicListingsQuery({
    page: 1,
    limit: 200,
  });

  const today = useMemo(() => new Date(), []);

  const todayProperties = useMemo(() => {
    const rows = publicListingsData?.listings ?? [];
    const mapped = rows.map(mapApiListingToProperty);
    return mapped.filter((p) => {
      const raw = (p as any).createdAt as string | undefined;
      if (!raw) return false;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return false;
      return isSameLocalDay(d, today);
    });
  }, [publicListingsData, today]);

  useEffect(() => {
    if (todayProperties.length > 0) {
      registerApiListingProperties(todayProperties);
    }
  }, [todayProperties]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePropertyPress = useCallback(
    (item: Property) => {
      navigation.navigate("PropertyDetails", {
        propertyId: item.id,
        visiblePropertyIds: todayProperties.map((p) => p.id),
        listingType: item.listingType,
        ...(item.serverListingId ? { listingId: item.serverListingId } : {}),
      });
    },
    [navigation, todayProperties]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={t("services.todayAds")}
        onBackPress={handleBackPress}
        showRightSide={false}
      />
      <FlatList
        data={todayProperties}
        keyExtractor={(item) => item.serverListingId ?? String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9} onPress={() => handlePropertyPress(item)}>
            <PropertyCard
              property={item}
              onPress={() => handlePropertyPress(item)}
              title={
                String(
                  (item as any)?.listingMetadata?.locationDisplayName ??
                    item.address ??
                    item.city ??
                    ""
                ).trim() ||
                getTranslatedPropertyTypeLabel(
                  item.type,
                  item.listingType as "rent" | "sale" | "daily",
                  t
                ) ||
                t("listings.property")
              }
              priceLine={
                item.listingType === "sale"
                  ? `${formatPrice((item as any)?.price)} ${t("listings.sar")}`
                  : ""
              }
              listingType={item.listingType}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isFetching ? t("common.loading") : t("profile.noAdsFound")}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(3),
  },
  emptyText: {
    textAlign: "center",
    marginTop: hp(4),
    color: "#6b7280",
    fontSize: wp(3.8),
  },
});

