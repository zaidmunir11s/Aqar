import * as Localization from "expo-localization";
import type { SupportedLanguage } from "../redux/slices/localizationSlice";
import { STORAGE_KEYS } from "@/constants/storage";
import { backendRequest } from "./backendApi";
import { secureGet } from "@/utils/secureStore";

const SETTINGS_FETCH_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      },
    );
  });
}

/**
 * Get device locale and determine initial language
 */
export const getDeviceLanguage = (): SupportedLanguage => {
  const deviceLocale = Localization.getLocales()[0]?.languageCode || "en";
  return deviceLocale.startsWith("ar") ? "ar" : "en";
};

/**
 * Load saved language from the backend (`GET /api/me/settings`).
 * Skips the network call when there is no session (guest / new install).
 * On failure or timeout, returns null so the app can fall back to English.
 */
export const loadSavedLanguage =
  async (): Promise<SupportedLanguage | null> => {
    const token = await secureGet(STORAGE_KEYS.authToken);
    if (!token) {
      return null;
    }

    try {
      const res = await withTimeout(
        backendRequest<{
          success: boolean;
          data: { settings: { language?: string } };
        }>("/me/settings"),
        SETTINGS_FETCH_TIMEOUT_MS,
      );
      const savedLanguage = res.data?.settings?.language;
      if (savedLanguage === "en" || savedLanguage === "ar")
        return savedLanguage;
      return null;
    } catch (error) {
      if (__DEV__) {
        console.warn(
          "Using default language (en); could not load saved preference:",
          error,
        );
      }
      return null;
    }
  };

/**
 * Save language preference to Supabase (`public.user_settings`).
 * No-op if user is not signed in.
 */
export const saveLanguage = async (
  language: SupportedLanguage,
): Promise<void> => {
  try {
    await backendRequest("/me/settings", {
      method: "PATCH",
      body: { language },
    });
  } catch (error) {
    console.error("Error saving language:", error);
  }
};

/**
 * Get initial language: saved preference from API when signed in, otherwise English.
 */
export const getInitialLanguage = async (): Promise<SupportedLanguage> => {
  const savedLanguage = await loadSavedLanguage();
  if (savedLanguage) {
    return savedLanguage;
  }
  return "en";
};
