import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS, CITY_REGIONS } from "../../constants";

// Get all cities from CITY_REGIONS (in original order)
const SAUDI_CITIES = Object.keys(CITY_REGIONS);

export interface LocationSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: string) => void;
  searchQuery?: string;
}

export default function LocationSearchModal({
  visible,
  onClose,
  onSelect,
  searchQuery = "",
}: LocationSearchModalProps): React.JSX.Element {
  const [searchText, setSearchText] = useState<string>(searchQuery);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sync search query when modal opens
  useEffect(() => {
    if (visible) {
      setSearchText(searchQuery || "");
    }
  }, [visible, searchQuery]);

  const filteredCities = useMemo(
    () => SAUDI_CITIES.filter((city) => city.toLowerCase().includes(searchText.toLowerCase())),
    [searchText]
  );

  const handleSelect = useCallback(
    (city: string) => {
      onSelect(city);
      setSearchText("");
      onClose();
    },
    [onSelect, onClose]
  );

  const handleClose = useCallback(() => {
    setSearchText("");
    onClose();
  }, [onClose]);

  // Memoized city item component for better performance
  const CityItem = memo<{ city: string; index: number; total: number; onSelect: (city: string) => void }>(
    ({ city, index, total, onSelect }) => (
      <View>
        <TouchableOpacity
          style={styles.cityItem}
          onPress={() => onSelect(city)}
          activeOpacity={0.7}
        >
          <Text style={styles.cityText}>{city}</Text>
        </TouchableOpacity>
        {index < total - 1 && <View style={styles.divider} />}
      </View>
    )
  );
  CityItem.displayName = "CityItem";

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <CityItem city={item} index={index} total={filteredCities.length} onSelect={handleSelect} />
    ),
    [filteredCities.length, handleSelect]
  );

  const keyExtractor = useCallback((item: string) => item, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: hp(1.5) + 1 + hp(1.5), // cityItem padding + divider + next cityItem padding
      offset: (hp(1.5) + 1 + hp(1.5)) * index,
      index,
    }),
    []
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.modalContainer}>
          {/* Search Input */}
          <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a city..."
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={false}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText("")}
                style={styles.clearButton}
              >
                <Ionicons name="close" size={wp(5)} color="#6b7280" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                if (searchText.trim()) {
                  handleSelect(searchText.trim());
                }
              }}
              style={styles.searchIconButton}
            >
              <Ionicons name="search" size={wp(5)} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Results List */}
          <FlatList
            data={filteredCities}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No cities found</Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={15}
            windowSize={5}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    height: hp(45),
    paddingBottom: Platform.OS === "ios" ? hp(2) : hp(1),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: wp(3),
    marginHorizontal: wp(4),
    marginTop: hp(2),
    marginBottom: hp(1),
    paddingLeft: wp(3),
    paddingRight: wp(2),
    paddingVertical: hp(1),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchContainerFocused: {
    backgroundColor: COLORS.activeChipBackground,
    borderColor: COLORS.activeChipBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: wp(4),
    color: "#111827",
    paddingVertical: 0,
    paddingRight: wp(2),
  },
  clearButton: {
    padding: wp(1),
    marginRight: wp(1),
  },
  searchIconButton: {
    padding: wp(1),
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  cityItem: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  cityText: {
    fontSize: wp(4),
    color: "#374151",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginLeft: wp(4),
  },
  emptyContainer: {
    paddingVertical: hp(4),
    alignItems: "center",
  },
  emptyText: {
    fontSize: wp(4),
    color: "#9ca3af",
  },
});


