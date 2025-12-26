import React, { memo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  showForgotPassword?: boolean;
  onForgotPassword?: () => void;
}

/**
 * Reusable password input component
 */
const PasswordInput = memo<PasswordInputProps>(
  ({
    value,
    onChangeText,
    label = "Password",
    placeholder = "",
    showForgotPassword = false,
    onForgotPassword,
  }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    return (
      <View style={styles.container}>
        <View style={styles.passwordHeader}>
          <View style={styles.inputLabel}>
            <Ionicons name="lock-closed-outline" size={wp(6)} color="#0ab539" />
            <Text style={styles.labelText}>{label}</Text>
          </View>
          {showForgotPassword && onForgotPassword && (
            <TouchableOpacity onPress={onForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot your password?</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!showPassword}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={wp(5.5)}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

const styles = StyleSheet.create({
  container: {
    marginBottom: hp(3),
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1.2),
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: wp(2),
  },
  forgotPassword: {
    fontSize: wp(3.8),
    color: "#0ab539",
    fontWeight: "600",
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    height: hp(7),
  },
  passwordInput: {
    flex: 1,
    fontSize: wp(4.5),
    color: "#1f2937",
    padding: 0,
  },
  eyeIcon: {
    padding: wp(2),
  },
});

export default PasswordInput;
