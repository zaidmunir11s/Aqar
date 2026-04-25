import React, { memo, ReactNode, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useLocalization } from "@/hooks";
import BackButton from "./BackButton";
import { COLORS } from "../../constants";
export interface HeaderProps {
  title?: string;
  onBackPress?: () => void;
  onClosePress?: () => void;
  rightComponent?: ReactNode;
}

const Header = memo<HeaderProps>(
  ({ title, onBackPress, onClosePress, rightComponent }) => {
    const insets = useSafeAreaInsets();
    const { isRTL } = useLocalization();
    const showBack = Boolean(onBackPress);
    const showClose = Boolean(onClosePress);

    const rtlStyles = useMemo(
      (): { header: ViewStyle; headerTitle: TextStyle } => ({
        header: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        headerTitle: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
        },
      }),
      [isRTL],
    );

    const headerStyle = {
      ...styles.header,
      ...rtlStyles.header,
      paddingTop: insets.top + hp(1),
    };

    return (
      <View style={headerStyle}>
        {showClose ? (
          <TouchableOpacity
            onPress={onClosePress}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={wp(6)} color="#111827" />
          </TouchableOpacity>
        ) : showBack ? (
          <View style={styles.iconButton}>
            <BackButton
              onPress={onBackPress!}
              color={COLORS.primary}
              size={wp(6)}
            />
          </View>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
        {title != null && title !== "" ? (
          <Text style={[styles.headerTitle, rtlStyles.headerTitle]}>
            {title}
          </Text>
        ) : (
          <View style={styles.titleSpacer} />
        )}
        {rightComponent ?? <View style={styles.iconPlaceholder} />}
      </View>
    );
  },
);

Header.displayName = "Header";

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(2),
    backgroundColor: "#fff",
  },
  headerTitle: {
    flex: 1,
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#111827",
  },
  titleSpacer: {
    flex: 1,
  },
  iconButton: {
    width: wp(12),
    height: wp(12),
    minWidth: wp(12),
    minHeight: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  iconPlaceholder: {
    width: wp(12),
    minWidth: wp(12),
    height: wp(12),
  },
});

export default Header;
