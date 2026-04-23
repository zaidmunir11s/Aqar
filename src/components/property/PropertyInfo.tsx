import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "@/constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface InfoItemProps {
  icon: string;
  label: string;
  value: string;
  backgroundColor?: string;
}

/**
 * Property info item component
 */
export const InfoItem = memo<InfoItemProps>(
  ({ icon, label, value, backgroundColor }) => {
    const { isRTL } = useLocalization();

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        infoItem: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        infoLeftSection: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        infoLabel: {
          marginLeft: isRTL ? 0 : wp(3),
          marginRight: isRTL ? wp(3) : 0,
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        infoValue: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL]
    );

    return (
      <View style={[styles.infoItem, { backgroundColor }, rtlStyles.infoItem]}>
        <View style={[styles.infoLeftSection, rtlStyles.infoLeftSection]}>
          <Ionicons name={icon as any} size={wp(5)} color="#9ca3af" />
          <Text style={[styles.infoLabel, rtlStyles.infoLabel]}>{label}</Text>
        </View>
        <View style={styles.infoValueContainer}>
          <Text style={[styles.infoValue, rtlStyles.infoValue]}>{value}</Text>
        </View>
      </View>
    );
  }
);

InfoItem.displayName = "InfoItem";

export interface FeatureItemProps {
  label: string;
  backgroundColor?: string;
  showBorder?: boolean;
}

/**
 * Property feature item component
 */
export const FeatureItem = memo<FeatureItemProps>(
  ({ label, backgroundColor, showBorder }) => {
    const { isRTL } = useLocalization();

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        featureItem: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        featureLabel: {
          marginLeft: isRTL ? 0 : wp(2),
          marginRight: isRTL ? wp(2) : 0,
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL]
    );

    return (
      <View style={[styles.featureItem, { backgroundColor }, rtlStyles.featureItem]}>
        <Ionicons name="checkmark-circle" size={wp(5)} color={COLORS.checkmarkCircle} />
        <Text style={[styles.featureLabel, rtlStyles.featureLabel]}>{label}</Text>
      </View>
    );
  }
);

FeatureItem.displayName = "FeatureItem";

export interface DetailRowProps {
  label: string;
  value: string;
  showCopy?: boolean;
  onCopy?: () => void;
  copyLabel?: string;
  backgroundColor?: string;
  isLast?: boolean;
}

/**
 * Detail row component
 */
export const DetailRow = memo<DetailRowProps>(
  ({ label, value, showCopy, onCopy, copyLabel, backgroundColor, isLast }) => {
    const { isRTL, t } = useLocalization();

    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        detailRow: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        detailLabel: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        detailValueContainer: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
          justifyContent: "space-between" as "space-between",
        },
        detailValue: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        copyAction: {
          flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        },
        copyText: {
          marginLeft: isRTL ? 0 : wp(1),
          marginRight: isRTL ? wp(1) : 0,
        },
      }),
      [isRTL]
    );

    return (
      <View
        style={[
          styles.detailRow,
          { backgroundColor },
          isLast && styles.lastDetailRow,
          rtlStyles.detailRow,
        ]}
      >
        <Text style={[styles.detailLabel, rtlStyles.detailLabel]}>{label}</Text>
        <View style={[styles.detailValueContainer, rtlStyles.detailValueContainer]}>
          <Text style={[styles.detailValue, rtlStyles.detailValue]}>{value}</Text>
          {showCopy && onCopy && (
            <TouchableOpacity onPress={onCopy} style={[styles.copyAction, rtlStyles.copyAction]}>
              <Ionicons name="copy-outline" size={wp(4.5)} color={COLORS.textTertiary} />
              <Text style={[styles.copyText, rtlStyles.copyText]}>
                {copyLabel?.trim() ? copyLabel.trim() : t("common.copy")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

DetailRow.displayName = "DetailRow";

const styles = StyleSheet.create({
  infoItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  infoLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    fontSize: wp(3.5),
    color: COLORS.textPrimary,
  },
  infoValueContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  infoValue: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  featureItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  featureLabel: {
    fontSize: wp(3.5),
    color: COLORS.textPrimary,
    flex: 1,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  lastDetailRow: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: hp(1),
  },
  detailLabel: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    flex: 1,
  },
  detailValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
  },
  detailValue: {
    fontSize: wp(3.5),
    color: COLORS.textPrimary,
    fontWeight: "600",
    flexShrink: 1,
  },
  copyAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  copyText: {
    fontSize: wp(3.2),
    color: COLORS.textTertiary,
  },
});
