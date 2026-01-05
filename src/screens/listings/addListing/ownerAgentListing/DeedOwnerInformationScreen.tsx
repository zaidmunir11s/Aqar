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

  const deedOwnerOptions = ["Electronic/Eye Record", "Other"];
  const ownerTypeOptions = ["Individual", "Multi/Agent", "Company"];

  // Validation functions
  const validators = useMemo(() => ({
    deedNumber: (value: string): string => {
      if (!value.trim()) return "This field is required";
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length === 12 || digitsOnly.length === 16) return "";
      return "Please enter the deed number (12 digits) or RER property number (16 digits)";
    },
    ownerId: (value: string): string => {
      if (!value.trim()) return "This field is required";
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length === 10) return "";
      return "Please enter 10 digits owner ID number";
    },
    poaAgentId: (value: string): string => {
      if (!value.trim()) return "This field is required";
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length === 10) return "";
      return "Please enter 10 digits POA agent ID number";
    },
    poaId: (value: string): string => {
      if (!value.trim()) return "This field is required";
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length >= 7 && digitsOnly.length <= 12) return "";
      return "Please enter 7-12 digits POA ID number";
    },
    unifiedCrNumber: (value: string): string => {
      if (!value.trim()) return "This field is required";
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length === 10) return "";
      return "Please enter 10 digits owner ID number";
    },
    phone: (value: string): string => {
      if (!value.trim()) return "This field is required";
      return "";
    },
    birthdate: (value: string): string => {
      if (!value.trim()) return "This field is required";
      return "";
    },
  }), []);

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
      owner: "Owner Birthdate",
      agent: "Agent Birthdate",
      company: "Agent Birthdate",
    };
    setDatePickerTitle(titles[type]);
    
    const fieldNames = {
      owner: "ownerBirthdate",
      agent: "agentBirthdate",
      company: "companyAgentBirthdate",
    };
    setTouched((prev) => ({ ...prev, [fieldNames[type]]: true }));
    setDatePickerVisible(true);
  }, []);

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

  // Render phone input with +966 prefix
  const renderPhoneInput = useCallback((
    label: string,
    value: string,
    fieldName: "ownerPhone" | "agentPhone" | "companyAgentPhone"
  ) => {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={[
          styles.phoneInputWrapper,
          focusedField === fieldName && styles.textInputFocused,
          focusedField !== fieldName && touched[fieldName] && errors[fieldName] && styles.textInputError,
        ]}>
          <Text style={styles.countryCode}>+966</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder="Enter phone number"
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
          <Text style={styles.errorText}>{errors[fieldName]}</Text>
        )}
      </View>
    );
  }, [focusedField, touched, errors, updateField, validators]);

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
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[
            styles.textInput,
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
          <Text style={styles.errorText}>{errors[errorKeyToUse]}</Text>
        )}
      </View>
    );
  }, [focusedField, touched, errors, updateField]);

  // Render date selector
  const renderDateSelector = useCallback((
    label: string,
    value: string,
    fieldName: "ownerBirthdate" | "agentBirthdate" | "companyAgentBirthdate",
    type: "owner" | "agent" | "company"
  ) => {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[
            styles.dateSelector,
            touched[fieldName] && errors[fieldName] && styles.dateSelectorError,
          ]}
          onPress={() => openDatePicker(type)}
        >
          <Text style={[styles.dateText, !value && styles.placeholderText]}>
            {value || "Select date"}
          </Text>
          <Ionicons name="chevron-down" size={wp(5)} color={COLORS.primary} />
        </TouchableOpacity>
        {touched[fieldName] && errors[fieldName] && (
          <Text style={styles.errorText}>{errors[fieldName]}</Text>
        )}
      </View>
    );
  }, [touched, errors, openDatePicker]);

  // Render form fields based on owner type
  const renderFormFields = useMemo(() => {
    if (ownerType === "individual") {
      return (
        <>
          {renderTextInput("Deed number", fields.deedNumber, "deedNumber", "Deed number", validators.deedNumber)}
          {renderTextInput("Owner ID", fields.ownerId, "ownerId", "Enter here", validators.ownerId)}
          {renderDateSelector("Owner Birthdate", fields.ownerBirthdate, "ownerBirthdate", "owner")}
          {renderPhoneInput("Owner phone number", fields.ownerPhone, "ownerPhone")}
        </>
      );
    } else if (ownerType === "multi-agent") {
      return (
        <>
          {renderTextInput("Deed number", fields.deedNumber, "deedNumber", "Deed number", validators.deedNumber, "deedNumber_ma")}
          {renderTextInput("Owner ID number", fields.ownerIdNumber, "ownerIdNumber", "Enter here", validators.ownerId)}
          {renderTextInput("POA Agent ID", fields.poaAgentId, "poaAgentId", "Enter here", validators.poaAgentId)}
          {renderTextInput("POA ID", fields.poaId, "poaId", "Enter here", validators.poaId)}
          {renderDateSelector("Agent Birthdate", fields.agentBirthdate, "agentBirthdate", "agent")}
          {renderPhoneInput("Agent Phone Number", fields.agentPhone, "agentPhone")}
        </>
      );
    } else {
      return (
        <>
          {renderTextInput("Deed number", fields.deedNumber, "deedNumber", "Deed number", validators.deedNumber, "companyDeedNumber")}
          {renderTextInput("Unified CR number", fields.unifiedCrNumber, "unifiedCrNumber", "Enter here", validators.unifiedCrNumber)}
          {renderTextInput("POA Agent ID", fields.poaAgentId, "poaAgentId", "Enter here", validators.poaAgentId, "companyPoaAgentId")}
          {renderTextInput("POA ID", fields.poaId, "poaId", "Enter here", validators.poaId, "companyPoaId")}
          {renderDateSelector("Agent Birthdate", fields.companyAgentBirthdate, "companyAgentBirthdate", "company")}
          {renderPhoneInput("Agent Phone Number", fields.companyAgentPhone, "companyAgentPhone")}
        </>
      );
    }
  }, [ownerType, fields, renderTextInput, renderDateSelector, renderPhoneInput, validators]);

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
            title="Add Listing"
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
            <Text style={styles.sectionLabel}>
              Deed Owner Type (Property Ownership Document)
            </Text>
            <View style={styles.segmentedControlContainer}>
              <SegmentedControl
                options={deedOwnerOptions}
                selectedIndex={deedOwnerType === "electronic" ? 0 : 1}
                onSelect={handleDeedOwnerSelect}
              />
            </View>

            <Text style={styles.sectionLabel}>Owner Type</Text>
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

            <TouchableOpacity style={styles.contactLink}>
              <Ionicons name="chatbubble-outline" size={wp(5)} color="#3b82f6" />
              <Text style={styles.contactLinkText}>Have a question? Contact us</Text>
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
            backText="Complete Later"
            nextText="Next"
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
