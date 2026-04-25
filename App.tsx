// App.tsx - Main entry point with refactored navigation
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useDispatch } from "react-redux";
import { I18nextProvider } from "react-i18next";
import { useAppSelector } from "./src/redux/hooks";
import AppNavigator from "./src/navigation/AppNavigator";
// import SafeAreaView from "./src/components/common/SafeAreaView";
import { ErrorBoundary } from "./src/components/common";
import { SearchRequestProvider } from "./src/context/searchRequest-context";
import { AuthProvider } from "./src/context/auth-context";
import { SupabaseProvider } from "./providers/supabase-provider";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { store, AppDispatch } from "./src/redux/Store";
import { initializeLanguage } from "./src/redux/slices/localizationSlice";
import i18n from "./src/i18n/config";
// Import rtlHelpers early to disable auto-flipping
import "./src/utils/rtlHelpers";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
  );
}

// Component to initialize localization (must be inside Provider)
const LocalizationInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isInitialized = useAppSelector(
    (state) => state.localization.isInitialized,
  );

  useEffect(() => {
    // Initialize language from AsyncStorage or device language
    if (!isInitialized) {
      dispatch(initializeLanguage());
    }
  }, [dispatch, isInitialized]);

  // Wait for initialization to complete before rendering children
  // This ensures RTL is properly set before UI renders
  if (!isInitialized) {
    return null; // or a loading screen
  }

  return <>{children}</>;
};

export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <ErrorBoundary>
        <Provider store={store}>
          <I18nextProvider i18n={i18n}>
            <LocalizationInitializer>
              <ClerkProvider
                publishableKey={publishableKey}
                tokenCache={tokenCache}
              >
                <AuthProvider>
                  <SafeAreaProvider>
                    <SupabaseProvider>
                      {/* <SafeAreaView> */}
                      <SearchRequestProvider>
                        <NavigationContainer>
                          <AppNavigator />
                        </NavigationContainer>
                      </SearchRequestProvider>
                      {/* </SafeAreaView> */}
                    </SupabaseProvider>
                  </SafeAreaProvider>
                </AuthProvider>
              </ClerkProvider>
            </LocalizationInitializer>
          </I18nextProvider>
        </Provider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
