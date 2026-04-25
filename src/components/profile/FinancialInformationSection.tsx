import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import SectionHeader from "./SectionHeader";
import { useLocalization } from "../../hooks/useLocalization";

export interface FinancialInformationSectionProps {
  onPaymentsPress?: () => void;
  onFinancialSettingsPress?: () => void;
  onManageCardsPress?: () => void;
}

/**
 * Financial Information section component with header and menu items
 */
const FinancialInformationSection = memo<FinancialInformationSectionProps>(
  ({ onPaymentsPress, onFinancialSettingsPress, onManageCardsPress }) => {
    const { t } = useLocalization();
    return (
      <View style={styles.container}>
        <SectionHeader
          title={t("profile.financialInformation")}
          iconName="card"
        />
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onPaymentsPress}
            activeOpacity={0.7}
          >
            <Text style={styles.menuItemText}>{t("profile.payments")}</Text>
            <Ionicons
              name="chevron-forward"
              size={wp(5)}
              color={COLORS.textDisabled}
              style={styles.chevron}
            />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onFinancialSettingsPress}
            activeOpacity={0.7}
          >
            <Text style={styles.menuItemText}>
              {t("profile.financialSettings")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={wp(5)}
              color={COLORS.textDisabled}
              style={styles.chevron}
            />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onManageCardsPress}
            activeOpacity={0.7}
          >
            <Text style={styles.menuItemText}>{t("profile.manageCards")}</Text>
            <Ionicons
              name="chevron-forward"
              size={wp(5)}
              color={COLORS.textDisabled}
              style={styles.chevron}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

FinancialInformationSection.displayName = "FinancialInformationSection";

const styles = StyleSheet.create({
  container: {
    marginTop: hp(2),
    marginBottom: hp(1.5),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    marginHorizontal: wp(4),
    overflow: "hidden",
    width: "100%",
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  menuItemText: {
    fontSize: wp(4),
    fontWeight: "400",
    color: COLORS.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.bgGray,
    marginHorizontal: wp(4),
  },
  chevron: {
    marginLeft: wp(2),
  },
});

export default FinancialInformationSection;
