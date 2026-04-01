/**
 * Normalizes property detail values for publish preview and Property Details (listings),
 * not for in-form pickers.
 */

export function isRealEstateAgeDetailLabel(
  label: string,
  t: (key: string) => string
): boolean {
  const L = label.trim().toLowerCase();
  return (
    L === t("listings.realEstateAge").trim().toLowerCase() ||
    L === t("listings.ageLessThan").trim().toLowerCase()
  );
}
``
/** Leading integer from strings like "11 years", "35+", "35+ years", "10". */
function parseLeadingYearCount(value: string): number | null {
  const v = value.trim();
  const plus = v.match(/^(\d+)\s*\+/);
  if (plus) return parseInt(plus[1], 10);
  const lead = v.match(/^(\d+)/);
  if (lead) return parseInt(lead[1], 10);
  return null;
}

/**
 * Real estate age on listing: 1–10 → "N year(s)"; &gt; 10 → translated "More than 10";
 * New / unknown preserved.
 */
export function formatAgeValueForListingDisplay(
  value: string,
  t: (key: string) => string
): string {
  const raw = value.trim();
  if (!raw) return raw;

  const newT = t("common.new");
  const unkT = t("listings.unknown");
  if (raw === newT || /^new$/i.test(raw) || raw === "NE" || raw === "ne" || raw === "n") {
    return newT;
  }
  if (raw === unkT || /^unknown$/i.test(raw)) {
    return unkT;
  }

  const n = parseLeadingYearCount(raw);
  if (n == null || Number.isNaN(n)) {
    return raw;
  }
  if (n > 10) {
    return t("listings.ageMoreThan10");
  }
  if (n >= 1 && n <= 10) {
    return `${n} ${n === 1 ? t("listings.year") : t("listings.years")}`;
  }
  return raw;
}

/** e.g. bedrooms "5+" → "5"; floor "20+" → "20". Does not apply to age rows. */
export function formatPlusOnlyCountDisplay(value: string): string {
  const v = value.trim();
  const m = v.match(/^(\d+)\+\s*$/);
  if (m) return m[1];
  return v;
}

export function formatPropertyDetailValueForListingDisplay(
  label: string,
  value: string,
  t: (key: string) => string
): string {
  const raw = (value ?? "").trim();
  if (!raw || raw === "---") {
    return raw;
  }
  if (isRealEstateAgeDetailLabel(label, t)) {
    return formatAgeValueForListingDisplay(raw, t);
  }
  return formatPlusOnlyCountDisplay(raw);
}

export function formatStaticEstateAgeForListing(
  estateAge: number,
  t: (key: string) => string
): string {
  if (estateAge <= 0) {
    return t("listings.new");
  }
  if (estateAge > 10) {
    return t("listings.ageMoreThan10");
  }
  return `${estateAge} ${estateAge === 1 ? t("listings.year") : t("listings.years")}`;
}
