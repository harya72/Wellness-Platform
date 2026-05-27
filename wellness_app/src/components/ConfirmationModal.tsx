import React from "react";
import { View, StyleSheet, Modal, Pressable, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import { useUI } from "@context/UiProvider";
import CustomText from "./CustomText";
import CustomButton from "./CustomButton";
import { RADIUS } from "@utils/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  loading = false,
}) => {
  const { theme } = useUI();

  const getIconName = (): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (type) {
      case "danger":
        return "alert-circle";
      case "warning":
        return "alert";
      case "info":
        return "information";
      default:
        return "alert-circle";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "danger":
        return theme.error;
      case "warning":
        return theme.warning;
      case "info":
        return theme.info;
      default:
        return theme.error;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case "danger":
        return theme.error;
      case "warning":
        return theme.warning;
      case "info":
        return theme.primary;
      default:
        return theme.error;
    }
  };

  return (
    <View>
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onClose} />

          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${getIconColor()}20` },
              ]}
            >
              <MaterialCommunityIcons
                name={getIconName()}
                size={32}
                color={getIconColor()}
              />
            </View>

            <CustomText
              font="Bold"
              style={[styles.title, { color: theme.text.primary }]}
            >
              {title}
            </CustomText>

            <CustomText
              font="Regular"
              style={[styles.message, { color: theme.text.secondary }]}
            >
              {message}
            </CustomText>

            <View style={styles.buttonContainer}>
              <CustomButton
                title={cancelText}
                onPress={onClose}
                variant="outline"
                style={styles.button}
                disabled={loading}
              />
              <CustomButton
                title={confirmText}
                onPress={onConfirm}
                color={getConfirmButtonColor()}
                style={styles.button}
                loading={loading}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: SCREEN_WIDTH - 48,
    borderRadius: RADIUS.xl,
    padding: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: RFValue(18),
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: RFValue(14),
    textAlign: "center",
    marginBottom: 24,
    lineHeight: RFValue(20),
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
  },
});
