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
import { useLocalization } from "@/hooks";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  backButtonColor?: string;
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
    backButtonColor = "#0e856a",
  }) => {
    const { isRTL } = useLocalization();
    const insets = useSafeAreaInsets();
    const { top } = insets;
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
            style={[styles.rightContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
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

    // Determine back arrow icon based on RTL
    const backIconName: keyof typeof Ionicons.glyphMap = isRTL ? "arrow-forward" : "arrow-back";

    // RTL-aware styles
    const headerStyle = {
      ...styles.header,
      flexDirection: (isRTL ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
    };

    const leftContainerStyle = {
      ...styles.leftContainer,
      flexDirection: (isRTL ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
    };

    const titleStyle = {
      ...styles.title,
      textAlign: (isRTL ? 'right' : 'left') as 'left' | 'right',
      marginLeft: onBackPress && !isRTL ? wp(2) : 0,
      marginRight: onBackPress && isRTL ? wp(2) : 0,
      flex: 1,
    };

    const backButtonStyle = {
      ...styles.backButton,
      alignItems: 'center' as const,
    };

    return (
      <View style={[headerStyle, { paddingTop: top }]}>
        <View style={leftContainerStyle}>
          {onBackPress && (
            <TouchableOpacity
              style={backButtonStyle}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <Ionicons name={backIconName} size={wp(7)} color={backButtonColor} />
            </TouchableOpacity>
          )}
          <Text
            style={[
              titleStyle,
              fontWeightBold && styles.titleBold,
              fontSize !== undefined ? { fontSize } : null,
            ].filter(Boolean)}
            numberOfLines={1}
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
    paddingHorizontal: wp(2),
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
    alignItems: "center",
  },
  title: {
    fontSize: wp(5),
    fontWeight: "500",
  },
  titleBold: {
    // fontWeight: "bold",
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
