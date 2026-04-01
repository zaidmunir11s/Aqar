import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants";

/** Persist phone from login / signup / verify (digits only, same as auth forms). */
export async function setLoggedInPhoneNumber(phoneDigits: string): Promise<void> {
  const d = phoneDigits.replace(/\D/g, "");
  if (d.length > 0) {
    await AsyncStorage.setItem(STORAGE_KEYS.loggedInPhoneNumber, d);
  }
}

export async function setLoggedInDisplayName(fullName: string): Promise<void> {
  const trimmed = fullName.trim();
  if (trimmed.length > 0) {
    await AsyncStorage.setItem(STORAGE_KEYS.loggedInDisplayName, trimmed);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.loggedInDisplayName);
  }
}

export async function setLoggedInProfileImageUri(
  uri: string | null | undefined
): Promise<void> {
  if (uri && uri.length > 0) {
    await AsyncStorage.setItem(STORAGE_KEYS.loggedInProfileImageUri, uri);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.loggedInProfileImageUri);
  }
}
