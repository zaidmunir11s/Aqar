import * as SecureStore from "expo-secure-store";

export async function secureGet(key: string): Promise<string | null> {
  try {
    return (await SecureStore.getItemAsync(key)) ?? null;
  } catch {
    return null;
  }
}

export async function secureSet(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function secureRemove(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

export async function secureMultiRemove(keys: string[]): Promise<void> {
  await Promise.all(keys.map((k) => SecureStore.deleteItemAsync(k)));
}
