import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export interface AqarCardProps {
  onPress?: () => void;
}

/**
 * Aqar+ card component with icon, title, subtitle and chevron
 */
const AqarCard = memo<AqarCardProps>(({ onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name="map" size={wp(8)} color="#fbbf24" />
        <Ionicons
          name="location"
          size={wp(4)}
          color="#fbbf24"
          style={styles.pinIcon}
        />
        <View style={styles.plusIcon}>
          <Ionicons name="add" size={wp(3.5)} color="#fbbf24" />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Aqar+</Text>
        <Text style={styles.subtitle}>Explore Aqar+ features</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={wp(5)}
        color="#e0e0e0"
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
});

AqarCard.displayName = "AqarCard";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  iconContainer: {
    width: wp(14),
    height: wp(14),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
    position: "relative",
  },
  pinIcon: {
    position: "absolute",
  },
  plusIcon: {
    position: "absolute",
    top: wp(-1),
    right: wp(-1),
    backgroundColor: "#fff",
    borderRadius: wp(2),
    width: wp(5),
    height: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: wp(4),
    color: "#1f2937",
    marginBottom: hp(0.3),
  },
  subtitle: {
    fontSize: wp(3),
    color: "#6b7280",
    fontWeight: "400",
  },
  chevron: {
    marginLeft: wp(2),
  },
});

export default AqarCard;
