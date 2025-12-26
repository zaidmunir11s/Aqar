// App.tsx - Main entry point with refactored navigation
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import SafeAreaView from "./src/components/common/SafeAreaView";
import { SearchRequestProvider } from "./src/context/searchRequest-context";

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <SearchRequestProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SearchRequestProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
