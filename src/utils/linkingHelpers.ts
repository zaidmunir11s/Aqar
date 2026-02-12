import { Linking } from "react-native";

/**
 * Open phone dialer
 * @param phoneNumber - Phone number to call
 */
export function openPhoneDialer(phoneNumber: string): void {
  Linking.openURL(`tel:${phoneNumber}`);
}

/**
 * Open WhatsApp
 * @param phoneNumber - Phone number for WhatsApp
 */
export function openWhatsApp(phoneNumber: string): void {
  Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
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
