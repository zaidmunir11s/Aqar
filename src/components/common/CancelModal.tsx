import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export interface CancelModalProps {
  visible: boolean;
  title?: string;
  description?: string;
  onBack: () => void;
  onConfirm: () => void;
  backText?: string;
  confirmText?: string;
  confirmButtonColor?: string;
  /** When true, title/description align to the start edge (LTR left / RTL right); default keeps centered block. */
  alignBodyToStart?: boolean;
}

/**
 * Reusable cancel confirmation modal component
 */
const CancelModal = memo<CancelModalProps>(
  ({
    visible,
    title,
    description,
    onBack,
    onConfirm,
    backText,
    confirmText,
    confirmButtonColor,
    alignBodyToStart = false,
  }) => {
    const { t, isRTL } = useLocalization();

    // Use translations as defaults if not provided
    const defaultTitle = t("common.cancelAddingAds");
    const defaultBackText = t("common.back");
    const defaultConfirmText = t("common.yes");

    const finalTitle = title ?? defaultTitle;
    const finalBackText = backText ?? defaultBackText;
    const finalConfirmText = confirmText ?? defaultConfirmText;

    // RTL-aware styles (only apply RTL-specific changes, preserve LTR styling)
    const rtlStyles = useMemo(
      () => ({
        modalHeading: alignBodyToStart
          ? {
              textAlign: (isRTL ? "right" : "left") as "left" | "right",
              alignSelf: "stretch" as const,
            }
          : {
              textAlign: (isRTL ? "right" : undefined) as "right" | undefined,
            },
        modalText: alignBodyToStart
          ? {
              textAlign: (isRTL ? "right" : "left") as "left" | "right",
              alignSelf: "stretch" as const,
            }
          : {
              textAlign: (isRTL ? "right" : undefined) as "right" | undefined,
            },
        modalButtons: isRTL
          ? {
              flexDirection: "row-reverse" as const,
              justifyContent: "flex-end" as const, // flex-end in row-reverse puts buttons on the left
            }
          : {},
      }),
      [isRTL, alignBodyToStart],
    );

    const contentStyle = alignBodyToStart
      ? [styles.modalContent, styles.modalContentAlignStart]
      : styles.modalContent;

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onBack}
      >
        <View style={styles.modalOverlay}>
          <View style={contentStyle}>
            {finalTitle && !description && (
              <Text style={[styles.modalText, rtlStyles.modalText]}>
                {finalTitle}
              </Text>
            )}
            {finalTitle && description && (
              <Text style={[styles.modalHeading, rtlStyles.modalHeading]}>
                {finalTitle}
              </Text>
            )}
            {description && (
              <Text style={[styles.modalText, rtlStyles.modalText]}>
                {description}
              </Text>
            )}
            <View style={[styles.modalButtons, rtlStyles.modalButtons]}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={onBack}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBackButtonText}>{finalBackText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalYesButton}
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalYesButtonText,
                    confirmButtonColor && { color: confirmButtonColor },
                  ]}
                >
                  {finalConfirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

CancelModal.displayName = "CancelModal";

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: wp(5),
    width: wp(80),
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalContentAlignStart: {
    alignItems: "stretch",
  },
  modalHeading: {
    fontSize: wp(5),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(1.5),
  },
  modalText: {
    fontSize: wp(4),
    fontWeight: "400",
    color: COLORS.textSecondary,
    marginBottom: hp(2),
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-end",
  },
  modalBackButton: {
    paddingVertical: hp(1.5),
    minWidth: wp(10),
    alignItems: "center",
  },
  modalBackButtonText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textTertiary,
  },
  modalYesButton: {
    borderRadius: wp(2.5),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    minWidth: wp(10),
  },
  modalYesButtonText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.primary,
  },
});

export default CancelModal;
