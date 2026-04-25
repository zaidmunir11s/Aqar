import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useLocalization } from "../../hooks/useLocalization";
import { COLORS } from "@/constants";

export interface PropertyAdvertiserProps {
  /** Display name of the user who published the ad (exact string from profile). */
  advertiserName: string;
  /**
   * Optional second line (e.g. agency / reviews). When omitted or empty, the row is hidden.
   */
  advertiserSubtitle?: string;
  /** When false, Call / WhatsApp are visually disabled and do not open dialer/apps. */
  contactActionsEnabled?: boolean;
  onCall: () => void;
  onWhatsApp: () => void;
  /** When set, the name row (with chevron) is tappable — e.g. open profile ads. */
  onAdvertiserRowPress?: () => void;
}

/**
 * Property advertiser information: name from listing; optional subtitle row; contact actions.
 */
const PropertyAdvertiser = memo<PropertyAdvertiserProps>(
  ({
    advertiserName,
    advertiserSubtitle,
    contactActionsEnabled = true,
    onCall,
    onWhatsApp,
    onAdvertiserRowPress,
  }) => {
    const { t, isRTL } = useLocalization();

    const displayName = advertiserName.trim();
    const nameLabel =
      displayName.length > 0 ? displayName : t("listings.notAvailable");
    const subtitleTrimmed = (advertiserSubtitle ?? "").trim();
    const showSubtitleRow = subtitleTrimmed.length > 0;

    const rtlStyles = useMemo(
      () => ({
        sectionTitle: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        advertiserHeader: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        advertiserLogo: {
          marginRight: isRTL ? 0 : wp(3),
          marginLeft: isRTL ? wp(3) : 0,
        },
        advertiserName: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        contactButtons: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        contactBtnText: {
          marginLeft: isRTL ? 0 : wp(2),
          marginRight: isRTL ? wp(2) : 0,
        },
        warningBox: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        warningText: {
          marginLeft: isRTL ? 0 : wp(2),
          marginRight: isRTL ? wp(2) : 0,
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL],
    );

    const advertiserHeaderStyle = [
      styles.advertiserHeader,
      rtlStyles.advertiserHeader,
    ];
    const advertiserHeaderRow = (
      <>
        <View style={[styles.advertiserLogo, rtlStyles.advertiserLogo]}>
          <MaterialCommunityIcons
            name="office-building"
            size={wp(8)}
            color="#3b82f6"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.advertiserName, rtlStyles.advertiserName]}>
            {nameLabel}
          </Text>
          {showSubtitleRow ? (
            <Text style={[styles.advertiserSubtitle, rtlStyles.advertiserName]}>
              {subtitleTrimmed}
            </Text>
          ) : null}
        </View>
        <Ionicons
          name={isRTL ? "chevron-back" : "chevron-forward"}
          size={wp(6)}
          color="#9ca3af"
        />
      </>
    );

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, rtlStyles.sectionTitle]}>
          {t("listings.advertiserInformation")}
        </Text>
        <View style={styles.advertiserCardWrapper}>
          <View style={styles.advertiserCard}>
            {onAdvertiserRowPress ? (
              <TouchableOpacity
                style={advertiserHeaderStyle}
                onPress={onAdvertiserRowPress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${nameLabel}. ${t("listings.advertiserRowOpenAdsA11y")}`}
              >
                {advertiserHeaderRow}
              </TouchableOpacity>
            ) : (
              <View style={advertiserHeaderStyle}>{advertiserHeaderRow}</View>
            )}

            <View style={[styles.contactButtons, rtlStyles.contactButtons]}>
              <TouchableOpacity
                style={[
                  styles.contactBtn,
                  styles.callBtn,
                  isRTL && styles.contactBtnRTL,
                  !contactActionsEnabled && styles.contactBtnDisabled,
                ]}
                onPress={onCall}
                disabled={!contactActionsEnabled}
                activeOpacity={contactActionsEnabled ? 0.7 : 1}
              >
                <Ionicons name="call" size={wp(5)} color="#fff" />
                <Text style={[styles.contactBtnText, rtlStyles.contactBtnText]}>
                  {t("listings.call")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.contactBtn,
                  styles.waBtn,
                  isRTL && styles.contactBtnRTL,
                  !contactActionsEnabled && styles.contactBtnDisabled,
                ]}
                onPress={onWhatsApp}
                disabled={!contactActionsEnabled}
                activeOpacity={contactActionsEnabled ? 0.7 : 1}
              >
                <FontAwesome name="whatsapp" size={wp(5)} color="#0ab63a" />
                <Text
                  style={[
                    styles.contactBtnText,
                    rtlStyles.contactBtnText,
                    { color: "#0ab63a" },
                  ]}
                >
                  {t("listings.wa")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  },
);

PropertyAdvertiser.displayName = "PropertyAdvertiser";

const styles = StyleSheet.create({
  section: {
    backgroundColor: COLORS.background,
    padding: wp(4),
    paddingTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: hp(2),
  },
  advertiserCardWrapper: {
    backgroundColor: COLORS.background,
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  advertiserCard: {
    marginBottom: 0,
  },
  advertiserHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  advertiserLogo: {
    width: wp(15),
    height: wp(15),
    backgroundColor: "#e5e7eb",
    borderRadius: wp(2),
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp(3),
  },
  advertiserName: {
    fontSize: wp(4),
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  advertiserSubtitle: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
    marginTop: hp(0.5),
  },
  contactButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    marginHorizontal: wp(1),
  },
  contactBtnRTL: {
    flexDirection: "row-reverse",
  },
  contactBtnDisabled: {
    opacity: 0.45,
  },
  callBtn: {
    backgroundColor: "#0e856a",
  },
  waBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: "#40ac55",
  },
  chatBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactBtnText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: "600",
    marginLeft: wp(2),
  },
  // warningBox / warningText removed (private messages not implemented)
});

export default PropertyAdvertiser;
