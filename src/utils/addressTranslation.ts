import { TFunction } from "i18next";

/**
 * Helper function to translate direction words
 */
const translateDirection = (dir: string, t: TFunction): string => {
  const lowerDir = dir.toLowerCase();
  const directionMap: { [key: string]: string } = {
    north: t("listings.address.north"),
    south: t("listings.address.south"),
    east: t("listings.address.east"),
    west: t("listings.address.west"),
    central: t("listings.address.central"),
  };
  return directionMap[lowerDir] || dir;
};

/**
 * Translates property addresses by matching common patterns
 * @param address - The original address string
 * @param t - Translation function from i18next
 * @returns Translated address string
 */
export const translateAddress = (address: string, t: TFunction): string => {
  if (!address) return address;

  const lowerAddress = address.toLowerCase();
  let translated = address;

  // Common patterns to translate
  const patterns: [RegExp, (match: RegExpMatchArray) => string][] = [
    // For Sale patterns with locations - MUST come before other patterns
    [
      /luxury\s+apartment\s+for\s+sale,\s+central\s+riyadh/i,
      () =>
        `${t("listings.propertyTypes.apartmentForSale")}, ${t("listings.address.centralRiyadh")}`,
    ],
    [
      /modern\s+villa\s+for\s+sale,\s+central/i,
      () =>
        `${t("listings.propertyTypes.villaForSale")}, ${t("listings.address.central")}`,
    ],
    [
      /apartment\s+for\s+sale,\s+central\s+location/i,
      () =>
        `${t("listings.propertyTypes.apartmentForSale")}, ${t("listings.address.centralLocation")}`,
    ],
    [
      /residential\s+land\s+for\s+sale,\s+central/i,
      () =>
        `${t("listings.propertyTypes.landForSale")}, ${t("listings.address.central")}`,
    ],
    [
      /small\s+house\s+for\s+sale,\s+central/i,
      () =>
        `${t("listings.propertyTypes.smallHouseForSale")}, ${t("listings.address.central")}`,
    ],
    [
      /lounge\s+for\s+sale,\s+central/i,
      () =>
        `${t("listings.propertyTypes.loungeForSale")}, ${t("listings.address.central")}`,
    ],
    [
      /premium\s+villa\s+for\s+sale,\s+north\s+riyadh/i,
      () =>
        `${t("listings.propertyTypes.villaForSale")}, ${t("listings.address.north")} ${t("listings.address.riyadh")}`,
    ],
    [
      /apartment\s+for\s+sale,\s+north/i,
      () =>
        `${t("listings.propertyTypes.apartmentForSale")}, ${t("listings.address.north")}`,
    ],
    [
      /prime\s+land\s+for\s+sale,\s+north/i,
      () =>
        `${t("listings.propertyTypes.landForSale")}, ${t("listings.address.north")}`,
    ],
    [
      /floor\s+for\s+sale,\s+north/i,
      () =>
        `${t("listings.propertyTypes.floorForSale")}, ${t("listings.address.north")}`,
    ],
    [
      /villa\s+for\s+sale,\s+west\s+riyadh/i,
      () =>
        `${t("listings.propertyTypes.villaForSale")}, ${t("listings.address.west")} ${t("listings.address.riyadh")}`,
    ],
    [
      /apartment\s+for\s+sale,\s+west/i,
      () =>
        `${t("listings.propertyTypes.apartmentForSale")}, ${t("listings.address.west")}`,
    ],
    [
      /small\s+house\s+for\s+sale,\s+west/i,
      () =>
        `${t("listings.propertyTypes.smallHouseForSale")}, ${t("listings.address.west")}`,
    ],
    [
      /farm\s+for\s+sale,\s+west\s+riyadh/i,
      () =>
        `${t("listings.propertyTypes.farmForSale")}, ${t("listings.address.west")} ${t("listings.address.riyadh")}`,
    ],
    [
      /apartment\s+for\s+sale,\s+south/i,
      () =>
        `${t("listings.propertyTypes.apartmentForSale")}, ${t("listings.address.south")}`,
    ],
    [
      /land\s+for\s+sale,\s+south\s+riyadh/i,
      () =>
        `${t("listings.propertyTypes.landForSale")}, ${t("listings.address.south")} ${t("listings.address.riyadh")}`,
    ],
    [
      /store\s+for\s+sale,\s+south/i,
      () =>
        `${t("listings.propertyTypes.storeForSale")}, ${t("listings.address.south")}`,
    ],
    [
      /building\s+for\s+sale,\s+south/i,
      () =>
        `${t("listings.propertyTypes.buildingForSale")}, ${t("listings.address.south")}`,
    ],
    [
      /apartment\s+for\s+sale,\s+east\s+riyadh/i,
      () =>
        `${t("listings.propertyTypes.apartmentForSale")}, ${t("listings.address.east")} ${t("listings.address.riyadh")}`,
    ],
    [
      /luxury\s+villa\s+for\s+sale,\s+east/i,
      () =>
        `${t("listings.propertyTypes.villaForSale")}, ${t("listings.address.east")}`,
    ],
    [
      /floor\s+for\s+sale,\s+east/i,
      () =>
        `${t("listings.propertyTypes.floorForSale")}, ${t("listings.address.east")}`,
    ],
    [
      /lounge\s+for\s+sale,\s+east/i,
      () =>
        `${t("listings.propertyTypes.loungeForSale")}, ${t("listings.address.east")}`,
    ],
    [
      /farm\s+for\s+sale,\s+east\s+riyadh/i,
      () =>
        `${t("listings.propertyTypes.farmForSale")}, ${t("listings.address.east")} ${t("listings.address.riyadh")}`,
    ],
    [
      /apartment\s+for\s+sale,\s+scattered\s+(\d+)/i,
      (m) =>
        `${t("listings.propertyTypes.apartmentForSale")}, ${t("listings.address.scattered")} ${m[1]}`,
    ],
    [
      /villa\s+for\s+sale,\s+scattered\s+(\d+)/i,
      (m) =>
        `${t("listings.propertyTypes.villaForSale")}, ${t("listings.address.scattered")} ${m[1]}`,
    ],
    [
      /property\s+for\s+sale,\s+scattered\s+(\d+)/i,
      (m) =>
        `${t("listings.property")} ${t("listings.forSale")}, ${t("listings.address.scattered")} ${m[1]}`,
    ],
    [
      /land\s+for\s+sale,\s+scattered\s+(\d+)/i,
      (m) =>
        `${t("listings.propertyTypes.landForSale")}, ${t("listings.address.scattered")} ${m[1]}`,
    ],
    [
      /small\s+house\s+for\s+sale,\s+scattered\s+(\d+)/i,
      (m) =>
        `${t("listings.propertyTypes.smallHouseForSale")}, ${t("listings.address.scattered")} ${m[1]}`,
    ],

    // Generic "for sale" patterns (catch-all for any remaining cases)
    [
      /(.+?)\s+for\s+sale,\s+(north|south|east|west|central)(?:\s+riyadh)?/i,
      (m) => {
        const propertyType = m[1].toLowerCase().trim();
        const location = m[2].toLowerCase();
        const hasRiyadh = m[0].toLowerCase().includes("riyadh");
        const locationKey = hasRiyadh
          ? `${translateDirection(location, t)} ${t("listings.address.riyadh")}`
          : translateDirection(location, t);

        // Map property type to translation key (handle multi-word types)
        const typeMap: Record<string, string> = {
          apartment: "apartmentForSale",
          "luxury apartment": "apartmentForSale",
          "modern apartment": "apartmentForSale",
          villa: "villaForSale",
          "modern villa": "villaForSale",
          "luxury villa": "villaForSale",
          "premium villa": "villaForSale",
          land: "landForSale",
          "residential land": "landForSale",
          "prime land": "landForSale",
          building: "buildingForSale",
          "residential building": "buildingForSale",
          "small house": "smallHouseForSale",
          house: "smallHouseForSale",
          lounge: "loungeForSale",
          "small lounge": "loungeForSale",
          farm: "farmForSale",
          store: "storeForSale",
          "retail store": "storeForSale",
          floor: "floorForSale",
          property: "property",
        };

        const typeKey =
          typeMap[propertyType] || propertyType.replace(/\s+/g, "");
        const translationKey = `listings.propertyTypes.${typeKey}`;
        const translatedType = t(translationKey);

        // If translation exists, use it; otherwise construct from base type
        if (translatedType !== translationKey) {
          return `${translatedType}, ${locationKey}`;
        }

        // Fallback: use base property type translation
        const baseTypeKey = `listings.propertyTypes.${propertyType.replace(/\s+/g, "")}`;
        const baseType =
          t(baseTypeKey) !== baseTypeKey ? t(baseTypeKey) : propertyType;
        return `${baseType} ${t("listings.forSale")}, ${locationKey}`;
      },
    ],

    // Scattered patterns: "Scattered apartment 1", "scattered 2", etc.
    [
      /scattered\s+apartment\s+(\d+)/i,
      (m) =>
        `${t("listings.address.scattered")} ${t("listings.address.apartment")} ${m[1]}`,
    ],
    [/scattered\s+(\d+)/i, (m) => `${t("listings.address.scattered")} ${m[1]}`],
    [
      /small\s+house,\s+scattered\s+(\d+)/i,
      (m) =>
        `${t("listings.address.smallHouse")}, ${t("listings.address.scattered")} ${m[1]}`,
    ],
    [
      /chalet,\s+scattered\s+(\d+)/i,
      (m) =>
        `${t("listings.address.chalet")}, ${t("listings.address.scattered")} ${m[1]}`,
    ],
    [
      /tent,\s+scattered\s+(\d+)/i,
      (m) =>
        `${t("listings.address.tent")}, ${t("listings.address.scattered")} ${m[1]}`,
    ],
    [
      /warehouse,\s+scattered\s+(\d+)/i,
      (m) =>
        `${t("listings.address.warehouse")}, ${t("listings.address.scattered")} ${m[1]}`,
    ],
    [
      /store,\s+scattered\s+(\d+)/i,
      (m) =>
        `${t("listings.address.store")}, ${t("listings.address.scattered")} ${m[1]}`,
    ],

    // Direction patterns: "Warehouse, south", "Apartment, north", etc.
    [
      /warehouse,\s+south/i,
      () =>
        `${t("listings.address.warehouse")}, ${t("listings.address.south")}`,
    ],
    [
      /warehouse,\s+north/i,
      () =>
        `${t("listings.address.warehouse")}, ${t("listings.address.north")}`,
    ],
    [
      /warehouse,\s+east/i,
      () => `${t("listings.address.warehouse")}, ${t("listings.address.east")}`,
    ],
    [
      /warehouse,\s+west/i,
      () => `${t("listings.address.warehouse")}, ${t("listings.address.west")}`,
    ],

    [
      /apartment,\s+south/i,
      () =>
        `${t("listings.address.apartment")}, ${t("listings.address.south")}`,
    ],
    [
      /apartment,\s+north/i,
      () =>
        `${t("listings.address.apartment")}, ${t("listings.address.north")}`,
    ],
    [
      /apartment,\s+east/i,
      () => `${t("listings.address.apartment")}, ${t("listings.address.east")}`,
    ],
    [
      /apartment,\s+west/i,
      () => `${t("listings.address.apartment")}, ${t("listings.address.west")}`,
    ],

    [
      /tent,\s+south/i,
      () => `${t("listings.address.tent")}, ${t("listings.address.south")}`,
    ],
    [
      /tent,\s+north/i,
      () => `${t("listings.address.tent")}, ${t("listings.address.north")}`,
    ],
    [
      /tent,\s+east/i,
      () => `${t("listings.address.tent")}, ${t("listings.address.east")}`,
    ],
    [
      /tent,\s+west/i,
      () => `${t("listings.address.tent")}, ${t("listings.address.west")}`,
    ],

    // North patterns
    [
      /north\s+riyadh\s+apartment/i,
      () =>
        `${t("listings.address.apartment")} ${t("listings.address.north")} ${t("listings.address.riyadh")}`,
    ],
    [
      /apartment\s+north\s+of\s+center/i,
      () =>
        `${t("listings.address.apartment")} ${t("listings.address.north")} ${t("listings.address.ofCenter")}`,
    ],
    [
      /large\s+villa,\s+north\s+riyadh/i,
      () =>
        `${t("listings.address.villa")}, ${t("listings.address.north")} ${t("listings.address.riyadh")}`,
    ],
    [
      /furnished\s+apartment,\s+north/i,
      () =>
        `${t("listings.address.furnishedApartment")}, ${t("listings.address.north")}`,
    ],
    [
      /family\s+chalet,\s+north/i,
      () =>
        `${t("listings.address.familyChalet")}, ${t("listings.address.north")}`,
    ],

    // South patterns
    [
      /south\s+apartment/i,
      () => `${t("listings.address.apartment")} ${t("listings.address.south")}`,
    ],
    [
      /south\s+family\s+apartment/i,
      () =>
        `${t("listings.address.familyApartment")} ${t("listings.address.south")}`,
    ],
    [
      /residential\s+land,\s+south/i,
      () =>
        `${t("listings.address.residentialLand")}, ${t("listings.address.south")}`,
    ],
    [
      /retail\s+store,\s+south/i,
      () =>
        `${t("listings.address.retailStore")}, ${t("listings.address.south")}`,
    ],
    [
      /big\s+flat,\s+south/i,
      () => `${t("listings.address.bigFlat")}, ${t("listings.address.south")}`,
    ],

    // East patterns
    [
      /east\s+apartment/i,
      () => `${t("listings.address.apartment")} ${t("listings.address.east")}`,
    ],
    [
      /budget\s+east\s+apartment/i,
      () =>
        `${t("listings.address.budgetApartment")} ${t("listings.address.east")}`,
    ],
    [
      /small\s+east\s+apartment/i,
      () => `${t("listings.address.apartment")} ${t("listings.address.east")}`,
    ],
    [
      /room,\s+east\s+riyadh/i,
      () =>
        `${t("listings.address.room")}, ${t("listings.address.east")} ${t("listings.address.riyadh")}`,
    ],
    [
      /east\s+residential\s+building/i,
      () =>
        `${t("listings.address.residentialBuilding")} ${t("listings.address.east")}`,
    ],
    [
      /compact\s+east\s+apartment/i,
      () =>
        `${t("listings.address.compactApartment")} ${t("listings.address.east")}`,
    ],
    [
      /east\s+office\s+space/i,
      () =>
        `${t("listings.address.officeSpace")} ${t("listings.address.east")}`,
    ],
    [
      /verified\s+furnished\s+apartment,\s+east/i,
      () =>
        `${t("listings.address.verifiedFurnishedApartment")}, ${t("listings.address.east")}`,
    ],

    // West patterns
    [
      /west\s+riyadh\s+apartment/i,
      () =>
        `${t("listings.address.apartment")} ${t("listings.address.west")} ${t("listings.address.riyadh")}`,
    ],
    [
      /small\s+house,\s+west/i,
      () =>
        `${t("listings.address.smallHouse")}, ${t("listings.address.west")}`,
    ],
    [
      /budget\s+apartment,\s+west/i,
      () =>
        `${t("listings.address.budgetApartment")}, ${t("listings.address.west")}`,
    ],
    [
      /family\s+villa,\s+west/i,
      () =>
        `${t("listings.address.familyVilla")}, ${t("listings.address.west")}`,
    ],
    [
      /office\s+space,\s+west/i,
      () =>
        `${t("listings.address.officeSpace")}, ${t("listings.address.west")}`,
    ],

    // Central patterns
    [/central\s+riyadh/i, () => t("listings.address.centralRiyadh")],
    [/central\s+area/i, () => t("listings.address.centralArea")],
    [/central\s+location/i, () => t("listings.address.centralLocation")],
    [
      /apartment\s+near\s+al\s+wusta/i,
      () =>
        `${t("listings.address.apartment")} ${t("listings.address.near")} ${t("listings.address.alWusta")}`,
    ],
    [
      /villa\s+in\s+al\s+wusta/i,
      () =>
        `${t("listings.address.villa")} ${t("listings.address.in")} ${t("listings.address.alWusta")}`,
    ],
    [
      /small\s+lounge,\s+central\s+riyadh/i,
      () =>
        `${t("listings.address.lounge")}, ${t("listings.address.centralRiyadh")}`,
    ],
    [
      /family\s+villa,\s+central\s+area/i,
      () =>
        `${t("listings.address.familyVilla")}, ${t("listings.address.centralArea")}`,
    ],
    [
      /residential\s+building,\s+central\s+riyadh/i,
      () =>
        `${t("listings.address.residentialBuilding")}, ${t("listings.address.centralRiyadh")}`,
    ],
    [
      /verified\s+apartment,\s+central/i,
      () =>
        `${t("listings.address.verifiedApartment")}, ${t("listings.address.central")}`,
    ],

    // Other common patterns
    [
      /favorite\s+villa\s+listing/i,
      () => t("listings.address.favoriteVillaListing"),
    ],
    [
      /highlighted\s+room\s+near\s+services/i,
      () =>
        `${t("listings.address.highlightedRoom")} ${t("listings.address.nearServices")}`,
    ],

    // Daily booking patterns: "X for daily booking" or "X for daily booking, Y"
    [
      /furnished\s+apartment\s+for\s+daily\s+booking(?:,\s+(\w+))?/i,
      (m) =>
        m[1]
          ? `${t("listings.address.furnishedApartment")} ${t("listings.address.forDailyBooking")}, ${translateDirection(m[1], t)}`
          : `${t("listings.address.furnishedApartment")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /modern\s+studio\s+for\s+daily\s+booking/i,
      () =>
        `${t("listings.address.modernStudio")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /beautiful\s+chalet\s+for\s+daily\s+booking/i,
      () =>
        `${t("listings.address.beautifulChalet")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /camping\s+tent\s+for\s+daily\s+booking/i,
      () =>
        `${t("listings.address.campingTent")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /event\s+hall\s+for\s+daily\s+booking/i,
      () =>
        `${t("listings.address.eventHall")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /apartment\s+for\s+daily\s+booking(?:,\s+(\w+))?/i,
      (m) =>
        m[1]
          ? `${t("listings.address.apartment")} ${t("listings.address.forDailyBooking")}, ${translateDirection(m[1], t)}`
          : `${t("listings.address.apartment")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /cozy\s+studio\s+for\s+daily\s+booking/i,
      () =>
        `${t("listings.address.cozyStudio")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /chalet\s+with\s+pool\s+for\s+daily\s+booking/i,
      () =>
        `${t("listings.address.chaletWithPool")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /family\s+apartment\s+for\s+daily\s+booking(?:,\s+(\w+))?/i,
      (m) =>
        m[1]
          ? `${t("listings.address.familyApartment")} ${t("listings.address.forDailyBooking")}, ${translateDirection(m[1], t)}`
          : `${t("listings.address.familyApartment")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /desert\s+tent\s+for\s+daily\s+booking/i,
      () =>
        `${t("listings.address.desertTent")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /wedding\s+hall\s+for\s+daily\s+booking/i,
      () =>
        `${t("listings.address.weddingHall")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /studio\s+for\s+daily\s+booking(?:,\s+(\w+))?/i,
      (m) =>
        m[1]
          ? `${t("listings.address.studio")} ${t("listings.address.forDailyBooking")}, ${translateDirection(m[1], t)}`
          : `${t("listings.address.studio")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /chalet\s+for\s+daily\s+booking(?:,\s+(\w+))?/i,
      (m) =>
        m[1]
          ? `${t("listings.address.chalet")} ${t("listings.address.forDailyBooking")}, ${translateDirection(m[1], t)}`
          : `${t("listings.address.chalet")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /tent\s+for\s+daily\s+booking(?:,\s+(\w+))?/i,
      (m) =>
        m[1]
          ? `${t("listings.address.tent")} ${t("listings.address.forDailyBooking")}, ${translateDirection(m[1], t)}`
          : `${t("listings.address.tent")} ${t("listings.address.forDailyBooking")}`,
    ],
    [
      /conference\s+hall\s+for\s+daily\s+booking/i,
      () =>
        `${t("listings.address.conferenceHall")} ${t("listings.address.forDailyBooking")}`,
    ],
  ];

  // Try to match patterns
  for (const [pattern, replacer] of patterns) {
    const match = address.match(pattern);
    if (match) {
      translated = replacer(match);
      break;
    }
  }

  // If no pattern matched, try simple word replacements
  if (translated === address) {
    translated = address
      .replace(/\bnorth\b/gi, t("listings.address.north"))
      .replace(/\bsouth\b/gi, t("listings.address.south"))
      .replace(/\beast\b/gi, t("listings.address.east"))
      .replace(/\bwest\b/gi, t("listings.address.west"))
      .replace(/\bcentral\b/gi, t("listings.address.central"))
      .replace(/\bscattered\b/gi, t("listings.address.scattered"))
      .replace(/\briyadh\b/gi, t("listings.address.riyadh"));
  }

  // Common Riyadh district names (often left English in mixed addresses)
  const districtPatterns: [RegExp, string][] = [
    [/\bAl Olaya\b/gi, t("listings.districtAlOlaya")],
    [/\bAl Malaz\b/gi, t("listings.districtAlMalaz")],
    [/\bAl Naseem\b/gi, t("listings.districtAlNaseem")],
    [/\bAl Murjan\b/gi, t("listings.districtAlMurjan")],
    [/\bAl Suwaidi\b/gi, t("listings.districtAlSuwaidi")],
    [/\bAl Narjis\b/gi, t("listings.districtAlNarjis")],
    [/\bAl Rawdah\b/gi, t("listings.districtAlRawdah")],
    [/\bAl Wurud\b/gi, t("listings.districtAlWurud")],
  ];
  for (const [re, rep] of districtPatterns) {
    translated = translated.replace(re, rep);
  }

  return translated;
};
