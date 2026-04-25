/**
 * Normalizes property detail values for publish preview and Property Details (listings),
 * not for in-form pickers.
 */

export function isRealEstateAgeDetailLabel(
  label: string,
  t: (key: string) => string,
): boolean {
  const L = label.trim().toLowerCase();
  return (
    L === t("listings.realEstateAge").trim().toLowerCase() ||
    L === t("listings.ageLessThan").trim().toLowerCase()
  );
}

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
  t: (key: string) => string,
): string {
  const raw = value.trim();
  if (!raw) return raw;

  const newT = t("common.new");
  const unkT = t("listings.unknown");
  if (
    raw === newT ||
    /^new$/i.test(raw) ||
    raw === "NE" ||
    raw === "ne" ||
    raw === "n"
  ) {
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

function normalizeDetailLabel(label: string): string {
  return String(label ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function labelMeansStreetDirection(
  label: string,
  t: (key: string) => string,
): boolean {
  const n = normalizeDetailLabel(label);
  return (
    n === normalizeDetailLabel(t("listings.streetDirection")) ||
    n === "street direction"
  );
}

function labelMeansStreetWidth(
  label: string,
  t: (key: string) => string,
): boolean {
  const n = normalizeDetailLabel(label);
  return (
    n === normalizeDetailLabel(t("listings.streetWidth")) ||
    n === "street width"
  );
}

function labelMeansTypeOrUsage(
  label: string,
  t: (key: string) => string,
): boolean {
  const n = normalizeDetailLabel(label);
  return (
    n === normalizeDetailLabel(t("listings.type")) ||
    n === "type" ||
    n === "usage" ||
    n === normalizeDetailLabel(t("listings.landType")) ||
    n === "land type"
  );
}

function labelMeansPricePerMeter(
  label: string,
  t: (key: string) => string,
): boolean {
  const n = normalizeDetailLabel(label);
  return (
    n === normalizeDetailLabel(t("listings.pricePerMeter")) ||
    n === normalizeDetailLabel(t("listings.meterPrice")) ||
    n === "price per meter" ||
    n === "meter price"
  );
}

/** Stored/API values are often English; map to current locale for listing display. */
function translateStreetDirectionValue(
  raw: string,
  t: (key: string) => string,
): string {
  const v = raw.trim();
  if (!v) return raw;

  const pairs: [RegExp, string][] = [
    [/^northeast$/i, "listings.northeast"],
    [/^southeast$/i, "listings.southeast"],
    [/^southwest$/i, "listings.southwest"],
    [/^northwest$/i, "listings.northwest"],
    [/^north$/i, "listings.north"],
    [/^south$/i, "listings.south"],
    [/^east$/i, "listings.east"],
    [/^west$/i, "listings.west"],
  ];
  for (const [re, key] of pairs) {
    if (re.test(v)) return t(key);
  }
  return raw;
}

function translateStreetWidthValue(
  raw: string,
  t: (key: string) => string,
): string {
  const v = raw.trim();
  const m = v.match(/^(\d+)\s*meters?$/i);
  if (m) {
    // `t` is a simple key -> string function in this codebase (no interpolation args).
    // Replace the placeholder manually.
    return (t("listings.streetWidthWithMeter") || "")
      .replace(/\{\{\s*value\s*\}\}/g, m[1]);
  }
  return raw.replace(/\bmeters?\b/gi, t("listings.meterUnit"));
}

function translateUsageTypeValue(
  raw: string,
  t: (key: string) => string,
): string {
  const v = raw.trim();
  if (!v) return raw;

  const map: [RegExp, string][] = [
    [/^residential\s*&\s*commercial$/i, "listings.residentialAndCommercial"],
    [/^residential$/i, "listings.residential"],
    [/^commercial$/i, "listings.commercial"],
  ];
  for (const [re, key] of map) {
    if (re.test(v)) return t(key);
  }
  return raw;
}

function localizeCurrencySuffixes(
  text: string,
  t: (key: string) => string,
): string {
  const sar = t("listings.sar");
  return text.replace(/\bSAR\b/g, sar).replace(/\bS\.?A\.?R\.?\b/gi, sar);
}

export function formatPropertyDetailValueForListingDisplay(
  label: string,
  value: string,
  t: (key: string) => string,
): string {
  const raw = (value ?? "").trim();
  if (!raw || raw === "---") {
    return raw;
  }
  if (isRealEstateAgeDetailLabel(label, t)) {
    return localizeCurrencySuffixes(formatAgeValueForListingDisplay(raw, t), t);
  }

  let out = formatPlusOnlyCountDisplay(raw);

  if (labelMeansStreetDirection(label, t)) {
    out = translateStreetDirectionValue(out, t);
  } else if (labelMeansStreetWidth(label, t)) {
    out = translateStreetWidthValue(out, t);
  } else if (labelMeansTypeOrUsage(label, t)) {
    out = translateUsageTypeValue(out, t);
  } else if (labelMeansPricePerMeter(label, t)) {
    out = localizeCurrencySuffixes(out, t);
  } else {
    out = localizeCurrencySuffixes(out, t);
  }

  return out;
}

export function formatStaticEstateAgeForListing(
  estateAge: number,
  t: (key: string) => string,
): string {
  if (estateAge <= 0) {
    return t("listings.new");
  }
  if (estateAge > 10) {
    return t("listings.ageMoreThan10");
  }
  return `${estateAge} ${estateAge === 1 ? t("listings.year") : t("listings.years")}`;
}
