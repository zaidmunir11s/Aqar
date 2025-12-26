import React, { memo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  countryCode?: string;
  placeholder?: string;
}

/**
 * Reusable phone input component
 */
const PhoneInput = memo<PhoneInputProps>(
  ({
    value,
    onChangeText,
    label = "Phone number",
    countryCode = "+966",
    placeholder = "",
  }) => {
    return (
      <View style={styles.container}>
        <View style={styles.inputLabel}>
          <Ionicons
            name="phone-portrait-outline"
            size={wp(6)}
            color="#0ab539"
          />
          <Text style={styles.labelText}>{label}</Text>
        </View>
        <View style={styles.phoneInputWrapper}>
          <Text style={styles.countryCode}>{countryCode}</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType="phone-pad"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

const styles = StyleSheet.create({
  container: {
    marginBottom: hp(3),
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.2),
  },
  labelText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: wp(2),
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    height: hp(7),
  },
  countryCode: {
    fontSize: wp(4.5),
    color: "#0ab539",
    fontWeight: "600",
    marginRight: wp(2),
  },
  phoneInput: {
    flex: 1,
    fontSize: wp(4.5),
    color: "#1f2937",
    padding: 0,
  },
});

export default PhoneInput;
