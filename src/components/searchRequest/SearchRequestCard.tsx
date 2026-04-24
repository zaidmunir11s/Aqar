import React, { memo, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import {
  FLOOR_OPTIONS,
  AGE_OPTIONS,
  STREET_DIRECTION_OPTIONS,
  STREET_WIDTH_OPTIONS,
} from "../../constants/orderFormOptions";
import { SearchRequestData } from "@/context/searchRequest-context";
import {
  findMatchingPropertiesFromList,
  getListingTypeFromCategory,
  getPropertyTypeFromCategory,
} from "@/utils/propertyMatching";
import { DeleteConfirmationModal } from "../common";
import { useLocalization } from "../../hooks/useLocalization";
import { useGetPublicListingsQuery } from "@/redux/api";
import { mapApiListingToProperty } from "@/utils/apiListingMapper";

export interface SearchRequestCardProps {
  request: SearchRequestData;
  onDelete?: (id: string) => void;
  onPress?: (request: SearchRequestData, matchedCount: number) => void;
}

const SearchRequestCard = memo<SearchRequestCardProps>(
  ({ request, onDelete, onPress }) => {
    const { t, isRTL } = useLocalization();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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

    const matchCount = useMemo(() => {
      if (!request) return 0;
      return findMatchingPropertiesFromList(candidateProperties, request).length;
    }, [candidateProperties, request]);

    // Helper function to translate street direction
    const translateStreetDirection = useCallback((direction: string): string => {
      if (!direction) return "";
      if (direction === "North") return t("listings.address.north");
      if (direction === "East") return t("listings.address.east");
      if (direction === "West") return t("listings.address.west");
      if (direction === "South") return t("listings.address.south");
      if (direction === "Northeast") return t("listings.northeast");
      if (direction === "Southeast") return t("listings.southeast");
      if (direction === "Southwest") return t("listings.southwest");
      if (direction === "Northwest") return t("listings.northwest");
      if (direction === "3 Streets") return t("listings.threeStreets");
      if (direction === "4 Streets") return t("listings.fourStreets");
      return direction;
    }, [t]);

    // Helper function to translate villa type
    const translateVillaType = useCallback((type: string): string => {
      if (!type) return "";
      if (type === "Standalone") return t("listings.standalone");
      if (type === "Duplex") return t("listings.duplex");
      if (type === "Townhouse") return t("listings.townhouse");
      return type;
    }, [t]);

    const translateRentPaymentFrequency = useCallback((period: string): string => {
      if (!period) return "";
      if (period === "Yearly") return t("listings.yearly");
      if (period === "Semi Annual") return t("listings.semiAnnual");
      if (period === "Quarterly") return t("listings.quarterly");
      if (period === "Monthly") return t("listings.monthly");
      return period;
    }, [t]);

    const translateApartmentRentTenant = useCallback((value: string): string => {
      if (value === "Singles") return t("listings.singles");
      if (value === "Families") return t("listings.families");
      return value;
    }, [t]);

    // Helper function to translate street width (handles "More than X" format)
    const translateStreetWidth = useCallback((width: string): string => {
      if (!width) return "";
      if (width.startsWith("More than")) {
        const widthValue = width.match(/\d+/)?.[0] || "";
        return t("listings.moreThan", { width: widthValue });
      }
      return width;
    }, [t]);

    // Helper function to translate "All" option
    const translateAll = useCallback((value: string): string => {
      if (value === "ALL" || value === "All") {
        return t("listings.all");
      }
      return value;
    }, [t]);

    // Helper function to translate floor for card display
    const translateFloor = useCallback((floor: string): string => {
      if (!floor) return "";
      if (floor === "All") return t("listings.all");
      if (floor === "First floor") return t("listings.firstFloor");
      if (floor === "Second floor") return t("listings.secondFloor");
      return floor; // numeric floor (3, 4, ...)
    }, [t]);

    const priceRange = useMemo(() => {
      const orderData = request.orderFormData || {};
      if (orderData.fromPrice || orderData.toPrice || orderData.priceFrom || orderData.priceTo || 
          orderData.villaPriceFrom || orderData.villaPriceTo || orderData.apartmentSalePriceFrom || 
          orderData.apartmentSalePriceTo || orderData.bigFlatPriceFrom || orderData.bigFlatPriceTo ||
          orderData.loungePriceFrom || orderData.loungePriceTo || orderData.smallHousePriceFrom ||
          orderData.smallHousePriceTo || orderData.storePriceFrom || orderData.storePriceTo ||
          orderData.buildingPriceFrom || orderData.buildingPriceTo || orderData.landPriceFrom ||
          orderData.landPriceTo || orderData.roomPriceFrom || orderData.roomPriceTo ||
          orderData.officePriceFrom || orderData.officePriceTo || orderData.tentPriceFrom ||
          orderData.tentPriceTo || orderData.warehousePriceFrom || orderData.warehousePriceTo ||
          orderData.chaletPriceFrom || orderData.chaletPriceTo) {
        const from = orderData.fromPrice || orderData.priceFrom || orderData.villaPriceFrom || 
                     orderData.apartmentSalePriceFrom || orderData.bigFlatPriceFrom || 
                     orderData.loungePriceFrom || orderData.smallHousePriceFrom || 
                     orderData.storePriceFrom || orderData.buildingPriceFrom || 
                     orderData.landPriceFrom || orderData.roomPriceFrom || 
                     orderData.officePriceFrom || orderData.tentPriceFrom || 
                     orderData.warehousePriceFrom || orderData.chaletPriceFrom || "0";
        const to = orderData.toPrice || orderData.priceTo || orderData.villaPriceTo || 
                   orderData.apartmentSalePriceTo || orderData.bigFlatPriceTo || 
                   orderData.loungePriceTo || orderData.smallHousePriceTo || 
                   orderData.storePriceTo || orderData.buildingPriceTo || 
                   orderData.landPriceTo || orderData.roomPriceTo || 
                   orderData.officePriceTo || orderData.tentPriceTo || 
                   orderData.warehousePriceTo || orderData.chaletPriceTo || "∞";
        return `${from} - ${to} ${t("listings.riyals")}`;
      }
      return null;
    }, [request.orderFormData, t]);

    interface ChipData {
      label: string;
      icon?: string;
      iconLibrary?: "Ionicons" | "MaterialCommunityIcons" | "FontAwesome";
    }

    const getChips = useMemo((): ChipData[] => {
      const orderData = request.orderFormData || {};
      const chips: ChipData[] = [];

      // Age – only show when not first option (All)
      if (orderData.age && orderData.age !== AGE_OPTIONS[0]) {
        let years = orderData.age;
        if (orderData.age.startsWith("Less than")) {
          const yearMatch = orderData.age.match(/\d+/)?.[0];
          if (yearMatch) {
            years = yearMatch;
          }
        }
        chips.push({
          label: t("listings.lessThanYears", { years }),
          icon: "business-outline",
          iconLibrary: "Ionicons",
        });
      }

      // Floor – only show when not first option (All)
      if (orderData.floor && orderData.floor !== FLOOR_OPTIONS[0]) {
        const translatedFloor = translateFloor(orderData.floor);
        chips.push({
          label: t("listings.floorLabel", { floor: translatedFloor }),
          icon: "layers-outline",
          iconLibrary: "Ionicons",
        });
      }

      // Area
      if (orderData.areaFrom || orderData.areaTo) {
        const from = orderData.areaFrom || "0";
        const to = orderData.areaTo || "∞";
        chips.push({
          label: `${from} / ${to} m²`,
          icon: "ruler",
          iconLibrary: "MaterialCommunityIcons",
        });
      }

      // WC (TabBar – show any selected option)
      if (orderData.selectedWc) {
        chips.push({
          label: translateAll(orderData.selectedWc),
          icon: "water-outline",
          iconLibrary: "Ionicons",
        });
      }

      // Living Rooms (TabBar – show any selected option)
      if (orderData.selectedLivingRoom) {
        chips.push({
          label: translateAll(orderData.selectedLivingRoom),
          icon: "sofa",
          iconLibrary: "MaterialCommunityIcons",
        });
      }

      // Bedrooms (TabBar – show any selected option)
      if (orderData.selectedBedroom) {
        chips.push({
          label: translateAll(orderData.selectedBedroom),
          icon: "bed-outline",
          iconLibrary: "Ionicons",
        });
      }

      // Apartments (TabBar – show any selected option: Apartment for rent, Building for sale/rent)
      const apartmentsValue = orderData.selectedApartment || orderData.buildingApartments || orderData.buildingRentApartments;
      if (apartmentsValue) {
        chips.push({
          label: t("listings.apartmentsLabel", { value: translateAll(apartmentsValue) }),
          icon: "albums-outline",
          iconLibrary: "Ionicons",
        });
      }

      // Street direction – only show when not first option (All)
      const streetDirectionValue = orderData.streetDirection || orderData.landStreetDirection ||
          orderData.smallHouseStreetDirection || orderData.buildingStreetDirection ||
          orderData.villaRentStreetDirection || orderData.smallHouseRentStreetDirection ||
          orderData.buildingRentStreetDirection || orderData.landRentStreetDirection;
      if (streetDirectionValue && streetDirectionValue !== STREET_DIRECTION_OPTIONS[0]) {
        const translatedDirection = translateStreetDirection(streetDirectionValue);
        chips.push({ label: t("listings.streetDirectionLabel", { direction: translatedDirection }) });
      }

      // Street width – only show when not first option (All)
      const streetWidthValue = orderData.streetWidth || orderData.landStreetWidth ||
          orderData.smallHouseStreetWidth || orderData.loungeStreetWidth ||
          orderData.storeStreetWidth || orderData.villaRentStreetWidth ||
          orderData.smallHouseRentStreetWidth || orderData.storeRentStreetWidth ||
          orderData.buildingRentStreetWidth || orderData.landRentStreetWidth ||
          orderData.officeRentStreetWidth || orderData.warehouseRentStreetWidth;
      if (streetWidthValue && streetWidthValue !== STREET_WIDTH_OPTIONS[0]) {
        const translatedWidth = translateStreetWidth(streetWidthValue);
        chips.push({ label: t("listings.streetWidthLabel", { width: translatedWidth }) });
      }

      // Villa Type
      if (orderData.selectedVillaType) {
        const translatedVillaType = translateVillaType(orderData.selectedVillaType);
        chips.push({ label: t("listings.villaTypeLabel", { type: translatedVillaType }) });
      }

      // Features (individual chips)
      if (orderData.stairs) chips.push({ label: t("listings.stairs") });
      if (orderData.pool || orderData.loungeRentPool || orderData.chaletRentPool) {
        chips.push({ label: t("listings.pool") });
      }
      if (orderData.kitchen || orderData.loungeRentKitchen || orderData.smallHouseRentKitchen ||
          orderData.roomRentKitchen || orderData.chaletRentKitchen) {
        chips.push({ label: t("listings.kitchen") });
      }
      if (orderData.furnished || orderData.villaFurnished || orderData.smallHouseFurnished ||
          orderData.smallHouseRentFurnished || orderData.officeRentFurnished) {
        chips.push({ label: t("listings.furnished") });
      }
      if (orderData.maidRoom || orderData.villaRentMaidRoom) {
        chips.push({ label: t("listings.maidRoom") });
      }
      if (orderData.basement || orderData.villaRentBasement) {
        chips.push({ label: t("listings.basement") });
      }
      if (orderData.driverRoom || orderData.villaRentDriverRoom) {
        chips.push({ label: t("listings.driverRoom") });
      }
      if (orderData.airConditioned || orderData.villaRentAirConditioned ||
          orderData.bigFlatAirConditioned || orderData.apartmentSaleAirConditioned) {
        chips.push({
          label: t("listings.airConditioned"),
          icon: "snow-outline",
          iconLibrary: "Ionicons",
        });
      }

      const paymentFrequency =
        orderData.rentPeriod ||
        orderData.villaRentRentPeriod ||
        orderData.bigFlatRentPeriod ||
        orderData.loungeRentRentPeriod ||
        orderData.roomRentRentPeriod ||
        orderData.tentRentRentPeriod ||
        orderData.chaletRentRentPeriod;
      if (paymentFrequency && paymentFrequency !== "ALL") {
        chips.push({
          label: t("listings.paymentFrequencyLabel", {
            period: translateRentPaymentFrequency(paymentFrequency),
          }),
          icon: "calendar-outline",
          iconLibrary: "Ionicons",
        });
      }

      if (orderData.apartmentRentTenant) {
        chips.push({
          label: t("listings.tenantTypeChip", {
            tenant: translateApartmentRentTenant(orderData.apartmentRentTenant),
          }),
        });
      }

      return chips;
    }, [
      request.orderFormData,
      t,
      translateStreetDirection,
      translateVillaType,
      translateRentPaymentFrequency,
      translateApartmentRentTenant,
      translateStreetWidth,
      translateAll,
      translateFloor,
    ]);

    const chips = getChips;

    const handleDeletePress = useCallback(() => {
      setShowDeleteModal(true);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
      setShowDeleteModal(false);
      onDelete?.(request.id);
    }, [onDelete, request.id]);

    const handleMatchedPress = useCallback(() => {
      onPress?.(request, matchCount);
    }, [onPress, request, matchCount]);

    // RTL-aware styles (only apply RTL-specific changes, preserve LTR styling)
    const rtlStyles = useMemo(
      () => ({
        topRow: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        description: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
          marginRight: isRTL ? 0 : wp(2),
          marginLeft: isRTL ? wp(2) : 0,
        },
        chipsContainer: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        chip: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        matchedSection: {
          alignItems: (isRTL ? "flex-end" : "flex-start") as "flex-start" | "flex-end",
        },
        matchedLabel: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        matchedValue: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        matchedChip: {
          alignSelf: (isRTL ? "flex-end" : "flex-start") as "flex-start" | "flex-end",
        },
        priceRange: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL]
    );

    const renderIcon = (chip: ChipData) => {
      if (!chip.icon) return null;
      
      const iconSize = wp(3.5);
      const iconColor = "#6b7280";
      
      if (chip.iconLibrary === "MaterialCommunityIcons") {
        return (
          <MaterialCommunityIcons
            name={chip.icon as any}
            size={iconSize}
            color={iconColor}
          />
        );
      } else if (chip.iconLibrary === "FontAwesome") {
        return (
          <FontAwesome
            name={chip.icon as any}
            size={iconSize}
            color={iconColor}
          />
        );
      } else {
        return (
          <Ionicons
            name={chip.icon as any}
            size={iconSize}
            color={iconColor}
          />
        );
      }
    };

    return (
      <View style={styles.card}>
        {/* Top Row: Description and Delete Button */}
        <View style={[styles.topRow, rtlStyles.topRow]}>
          {request.description ? (
            <Text style={[styles.description, rtlStyles.description]} numberOfLines={2}>
              {request.description}
            </Text>
          ) : (
            <View style={styles.emptyDescription} />
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={handleDeletePress}
              style={styles.deleteButton}
            >
              <MaterialCommunityIcons name="delete" size={wp(6)} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>

        {/* Price Range - Only show if available */}
        {priceRange && (
          <Text style={[styles.priceRange, rtlStyles.priceRange]}>{priceRange}</Text>
        )}

        {/* Chips */}
        {chips.length > 0 && (
          <View style={[styles.chipsContainer, rtlStyles.chipsContainer]}>
            {chips.map((chip, index) => (
              <View key={index} style={[styles.chip, rtlStyles.chip]}>
                {renderIcon(chip)}
                <Text style={styles.chipText}>{chip.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Matched Listings */}
        <View style={[styles.matchedSection, rtlStyles.matchedSection]}>
          <Text style={[styles.matchedLabel, rtlStyles.matchedLabel]}>{t("listings.matchedListings")}</Text>
          {matchCount > 0 ? (
            <TouchableOpacity
              style={[styles.matchedChip, rtlStyles.matchedChip]}
              onPress={handleMatchedPress}
              activeOpacity={0.5}
            >
              <Ionicons name="list-outline" size={wp(5.5)} color={"#fff000"} />
              <Text style={styles.matchedChipText}>{t("listings.all")}({matchCount})</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.matchedValue, rtlStyles.matchedValue]}>{t("listings.notAvailable")}</Text>
          )}
        </View>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          visible={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      </View>
    );
  }
);

SearchRequestCard.displayName = "SearchRequestCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: wp(2.5),
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: 1.2,
    borderColor: COLORS.border,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: hp(1),
    minHeight: hp(3),
  },
  description: {
    flex: 1,
    fontSize: wp(4),
    fontWeight: "600",
    color: COLORS.textPrimary,
    lineHeight: hp(2.5),
    marginRight: wp(2),
  },
  emptyDescription: {
    flex: 1,
  },
  deleteButton: {
    padding: wp(1),
    alignSelf: "flex-start",
  },
  priceRange: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(1.5),
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
    marginBottom: hp(1.5),
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    borderWidth: 1.2,
    borderColor: COLORS.border,
    gap: wp(1.5),
  },
  chipText: {
    fontSize: wp(3.5),
    color: COLORS.textPrimary,
    fontWeight: "400",
  },
  matchedChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    marginTop: hp(0.5),
    gap: wp(1.5),
  },
  matchedChipText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.primary,
  },
  matchedSection: {
    marginTop: hp(1),
    paddingTop: hp(1),
  },
  matchedLabel: {
    fontSize: wp(4),
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: hp(0.3),
  },
  matchedValue: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
  },
});

export default SearchRequestCard;
