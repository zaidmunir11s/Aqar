import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";
import * as Localization from "expo-localization";
import enTranslations from "./locales/en.json";
import arTranslations from "./locales/ar.json";

// Explicitly disable auto-flipping - we handle RTL manually through styles
// This prevents React Native from automatically flipping the entire layout
// These settings persist but require app restart to take full effect
I18nManager.allowRTL(false); // Disable RTL support globally
I18nManager.forceRTL(false); // Ensure RTL is not forced
I18nManager.swapLeftAndRightInRTL(false); // Disable automatic left/right swapping

// Get device locale
const deviceLocale = Localization.getLocales()[0]?.languageCode || "en";
const initialLanguage = deviceLocale.startsWith("ar") ? "ar" : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslations,
    },
    ar: {
      translation: arTranslations,
    },
  },
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false, // Disable suspense for React Native
  },
} as const);

export default i18n;
