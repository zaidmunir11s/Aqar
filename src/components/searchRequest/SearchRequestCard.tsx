import React, { memo, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { SearchRequestData } from "@/context/searchRequest-context";
import { findMatchingProperties } from "@/utils/propertyMatching";
import { DeleteConfirmationModal } from "../common";

export interface SearchRequestCardProps {
  request: SearchRequestData;
  onDelete?: (id: string) => void;
  onPress?: (request: SearchRequestData, matchedCount: number) => void;
}

const SearchRequestCard = memo<SearchRequestCardProps>(
  ({ request, onDelete, onPress }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const matchedProperties = useMemo(() => findMatchingProperties(request), [request]);
    const matchCount = matchedProperties.length;

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const getPriceRange = () => {
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
        return `${from} - ${to} Riyals`;
      }
      return null;
    };

    interface ChipData {
      label: string;
      icon?: string;
      iconLibrary?: "Ionicons" | "MaterialCommunityIcons" | "FontAwesome";
    }

    const getChips = (): ChipData[] => {
      const orderData = request.orderFormData || {};
      const chips: ChipData[] = [];

      // Age
      if (orderData.age && orderData.age !== "ALL") {
        chips.push({
          label: `Less than ${orderData.age} years`,
          icon: "business-outline",
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

      // WC
      if (orderData.selectedWc) {
        chips.push({
          label: orderData.selectedWc === "ALL" ? "All" : orderData.selectedWc,
          icon: "water-outline",
          iconLibrary: "Ionicons",
        });
      }

      // Living Rooms
      if (orderData.selectedLivingRoom) {
        chips.push({
          label: orderData.selectedLivingRoom === "ALL" ? "All" : orderData.selectedLivingRoom,
          icon: "sofa",
          iconLibrary: "MaterialCommunityIcons",
        });
      }

      // Bedrooms
      if (orderData.selectedBedroom) {
        chips.push({
          label: orderData.selectedBedroom === "ALL" ? "All" : orderData.selectedBedroom,
          icon: "bed-outline",
          iconLibrary: "Ionicons",
        });
      }

      // Street direction
      if (orderData.streetDirection || orderData.landStreetDirection || 
          orderData.smallHouseStreetDirection || orderData.buildingStreetDirection ||
          orderData.villaRentStreetDirection || orderData.smallHouseRentStreetDirection ||
          orderData.buildingRentStreetDirection || orderData.landRentStreetDirection) {
        const direction = orderData.streetDirection || orderData.landStreetDirection || 
                         orderData.smallHouseStreetDirection || orderData.buildingStreetDirection ||
                         orderData.villaRentStreetDirection || orderData.smallHouseRentStreetDirection ||
                         orderData.buildingRentStreetDirection || orderData.landRentStreetDirection;
        chips.push({ label: `Street direction ${direction}` });
      }

      // Street width
      if (orderData.streetWidth || orderData.landStreetWidth || 
          orderData.smallHouseStreetWidth || orderData.loungeStreetWidth ||
          orderData.storeStreetWidth || orderData.villaRentStreetWidth ||
          orderData.smallHouseRentStreetWidth || orderData.storeRentStreetWidth ||
          orderData.buildingRentStreetWidth || orderData.landRentStreetWidth ||
          orderData.officeRentStreetWidth || orderData.warehouseRentStreetWidth) {
        const width = orderData.streetWidth || orderData.landStreetWidth || 
                     orderData.smallHouseStreetWidth || orderData.loungeStreetWidth ||
                     orderData.storeStreetWidth || orderData.villaRentStreetWidth ||
                     orderData.smallHouseRentStreetWidth || orderData.storeRentStreetWidth ||
                     orderData.buildingRentStreetWidth || orderData.landRentStreetWidth ||
                     orderData.officeRentStreetWidth || orderData.warehouseRentStreetWidth;
        chips.push({ label: `Street width ${width}` });
      }

      // Villa Type
      if (orderData.selectedVillaType) {
        chips.push({ label: `Villa Type ${orderData.selectedVillaType || "undefined"}` });
      }

      // Features (individual chips)
      if (orderData.stairs) chips.push({ label: "Stairs" });
      if (orderData.pool || orderData.loungeRentPool || orderData.chaletRentPool) {
        chips.push({ label: "Pool" });
      }
      if (orderData.kitchen || orderData.loungeRentKitchen || orderData.smallHouseRentKitchen ||
          orderData.roomRentKitchen || orderData.chaletRentKitchen) {
        chips.push({ label: "Kitchen" });
      }
      if (orderData.furnished || orderData.villaFurnished || orderData.smallHouseFurnished ||
          orderData.smallHouseRentFurnished || orderData.officeRentFurnished) {
        chips.push({ label: "Furnished" });
      }
      if (orderData.maidRoom || orderData.villaRentMaidRoom) {
        chips.push({ label: "Maid room" });
      }
      if (orderData.basement || orderData.villaRentBasement) {
        chips.push({ label: "Basement" });
      }
      if (orderData.driverRoom || orderData.villaRentDriverRoom) {
        chips.push({ label: "Driver room" });
      }
      if (orderData.airConditioned || orderData.villaRentAirConditioned ||
          orderData.bigFlatAirConditioned || orderData.apartmentSaleAirConditioned) {
        chips.push({
          label: "Air conditioned",
          icon: "snow-outline",
          iconLibrary: "Ionicons",
        });
      }

      // Rent Period
      if (orderData.rentPeriod && orderData.rentPeriod !== "ALL") {
        chips.push({
          label: `Rent Period ${orderData.rentPeriod}`,
          icon: "calendar-outline",
          iconLibrary: "Ionicons",
        });
      }

      return chips;
    };

    const priceRange = getPriceRange();
    const chips = getChips();

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
        <View style={styles.topRow}>
          {request.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {request.description}
            </Text>
          ) : (
            <View style={styles.emptyDescription} />
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              style={styles.deleteButton}
            >
              <MaterialCommunityIcons name="delete" size={wp(6)} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>

        {/* Price Range - Only show if available */}
        {priceRange && (
          <Text style={styles.priceRange}>{priceRange}</Text>
        )}

        {/* Chips */}
        {chips.length > 0 && (
          <View style={styles.chipsContainer}>
            {chips.map((chip, index) => (
              <View key={index} style={styles.chip}>
                {renderIcon(chip)}
                <Text style={styles.chipText}>{chip.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Matched Listings */}
        <View style={styles.matchedSection}>
          <Text style={styles.matchedLabel}>Matched Listings</Text>
          {matchCount > 0 ? (
            <TouchableOpacity
              style={styles.matchedChip}
              onPress={() => onPress && onPress(request, matchCount)}
              activeOpacity={0.5}
            >
              <Ionicons name="list-outline" size={wp(5.5)} color={"#fff000"} />
              <Text style={styles.matchedChipText}>ALL({matchCount})</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.matchedValue}>Not available</Text>
          )}
        </View>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          visible={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            onDelete && onDelete(request.id);
          }}
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
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
    // borderTopWidth: 1,
    // borderTopColor: "#e5e7eb",
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
