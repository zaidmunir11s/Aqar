import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import i18n from '../../i18n/config';
import { getInitialLanguage, saveLanguage, getDeviceLanguage } from '../../utils/languageStorage';

export type SupportedLanguage = 'en' | 'ar';

interface LocalizationState {
  language: SupportedLanguage;
  isRTL: boolean;
  isInitialized: boolean;
  isLoading: boolean;
}

// Async thunk to initialize language from storage or device
export const initializeLanguage = createAsyncThunk(
  'localization/initializeLanguage',
  async () => {
    const language = await getInitialLanguage();
    return language;
  }
);

// Initialize based on device language
const initialDeviceLanguage = getDeviceLanguage();
const initialIsRTL = initialDeviceLanguage === 'ar';

// Note: I18nManager auto-flipping is disabled in config.ts
// Components handle RTL manually through styles

const initialState: LocalizationState = {
  language: initialDeviceLanguage, // Fallback initial state
  isRTL: initialIsRTL,
  isInitialized: false,
  isLoading: true,
};

const localizationSlice = createSlice({
  name: 'localization',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      const newLanguage = action.payload;
      const newIsRTL = newLanguage === 'ar';
      state.language = newLanguage;
      state.isRTL = newIsRTL;
      // Change i18n language
      i18n.changeLanguage(newLanguage);
      // Don't auto-flip I18nManager - components handle RTL manually
      // Save to AsyncStorage
      saveLanguage(newLanguage);
    },
    toggleLanguage: (state) => {
      const newLanguage: SupportedLanguage = state.language === 'en' ? 'ar' : 'en';
      const newIsRTL = newLanguage === 'ar';
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
        const newIsRTL = language === 'ar';
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
        // Fallback to device language on error
        const fallbackLanguage = getDeviceLanguage();
        state.language = fallbackLanguage;
        state.isRTL = fallbackLanguage === 'ar';
        state.isInitialized = true;
        state.isLoading = false;
        i18n.changeLanguage(fallbackLanguage);
        // Don't auto-flip I18nManager - components handle RTL manually
      });
  },
});

export const { setLanguage, toggleLanguage } = localizationSlice.actions;

export default localizationSlice.reducer;
