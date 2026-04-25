import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export type ProjectUnitsSortOption =
  | "normalSort"
  | "priceHighToLow"
  | "priceLowToHigh"
  | "areaHighToLow"
  | "areaLowToHigh";

const SORT_OPTIONS: ProjectUnitsSortOption[] = [
  "normalSort",
  "priceHighToLow",
  "priceLowToHigh",
  "areaHighToLow",
  "areaLowToHigh",
];

export interface ProjectUnitsSortModalProps {
  visible: boolean;
  onClose: () => void;
  selectedOption: ProjectUnitsSortOption;
  onSelect: (option: ProjectUnitsSortOption) => void;
  /** When provided, only these options are shown (e.g. Normal Sort, Price high/low only). */
  options?: ProjectUnitsSortOption[];
}

export default function ProjectUnitsSortModal({
  visible,
  onClose,
  selectedOption,
  onSelect,
  options: optionsProp,
}: ProjectUnitsSortModalProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocalization();

  const sortOptions = useMemo(() => optionsProp ?? SORT_OPTIONS, [optionsProp]);

  const handleSelect = useCallback(
    (option: ProjectUnitsSortOption) => {
      onSelect(option);
      onClose();
    },
    [onSelect, onClose],
  );

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
      row: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      rowLabel: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL],
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
        <View
          style={[
            styles.modalContainerWrapper,
            { paddingBottom: Math.max(insets.bottom, hp(2)) },
          ]}
        >
          <View style={styles.modalContainer}>
            {/* Header - same pattern as ProjectUnitsFilterModal */}
            <View style={[styles.header, rtlStyles.header]}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons
                  name={isRTL ? "arrow-forward" : "arrow-back"}
                  size={wp(6)}
                  color={COLORS.arrows}
                />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, rtlStyles.headerTitle]}>
                {t("projects.filterBy")}
              </Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Body - list: line, row, line, row, line, ... */}
            <View style={styles.body}>
              <View style={styles.rowSeparator} />
              {sortOptions.map((option) => {
                const isSelected = selectedOption === option;
                return (
                  <React.Fragment key={option}>
                    <TouchableOpacity
                      style={[styles.row, rtlStyles.row]}
                      onPress={() => handleSelect(option)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.rowLabel, rtlStyles.rowLabel]}>
                        {t(`projects.sort.${option}`)}
                      </Text>
                      <View style={styles.radioOuter}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                    <View style={styles.rowSeparator} />
                  </React.Fragment>
                );
              })}
            </View>
          </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainerWrapper: {
    width: "100%",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: wp(4),
    paddingTop: hp(1.5),
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
  body: {
    paddingTop: hp(0.5),
    paddingBottom: hp(2),
  },
  rowSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    alignSelf: "stretch",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  rowLabel: {
    fontSize: wp(4),
    color: COLORS.textSecondary,
    fontWeight: "400",
    flex: 1,
  },
  radioOuter: {
    width: wp(4.5),
    height: wp(4.5),
    borderRadius: wp(2),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.5),
    backgroundColor: COLORS.primary,
  },
});
