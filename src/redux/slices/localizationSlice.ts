import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import i18n from "../../i18n/config";
import { getInitialLanguage, saveLanguage } from "../../utils/languageStorage";

export type SupportedLanguage = "en" | "ar";

interface LocalizationState {
  language: SupportedLanguage;
  isRTL: boolean;
  isInitialized: boolean;
  isLoading: boolean;
}

// Async thunk to initialize language from storage or device
export const initializeLanguage = createAsyncThunk(
  "localization/initializeLanguage",
  async () => {
    const language = await getInitialLanguage();
    return language;
  },
);

// Note: I18nManager auto-flipping is disabled in config.ts
// Components handle RTL manually through styles

const initialState: LocalizationState = {
  language: "en",
  isRTL: false,
  isInitialized: false,
  isLoading: true,
};

const localizationSlice = createSlice({
  name: "localization",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      const newLanguage = action.payload;
      const newIsRTL = newLanguage === "ar";
      state.language = newLanguage;
      state.isRTL = newIsRTL;
      // Change i18n language
      i18n.changeLanguage(newLanguage);
      // Don't auto-flip I18nManager - components handle RTL manually
      // Save to AsyncStorage
      saveLanguage(newLanguage);
    },
    toggleLanguage: (state) => {
      const newLanguage: SupportedLanguage =
        state.language === "en" ? "ar" : "en";
      const newIsRTL = newLanguage === "ar";
      state.language = newLanguage;
      state.isRTL = newIsRTL;
      i18n.changeLanguage(newLanguage);
      // Don't auto-flip I18nManager - components handle RTL manually
      // Save to AsyncStorage
      saveLanguage(newLanguage);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeLanguage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeLanguage.fulfilled, (state, action) => {
        const language = action.payload;
        const newIsRTL = language === "ar";
        state.language = language;
        state.isRTL = newIsRTL;
        state.isInitialized = true;
        state.isLoading = false;
        // Initialize i18n with saved or device language
        i18n.changeLanguage(language);
        // Don't auto-flip I18nManager - components handle RTL manually
        if (__DEV__) {
          console.log(`Language initialized: ${language}, RTL: ${newIsRTL}`);
        }
      })
      .addCase(initializeLanguage.rejected, (state) => {
        state.language = "en";
        state.isRTL = false;
        state.isInitialized = true;
        state.isLoading = false;
        i18n.changeLanguage("en");
        // Don't auto-flip I18nManager - components handle RTL manually
      });
  },
});

export const { setLanguage, toggleLanguage } = localizationSlice.actions;

export default localizationSlice.reducer;
