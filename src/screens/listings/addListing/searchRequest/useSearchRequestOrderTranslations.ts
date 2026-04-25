import { useCallback, useMemo } from "react";
import {
  ALL_CATEGORIES,
  getMarketingRequestCategoryTranslationKey,
} from "@/constants/categories";
import {
  AGE_OPTIONS,
  FLOOR_OPTIONS,
  RESIDENTIAL_COMMERCIAL_OPTIONS,
  STREET_DIRECTION_OPTIONS,
  STREET_WIDTH_OPTIONS,
  VILLA_TYPE_OPTIONS,
} from "@/constants/orderFormOptions";

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

function createReverseMap(
  originalOptions: string[],
  translatedOptions: string[],
): Record<string, string> {
  const map: Record<string, string> = {};
  originalOptions.forEach((original, index) => {
    map[translatedOptions[index]] = original;
  });
  return map;
}

export function useSearchRequestOrderTranslations(t: TranslateFn) {
  const categoryOptions = useMemo(() => {
    const translatedCategories = ALL_CATEGORIES.map((cat) => {
      const translationKey = getMarketingRequestCategoryTranslationKey(cat.id);
      return translationKey ? t(translationKey) : cat.text;
    });
    return [...translatedCategories, t("listings.other")];
  }, [t]);

  const categoryTranslationMap = useMemo(() => {
    const map: Record<string, string> = {};
    ALL_CATEGORIES.forEach((cat) => {
      const translationKey = getMarketingRequestCategoryTranslationKey(cat.id);
      if (translationKey) {
        map[cat.text] = t(translationKey);
      } else {
        map[cat.text] = cat.text;
      }
    });
    map["Other"] = t("listings.other");
    return map;
  }, [t]);

  const getTranslatedCategoryValue = useCallback(
    (originalValue: string | null): string => {
      if (!originalValue) return "";
      return categoryTranslationMap[originalValue] || originalValue;
    },
    [categoryTranslationMap],
  );

  const translateOption = useCallback(
    (
      opt: string,
      type: "streetDirection" | "floor" | "age" | "streetWidth",
    ): string => {
      if (opt === "All") return t("listings.all");

      if (type === "streetDirection") {
        if (opt === "North") return t("listings.address.north");
        if (opt === "East") return t("listings.address.east");
        if (opt === "West") return t("listings.address.west");
        if (opt === "South") return t("listings.address.south");
        if (opt === "Northeast") return t("listings.address.northeast");
        if (opt === "Southeast") return t("listings.address.southeast");
        if (opt === "Southwest") return t("listings.address.southwest");
        if (opt === "Northwest") return t("listings.address.northwest");
        if (opt === "3 Streets") return t("listings.threeStreets");
        if (opt === "4 Streets") return t("listings.fourStreets");
      } else if (type === "floor") {
        if (opt === "First floor") return t("listings.firstFloor");
        if (opt === "Second floor") return t("listings.secondFloor");
      } else if (type === "age") {
        if (opt.startsWith("Less than")) {
          const years = opt.match(/\d+/)?.[0] || "";
          return t("listings.lessThanYears", { years });
        }
      } else if (type === "streetWidth") {
        if (opt.startsWith("More than")) {
          const width = opt.match(/\d+/)?.[0] || "";
          return t("listings.moreThan", { width });
        }
      }

      return opt;
    },
    [t],
  );

  const translatedStreetDirectionOptions = useMemo(
    () =>
      STREET_DIRECTION_OPTIONS.map((opt) =>
        translateOption(opt, "streetDirection"),
      ),
    [translateOption],
  );
  const translatedFloorOptions = useMemo(
    () => FLOOR_OPTIONS.map((opt) => translateOption(opt, "floor")),
    [translateOption],
  );
  const translatedAgeOptions = useMemo(
    () => AGE_OPTIONS.map((opt) => translateOption(opt, "age")),
    [translateOption],
  );
  const translatedStreetWidthOptions = useMemo(
    () =>
      STREET_WIDTH_OPTIONS.map((opt) => translateOption(opt, "streetWidth")),
    [translateOption],
  );

  const streetDirectionReverseMap = useMemo(
    () =>
      createReverseMap(
        STREET_DIRECTION_OPTIONS,
        translatedStreetDirectionOptions,
      ),
    [translatedStreetDirectionOptions],
  );
  const floorReverseMap = useMemo(
    () => createReverseMap(FLOOR_OPTIONS, translatedFloorOptions),
    [translatedFloorOptions],
  );
  const ageReverseMap = useMemo(
    () => createReverseMap(AGE_OPTIONS, translatedAgeOptions),
    [translatedAgeOptions],
  );
  const streetWidthReverseMap = useMemo(
    () => createReverseMap(STREET_WIDTH_OPTIONS, translatedStreetWidthOptions),
    [translatedStreetWidthOptions],
  );

  const getTranslatedInitialValue = useCallback(
    (
      originalValue: string | null,
      reverseMap: Record<string, string>,
      translatedOptions: string[],
      originalOptions?: string[],
    ): string => {
      if (!originalValue) return "";
      const originalIndex =
        originalOptions && originalOptions.length === translatedOptions.length
          ? originalOptions.indexOf(originalValue)
          : Object.values(reverseMap).indexOf(originalValue);
      return originalIndex >= 0
        ? translatedOptions[originalIndex]
        : originalValue;
    },
    [],
  );

  const getTranslatedPickerValue = useCallback(
    (
      originalValue: string | null,
      type: "floor" | "age" | "streetDirection" | "streetWidth" | "stores",
    ): string => {
      if (!originalValue) return "";

      if (type === "floor") {
        return getTranslatedInitialValue(
          originalValue,
          floorReverseMap,
          translatedFloorOptions,
          FLOOR_OPTIONS,
        );
      } else if (type === "age") {
        return getTranslatedInitialValue(
          originalValue,
          ageReverseMap,
          translatedAgeOptions,
          AGE_OPTIONS,
        );
      } else if (type === "streetDirection") {
        return getTranslatedInitialValue(
          originalValue,
          streetDirectionReverseMap,
          translatedStreetDirectionOptions,
          STREET_DIRECTION_OPTIONS,
        );
      } else if (type === "streetWidth") {
        return getTranslatedInitialValue(
          originalValue,
          streetWidthReverseMap,
          translatedStreetWidthOptions,
          STREET_WIDTH_OPTIONS,
        );
      } else if (type === "stores") {
        // Stores options: ["All", "1", "2", "3", "4"]
        if (originalValue === "All") return t("listings.all");
        // Numbers don't need translation
        return originalValue;
      }

      return originalValue;
    },
    [
      getTranslatedInitialValue,
      floorReverseMap,
      translatedFloorOptions,
      ageReverseMap,
      translatedAgeOptions,
      streetDirectionReverseMap,
      translatedStreetDirectionOptions,
      streetWidthReverseMap,
      translatedStreetWidthOptions,
      t,
    ],
  );

  const translatedVillaTypeOptions = useMemo(
    () =>
      VILLA_TYPE_OPTIONS.map((opt) => {
        if (opt === "Standalone") return t("listings.standalone");
        if (opt === "Duplex") return t("listings.duplex");
        if (opt === "Townhouse") return t("listings.townhouse");
        return opt;
      }),
    [t],
  );

  const translatedResidentialCommercialOptions = useMemo(
    () =>
      RESIDENTIAL_COMMERCIAL_OPTIONS.map((opt) => {
        if (opt === "Residential") return t("listings.residential");
        if (opt === "Commercial") return t("listings.commercial");
        return opt;
      }),
    [t],
  );

  const villaTypeReverseMap = useMemo(
    () => createReverseMap(VILLA_TYPE_OPTIONS, translatedVillaTypeOptions),
    [translatedVillaTypeOptions],
  );
  const residentialCommercialReverseMap = useMemo(
    () =>
      createReverseMap(
        RESIDENTIAL_COMMERCIAL_OPTIONS,
        translatedResidentialCommercialOptions,
      ),
    [translatedResidentialCommercialOptions],
  );

  return {
    categoryOptions,
    categoryTranslationMap,
    getTranslatedCategoryValue,
    translatedStreetDirectionOptions,
    translatedFloorOptions,
    translatedAgeOptions,
    translatedStreetWidthOptions,
    streetDirectionReverseMap,
    floorReverseMap,
    ageReverseMap,
    streetWidthReverseMap,
    getTranslatedInitialValue,
    getTranslatedPickerValue,
    translatedVillaTypeOptions,
    villaTypeReverseMap,
    translatedResidentialCommercialOptions,
    residentialCommercialReverseMap,
  };
}
