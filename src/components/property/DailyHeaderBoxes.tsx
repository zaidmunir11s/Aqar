import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";

interface DailyHeaderBoxesProps {
  reservationText: string;
  onReservationPress: () => void;
  onCityPress: () => void;
  onFiltersPress: () => void;
  containerStyle?: object;
  cityText?: string;
}

export default function DailyHeaderBoxes({
  reservationText,
  onReservationPress,
  onCityPress,
  onFiltersPress,
  containerStyle,
  cityText,
}: DailyHeaderBoxesProps): React.JSX.Element {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.boxes}>
        <TouchableOpacity
          style={[styles.box, styles.boxFirst]}
          onPress={onReservationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={wp(5)} color="#333" />
          <Text 
            style={styles.boxText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {reservationText}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={onCityPress}
          activeOpacity={0.7}
        >
          <Ionicons name="location-outline" size={wp(5)} color="#333" />
          <Text 
            style={styles.boxText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {cityText || "City"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={onFiltersPress}
          activeOpacity={0.7}
        >
          <Ionicons name="filter-outline" size={wp(5)} color="#333" />
          <Text 
            style={styles.boxText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Filters
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Container styles can be customized via containerStyle prop
  },
  boxes: {
    flexDirection: "row",
    paddingHorizontal: wp(2),
    gap: wp(2),
  },
  box: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: wp(2.5),
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: hp(6),
    gap: wp(1),
  },
  boxFirst: {
    flex: 2,
  },
  boxText: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    fontWeight: "500",
    flex: 1,
  },
});

