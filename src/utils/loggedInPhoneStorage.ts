import { STORAGE_KEYS } from "../constants";
import { secureRemove, secureSet } from "./secureStore";

/** Persist phone from login / signup / verify (digits only, same as auth forms). */
export async function setLoggedInPhoneNumber(phoneDigits: string): Promise<void> {
  const d = phoneDigits.replace(/\D/g, "");
  if (d.length > 0) {
    await secureSet(STORAGE_KEYS.loggedInPhoneNumber, d);
  }
}

export async function setLoggedInDisplayName(fullName: string): Promise<void> {
  const trimmed = fullName.trim();
  if (trimmed.length > 0) {
    await secureSet(STORAGE_KEYS.loggedInDisplayName, trimmed);
  } else {
    await secureRemove(STORAGE_KEYS.loggedInDisplayName);
  }
}

export async function setLoggedInProfileImageUri(
  uri: string | null | undefined
): Promise<void> {
  if (uri && uri.length > 0) {
    await secureSet(STORAGE_KEYS.loggedInProfileImageUri, uri);
  } else {
    await secureRemove(STORAGE_KEYS.loggedInProfileImageUri);
  }
}
