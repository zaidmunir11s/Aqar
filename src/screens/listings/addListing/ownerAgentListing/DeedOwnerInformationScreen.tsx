import React, { useState, useCallback, useMemo, useEffect, useRef, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  ScreenHeader,
  ListingFooter,
  SegmentedControl,
  DatePickerModal,
  CancelModal,
} from "../../../../components";
import { navigateToMapScreen } from "../../../../utils";
import { COLORS } from "../../../../constants";
import { useLocalization } from "../../../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;
type OwnerType = "individual" | "multi-agent" | "company";
type DeedOwnerType = "electronic" | "other";

// Memoized section: deed owner type + owner type (avoids re-render on every keystroke)
const DeedOwnerTypeSection = memo(function DeedOwnerTypeSection({
  deedOwnerType,
  deedOwnerOptions,
  ownerType,
  ownerTypeOptions,
  onDeedOwnerSelect,
  onOwnerTypeSelect,
  deedOwnerTypeLabel,
  ownerTypeLabel,
  rtlStyles,
}: {
  deedOwnerType: DeedOwnerType;
  deedOwnerOptions: string[];
  ownerType: OwnerType;
  ownerTypeOptions: string[];
  onDeedOwnerSelect: (index: number) => void;
  onOwnerTypeSelect: (index: number) => void;
  deedOwnerTypeLabel: string;
  ownerTypeLabel: string;
  rtlStyles: { sectionLabel: { textAlign: "left" | "right" } };
}) {
  return (
    <>
      <Text style={[styles.sectionLabel, rtlStyles.sectionLabel]}>{deedOwnerTypeLabel}</Text>
      <View style={styles.segmentedControlContainer}>
        <SegmentedControl
          options={deedOwnerOptions}
          selectedIndex={deedOwnerType === "electronic" ? 0 : 1}
          onSelect={onDeedOwnerSelect}
        />
      </View>
      <Text style={[styles.sectionLabel, rtlStyles.sectionLabel]}>{ownerTypeLabel}</Text>
      <View style={styles.segmentedControlContainer}>
        <SegmentedControl
          options={ownerTypeOptions}
          selectedIndex={ownerType === "individual" ? 0 : ownerType === "multi-agent" ? 1 : 2}
          onSelect={onOwnerTypeSelect}
        />
      </View>
    </>
  );
});

const ContactLink = memo(function ContactLink({
  rtlStyles,
  haveQuestionText,
}: {
  rtlStyles: { contactLink: { flexDirection: "row" | "row-reverse" }; contactLinkText: Record<string, number> };
  haveQuestionText: string;
}) {
  return (
    <TouchableOpacity style={[styles.contactLink, rtlStyles.contactLink]}>
      <Ionicons name="chatbubble-outline" size={wp(5)} color="#3b82f6" />
      <Text style={[styles.contactLinkText, rtlStyles.contactLinkText]}>{haveQuestionText}</Text>
    </TouchableOpacity>
  );
});

// Single row for FlatList: only this row re-renders when its value/error/touched/focus changes
type FormFieldItem = {
  id: string;
  kind: "text" | "date" | "phone";
  fieldName: keyof FormFields;
  label: string;
  placeholder?: string;
  validator?: (val: string) => string;
  errorKey?: string;
  dateType?: "owner" | "agent" | "company";
};
const FORM_ROW_HEIGHT = hp(11);

const FormFieldRow = memo(function FormFieldRow({
  item,
  value,
  error,
  touched,
  isFocused,
  onUpdateField,
  onFocus,
  onBlur,
  openDatePicker,
  rtlStyles,
  t,
  phoneValidator,
}: {
  item: FormFieldItem;
  value: string;
  error: string;
  touched: boolean;
  isFocused: boolean;
  onUpdateField: (name: keyof FormFields, value: string, validator?: (val: string) => string) => void;
  onFocus: (name: string) => void;
  onBlur: () => void;
  openDatePicker: (type: "owner" | "agent" | "company") => void;
  rtlStyles: Record<string, unknown>;
  t: (key: string) => string;
  phoneValidator: (val: string) => string;
}) {
  const errorKey = item.errorKey ?? item.fieldName;
  if (item.kind === "text" && item.placeholder !== undefined && item.validator) {
    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.label, rtlStyles.label]}>{item.label}</Text>
        <TextInput
          style={[
            styles.textInput,
            rtlStyles.textInput,
            isFocused && styles.textInputFocused,
            !isFocused && touched && error && styles.textInputError,
          ]}
          placeholder={item.placeholder}
          value={value}
          onChangeText={(val) => onUpdateField(item.fieldName, val, item.validator)}
          placeholderTextColor="#9ca3af"
          onFocus={() => onFocus(item.fieldName)}
          onBlur={onBlur}
        />
        {touched && error ? (
          <Text style={[styles.errorText, rtlStyles.errorText]}>{error}</Text>
        ) : null}
      </View>
    );
  }
  if (item.kind === "date" && item.dateType) {
    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.label, rtlStyles.label]}>{item.label}</Text>
        <TouchableOpacity
          style={[
            styles.dateSelector,
            rtlStyles.dateSelector,
            touched && error && styles.dateSelectorError,
          ]}
          onPress={() => openDatePicker(item.dateType!)}
        >
          <Text style={[styles.dateText, rtlStyles.dateText, !value && styles.placeholderText]}>
            {value || t("listings.selectDate")}
          </Text>
          <Ionicons name="chevron-down" size={wp(5)} color={COLORS.primary} />
        </TouchableOpacity>
        {touched && error ? (
          <Text style={[styles.errorText, rtlStyles.errorText]}>{error}</Text>
        ) : null}
      </View>
    );
  }
  if (item.kind === "phone") {
    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.label, rtlStyles.label]}>{item.label}</Text>
        <View
          style={[
            styles.phoneInputWrapper,
            isFocused && styles.textInputFocused,
            !isFocused && touched && error && styles.textInputError,
          ]}
        >
          <Text style={styles.countryCode}>+966</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder={t("listings.enterPhoneNumber")}
            value={value}
            onChangeText={(val) => onUpdateField(item.fieldName, val, phoneValidator)}
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            onFocus={() => onFocus(item.fieldName)}
            onBlur={onBlur}
          />
        </View>
        {touched && error ? (
          <Text style={[styles.errorText, rtlStyles.errorText]}>{error}</Text>
        ) : null}
      </View>
    );
  }
  return null;
});

// Helper function to parse formatted date string (DD / MM / YYYY) to Date object
const parseDateFromFormatted = (formattedDate: string): Date => {
  const parts = formattedDate.split(" / ");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date();
};

// Get current date formatted as DD / MM / YYYY (storage format)
const getCurrentDateFormatted = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day} / ${month} / ${year}`;
};

// Format stored date (DD / MM / YYYY) for display: RTL shows YYYY / MM / DD, LTR shows DD / MM / YYYY
const formatDateForDisplay = (storedDate: string, isRTL: boolean): string => {
  if (!storedDate?.trim()) return "";
  const parts = storedDate.split(" / ");
  if (parts.length !== 3) return storedDate;
  if (isRTL) return `${parts[2]} / ${parts[1]} / ${parts[0]}`; // YYYY / MM / DD
  return storedDate; // DD / MM / YYYY
};

// Unified field management interface
interface FormFields {
  // Shared fields
  deedNumber: string;
  poaAgentId: string;
  poaId: string;
  
  // Owner ID (synced: ownerId <-> ownerIdNumber)
  ownerId: string;
  ownerIdNumber: string;
  
  // Birthdate (synced across all tabs)
  ownerBirthdate: string;
  agentBirthdate: string;
  companyAgentBirthdate: string;
  
  // Phone (synced across all tabs)
  ownerPhone: string;
  agentPhone: string;
  companyAgentPhone: string;
  
  // Company specific
  unifiedCrNumber: string;
}

export default function DeedOwnerInformationScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLocalization();
  const [deedOwnerType, setDeedOwnerType] = useState<DeedOwnerType>("electronic");
  const [ownerType, setOwnerType] = useState<OwnerType>("individual");

  // Unified form fields state
  const [fields, setFields] = useState<FormFields>({
    deedNumber: "",
    poaAgentId: "",
    poaId: "",
    ownerId: "",
    ownerIdNumber: "",
    ownerBirthdate: getCurrentDateFormatted(),
    agentBirthdate: getCurrentDateFormatted(),
    companyAgentBirthdate: getCurrentDateFormatted(),
    ownerPhone: "",
    agentPhone: "",
    companyAgentPhone: "",
    unifiedCrNumber: "",
  });

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [activeCalendarType, setActiveCalendarType] = useState<"owner" | "agent" | "company">("owner");
  const [datePickerTitle, setDatePickerTitle] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  // Refs for stable renderItem: only the row whose data changed re-renders
  const fieldsRef = useRef(fields);
  const errorsRef = useRef(errors);
  const touchedRef = useRef(touched);
  const focusedFieldRef = useRef(focusedField);
  const isRTLRef = useRef(isRTL);
  fieldsRef.current = fields;
  errorsRef.current = errors;
  touchedRef.current = touched;
  focusedFieldRef.current = focusedField;
  isRTLRef.current = isRTL;

  const deedOwnerOptions = useMemo(
    () => [t("listings.electronicEyeRecord"), t("listings.other")],
    [t]
  );
  const ownerTypeOptions = useMemo(
    () => [t("listings.individual"), t("listings.multiAgent"), t("listings.company")],
    [t]
  );

  // Validation functions
  const validators = useMemo(() => ({
    deedNumber: (value: string): string => {
      if (!value.trim()) return t("listings.thisFieldRequired");
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length === 12 || digitsOnly.length === 16) return "";
      return t("listings.deedNumberError");
    },
    ownerId: (value: string): string => {
      if (!value.trim()) return t("listings.thisFieldRequired");
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length === 10) return "";
      return t("listings.ownerIdError");
    },
    poaAgentId: (value: string): string => {
      if (!value.trim()) return t("listings.thisFieldRequired");
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length === 10) return "";
      return t("listings.poaAgentIdError");
    },
    poaId: (value: string): string => {
      if (!value.trim()) return t("listings.thisFieldRequired");
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length >= 7 && digitsOnly.length <= 12) return "";
      return t("listings.poaIdError");
    },
    unifiedCrNumber: (value: string): string => {
      if (!value.trim()) return t("listings.thisFieldRequired");
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length === 10) return "";
      return t("listings.ownerIdError");
    },
    phone: (value: string): string => {
      if (!value.trim()) return t("listings.thisFieldRequired");
      return "";
    },
    birthdate: (value: string): string => {
      if (!value.trim()) return t("listings.thisFieldRequired");
      return "";
    },
  }), [t]);

  // Update field with syncing logic
  const updateField = useCallback((fieldName: keyof FormFields, value: string, validator?: (val: string) => string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    
    // Validate if validator provided
    if (validator) {
      const error = validator(value);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    }

    setFields((prev) => {
      const updated = { ...prev, [fieldName]: value };
      
      // Sync ownerId <-> ownerIdNumber <-> unifiedCrNumber
      if (fieldName === "ownerId") {
        updated.ownerIdNumber = value;
        updated.unifiedCrNumber = value;
      } else if (fieldName === "ownerIdNumber") {
        updated.ownerId = value;
        updated.unifiedCrNumber = value;
      } else if (fieldName === "unifiedCrNumber") {
        updated.ownerId = value;
        updated.ownerIdNumber = value;
      }
      
      // Sync birthdate across all tabs
      if (fieldName === "ownerBirthdate") {
        updated.agentBirthdate = value;
        updated.companyAgentBirthdate = value;
      } else if (fieldName === "agentBirthdate") {
        updated.ownerBirthdate = value;
        updated.companyAgentBirthdate = value;
      } else if (fieldName === "companyAgentBirthdate") {
        updated.ownerBirthdate = value;
        updated.agentBirthdate = value;
      }
      
      // Sync phone across all tabs
      if (fieldName === "ownerPhone") {
        updated.agentPhone = value;
        updated.companyAgentPhone = value;
      } else if (fieldName === "agentPhone") {
        updated.ownerPhone = value;
        updated.companyAgentPhone = value;
      } else if (fieldName === "companyAgentPhone") {
        updated.ownerPhone = value;
        updated.agentPhone = value;
      }
      
      return updated;
    });
  }, []);

  // Validate all fields across all tabs
  const validateAllTabs = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate Individual tab
    newErrors.deedNumber = validators.deedNumber(fields.deedNumber);
    newErrors.ownerId = validators.ownerId(fields.ownerId);
    newErrors.ownerBirthdate = validators.birthdate(fields.ownerBirthdate);
    newErrors.ownerPhone = validators.phone(fields.ownerPhone);

    // Validate Multi/Agent tab
    newErrors.deedNumber_ma = validators.deedNumber(fields.deedNumber);
    newErrors.ownerIdNumber = validators.ownerId(fields.ownerIdNumber);
    newErrors.poaAgentId = validators.poaAgentId(fields.poaAgentId);
    newErrors.poaId = validators.poaId(fields.poaId);
    newErrors.agentBirthdate = validators.birthdate(fields.agentBirthdate);
    newErrors.agentPhone = validators.phone(fields.agentPhone);

    // Validate Company tab
    newErrors.companyDeedNumber = validators.deedNumber(fields.deedNumber);
    newErrors.unifiedCrNumber = validators.unifiedCrNumber(fields.unifiedCrNumber);
    newErrors.companyPoaAgentId = validators.poaAgentId(fields.poaAgentId);
    newErrors.companyPoaId = validators.poaId(fields.poaId);
    newErrors.companyAgentBirthdate = validators.birthdate(fields.companyAgentBirthdate);
    newErrors.companyAgentPhone = validators.phone(fields.companyAgentPhone);

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  }, [fields, validators]);

  // Handlers
  const handleDeedOwnerSelect = useCallback((index: number) => {
    if (index === 1) {
      navigation.navigate("MarketingRequestPlaceholder");
    } else {
      setDeedOwnerType("electronic");
    }
  }, [navigation]);

  const handleOwnerTypeSelect = useCallback((index: number) => {
    const types: OwnerType[] = ["individual", "multi-agent", "company"];
    setOwnerType(types[index]);
  }, []);

  const handleBackPress = useCallback(() => {
    navigation.navigate("MarketingRequestPlaceholder");
  }, [navigation]);

  const handleClosePress = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const handleCancelBack = useCallback(() => {
    setShowCancelModal(false);
  }, []);

  const handleCancelYes = useCallback(() => {
    setShowCancelModal(false);
    navigateToMapScreen(navigation);
  }, [navigation]);

  const handleNextPress = useCallback(() => {
    // Mark all fields as touched
    const allFields = {
      deedNumber: true,
      ownerId: true,
      ownerBirthdate: true,
      ownerPhone: true,
      ownerIdNumber: true,
      poaAgentId: true,
      poaId: true,
      agentBirthdate: true,
      agentPhone: true,
      companyDeedNumber: true,
      unifiedCrNumber: true,
      companyPoaAgentId: true,
      companyPoaId: true,
      companyAgentBirthdate: true,
      companyAgentPhone: true,
    };
    setTouched(allFields);

    if (validateAllTabs()) {
      console.log("Next step");
      // Navigate to next step
    }
  }, [validateAllTabs]);

  const handleFooterBackPress = useCallback(() => {
    navigation.navigate("MarketingRequestPlaceholder");
  }, [navigation]);

  // Listen to keyboard show/hide events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        // Set keyboard height to position footer just above keyboard
        Animated.timing(keyboardHeight, {
          toValue: event.endCoordinates.height,
          duration: event.duration || 250,
          useNativeDriver: false, // Can't use native driver for bottom positioning
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (event) => {
        // Reset keyboard height to 0 to bring footer back to original position
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: event.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardHeight]);

  const openDatePicker = useCallback((type: "owner" | "agent" | "company") => {
    setActiveCalendarType(type);
    const titles = {
      owner: t("listings.ownerBirthdate"),
      agent: t("listings.agentBirthdate"),
      company: t("listings.agentBirthdate"),
    };
    setDatePickerTitle(titles[type]);
    
    const fieldNames = {
      owner: "ownerBirthdate",
      agent: "agentBirthdate",
      company: "companyAgentBirthdate",
    };
    setTouched((prev) => ({ ...prev, [fieldNames[type]]: true }));
    setDatePickerVisible(true);
  }, [t]);

  const handleDateSelect = useCallback((formattedDate: string) => {
    // Update the active calendar type field, which will sync to all tabs
    if (activeCalendarType === "owner") {
      updateField("ownerBirthdate", formattedDate, validators.birthdate);
      setErrors((prev) => ({ 
        ...prev, 
        ownerBirthdate: "",
        agentBirthdate: "",
        companyAgentBirthdate: ""
      }));
    } else if (activeCalendarType === "agent") {
      updateField("agentBirthdate", formattedDate, validators.birthdate);
      setErrors((prev) => ({ 
        ...prev, 
        ownerBirthdate: "",
        agentBirthdate: "",
        companyAgentBirthdate: ""
      }));
    } else {
      updateField("companyAgentBirthdate", formattedDate, validators.birthdate);
      setErrors((prev) => ({ 
        ...prev, 
        ownerBirthdate: "",
        agentBirthdate: "",
        companyAgentBirthdate: ""
      }));
    }
  }, [activeCalendarType, updateField, validators]);

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      sectionLabel: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      label: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      textInput: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      phoneInputWrapper: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      countryCode: {
        marginRight: isRTL ? 0 : wp(2),
        marginLeft: isRTL ? wp(2) : 0,
      },
      phoneInput: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      dateSelector: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      dateText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      errorText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      contactLink: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      contactLinkText: {
        marginLeft: isRTL ? 0 : wp(2),
        marginRight: isRTL ? wp(2) : 0,
      },
    }),
    [isRTL]
  );

  // FlatList data: one item per form field (virtualized for smooth scroll)
  const formFieldsList = useMemo(() => {
    if (ownerType === "individual") {
      return [
        { id: "ind-deed", kind: "text" as const, fieldName: "deedNumber" as const, label: t("listings.deedNumber"), placeholder: t("listings.deedNumber"), validator: validators.deedNumber, errorKey: "deedNumber" },
        { id: "ind-ownerId", kind: "text" as const, fieldName: "ownerId" as const, label: t("listings.ownerId"), placeholder: t("listings.enterHere"), validator: validators.ownerId, errorKey: "ownerId" },
        { id: "ind-birth", kind: "date" as const, fieldName: "ownerBirthdate" as const, label: t("listings.ownerBirthdate"), dateType: "owner" as const },
        { id: "ind-phone", kind: "phone" as const, fieldName: "ownerPhone" as const, label: t("listings.ownerPhoneNumber") },
      ];
    }
    if (ownerType === "multi-agent") {
      return [
        { id: "ma-deed", kind: "text" as const, fieldName: "deedNumber" as const, label: t("listings.deedNumber"), placeholder: t("listings.deedNumber"), validator: validators.deedNumber, errorKey: "deedNumber_ma" },
        { id: "ma-ownerId", kind: "text" as const, fieldName: "ownerIdNumber" as const, label: t("listings.ownerIdNumber"), placeholder: t("listings.enterHere"), validator: validators.ownerId, errorKey: "ownerIdNumber" },
        { id: "ma-poaAgent", kind: "text" as const, fieldName: "poaAgentId" as const, label: t("listings.poaAgentId"), placeholder: t("listings.enterHere"), validator: validators.poaAgentId, errorKey: "poaAgentId" },
        { id: "ma-poaId", kind: "text" as const, fieldName: "poaId" as const, label: t("listings.poaId"), placeholder: t("listings.enterHere"), validator: validators.poaId, errorKey: "poaId" },
        { id: "ma-birth", kind: "date" as const, fieldName: "agentBirthdate" as const, label: t("listings.agentBirthdate"), dateType: "agent" as const },
        { id: "ma-phone", kind: "phone" as const, fieldName: "agentPhone" as const, label: t("listings.agentPhoneNumber") },
      ];
    }
    return [
      { id: "co-deed", kind: "text" as const, fieldName: "deedNumber" as const, label: t("listings.deedNumber"), placeholder: t("listings.deedNumber"), validator: validators.deedNumber, errorKey: "companyDeedNumber" },
      { id: "co-cr", kind: "text" as const, fieldName: "unifiedCrNumber" as const, label: t("listings.unifiedCrNumber"), placeholder: t("listings.enterHere"), validator: validators.unifiedCrNumber, errorKey: "unifiedCrNumber" },
      { id: "co-poaAgent", kind: "text" as const, fieldName: "poaAgentId" as const, label: t("listings.poaAgentId"), placeholder: t("listings.enterHere"), validator: validators.poaAgentId, errorKey: "companyPoaAgentId" },
      { id: "co-poaId", kind: "text" as const, fieldName: "poaId" as const, label: t("listings.poaId"), placeholder: t("listings.enterHere"), validator: validators.poaId, errorKey: "companyPoaId" },
      { id: "co-birth", kind: "date" as const, fieldName: "companyAgentBirthdate" as const, label: t("listings.agentBirthdate"), dateType: "company" as const },
      { id: "co-phone", kind: "phone" as const, fieldName: "companyAgentPhone" as const, label: t("listings.agentPhoneNumber") },
    ];
  }, [ownerType, t, validators]);

  const handleFocusField = useCallback((fieldName: string) => {
    setFocusedField(fieldName);
  }, []);
  const handleBlurField = useCallback(() => {
    setFocusedField(null);
  }, []);

  const renderFormFieldItem = useCallback(
    ({ item }: { item: FormFieldItem }) => {
      const errorKey = item.errorKey ?? item.fieldName;
      const rawValue = fieldsRef.current[item.fieldName];
      const value =
        item.kind === "date"
          ? formatDateForDisplay(rawValue, isRTLRef.current)
          : rawValue;
      return (
        <FormFieldRow
          item={item}
          value={value}
          error={errorsRef.current[errorKey] ?? ""}
          touched={!!touchedRef.current[errorKey]}
          isFocused={focusedFieldRef.current === item.fieldName}
          onUpdateField={updateField}
          onFocus={handleFocusField}
          onBlur={handleBlurField}
          openDatePicker={openDatePicker}
          rtlStyles={rtlStyles}
          t={t}
          phoneValidator={validators.phone}
        />
      );
    },
    [updateField, handleFocusField, handleBlurField, openDatePicker, rtlStyles, t, validators.phone]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: FORM_ROW_HEIGHT,
      offset: FORM_ROW_HEIGHT * index,
      index,
    }),
    []
  );

  const listHeader = useMemo(
    () => (
      <DeedOwnerTypeSection
        deedOwnerType={deedOwnerType}
        deedOwnerOptions={deedOwnerOptions}
        ownerType={ownerType}
        ownerTypeOptions={ownerTypeOptions}
        onDeedOwnerSelect={handleDeedOwnerSelect}
        onOwnerTypeSelect={handleOwnerTypeSelect}
        deedOwnerTypeLabel={t("listings.deedOwnerType")}
        ownerTypeLabel={t("listings.ownerType")}
        rtlStyles={rtlStyles}
      />
    ),
    [deedOwnerType, deedOwnerOptions, ownerType, ownerTypeOptions, handleDeedOwnerSelect, handleOwnerTypeSelect, t, rtlStyles]
  );

  const listFooter = useMemo(
    () => <ContactLink rtlStyles={rtlStyles} haveQuestionText={t("listings.haveQuestionContactUs")} />,
    [rtlStyles, t]
  );

  return (
    <View style={styles.container}>
    <KeyboardAvoidingView
        style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
          <View style={styles.mainContainer}>
          <ScreenHeader
            title={t("listings.addListing")}
            onBackPress={handleBackPress}
            showRightSide={true}
            rightComponent={
              <TouchableOpacity
                onPress={handleClosePress}
                activeOpacity={0.7}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={wp(6)} color={COLORS.primary} />
              </TouchableOpacity>
            }
            fontWeightBold={true}
            fontSize={wp(4.5)}
          />

          <FlatList
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            data={formFieldsList}
            keyExtractor={(item) => item.id}
            renderItem={renderFormFieldItem}
            ListHeaderComponent={listHeader}
            ListFooterComponent={listFooter}
            getItemLayout={getItemLayout}
            initialNumToRender={6}
            maxToRenderPerBatch={4}
            windowSize={7}
            removeClippedSubviews={Platform.OS === "android"}
          />
          </View>
      </KeyboardAvoidingView>

      <Animated.View
        style={[
          styles.footerContainer,
          {
            bottom: keyboardHeight,
          },
        ]}
      >
          <ListingFooter
            currentStep={2}
            totalSteps={2}
            onBackPress={handleFooterBackPress}
            onNextPress={handleNextPress}
            backText={t("listings.completeLater")}
            nextText={t("listings.next")}
            nextDisabled={false}
          />
      </Animated.View>

      <DatePickerModal
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onDateSelect={handleDateSelect}
        title={datePickerTitle}
        initialDate={
          activeCalendarType === "owner" 
            ? (fields.ownerBirthdate ? parseDateFromFormatted(fields.ownerBirthdate) : new Date())
            : activeCalendarType === "agent"
            ? (fields.agentBirthdate ? parseDateFromFormatted(fields.agentBirthdate) : new Date())
            : (fields.companyAgentBirthdate ? parseDateFromFormatted(fields.companyAgentBirthdate) : new Date())
        }
      />

      <CancelModal
        visible={showCancelModal}
        onBack={handleCancelBack}
        onConfirm={handleCancelYes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebf1f1",
  },
  keyboardView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: wp(4),
    paddingBottom: hp(12), // Extra padding for footer
  },
  footerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  closeButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: wp(4),
    fontWeight: "500",
    color: "#353f49",
    marginBottom: hp(1.5),
    marginTop: hp(1),
  },
  segmentedControlContainer: {
    marginBottom: hp(2),
  },
  inputContainer: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: wp(4),
    fontWeight: "500",
    color: "#353f49",
    marginBottom: hp(1),
  },
  textInput: {
    height: hp(6),
    backgroundColor: "#fff",
    borderRadius: wp(2),
    borderWidth: 1.2,
    borderColor: "#d2d6d9",
    paddingHorizontal: wp(3),
    fontSize: wp(4),
    color: "#353f49",
  },
  textInputFocused: {
    backgroundColor: "#e6fff6",
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  textInputError: {
    borderColor: "#ef4444",
    borderWidth: 1.5,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: wp(2),
    borderWidth: 1.2,
    borderColor: "#d2d6d9",
    paddingHorizontal: wp(3),
    height: hp(6),
  },
  countryCode: {
    fontSize: wp(4),
    color: COLORS.primary,
    fontWeight: "400",
    marginRight: wp(2),
  },
  phoneInput: {
    flex: 1,
    fontSize: wp(4),
    color: "#353f49",
    padding: 0,
  },
  dateSelector: {
    height: hp(6),
    backgroundColor: "#fff",
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: "#d2d6d9",
    paddingHorizontal: wp(3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateSelectorError: {
    borderColor: "#ef4444",
    borderWidth: 1.5,
  },
  dateText: {
    fontSize: wp(4),
    color: "#353f49",
  },
  placeholderText: {
    color: "#9ca3af",
  },
  errorText: {
    color: "#ef4444",
    fontSize: wp(3.5),
    marginTop: hp(0.5),
  },
  contactLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactLinkText: {
    fontSize: wp(4),
    color: "#3b82f6",
    marginLeft: wp(2),
  },
});
