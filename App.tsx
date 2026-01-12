// App.tsx - Main entry point with refactored navigation
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import SafeAreaView from "./src/components/common/SafeAreaView";
import { ErrorBoundary } from "./src/components/common";
import { SearchRequestProvider } from "./src/context/searchRequest-context";
import { SupabaseProvider } from "./providers/supabase-provider";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <SafeAreaProvider>
          <SupabaseProvider>
            <SafeAreaView>
              <SearchRequestProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </SearchRequestProvider>
            </SafeAreaView>
          </SupabaseProvider>
        </SafeAreaProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
