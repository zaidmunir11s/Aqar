import React, { memo } from "react";
import {
  PriceInputSection,
  TabBarSection,
  FieldWithModal,
  ToggleGroup,
  RentPeriodTabBar,
  PaymentChips,
} from "./index";
import { View, Text, StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import {
  BEDROOM_OPTIONS,
  LIVING_ROOM_OPTIONS,
  WC_OPTIONS,
  APARTMENT_OPTIONS,
  VILLA_TYPE_OPTIONS,
  RESIDENTIAL_COMMERCIAL_OPTIONS,
  FLOOR_OPTIONS,
  AGE_OPTIONS,
  STREET_DIRECTION_OPTIONS,
  STREET_WIDTH_OPTIONS,
  STORES_OPTIONS,
} from "../../constants/orderFormOptions";

export type FieldType =
  | "price"
  | "area"
  | "rentPeriod"
  | "paymentChips"
  | "tabBar"
  | "fieldWithModal"
  | "toggleGroup"
  | "section";

export interface FieldConfig {
  type: FieldType;
  label?: string;
  options?: string[];
  placeholder?: string;
  modalOptions?: string[];
  toggles?: Array<{ label: string; valueKey: string }>;
  fromValueKey?: string;
  toValueKey?: string;
  valueKey?: string;
  selectedValueKey?: string;
  backgroundColor?: "white" | "background";
  fromPlaceholder?: string;
  toPlaceholder?: string;
}

export interface CategorySectionRendererProps {
  fields: FieldConfig[];
  state: Record<string, any>;
  handlers: Record<string, (...args: any[]) => void>;
  modalHandlers: Record<string, () => void>;
}

/**
 * Generic category section renderer that renders fields based on configuration
 */
const CategorySectionRenderer = memo<CategorySectionRendererProps>(
  ({ fields, state, handlers, modalHandlers }) => {
    const renderField = (field: FieldConfig, index: number) => {
      switch (field.type) {
        case "price":
          return (
            <PriceInputSection
              key={index}
              label={field.label || "Price"}
              fromValue={state[field.fromValueKey || ""] || ""}
              toValue={state[field.toValueKey || ""] || ""}
              onFromChange={handlers[`set${field.fromValueKey?.charAt(0).toUpperCase()}${field.fromValueKey?.slice(1)}`] || (() => {})}
              onToChange={handlers[`set${field.toValueKey?.charAt(0).toUpperCase()}${field.toValueKey?.slice(1)}`] || (() => {})}
              fromPlaceholder={field.fromPlaceholder || "From price"}
              toPlaceholder={field.toPlaceholder || "To price"}
            />
          );

        case "area":
          return (
            <PriceInputSection
              key={index}
              label={field.label || "Area (m²)"}
              fromValue={state[field.fromValueKey || ""] || ""}
              toValue={state[field.toValueKey || ""] || ""}
              onFromChange={handlers[`set${field.fromValueKey?.charAt(0).toUpperCase()}${field.fromValueKey?.slice(1)}`] || (() => {})}
              onToChange={handlers[`set${field.toValueKey?.charAt(0).toUpperCase()}${field.toValueKey?.slice(1)}`] || (() => {})}
              fromPlaceholder={field.fromPlaceholder || "From area"}
              toPlaceholder={field.toPlaceholder || "To area"}
            />
          );

        case "tabBar":
          return (
            <TabBarSection
              key={index}
              label={field.label}
              options={field.options || []}
              selectedValue={state[field.selectedValueKey || ""] || null}
              onSelect={handlers[`handle${field.selectedValueKey?.charAt(0).toUpperCase()}${field.selectedValueKey?.slice(1)}Press`] || (() => {})}
            />
          );

        case "fieldWithModal":
          return (
            <FieldWithModal
              key={index}
              label={field.label || ""}
              value={state[field.valueKey || ""] || ""}
              placeholder={field.placeholder || "Select"}
              onPress={modalHandlers[field.valueKey || ""] || (() => {})}
              backgroundColor={field.backgroundColor || "white"}
            />
          );

        case "toggleGroup":
          if (!field.toggles) return null;
          return (
            <ToggleGroup
              key={index}
              toggles={field.toggles.map((toggle) => ({
                label: toggle.label,
                value: state[toggle.valueKey] ?? true,
                onValueChange: handlers[`set${toggle.valueKey.charAt(0).toUpperCase()}${toggle.valueKey.slice(1)}`] || (() => {}),
              }))}
            />
          );

        case "rentPeriod":
          return (
            <RentPeriodTabBar
              key={index}
              selectedPeriod={state[field.valueKey || "rentPeriod"] || null}
              onSelect={handlers[`handle${field.valueKey?.charAt(0).toUpperCase()}${field.valueKey?.slice(1)}Press`] || (() => {})}
            />
          );

        case "paymentChips":
          return (
            <View key={index} style={styles.section}>
              <Text style={styles.label}>Payment options</Text>
              <PaymentChips
                selectedPayment={state[field.selectedValueKey || "selectedPayment"] || null}
                onSelect={handlers[`handle${field.selectedValueKey?.charAt(0).toUpperCase()}${field.selectedValueKey?.slice(1)}Press`] || (() => {})}
              />
            </View>
          );

        default:
          return null;
      }
    };

    return <>{fields.map((field, index) => renderField(field, index))}</>;
  }
);

CategorySectionRenderer.displayName = "CategorySectionRenderer";

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(2.5),
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: hp(1),
  },
});

export default CategorySectionRenderer;

