import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { i18n } from "@/i18n";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="alert-circle"
                size={wp(20)}
                color={COLORS.error}
              />
            </View>

            <Text style={styles.title}>{i18n.t("errors.unexpectedTitle")}</Text>

            <Text style={styles.message}>
              {i18n.t("errors.unexpectedMessage")}
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>
                  {i18n.t("errors.errorDetails")}
                </Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{i18n.t("common.retry")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(6),
    paddingVertical: hp(4),
  },
  iconContainer: {
    marginBottom: hp(3),
  },
  title: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: hp(1.5),
  },
  message: {
    fontSize: wp(4),
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: hp(4),
    lineHeight: hp(3),
  },
  errorDetails: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(3),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorDetailsTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(1),
  },
  errorText: {
    fontSize: wp(3.5),
    color: COLORS.error,
    fontFamily: "monospace",
    marginBottom: hp(1),
  },
  errorStack: {
    fontSize: wp(3),
    color: COLORS.textSecondary,
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(6),
    paddingHorizontal: wp(8),
    paddingVertical: hp(1.5),
    minWidth: wp(40),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.white,
  },
});

export default ErrorBoundary;
