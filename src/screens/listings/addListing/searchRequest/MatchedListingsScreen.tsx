import React, { useMemo, useCallback, useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { PropertyCard, ScreenHeader, FilterTabs } from "../../../../components";
import { COLORS } from "@/constants";
import { SearchRequestData } from "@/context/searchRequest-context";
import {
  findMatchingPropertiesFromList,
  getListingTypeFromCategory,
  getPropertyTypeFromCategory,
} from "@/utils/propertyMatching";
import { getMatchedCriteria } from "@/utils/criteriaMatching";
import { formatPrice, getTranslatedPropertyTypeLabel } from "../../../../utils";
import type { Property } from "../../../../types/property";
import { useLocalization } from "../../../../hooks/useLocalization";
import { useGetPublicListingsQuery } from "@/redux/api";
import { mapApiListingToProperty } from "@/utils/apiListingMapper";
import { registerApiListingProperties } from "@/utils/propertyLookup";
import { parseBackendDateMs } from "@/utils/dateParsing";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  request: SearchRequestData;
}

export default function MatchedListingsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;
  const request = params.request;
  const { t, isRTL } = useLocalization();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const listingType = useMemo(() => {
    const lt = request?.category ? getListingTypeFromCategory(request.category) : null;
    return lt;
  }, [request?.category]);

  const propertyType = useMemo(() => {
    const pt = request?.category ? getPropertyTypeFromCategory(request.category) : null;
    return pt;
  }, [request?.category]);

  const { data: publicListingsData } = useGetPublicListingsQuery(
    listingType
      ? {
          page: 1,
          limit: 200,
          listingType: listingType === "sale" ? "SALE" : "RENT",
          ...(propertyType ? { propertyType } : {}),
        }
      : { page: 1, limit: 200 }
  );

  const candidateProperties = useMemo(() => {
    const rows = publicListingsData?.listings ?? [];
    return rows.map(mapApiListingToProperty);
  }, [publicListingsData]);

  useEffect(() => {
    if (candidateProperties.length > 0) {
      registerApiListingProperties(candidateProperties);
    }
  }, [candidateProperties]);

  const matchedProperties = useMemo(() => {
    if (!request) return [];
    return findMatchingPropertiesFromList(candidateProperties, request);
  }, [candidateProperties, request]);

  const matchedPropertyIds = useMemo(
    () => matchedProperties.map((p) => p.id),
    [matchedProperties]
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Helper function to get numeric price value for sorting
  const getNumericPrice = useCallback((property: Property) => {
    const rentSaleProperty = property as any;
    if (rentSaleProperty.price) {
      const priceStr = String(rentSaleProperty.price);
      const numericValue = parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
      const multiplier = priceStr.includes("M")
        ? 1000000
        : priceStr.includes("K")
          ? 1000
          : 1;
      return numericValue * multiplier;
    }
    return 0;
  }, []);

  // Sort properties based on selected filter
  const sortedProperties = useMemo(() => {
    if (!selectedFilter) return matchedProperties;

    const sorted = [...matchedProperties];

    switch (selectedFilter) {
      case "latest":
        return sorted.sort((a, b) => {
          const am = parseBackendDateMs((a as any).createdAt) ?? 0;
          const bm = parseBackendDateMs((b as any).createdAt) ?? 0;
          if (Number.isFinite(am) && Number.isFinite(bm)) return bm - am;
          return (b.id || 0) - (a.id || 0);
        });
      case "price":
        return sorted.sort((a, b) => {
          const priceA = getNumericPrice(a);
          const priceB = getNumericPrice(b);
          return priceA - priceB;
        });
      case "nearest":
        return sorted;
      default:
        return sorted;
    }
  }, [matchedProperties, selectedFilter, getNumericPrice]);

  const handlePropertyPress = useCallback((property: Property) => {
    // Navigate to DailyDetails for daily listings, PropertyDetails for rent/sale
    const screenName = property.listingType === "daily" ? "DailyDetails" : "PropertyDetails";
    navigation.navigate(screenName, {
      propertyId: property.id,
      visiblePropertyIds: matchedPropertyIds,
      listingType: property.listingType,
    });
  }, [matchedPropertyIds, navigation]);

  const renderPropertyCard = useCallback(({ item }: { item: Property }) => {
    // Use translated property type label
    const title = getTranslatedPropertyTypeLabel(
      item.type,
      item.listingType as "rent" | "sale" | "daily",
      t
    ) || t("listings.property");
    
    let priceLine = "";

    if (item.listingType === "daily") {
      const dailyProperty = item as any;
      const dailyPrice = dailyProperty.dailyPrice || 0;
      priceLine = `${formatPrice(dailyPrice.toString())} ${t("listings.sar")} / ${t("common.day")}`;
    } else if (item.listingType === "rent") {
      priceLine = "";
    } else {
      const saleProperty = item as any;
      const formattedPrice = saleProperty.price
        ? formatPrice(saleProperty.price)
        : "0";
      priceLine = `${formattedPrice} ${t("listings.sar")}`;
    }

    // Calculate matched criteria
    const matchedCriteria = request ? getMatchedCriteria(item, request) : undefined;

    return (
      <PropertyCard
        property={item}
        onPress={() => handlePropertyPress(item)}
        title={title}
        priceLine={priceLine}
        listingType={item.listingType}
        matchedCriteria={matchedCriteria}
      />
    );
  }, [t, handlePropertyPress, request]);

  const keyExtractor = useCallback((item: Property) => item.id.toString(), []);

  const filterTabOptions = useMemo(
    () => [
      { value: "latest", label: t("listings.latest") },
      { value: "price", label: t("listings.price") },
      { value: "nearest", label: t("listings.nearest") },
    ],
    [t]
  );

  const rtlStyles = useMemo(
    () => ({
      emptyText: {
        textAlign: (isRTL ? "right" : "center") as "left" | "center" | "right",
      },
    }),
    [isRTL]
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScreenHeader
        title={t("listings.matchedListings")}
        onBackPress={handleBackPress}
      />

      <FilterTabs
        options={filterTabOptions}
        selectedValue={selectedFilter}
        onValueChange={setSelectedFilter}
      />

      <FlatList
        data={sortedProperties}
        renderItem={renderPropertyCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, rtlStyles.emptyText]}>{t("listings.noMatchingProperties")}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: wp(4),
    paddingBottom: hp(2),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: hp(10),
  },
  emptyText: {
    fontSize: wp(4),
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
