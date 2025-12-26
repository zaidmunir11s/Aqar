import React, { memo } from "react";
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
    return (
      <View style={[styles.infoItem, { backgroundColor }]}>
        <View style={styles.infoLeftSection}>
          <Ionicons name={icon as any} size={wp(5)} color="#9ca3af" />
          <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <View style={styles.infoValueContainer}>
          <Text style={styles.infoValue}>{value}</Text>
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
    return (
      <View style={[styles.featureItem, { backgroundColor }]}>
        <Ionicons name="checkmark-circle" size={wp(5)} color={COLORS.checkmarkCircle} />
        <Text style={styles.featureLabel}>{label}</Text>
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
  backgroundColor?: string;
  isLast?: boolean;
}

/**
 * Detail row component
 */
export const DetailRow = memo<DetailRowProps>(
  ({ label, value, showCopy, onCopy, backgroundColor, isLast }) => {
    return (
      <View
        style={[
          styles.detailRow,
          { backgroundColor },
          isLast && styles.lastDetailRow,
        ]}
      >
        <Text style={styles.detailLabel}>{label}</Text>
        <View style={styles.detailValueContainer}>
          <Text style={styles.detailValue}>{value}</Text>
          {showCopy && onCopy && (
            <TouchableOpacity onPress={onCopy}>
              <Ionicons name="copy-outline" size={wp(4.5)} color="#666" />
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
    color: "#374151",
    marginLeft: wp(3),
  },
  infoValueContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  infoValue: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: "#111827",
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
    color: "#374151",
    marginLeft: wp(2),
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
    borderBottomColor: "#d1d5db",
    marginBottom: hp(1),
  },
  detailLabel: {
    fontSize: wp(3.5),
    color: "#6b7280",
  },
  detailValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailValue: {
    fontSize: wp(3.5),
    color: "#111827",
    fontWeight: "600",
    marginRight: wp(2),
  },
});
