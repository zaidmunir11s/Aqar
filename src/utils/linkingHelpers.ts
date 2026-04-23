import { Linking } from "react-native";

/**
 * Open phone dialer
 * @param phoneNumber - Phone number to call
 */
export async function openPhoneDialer(phoneNumber: string): Promise<void> {
  const url = `tel:${phoneNumber}`;
  const can = await Linking.canOpenURL(url).catch(() => false);
  if (!can) {
    throw new Error("Phone calls are not supported on this device.");
  }
  await Linking.openURL(url);
}

/**
 * Open WhatsApp
 * @param phoneNumber - Phone number for WhatsApp
 */
export async function openWhatsApp(phoneNumber: string): Promise<void> {
  // Try native WhatsApp scheme first; fall back to wa.me if not installed.
  const nativeUrl = `whatsapp://send?phone=${phoneNumber}`;
  const canNative = await Linking.canOpenURL(nativeUrl).catch(() => false);
  if (canNative) {
    await Linking.openURL(nativeUrl);
    return;
  }
  const webUrl = `https://wa.me/${phoneNumber.replace(/^\+/, "")}`;
  const canWeb = await Linking.canOpenURL(webUrl).catch(() => false);
  if (!canWeb) {
    throw new Error("WhatsApp is not available on this device.");
  }
  await Linking.openURL(webUrl);
}

/**
 * Open URL in browser
 * @param url - URL to open
 */
export function openURL(url: string): void {
  Linking.openURL(url);
}

/**
 * Open Google Maps at the given coordinates (opens app if installed, otherwise web).
 */
export function openInGoogleMaps(latitude: number, longitude: number): void {
  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
  Linking.openURL(url);
}
