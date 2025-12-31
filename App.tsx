// App.tsx - Main entry point with refactored navigation
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import SafeAreaView from "./src/components/common/SafeAreaView";
import { ErrorBoundary } from "./src/components/common";
import { SearchRequestProvider } from "./src/context/searchRequest-context";

export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SafeAreaView>
          <SearchRequestProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </SearchRequestProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
