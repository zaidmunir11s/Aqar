import React, { useMemo, useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
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
import {
  RENT_FILTER_OPTIONS,
  SALE_FILTER_OPTIONS,
  DAILY_FILTER_OPTIONS,
} from "../../data/propertyData";
import { getTypeLabelFromType, formatPrice } from "../../utils";
import { PropertyCard } from "../../components";
import { COLORS } from "../../constants";
import type { Property } from "../../types/property";
import type { CalendarDates } from "../../hooks/useCalendar";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  properties: Property[];
  listingType: string;
  selectedDates?: CalendarDates;
}

export default function PropertyListScreen(): React.JSX.Element {
  const route = useRoute();
  const params = route.params as RouteParams;
  const { properties, listingType, selectedDates } = params;
  const navigation = useNavigation<NavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null); // null, 'latest', 'price', 'nearest'

  // Calculate daily price based on selected dates
  const calculateDailyPrice = useCallback(
    (property: Property) => {
      if (!selectedDates || !selectedDates.startDate || !selectedDates.endDate)
        return null;
      const start = new Date(selectedDates.startDate);
      const end = new Date(selectedDates.endDate);
      const days =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
      const dailyProperty = property as any;
      return (dailyProperty.dailyPrice || 0) * days;
    },
    [selectedDates]
  );

  const getTypeLabel = useCallback(
    (type: string) => {
      let filterOptions;
      if (listingType === "rent") filterOptions = RENT_FILTER_OPTIONS;
      else if (listingType === "sale") filterOptions = SALE_FILTER_OPTIONS;
      else filterOptions = DAILY_FILTER_OPTIONS;

      return getTypeLabelFromType(type, filterOptions);
    },
    [listingType]
  );

  const handlePropertyPress = useCallback(
    (item: Property) => {
      const navParams: any = {
        propertyId: item.id,
        visiblePropertyIds: properties.map((p) => p.id),
        listingType: listingType,
      };

      if (listingType === "daily" && selectedDates) {
        navParams.selectedDates = selectedDates;
      }

      navigation.navigate("PropertyDetails", navParams);
    },
    [properties, listingType, selectedDates, navigation]
  );

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("MapLanding");
    }
  }, [navigation]);

  const handleFilterPress = useCallback((filterType: string) => {
    // Toggle filter: if same filter is pressed, unselect it
    setSelectedFilter((prev) => (prev === filterType ? null : filterType));
  }, []);

  const handleSearchPress = useCallback(() => {
    // TODO: Implement search functionality
    console.log("Search pressed");
  }, []);

  // Helper function to get numeric price value for sorting
  const getNumericPrice = useCallback(
    (property: Property) => {
      // For daily listings, use dailyPrice
      if (listingType === "daily") {
        const dailyProperty = property as any;
        if (dailyProperty.dailyPrice) {
          return dailyProperty.dailyPrice;
        }
      }

      // For rent/sale, use price field
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
    },
    [listingType]
  );

  // Sort properties based on selected filter
  const sortedProperties = useMemo(() => {
    if (!selectedFilter) return properties;

    const sorted = [...properties];

    switch (selectedFilter) {
      case "latest":
        // Sort by ID descending (assuming higher ID = newer)
        return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));

      case "price":
        // Sort by price ascending
        return sorted.sort((a, b) => {
          const priceA = getNumericPrice(a);
          const priceB = getNumericPrice(b);
          return priceA - priceB;
        });

      case "nearest":
        // For nearest, we'd need user location - for now, keep original order
        // TODO: Implement location-based sorting when user location is available
        return sorted;

      default:
        return sorted;
    }
  }, [properties, selectedFilter, getNumericPrice]);

  const renderProperty = useCallback(
    ({ item }: { item: Property }) => {
      const typeLabel = getTypeLabel(item.type) || "Property";

      let priceLine = "";
      let title = "";

      if (listingType === "daily") {
        title = typeLabel || "Property";
        const calculatedPrice = calculateDailyPrice(item);
        if (calculatedPrice) {
          priceLine = `${calculatedPrice} SAR`;
        } else {
          const dailyProperty = item as any;
          priceLine =
            dailyProperty.bookingType === "daily" ? "Daily" : "Monthly";
        }
      } else if (listingType === "rent") {
        title = `${typeLabel} for rent`;
        const rentProperty = item as any;
        const formattedPrice = rentProperty.price
          ? formatPrice(rentProperty.price)
          : "0";
        priceLine = `${formattedPrice} SAR / Yearly`;
      } else {
        title = `${typeLabel} for sale`;
        const saleProperty = item as any;
        const formattedPrice = saleProperty.price
          ? formatPrice(saleProperty.price)
          : "0";
        priceLine = `${formattedPrice} SAR`;
      }

      return (
        <PropertyCard
          property={item}
          onPress={() => handlePropertyPress(item)}
          title={title || "Property"}
          priceLine={priceLine || "Price not available"}
          listingType={listingType}
        />
      );
    },
    [listingType, getTypeLabel, calculateDailyPrice, handlePropertyPress]
  );

  const keyExtractor = useCallback((item: Property) => item.id.toString(), []);

  const searchIcon = (
    <TouchableOpacity
      onPress={handleSearchPress}
      style={styles.searchButtonContainer}
      activeOpacity={0.7}
    >
      <View style={styles.searchButton}>
        <Ionicons name="search-outline" size={wp(5)} color="#3b82f6" />
      </View>
    </TouchableOpacity>
  );

  // Custom header with green back button
  const customHeader = (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={handleBackPress}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={wp(6.5)} color="#0ab739" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Listings</Text>
      {searchIcon}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
        renderItem={renderProperty}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    paddingTop: Platform.OS === "ios" ? hp(2) : hp(1.5),
    paddingBottom: hp(2),
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
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  searchButtonContainer: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  searchButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#358dcd",
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
    backgroundColor: "#0ab739",
  },
  filterSeparator: {
    width: 1,
    height: hp(3),
    backgroundColor: "#d1d5db",
    marginHorizontal: wp(1),
  },
  filterText: {
    fontSize: wp(3.8),
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
});
