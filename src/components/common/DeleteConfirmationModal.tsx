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

export interface DeleteConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Delete confirmation modal component
 */
const DeleteConfirmationModal = memo<DeleteConfirmationModalProps>(
  ({ visible, onCancel, onConfirm }) => {
    const { t, isRTL } = useLocalization();

    // RTL-aware styles (only apply RTL-specific changes, preserve LTR styling)
    const rtlStyles = useMemo(
      () => ({
        modalContent: {
          alignItems: (isRTL ? "flex-end" : "flex-start") as
            | "flex-start"
            | "flex-end",
        },
        modalHeading: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        modalText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        modalButtons: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
          justifyContent: (isRTL ? "flex-end" : "flex-end") as
            | "flex-start"
            | "flex-end",
          marginLeft: isRTL ? 0 : wp(3),
          marginRight: isRTL ? wp(3) : 0,
        },
        modalNoButtonText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
        modalYesButtonText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL],
    );

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, rtlStyles.modalContent]}>
            <Text style={[styles.modalHeading, rtlStyles.modalHeading]}>
              {t("common.appName")}
            </Text>
            <Text style={[styles.modalText, rtlStyles.modalText]}>
              {t("common.deleteRequestConfirm")}
            </Text>
            <View style={[styles.modalButtons, rtlStyles.modalButtons]}>
              <TouchableOpacity
                style={styles.modalNoButton}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalNoButtonText,
                    rtlStyles.modalNoButtonText,
                  ]}
                >
                  {t("common.no")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalYesButton}
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalYesButtonText,
                    rtlStyles.modalYesButtonText,
                  ]}
                >
                  {t("common.yes")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

DeleteConfirmationModal.displayName = "DeleteConfirmationModal";

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: wp(6),
    width: wp(74),
    borderRadius: wp(0.5),
  },
  modalHeading: {
    fontSize: wp(5),
    fontWeight: "600",
    color: COLORS.textPrimary,
    // textAlign: "center",
    marginBottom: hp(2),
  },
  modalText: {
    fontSize: wp(4),
    fontWeight: "400",
    color: COLORS.textSecondary,
    // textAlign: "center",
    // marginBottom: hp(2),
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-end",
    marginLeft: wp(3),
    // gap: wp(3),
  },
  modalNoButton: {
    paddingVertical: hp(1.5),
    // paddingHorizontal: wp(6),
    borderRadius: wp(2),
    // minWidth: wp(8),
    // alignItems: "center",
  },
  modalNoButtonText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  modalYesButton: {
    borderRadius: wp(2),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    // minWidth: wp(15),
    // alignItems: "center",
    // backgroundColor: COLORS.primary,
  },
  modalYesButtonText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.primary,
  },
});

export default DeleteConfirmationModal;
