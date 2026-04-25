import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

const ROOM_OPTIONS = ["1", "2", "3", "4", "5", "more"];

export interface ProjectUnitsFilterState {
  rooms: string | null;
  livingRooms: string | null;
  wcs: string | null;
  minPrice: string;
  maxPrice: string;
}

const defaultFilterState: ProjectUnitsFilterState = {
  rooms: null,
  livingRooms: null,
  wcs: null,
  minPrice: "",
  maxPrice: "",
};

export interface ProjectUnitsFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (filters: ProjectUnitsFilterState) => void;
  initialFilters?: ProjectUnitsFilterState | null;
}

export default function ProjectUnitsFilterModal({
  visible,
  onClose,
  onSearch,
  initialFilters,
}: ProjectUnitsFilterModalProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocalization();
  const [filters, setFilters] = useState<ProjectUnitsFilterState>(
    initialFilters ?? defaultFilterState,
  );
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setFilters(initialFilters ?? defaultFilterState);
    } else {
      setKeyboardVisible(false);
    }
  }, [visible, initialFilters]);

  // Animate modal up when keyboard shows, back down when it hides (same pattern as NewOrderScreen / DeedOwnerInformationScreen)
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        setKeyboardVisible(true);
        Animated.timing(keyboardHeight, {
          toValue: event.endCoordinates.height,
          duration: event.duration ?? 250,
          useNativeDriver: false,
        }).start();
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (event) => {
        setKeyboardVisible(false);
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: event.duration ?? 250,
          useNativeDriver: false,
        }).start();
      },
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardHeight]);

  const updateFilter = useCallback(
    <K extends keyof ProjectUnitsFilterState>(
      key: K,
      value: ProjectUnitsFilterState[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleClear = useCallback(() => {
    setFilters(defaultFilterState);
    onSearch(defaultFilterState);
    onClose();
  }, [onSearch, onClose]);

  const handleSearch = useCallback(() => {
    onSearch(filters);
    onClose();
  }, [filters, onSearch, onClose]);

  const rtlStyles = useMemo(
    () => ({
      header: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      headerTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        marginLeft: isRTL ? 0 : wp(2),
        marginRight: isRTL ? wp(2) : 0,
      },
      sectionLabel: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      chipRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      priceRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      priceInput: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      footer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
    }),
    [isRTL],
  );

  const renderChipRow = useCallback(
    (
      labelKey:
        | "projects.unitsFilter.rooms"
        | "projects.unitsFilter.livingRooms"
        | "projects.unitsFilter.wcs",
      filterKey: "rooms" | "livingRooms" | "wcs",
    ) => (
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, rtlStyles.sectionLabel]}>
          {t(labelKey)}
        </Text>
        <View style={[styles.chipRow, rtlStyles.chipRow]}>
          {ROOM_OPTIONS.map((opt) => {
            const isSelected = filters[filterKey] === opt;
            const displayLabel =
              opt === "more" ? t("projects.unitsFilter.more") : opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => updateFilter(filterKey, isSelected ? null : opt)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {displayLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    ),
    [filters, rtlStyles, t, updateFilter],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[styles.modalContainerWrapper, { bottom: keyboardHeight }]}
        >
          <View style={styles.modalContainer}>
            {/* Header - same as ProjectSearchModal */}
            <View style={[styles.header, rtlStyles.header]}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons
                  name={isRTL ? "arrow-forward" : "arrow-back"}
                  size={wp(6)}
                  color={COLORS.arrows}
                />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, rtlStyles.headerTitle]}>
                {t("common.search")}
              </Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Body - single ScrollView; scroll only when keyboard is visible to avoid focus loss */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={keyboardVisible}
              scrollEnabled={keyboardVisible}
              keyboardShouldPersistTaps="handled"
            >
              {renderChipRow("projects.unitsFilter.rooms", "rooms")}
              {renderChipRow("projects.unitsFilter.livingRooms", "livingRooms")}
              {renderChipRow("projects.unitsFilter.wcs", "wcs")}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, rtlStyles.sectionLabel]}>
                  {t("projects.unitsFilter.price")}
                </Text>
                <View style={[styles.priceRow, rtlStyles.priceRow]}>
                  <View style={styles.priceInputWrapper}>
                    <TextInput
                      style={[styles.priceInput, rtlStyles.priceInput]}
                      placeholder={t("projects.unitsFilter.minPrice")}
                      placeholderTextColor="#9ca3af"
                      value={filters.minPrice}
                      onChangeText={(v) => updateFilter("minPrice", v)}
                      keyboardType="numeric"
                    />
                  </View>
                  <Text style={styles.priceSeparator}>-</Text>
                  <View style={styles.priceInputWrapper}>
                    <TextInput
                      style={[styles.priceInput, rtlStyles.priceInput]}
                      placeholder={t("projects.unitsFilter.maxPrice")}
                      placeholderTextColor="#9ca3af"
                      value={filters.maxPrice}
                      onChangeText={(v) => updateFilter("maxPrice", v)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer - same as ProjectSearchModal */}
            <View
              style={[
                styles.footer,
                rtlStyles.footer,
                {
                  paddingBottom: Math.max(
                    insets.bottom,
                    Platform.OS === "ios" ? hp(2) : hp(1),
                  ),
                },
              ]}
            >
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>{t("common.clear")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                activeOpacity={0.7}
              >
                <Text style={styles.searchButtonText}>
                  {t("common.search")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    width: "100%",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    width: "100%",
    minHeight: hp(60),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(1.5),
  },
  backButton: {
    padding: wp(0.5),
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingBottom: hp(3),
  },
  bodyContent: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingBottom: hp(1),
  },
  section: {
    marginBottom: hp(2),
  },
  sectionLabel: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: hp(1),
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(4),
  },
  chip: {
    paddingVertical: hp(1.3),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  chipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.activeChipBackground,
  },
  chipText: {
    fontSize: wp(3.8),
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: COLORS.primary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  priceInputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    backgroundColor: COLORS.background,
  },
  priceInput: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    padding: 0,
  },
  priceSeparator: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: "space-between",
    gap: wp(3),
  },
  clearButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1d87bc",
    borderRadius: wp(2),
    flex: 1,
  },
  clearButtonText: {
    fontSize: wp(4),
    color: "#1d87bc",
    fontWeight: "bold",
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  searchButtonText: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: "#fff",
  },
});
