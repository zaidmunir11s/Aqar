import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import SectionHeader from "./SectionHeader";

export interface ClientsSectionProps {
  onMyClientsPress?: () => void;
}

/**
 * Clients section component with header and My Clients menu item
 */
const ClientsSection = memo<ClientsSectionProps>(({ onMyClientsPress }) => {
  return (
    <View style={styles.container}>
      <SectionHeader title="Clients" iconName="people" />
      <TouchableOpacity
        style={styles.card}
        onPress={onMyClientsPress}
        activeOpacity={0.7}
      >
        <Text style={styles.cardText}>My Clients</Text>
        <Ionicons
          name="chevron-forward"
          size={wp(5)}
          color={COLORS.textDisabled}
          style={styles.chevron}
        />
      </TouchableOpacity>
    </View>
  );
});

ClientsSection.displayName = "ClientsSection";

const styles = StyleSheet.create({
  container: {
    marginTop: hp(2),
    marginBottom: hp(1.5),
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    marginHorizontal: wp(4),
    width: "100%",
    alignSelf: "center",
  },
  cardText: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  chevron: {
    marginLeft: wp(2),
  },
});

export default ClientsSection;
