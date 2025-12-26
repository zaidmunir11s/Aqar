import React, { memo, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export interface ScreenHeaderProps {
  title: string;
  onBackPress?: () => void;
  showRightSide?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightText?: string;
  onRightPress?: () => void;
  rightComponent?: ReactNode;
  fontWeightBold?: boolean;
  fontSize?: number;
  
}

const ScreenHeader = memo<ScreenHeaderProps>(
  ({
    title,
    onBackPress,
    showRightSide = false,
    rightIcon,
    rightText,
    onRightPress,
    rightComponent,
    fontWeightBold = false,
    fontSize,
  }) => {
    const renderRightSide = () => {
      if (!showRightSide) {
        return <View style={{ width: wp(12) }} />;
      }

      if (rightComponent) {
        return rightComponent;
      }

      if (rightIcon && rightText && onRightPress) {
        return (
          <TouchableOpacity
            style={styles.rightContainer}
            onPress={onRightPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.rightText]}>{rightText}</Text>
            <View style={[styles.rightIconContainer]}>
              <Ionicons name={rightIcon} size={wp(4)} color="#fff" />
            </View>
          </TouchableOpacity>
        );
      }

      return <View style={{ width: wp(12) }} />;
    };

    return (
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          {onBackPress && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={wp(7)} color={"#0e856a"} />
            </TouchableOpacity>
          )}
          <Text
            style={[
              styles.title,
              fontWeightBold && styles.titleBold,
              fontSize !== undefined ? { fontSize } : null,
            ].filter(Boolean)}
          >
            {title}
          </Text>
        </View>

        {renderRightSide()}
      </View>
    );
  }
);

ScreenHeader.displayName = "ScreenHeader";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
  },
  title: {
    fontSize: wp(4),
  },
  titleBold: {
    fontWeight: "bold",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  rightText: {
    fontSize: wp(3.8),
    fontWeight: "600",
  },
  rightIconContainer: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ScreenHeader;
