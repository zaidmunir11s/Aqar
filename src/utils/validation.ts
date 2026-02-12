/**
 * Saudi Arabia mobile phone validation (+966).
 * National format: 9 digits, must start with 5 (e.g. 5X XXX XXXX).
 * Returns an i18n key for the error message, or "" if valid.
 */
export function getSaudiPhoneValidationError(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.length === 0) {
    return "auth.phoneRequired";
  }
  if (!/^\d+$/.test(trimmed)) {
    return "auth.invalidPhone";
  }
  if (trimmed.length !== 9) {
    return "auth.phoneMustBe9Digits";
  }
  if (!trimmed.startsWith("5")) {
    return "auth.phoneMustStartWith5";
  }
  return "";
}
