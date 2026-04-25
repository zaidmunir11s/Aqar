import * as SecureStore from "expo-secure-store";

/**
 * Minimal async storage adapter compatible with supabase-js `auth.storage`.
 * Uses Expo SecureStore (encrypted on device) instead of AsyncStorage.
 */
export const secureStoreStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const v = await SecureStore.getItemAsync(key);
      return v ?? null;
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};
