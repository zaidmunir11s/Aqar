import React, { useState, useCallback, useEffect } from "react";
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
import { COLORS } from "../../constants";

// Common Saudi cities - you can expand this list
const SAUDI_CITIES = [
  "Riyadh",
  "Jeddah",
  "Mecca",
  "Medina",
  "Dammam",
  "Khobar",
  "Abha",
  "Tabuk",
  "Buraidah",
  "Khamis Mushait",
  "Hail",
  "Najran",
  "Jazan",
  "Yanbu",
  "Al Jubail",
  "Al Khobar",
  "Al Bukayriyah",
  "Al Qatif",
  "Arar",
  "Sakaka",
];

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

  const filteredCities = SAUDI_CITIES.filter((city) =>
    city.toLowerCase().includes(searchText.toLowerCase())
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
            keyExtractor={(item) => item}
            renderItem={({ item, index }) => (
              <View>
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cityText}>{item}</Text>
                </TouchableOpacity>
                {index < filteredCities.length - 1 && <View style={styles.divider} />}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No cities found</Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
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


