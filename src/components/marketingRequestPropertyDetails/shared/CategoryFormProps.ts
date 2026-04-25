export type PropertyDetailsDisplayItem = {
  type: "value" | "toggle";
  label: string;
  value?: string;
  icon?: string;
  enabled?: boolean;
};

export interface CategoryFormProps {
  submitAttempted?: boolean;
  onValidityChange?: (isValid: boolean) => void;
  onFormDataChange?: (items: PropertyDetailsDisplayItem[]) => void;
}
