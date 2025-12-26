import React, { memo, ReactNode } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import BackButton from "./BackButton";

export interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  rightComponent?: ReactNode;
}

const Header = memo<HeaderProps>(({ title, onBackPress, rightComponent }) => {
  return (
    <View style={styles.header}>
      {onBackPress && <BackButton onPress={onBackPress} color="#111827" />}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
});

Header.displayName = "Header";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === "ios" ? hp(6) : hp(3),
    paddingBottom: hp(2),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#111827",
  },
});

export default Header;
