import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import {
  setLanguage,
  toggleLanguage as toggleLanguageAction,
} from "../redux/slices/localizationSlice";
import type { SupportedLanguage } from "../redux/slices/localizationSlice";

/**
 * Custom hook for localization
 * Provides translation function, current language, RTL status, and language control functions
 * Note: Language initialization is handled in App.tsx via initializeLanguage thunk
 */
export const useLocalization = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.localization.language);
  const isRTL = useAppSelector((state) => state.localization.isRTL);
  const isInitialized = useAppSelector(
    (state) => state.localization.isInitialized
  );

  const changeLanguage = useCallback(
    (lang: SupportedLanguage) => {
      dispatch(setLanguage(lang));
    },
    [dispatch]
  );

  const toggleLanguage = useCallback(() => {
    dispatch(toggleLanguageAction());
  }, [dispatch]);

  return useMemo(
    () => ({
      t,
      i18n,
      language,
      isRTL,
      changeLanguage,
      toggleLanguage,
      isInitialized,
    }),
    [t, i18n, language, isRTL, changeLanguage, toggleLanguage, isInitialized]
  );
};
