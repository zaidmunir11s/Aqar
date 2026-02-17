import React, { useMemo, useCallback, useState } from "react";
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
import { findMatchingProperties } from "@/utils/propertyMatching";
import { getMatchedCriteria } from "@/utils/criteriaMatching";
import { getTypeLabelFromType, formatPrice, getTranslatedPropertyTypeLabel } from "../../../../utils";
import {
  RENT_FILTER_OPTIONS,
  SALE_FILTER_OPTIONS,
  DAILY_FILTER_OPTIONS,
} from "../../../../data/propertyData";
import type { Property } from "../../../../types/property";
import { useLocalization } from "../../../../hooks/useLocalization";

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

  const matchedProperties = useMemo(() => {
    if (!request) return [];
    return findMatchingProperties(request);
  }, [request]);

  const getTypeLabel = useCallback((type: string, listingType: string) => {
    let filterOptions;
    if (listingType === "rent") filterOptions = RENT_FILTER_OPTIONS;
    else if (listingType === "sale") filterOptions = SALE_FILTER_OPTIONS;
    else filterOptions = DAILY_FILTER_OPTIONS;
    return getTypeLabelFromType(type, filterOptions);
  }, []);

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
        return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
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
      visiblePropertyIds: matchedProperties.map((p) => p.id),
      listingType: property.listingType,
    });
  }, [matchedProperties, navigation]);

  const renderPropertyCard = useCallback((property: Property) => {
    // Use translated property type label
    const title = getTranslatedPropertyTypeLabel(
      property.type,
      property.listingType as "rent" | "sale" | "daily",
      t
    ) || t("listings.property");
    
    let priceLine = "";

    if (property.listingType === "daily") {
      const dailyProperty = property as any;
      const dailyPrice = dailyProperty.dailyPrice || 0;
      priceLine = `${formatPrice(dailyPrice.toString())} ${t("listings.sar")} / ${t("common.day")}`;
    } else if (property.listingType === "rent") {
      const rentProperty = property as any;
      const formattedPrice = rentProperty.price
        ? formatPrice(rentProperty.price)
        : "0";
      priceLine = `${formattedPrice} ${t("listings.sar")} / ${t("listings.yearly")}`;
    } else {
      const saleProperty = property as any;
      const formattedPrice = saleProperty.price
        ? formatPrice(saleProperty.price)
        : "0";
      priceLine = `${formattedPrice} ${t("listings.sar")}`;
    }

    // Calculate matched criteria
    const matchedCriteria = request ? getMatchedCriteria(property, request) : undefined;

    return (
      <PropertyCard
        key={property.id}
        property={property}
        onPress={() => handlePropertyPress(property)}
        title={title}
        priceLine={priceLine}
        listingType={property.listingType}
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
        renderItem={({ item }) => renderPropertyCard(item)}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
