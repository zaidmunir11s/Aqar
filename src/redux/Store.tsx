import { configureStore } from '@reduxjs/toolkit';
import localizationReducer from './slices/localizationSlice';

export const store = configureStore({
  reducer: {
    localization: localizationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
