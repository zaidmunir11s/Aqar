import React, { memo, useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface AddActionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddAdPress: () => void;
  onSearchRequestPress: () => void;
}

const AddActionBottomSheet = memo<AddActionBottomSheetProps>(
  ({ visible, onClose, onAddAdPress, onSearchRequestPress }) => {
    const { t, isRTL } = useLocalization();
    const insets = useSafeAreaInsets();

    const rtlStyles = useMemo(
      () => ({
        title: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        optionRow: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        optionTextWrap: {
          marginLeft: isRTL ? 0 : wp(3),
          marginRight: isRTL ? wp(3) : 0,
        },
        optionText: {
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
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, hp(2)) },
            ]}
            onPress={() => undefined}
          >
            <Text style={[styles.title, rtlStyles.title]}>
              {t("listings.whatWouldYouLikeToAdd")}
            </Text>

            <TouchableOpacity
              style={[
                styles.optionCard,
                styles.addOptionCard,
                rtlStyles.optionRow,
              ]}
              activeOpacity={0.85}
              onPress={onAddAdPress}
            >
              <View style={[styles.iconWrap, styles.addIconWrap]}>
                <MaterialCommunityIcons
                  name="home-plus-outline"
                  size={wp(6)}
                  color={COLORS.primary}
                />
              </View>

              <View style={[styles.optionTextWrap, rtlStyles.optionTextWrap]}>
                <Text style={[styles.optionTitle, rtlStyles.optionText]}>
                  {t("listings.addAnAd")}
                </Text>
                <Text style={[styles.optionDescription, rtlStyles.optionText]}>
                  {t("listings.addAnAdDescription")}
                </Text>
              </View>

              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={wp(5)}
                color={COLORS.textTertiary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                styles.searchOptionCard,
                rtlStyles.optionRow,
              ]}
              activeOpacity={0.85}
              onPress={onSearchRequestPress}
            >
              <View style={[styles.iconWrap, styles.searchIconWrap]}>
                <MaterialCommunityIcons
                  name="home-search-outline"
                  size={wp(6)}
                  color="#0ea5e9"
                />
              </View>

              <View style={[styles.optionTextWrap, rtlStyles.optionTextWrap]}>
                <Text style={[styles.optionTitle, rtlStyles.optionText]}>
                  {t("listings.propertySearchRequest")}
                </Text>
                <Text style={[styles.optionDescription, rtlStyles.optionText]}>
                  {t("listings.addActionSearchRequestDescription")}
                </Text>
              </View>

              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={wp(5)}
                color={COLORS.textTertiary}
              />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

AddActionBottomSheet.displayName = "AddActionBottomSheet";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: wp(6),
    borderTopRightRadius: wp(6),
    paddingHorizontal: wp(4),
    paddingTop: hp(2.2),
    minHeight: hp(33),
    gap: hp(1.4),
  },
  title: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(0.6),
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    alignItems: "center",
    flexDirection: "row",
  },
  addOptionCard: {
    paddingVertical: hp(1.3),
  },
  searchOptionCard: {
    paddingVertical: hp(1.3),
  },
  optionTextWrap: {
    flex: 1,
    marginLeft: wp(3),
  },
  iconWrap: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  addIconWrap: {
    backgroundColor: "#dcfce7",
  },
  searchIconWrap: {
    backgroundColor: "#e0f2fe",
  },
  optionTitle: {
    fontSize: wp(4.3),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(0.2),
  },
  optionDescription: {
    fontSize: wp(3.8),
    color: COLORS.textSecondary,
    lineHeight: hp(2.3),
  },
});

export default AddActionBottomSheet;
