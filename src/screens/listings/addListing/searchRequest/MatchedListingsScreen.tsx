import React, { useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { PropertyCard } from "../../../../components";
import { COLORS } from "@/constants";
import { SearchRequestData } from "@/context/searchRequest-context";
import { findMatchingProperties } from "@/utils/propertyMatching";
import { getMatchedCriteria } from "@/utils/criteriaMatching";
import { getTypeLabelFromType, formatPrice } from "../../../../utils";
import {
  RENT_FILTER_OPTIONS,
  SALE_FILTER_OPTIONS,
  DAILY_FILTER_OPTIONS,
} from "../../../../data/propertyData";
import type { Property } from "../../../../types/property";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  request: SearchRequestData;
}

export default function MatchedListingsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;
  const request = params.request;
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

  const handleFilterPress = useCallback((filterType: string) => {
    setSelectedFilter((prev) => (prev === filterType ? null : filterType));
  }, []);

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
    navigation.navigate("PropertyDetails", {
      propertyId: property.id,
      visiblePropertyIds: matchedProperties.map((p) => p.id),
      listingType: property.listingType,
    });
  }, [matchedProperties, navigation]);

  const renderPropertyCard = useCallback((property: Property) => {
    const typeLabel = getTypeLabel(property.type, property.listingType) || "Property";
    let priceLine = "";
    let title = "";

    if (property.listingType === "daily") {
      const dailyProperty = property as any;
      title = `${typeLabel} for daily rent`;
      const dailyPrice = dailyProperty.dailyPrice || 0;
      priceLine = `${formatPrice(dailyPrice.toString())} SAR / Day`;
    } else if (property.listingType === "rent") {
      title = `${typeLabel} for rent`;
      const rentProperty = property as any;
      const formattedPrice = rentProperty.price
        ? formatPrice(rentProperty.price)
        : "0";
      priceLine = `${formattedPrice} SAR / Yearly`;
    } else {
      title = `${typeLabel} for sale`;
      const saleProperty = property as any;
      const formattedPrice = saleProperty.price
        ? formatPrice(saleProperty.price)
        : "0";
      priceLine = `${formattedPrice} SAR`;
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
  }, [getTypeLabel, handlePropertyPress, request]);

  const keyExtractor = useCallback((item: Property) => item.id.toString(), []);

  const customHeader = (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={handleBackPress}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={wp(6.5)} color={COLORS.backButton} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Matched Listings</Text>
      <View style={styles.headerRight} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {customHeader}

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <View style={styles.filterTabsWrapper}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === "latest" && styles.filterTabActive,
            ]}
            onPress={() => handleFilterPress("latest")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "latest" && styles.filterTextActive,
              ]}
            >
              Latest
            </Text>
          </TouchableOpacity>

          <View style={styles.filterSeparator} />

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === "price" && styles.filterTabActive,
            ]}
            onPress={() => handleFilterPress("price")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "price" && styles.filterTextActive,
              ]}
            >
              Price
            </Text>
          </TouchableOpacity>

          <View style={styles.filterSeparator} />

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === "nearest" && styles.filterTabActive,
            ]}
            onPress={() => handleFilterPress("nearest")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "nearest" && styles.filterTextActive,
              ]}
            >
              Nearest
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedProperties}
        renderItem={({ item }) => renderPropertyCard(item)}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matching properties found</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingBottom: hp(1),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    flex: 1,
  },
  headerRight: {
    width: wp(12),
  },
  filterContainer: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  filterTabsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: wp(2.5),
    paddingHorizontal: wp(1),
    paddingVertical: wp(1),
    borderWidth: 1,
    borderColor: "#dedfe3",
  },
  filterTab: {
    flex: 1,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
  },
  filterTabActive: {
    backgroundColor: COLORS.showListFilterTabActive,
  },
  filterSeparator: {
    width: 1,
    height: hp(3),
    backgroundColor: "#d1d5db",
    marginHorizontal: wp(1),
  },
  filterText: {
    fontSize: wp(4.2),
    color: "#6b7280",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
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
