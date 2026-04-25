/**
 * Normalize city name to a key for translation lookup.
 */
function normalizeCityKey(cityName: string): string {
  return cityName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/`/g, "")
    .replace(/'/g, "")
    .replace(/al\s+/gi, "al");
}

const CITY_KEY_MAP: Record<string, string> = {
  riyadh: "riyadh",
  jeddah: "jeddah",
  dammam: "dammam",
  alkhobar: "khobar",
  medina: "medina",
  macca: "mecca",
  makkah: "mecca",
  mecca: "mecca",
  buraydah: "buraidah",
  taif: "taif",
  jazan: "jazan",
  abha: "abha",
  khamismushait: "khamisMushait",
  alhofuf: "alHofuf",
  unayzah: "unayzah",
  alkharj: "kharj",
  hail: "hail",
  albukayriyah: "albukayriyah",
  aljubail: "alJubail",
  addiriyah: "addiriyah",
  dhahran: "dhahran",
  tabuk: "tabuk",
  almajmaah: "almajmaah",
  ahadrufaidah: "ahadrufaidah",
  thadiq: "thadiq",
  hafralbatin: "hafrAlBatin",
  riyadhalkhabra: "riyadhAlKhabra",
  alquwaiiyah: "alquwaiiyah",
  abuarish: "abuArish",
  albahah: "albahah",
  shaqra: "shaqra",
  thuwal: "thuwal",
  azzulfi: "azzulfi",
  arrass: "arrass",
  albadayea: "albadayea",
  buqayq: "buqayq",
  alduwadimi: "alduwadimi",
  nairyah: "nairyah",
  safwa: "safwa",
  muhayil: "muhayil",
  kingabdullaheconomiccity: "kingabdullaheconomiccity",
  rabigh: "rabigh",
  sabya: "sabya",
  alqatif: "qatif",
  qatif: "qatif",
  yanbu: "yanbu",
  sakaka: "sakaka",
  najran: "najran",
};

export type TranslateFn = (
  key: string,
  opts?: { defaultValue?: string },
) => string;

/**
 * Translate a city name for display using i18n.
 */
export function translateCityName(cityName: string, t: TranslateFn): string {
  if (!cityName || cityName === "City") {
    return cityName;
  }
  const normalized = normalizeCityKey(cityName);
  const mappedKey = CITY_KEY_MAP[normalized];
  const key = mappedKey ?? normalized;
  const translated = t(`listings.cities.${key}`, { defaultValue: cityName });
  if (translated !== `listings.cities.${key}`) {
    return translated;
  }
  return cityName;
}
