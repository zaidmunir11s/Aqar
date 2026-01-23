import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setLanguage, toggleLanguage } from '../redux/slices/localizationSlice';
import type { SupportedLanguage } from '../redux/slices/localizationSlice';

/**
 * Custom hook for localization
 * Provides translation function, current language, RTL status, and language control functions
 * Note: Language initialization is handled in App.tsx via initializeLanguage thunk
 */
export const useLocalization = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { language, isRTL, isInitialized } = useAppSelector(
    (state) => state.localization
  );

  const changeLanguage = (lang: SupportedLanguage) => {
    dispatch(setLanguage(lang));
  };

  const toggle = () => {
    dispatch(toggleLanguage());
  };

  return {
    t, // Translation function
    i18n, // i18n instance for advanced usage
    language, // Current language code ('en' | 'ar')
    isRTL, // Whether current language is RTL
    changeLanguage, // Function to change language
    toggleLanguage: toggle, // Function to toggle between languages
    isInitialized, // Whether localization has been initialized
  };
};
