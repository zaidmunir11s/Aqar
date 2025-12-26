import React, { memo } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

export interface LoadingIndicatorProps {
  message?: string;
  color?: string;
}

/**
 * Reusable loading indicator component
 */
const LoadingIndicator = memo<LoadingIndicatorProps>(
  ({ message = "Loading...", color = COLORS.primary }) => {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={color} />
        {message && <Text style={styles.text}>{message}</Text>}
      </View>
    );
  }
);

LoadingIndicator.displayName = "LoadingIndicator";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  text: {
    marginTop: 12,
    fontSize: wp(4),
    color: COLORS.textSecondary,
  },
});

export default LoadingIndicator;
