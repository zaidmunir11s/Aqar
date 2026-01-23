import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
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

// Get current date formatted as DD / MM / YYYY
const getCurrentDateFormatted = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day} / ${month} / ${year}`;
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

  // Render phone input with +966 prefix
  const renderPhoneInput = useCallback((
    label: string,
    value: string,
    fieldName: "ownerPhone" | "agentPhone" | "companyAgentPhone"
  ) => {
    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.label, rtlStyles.label]}>{label}</Text>
        <View style={[
          styles.phoneInputWrapper,
          rtlStyles.phoneInputWrapper,
          focusedField === fieldName && styles.textInputFocused,
          focusedField !== fieldName && touched[fieldName] && errors[fieldName] && styles.textInputError,
        ]}>
          <Text style={[styles.countryCode, rtlStyles.countryCode]}>+966</Text>
          <TextInput
            style={[styles.phoneInput, rtlStyles.phoneInput]}
            placeholder={t("listings.enterPhoneNumber")}
            value={value}
            onChangeText={(val) => {
              updateField(fieldName, val, validators.phone);
            }}
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            onFocus={() => setFocusedField(fieldName)}
            onBlur={() => setFocusedField(null)}
          />
        </View>
        {touched[fieldName] && errors[fieldName] && (
          <Text style={[styles.errorText, rtlStyles.errorText]}>{errors[fieldName]}</Text>
        )}
      </View>
    );
  }, [focusedField, touched, errors, updateField, validators, t, rtlStyles]);

  // Render text input
  const renderTextInput = useCallback((
    label: string,
    value: string,
    fieldName: keyof FormFields,
    placeholder: string,
    validator: (val: string) => string,
    errorKey?: string // For fields that use different error keys (e.g., deedNumber_ma)
  ) => {
    const errorKeyToUse = errorKey || fieldName;
    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.label, rtlStyles.label]}>{label}</Text>
        <TextInput
          style={[
            styles.textInput,
            rtlStyles.textInput,
            focusedField === fieldName && styles.textInputFocused,
            focusedField !== fieldName && touched[errorKeyToUse] && errors[errorKeyToUse] && styles.textInputError,
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={(val) => {
            updateField(fieldName, val, validator);
          }}
          placeholderTextColor="#9ca3af"
          onFocus={() => setFocusedField(fieldName)}
          onBlur={() => setFocusedField(null)}
        />
        {touched[errorKeyToUse] && errors[errorKeyToUse] && (
          <Text style={[styles.errorText, rtlStyles.errorText]}>{errors[errorKeyToUse]}</Text>
        )}
      </View>
    );
  }, [focusedField, touched, errors, updateField, rtlStyles]);

  // Render date selector
  const renderDateSelector = useCallback((
    label: string,
    value: string,
    fieldName: "ownerBirthdate" | "agentBirthdate" | "companyAgentBirthdate",
    type: "owner" | "agent" | "company"
  ) => {
    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.label, rtlStyles.label]}>{label}</Text>
        <TouchableOpacity
          style={[
            styles.dateSelector,
            rtlStyles.dateSelector,
            touched[fieldName] && errors[fieldName] && styles.dateSelectorError,
          ]}
          onPress={() => openDatePicker(type)}
        >
          <Text style={[styles.dateText, rtlStyles.dateText, !value && styles.placeholderText]}>
            {value || t("listings.selectDate")}
          </Text>
          <Ionicons 
            name={isRTL ? "chevron-up" : "chevron-down"} 
            size={wp(5)} 
            color={COLORS.primary} 
          />
        </TouchableOpacity>
        {touched[fieldName] && errors[fieldName] && (
          <Text style={[styles.errorText, rtlStyles.errorText]}>{errors[fieldName]}</Text>
        )}
      </View>
    );
  }, [touched, errors, openDatePicker, t, isRTL, rtlStyles]);

  // Render form fields based on owner type
  const renderFormFields = useMemo(() => {
    if (ownerType === "individual") {
      return (
        <>
          {renderTextInput(t("listings.deedNumber"), fields.deedNumber, "deedNumber", t("listings.deedNumber"), validators.deedNumber)}
          {renderTextInput(t("listings.ownerId"), fields.ownerId, "ownerId", t("listings.enterHere"), validators.ownerId)}
          {renderDateSelector(t("listings.ownerBirthdate"), fields.ownerBirthdate, "ownerBirthdate", "owner")}
          {renderPhoneInput(t("listings.ownerPhoneNumber"), fields.ownerPhone, "ownerPhone")}
        </>
      );
    } else if (ownerType === "multi-agent") {
      return (
        <>
          {renderTextInput(t("listings.deedNumber"), fields.deedNumber, "deedNumber", t("listings.deedNumber"), validators.deedNumber, "deedNumber_ma")}
          {renderTextInput(t("listings.ownerIdNumber"), fields.ownerIdNumber, "ownerIdNumber", t("listings.enterHere"), validators.ownerId)}
          {renderTextInput(t("listings.poaAgentId"), fields.poaAgentId, "poaAgentId", t("listings.enterHere"), validators.poaAgentId)}
          {renderTextInput(t("listings.poaId"), fields.poaId, "poaId", t("listings.enterHere"), validators.poaId)}
          {renderDateSelector(t("listings.agentBirthdate"), fields.agentBirthdate, "agentBirthdate", "agent")}
          {renderPhoneInput(t("listings.agentPhoneNumber"), fields.agentPhone, "agentPhone")}
        </>
      );
    } else {
      return (
        <>
          {renderTextInput(t("listings.deedNumber"), fields.deedNumber, "deedNumber", t("listings.deedNumber"), validators.deedNumber, "companyDeedNumber")}
          {renderTextInput(t("listings.unifiedCrNumber"), fields.unifiedCrNumber, "unifiedCrNumber", t("listings.enterHere"), validators.unifiedCrNumber)}
          {renderTextInput(t("listings.poaAgentId"), fields.poaAgentId, "poaAgentId", t("listings.enterHere"), validators.poaAgentId, "companyPoaAgentId")}
          {renderTextInput(t("listings.poaId"), fields.poaId, "poaId", t("listings.enterHere"), validators.poaId, "companyPoaId")}
          {renderDateSelector(t("listings.agentBirthdate"), fields.companyAgentBirthdate, "companyAgentBirthdate", "company")}
          {renderPhoneInput(t("listings.agentPhoneNumber"), fields.companyAgentPhone, "companyAgentPhone")}
        </>
      );
    }
  }, [ownerType, fields, renderTextInput, renderDateSelector, renderPhoneInput, validators, t]);

  return (
    <View style={styles.container}>
    <KeyboardAvoidingView
        style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.sectionLabel, rtlStyles.sectionLabel]}>
              {t("listings.deedOwnerType")}
            </Text>
            <View style={styles.segmentedControlContainer}>
              <SegmentedControl
                options={deedOwnerOptions}
                selectedIndex={deedOwnerType === "electronic" ? 0 : 1}
                onSelect={handleDeedOwnerSelect}
              />
            </View>

            <Text style={[styles.sectionLabel, rtlStyles.sectionLabel]}>
              {t("listings.ownerType")}
            </Text>
            <View style={styles.segmentedControlContainer}>
              <SegmentedControl
                options={ownerTypeOptions}
                selectedIndex={
                  ownerType === "individual" ? 0 : ownerType === "multi-agent" ? 1 : 2
                }
                onSelect={handleOwnerTypeSelect}
              />
            </View>

            {renderFormFields}

            <TouchableOpacity style={[styles.contactLink, rtlStyles.contactLink]}>
              <Ionicons name="chatbubble-outline" size={wp(5)} color="#3b82f6" />
              <Text style={[styles.contactLinkText, rtlStyles.contactLinkText]}>
                {t("listings.haveQuestionContactUs")}
              </Text>
            </TouchableOpacity>
          </ScrollView>
          </View>
        </TouchableWithoutFeedback>
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
