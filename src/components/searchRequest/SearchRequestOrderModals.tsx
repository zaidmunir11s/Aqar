import React from "react";
import { WheelPickerModal } from "../common";
import {
  AGE_OPTIONS,
  FLOOR_OPTIONS,
  STORES_OPTIONS,
} from "../../constants/orderFormOptions";

interface SearchRequestOrderModalsProps {
  form: any;
  t: (key: string) => string;
  categoryOptions: string[];
  translatedFloorOptions: string[];
  translatedAgeOptions: string[];
  translatedStreetDirectionOptions: string[];
  translatedStreetWidthOptions: string[];
  floorReverseMap: Record<string, string>;
  ageReverseMap: Record<string, string>;
  streetDirectionReverseMap: Record<string, string>;
  streetWidthReverseMap: Record<string, string>;
  categoryTranslationMap: Record<string, string>;
  getTranslatedCategoryValue: (value: string | null) => string;
  getTranslatedInitialValue: (
    originalValue: string | null,
    reverseMap: Record<string, string>,
    translatedOptions: string[],
    originalOptions?: string[]
  ) => string;
  streetDirectionModalValue: string;
  streetWidthModalValue: string;
}

export default function SearchRequestOrderModals(
  props: SearchRequestOrderModalsProps
): React.JSX.Element {
  const {
    form,
    t,
    categoryOptions,
    translatedFloorOptions,
    translatedAgeOptions,
    translatedStreetDirectionOptions,
    translatedStreetWidthOptions,
    floorReverseMap,
    ageReverseMap,
    streetDirectionReverseMap,
    streetWidthReverseMap,
    categoryTranslationMap,
    getTranslatedCategoryValue,
    getTranslatedInitialValue,
    streetDirectionModalValue,
    streetWidthModalValue,
  } = props;

  return (
    <>
      <WheelPickerModal
        visible={form.showCategoryModal}
        onClose={() => form.setShowCategoryModal(false)}
        onSelect={(translatedValue: string) => {
          const originalValue =
            Object.keys(categoryTranslationMap).find(
              (key) => categoryTranslationMap[key] === translatedValue
            ) || translatedValue;
          form.handleCategorySelect(originalValue);
        }}
        title={t("listings.selectCategory")}
        options={categoryOptions}
        initialValue={getTranslatedCategoryValue(form.category)}
      />

      <WheelPickerModal
        key={`floor-${form.category}`}
        visible={form.showFloorModal}
        onClose={() => form.setShowFloorModal(false)}
        onSelect={(translatedValue: string) => {
          const originalValue = floorReverseMap[translatedValue] || translatedValue;
          form.handleFloorSelect(originalValue);
        }}
        title={t("listings.selectFloor")}
        options={translatedFloorOptions}
        initialValue={getTranslatedInitialValue(
          form.floor,
          floorReverseMap,
          translatedFloorOptions,
          FLOOR_OPTIONS
        )}
      />

      <WheelPickerModal
        key={`age-${form.category}`}
        visible={form.showAgeModal}
        onClose={() => form.setShowAgeModal(false)}
        onSelect={(translatedValue: string) => {
          const originalValue = ageReverseMap[translatedValue] || translatedValue;
          form.handleAgeSelect(originalValue);
        }}
        title={t("listings.selectAge")}
        options={translatedAgeOptions}
        initialValue={getTranslatedInitialValue(
          form.age,
          ageReverseMap,
          translatedAgeOptions,
          AGE_OPTIONS
        )}
      />

      <WheelPickerModal
        key={`streetDirection-${form.category}`}
        visible={form.showStreetDirectionModal}
        onClose={() => form.setShowStreetDirectionModal(false)}
        onSelect={(translatedValue: string) => {
          const originalValue =
            streetDirectionReverseMap[translatedValue] || translatedValue;
          form.handleStreetDirectionSelect(originalValue);
        }}
        title={t("listings.selectStreetDirection")}
        options={translatedStreetDirectionOptions}
        initialValue={getTranslatedInitialValue(
          streetDirectionModalValue,
          streetDirectionReverseMap,
          translatedStreetDirectionOptions
        )}
      />

      <WheelPickerModal
        key={`streetWidth-${form.category}`}
        visible={form.showStreetWidthModal}
        onClose={() => form.setShowStreetWidthModal(false)}
        onSelect={(translatedValue: string) => {
          const originalValue = streetWidthReverseMap[translatedValue] || translatedValue;
          form.handleStreetWidthSelect(originalValue);
        }}
        title={t("listings.selectStreetWidth")}
        options={translatedStreetWidthOptions}
        initialValue={getTranslatedInitialValue(
          streetWidthModalValue,
          streetWidthReverseMap,
          translatedStreetWidthOptions
        )}
      />

      <WheelPickerModal
        key={`stores-${form.category}`}
        visible={form.showStoresModal}
        onClose={() => form.setShowStoresModal(false)}
        onSelect={(value: string) => {
          if (form.isBuildingForSale) {
            form.handleStoresSelect(value);
          } else if (form.isBuildingForRent) {
            form.handleBuildingRentStoresSelect(value);
          }
        }}
        title={t("listings.selectStores")}
        options={STORES_OPTIONS}
        initialValue={form.isBuildingForSale ? form.stores : form.buildingRentStores}
      />
    </>
  );
}

