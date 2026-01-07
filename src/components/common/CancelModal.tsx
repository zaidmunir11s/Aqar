import React, { memo } from "react";
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

export interface CancelModalProps {
  visible: boolean;
  title?: string;
  description?: string;
  onBack: () => void;
  onConfirm: () => void;
  backText?: string;
  confirmText?: string;
  confirmButtonColor?: string;
}

/**
 * Reusable cancel confirmation modal component
 */
const CancelModal = memo<CancelModalProps>(
  ({
    visible,
    title = "Do you want to cancel adding ads?",
    description,
    onBack,
    onConfirm,
    backText = "Back",
    confirmText = "Yes",
    confirmButtonColor,
  }) => {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onBack}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {title && !description && <Text style={styles.modalText}>{title}</Text>}
            {title && description && <Text style={styles.modalHeading}>{title}</Text>}
            {description && <Text style={styles.modalText}>{description}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={onBack}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBackButtonText}>{backText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalYesButton}
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.modalYesButtonText,
                  confirmButtonColor && { color: confirmButtonColor }
                ]}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
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


