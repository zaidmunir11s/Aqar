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

/**
 * Display helper for profile UI: `542932681` or `0542932681` → `0542 932 681`.
 */
export function formatSaudiPhoneForDisplay(storedDigits: string): string {
  const d = storedDigits.replace(/\D/g, "");
  if (d.length === 9 && d.startsWith("5")) {
    const full = `0${d}`;
    return `${full.slice(0, 4)} ${full.slice(4, 7)} ${full.slice(7)}`;
  }
  if (d.length === 10 && d.startsWith("05")) {
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  return storedDigits.trim();
}

type PasswordValidationMode = "detailed" | "generic";

/**
 * Returns an i18n key for password validation errors, or "" if valid.
 * - detailed: specific guidance per failed rule (used in sign-up).
 * - generic: one generic invalid-password message for all rule failures (used in login).
 */
export function getPasswordValidationError(
  password: string,
  mode: PasswordValidationMode = "detailed",
): string {
  const getRuleKey = (detailedKey: string): string =>
    mode === "detailed" ? detailedKey : "auth.invalidPassword";

  if (password.trim().length === 0) {
    return "auth.passwordRequired";
  }
  if (password.length < 8) {
    return getRuleKey("auth.passwordMinLength");
  }
  if (!/[A-Z]/.test(password)) {
    return getRuleKey("auth.passwordUppercase");
  }
  if (!/[a-z]/.test(password)) {
    return getRuleKey("auth.passwordLowercase");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return getRuleKey("auth.passwordSpecialChar");
  }
  return "";
}
