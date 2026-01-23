import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import type { SupportedLanguage } from '../redux/slices/localizationSlice';

const LANGUAGE_STORAGE_KEY = '@app_language';

/**
 * Get device locale and determine initial language
 */
export const getDeviceLanguage = (): SupportedLanguage => {
  const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
  return deviceLocale.startsWith('ar') ? 'ar' : 'en';
};

/**
 * Load saved language preference from AsyncStorage
 * Returns null if no preference is saved (first time install)
 */
export const loadSavedLanguage = async (): Promise<SupportedLanguage | null> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage === 'en' || savedLanguage === 'ar') {
      return savedLanguage as SupportedLanguage;
    }
    return null;
  } catch (error) {
    console.error('Error loading saved language:', error);
    return null;
  }
};

/**
 * Save language preference to AsyncStorage
 */
export const saveLanguage = async (language: SupportedLanguage): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

/**
 * Get initial language: saved preference or device language
 */
export const getInitialLanguage = async (): Promise<SupportedLanguage> => {
  const savedLanguage = await loadSavedLanguage();
  if (savedLanguage) {
    return savedLanguage;
  }
  // First time install - use device language
  return getDeviceLanguage();
};
