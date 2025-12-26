import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export interface PropertyAdvertiserProps {
  onCall: () => void;
  onWhatsApp: () => void;
  onChat: () => void;
}

/**
 * Property advertiser information component
 */
const PropertyAdvertiser = memo<PropertyAdvertiserProps>(
  ({ onCall, onWhatsApp, onChat }) => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advertiser information</Text>
        <View style={styles.advertiserCardWrapper}>
          <View style={styles.advertiserCard}>
            <View style={styles.advertiserHeader}>
              <View style={styles.advertiserLogo}>
                <MaterialCommunityIcons
                  name="office-building"
                  size={wp(8)}
                  color="#3b82f6"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.advertiserName}>مؤسسة سلالم العقارية</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={wp(4)} color="#fbbf24" />
                  <Text style={styles.ratingText}>5 Reviews (8)</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={wp(6)} color="#9ca3af" />
            </View>

            {/* Contact Buttons */}
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={[styles.contactBtn, styles.callBtn]}
                onPress={onCall}
              >
                <Ionicons name="call" size={wp(5)} color="#fff" />
                <Text style={styles.contactBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactBtn, styles.waBtn]}
                onPress={onWhatsApp}
              >
                <FontAwesome name="whatsapp" size={wp(5)} color="#0ab63a" />
                <Text style={[styles.contactBtnText, { color: "#0ab63a" }]}>
                  WA
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactBtn, styles.chatBtn]}
                onPress={onChat}
              >
                <MaterialIcons name="chat" size={wp(5)} color="#6a7681" />
                <Text style={[styles.contactBtnText, { color: "#6a7681" }]}>
                  Chat
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Fraud Warning */}
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={wp(5)} color="#3b82f6" />
          <Text style={styles.warningText}>
            Communicating through Aqar's private messages reduces fraud.
          </Text>
        </View>
      </View>
    );
  }
);

PropertyAdvertiser.displayName = "PropertyAdvertiser";

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#ebf1f1",
    padding: wp(4),
    paddingTop: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hp(2),
  },
  advertiserCardWrapper: {
    backgroundColor: "#ebf1f1",
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: 2,
    borderColor: "#dadee8",
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
    color: "#111827",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(0.5),
  },
  ratingText: {
    fontSize: wp(3),
    color: "#6b7280",
    marginLeft: wp(1),
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
  callBtn: {
    backgroundColor: "#0e856a",
  },
  waBtn: {
    backgroundColor: "#ebf1f1",
    borderWidth: 2,
    borderColor: "#40ac55",
  },
  chatBtn: {
    backgroundColor: "#ebf1f1",
    borderWidth: 1,
    borderColor: "#d1d6dc",
  },
  contactBtnText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "600",
    marginLeft: wp(2),
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#ebf1f1",
    padding: wp(3),
    borderRadius: wp(2),
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#dadee8",
  },
  warningText: {
    flex: 1,
    fontSize: wp(3),
    color: "#777c81",
    marginLeft: wp(2),
  },
});

export default PropertyAdvertiser;
