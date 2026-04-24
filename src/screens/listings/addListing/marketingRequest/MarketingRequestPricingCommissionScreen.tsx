import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import {
  ScreenHeader,
  ListingFooter,
  ToggleSwitch,
  SegmentedControl,
  CancelModal,
} from "@/components";
import { COLORS } from "@/constants";
import { useLocalization } from "@/hooks/useLocalization";
import { PropertyDetailsDisplayItem } from "@/components/marketingRequestPropertyDetails/shared/CategoryFormProps";
import { navigateToMapScreen } from "@/utils";

type NavigationProp = NativeStackNavigationProp<any>;
type AttachmentItem = {
  id: string;
  uri: string;
  mediaType?: "photo" | "video" | "unknown";
  note?: string;
};
type RouteParams = {
  selectedCategory?: string;
  attachments?: AttachmentItem[];
  locationDisplayName?: string;
  selectedLocation?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  propertyDetailsItems?: PropertyDetailsDisplayItem[];
};
type SaleValidationRule = {
  areaMin: number;
  priceMin: number;
  useMeterPriceLabel?: boolean;
  hasMeterPriceField?: boolean;
};
type RentValidationRule = {
  areaMin?: number;
  annualMin?: number;
  hasAnnualAmountField?: boolean;
  hasInstallments?: boolean;
  hasMeterPriceField?: boolean;
};

/** Upper bounds: invalid when value >= max (message text uses same number with grouping). */
type SaleMaxRule = {
  areaMax?: number;
  priceMax?: number;
};

const SALE_MAX_RULES: Partial<Record<string, SaleMaxRule>> = {
  "sale-1": { areaMax: 15001, priceMax: 100000001 },
  "sale-2": { areaMax: 10000001 },
  "sale-3": { areaMax: 1001, priceMax: 15000001 },
  "sale-4": { areaMax: 20001, priceMax: 2000000001 },
  "sale-5": { areaMax: 10001, priceMax: 5000001 },
  "sale-6": { areaMax: 15001, priceMax: 50000001 },
  "sale-7": { areaMax: 10000001, priceMax: 150000001 },
  "sale-8": { areaMax: 10001, priceMax: 100000001 },
  "sale-9": { areaMax: 15001, priceMax: 100000001 },
};

/** Rent: invalid when area >= areaMax or annual amount >= annualMax (stored in `price`). */
type RentMaxRule = {
  areaMax?: number;
  annualMax?: number;
};

const RENT_MAX_RULES: Partial<Record<string, RentMaxRule>> = {
  "rent-1": { areaMax: 10001, annualMax: 500001 },
  "rent-2": { areaMax: 7001, annualMax: 800001 },
  "rent-3": { areaMax: 10001, annualMax: 300001 },
  "rent-4": { areaMax: 15001, annualMax: 350001 },
  "rent-5": { areaMax: 10001, annualMax: 200001 },
  "rent-6": { areaMax: 15001, annualMax: 5000001 },
  "rent-7": { areaMax: 20001, annualMax: 150000001 },
  "rent-8": { areaMax: 10000001 },
  "rent-9": { areaMax: 1001, annualMax: 50001 },
  "rent-10": { areaMax: 10001, annualMax: 5000001 },
  "rent-11": { areaMax: 10001, annualMax: 5001 },
  "rent-12": { areaMax: 50001, annualMax: 100000001 },
  "rent-13": { areaMax: 15001, annualMax: 350001 },
};

const SALE_VALIDATION_RULES: Record<string, SaleValidationRule> = {
  "sale-1": { areaMin: 49, priceMin: 49999 }, // Villa
  "sale-2": { areaMin: 9, priceMin: 49999, useMeterPriceLabel: true }, // Land
  "sale-3": { areaMin: 19, priceMin: 49999 }, // Apartment
  "sale-4": { areaMin: 99, priceMin: 99999 }, // Building
  "sale-5": { areaMin: 49, priceMin: 49999 }, // Small house
  "sale-6": { areaMin: 49, priceMin: 19999 }, // Lounge
  "sale-7": { areaMin: 99, priceMin: 9999, hasMeterPriceField: true }, // Farm
  "sale-8": { areaMin: 1, priceMin: 999 }, // Store
  "sale-9": { areaMin: 49, priceMin: 49999 }, // Floor
};

const RENT_VALIDATION_RULES: Record<string, RentValidationRule> = {
  "rent-1": { annualMin: 49, hasAnnualAmountField: true, hasInstallments: true }, // Apartment
  "rent-2": { areaMin: 99, annualMin: 999, hasAnnualAmountField: true, hasInstallments: true }, // Villa
  "rent-3": { annualMin: 999, hasAnnualAmountField: true, hasInstallments: true }, // Big flat
  "rent-4": { areaMin: 49, annualMin: 99, hasAnnualAmountField: true, hasInstallments: true }, // Lounge
  "rent-5": { areaMin: 49, annualMin: 999, hasAnnualAmountField: true, hasInstallments: true }, // Small house
  "rent-6": { annualMin: 999, hasAnnualAmountField: true, hasInstallments: true }, // Store
  "rent-7": { areaMin: 49, annualMin: 9999, hasAnnualAmountField: true, hasInstallments: true }, // Building
  "rent-8": { areaMin: 9, hasAnnualAmountField: false, hasInstallments: false, hasMeterPriceField: true }, // Land
  "rent-9": { annualMin: 99, hasAnnualAmountField: true, hasInstallments: true }, // Room
  "rent-10": { areaMin: 19, annualMin: 1499, hasAnnualAmountField: true, hasInstallments: true, hasMeterPriceField: true }, // Office
  "rent-11": { areaMin: 19, annualMin: 99, hasAnnualAmountField: true, hasInstallments: true }, // Tent
  "rent-12": { areaMin: 9, annualMin: 79, hasAnnualAmountField: true, hasInstallments: true }, // Warehouse
  "rent-13": { areaMin: 49, annualMin: 99, hasAnnualAmountField: true, hasInstallments: true }, // Chalet
};

export default function MarketingRequestPricingCommissionScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { t, isRTL, i18n } = useLocalization();
  const params = (route.params as RouteParams | undefined) ?? {};
  const selectedCategory = params.selectedCategory ?? "";
  const isRentCategory = selectedCategory.startsWith("rent-");
  const saleRule = SALE_VALIDATION_RULES[selectedCategory];
  const rentRule = RENT_VALIDATION_RULES[selectedCategory];
  const hasCategoryValidationRule = Boolean(saleRule);
  const saleMaxRule = SALE_MAX_RULES[selectedCategory];
  const rentMaxRule = RENT_MAX_RULES[selectedCategory];
  const maxRuleForCeiling = saleMaxRule ?? rentMaxRule;
  const effectivePriceMaxExclusive = saleMaxRule?.priceMax ?? rentMaxRule?.annualMax;
  /** Farm sale & office rent: annual/total amount syncs with area × meter price (same pattern as farm). */
  const isAreaMeterAnnualSyncCategory =
    selectedCategory === "sale-7" || selectedCategory === "rent-10";
  const isMeterPriceCategory = saleRule?.useMeterPriceLabel === true;
  const hasMeterPriceField =
    saleRule?.hasMeterPriceField === true || rentRule?.hasMeterPriceField === true;
  const hasAnnualAmountFieldForRent = isRentCategory ? rentRule?.hasAnnualAmountField !== false : false;

  const [area, setArea] = useState("");
  const [price, setPrice] = useState("");
  const [hasCommission, setHasCommission] = useState(false);
  const [commissionType, setCommissionType] = useState<"percentage" | "fixed">("percentage");
  const [commissionValue, setCommissionValue] = useState("");
  const [meterPrice, setMeterPrice] = useState("");
  const [monthlyRentAmount, setMonthlyRentAmount] = useState("");
  const [quarterlyRentAmount, setQuarterlyRentAmount] = useState("");
  const [semiAnnualRentAmount, setSemiAnnualRentAmount] = useState("");
  const [description, setDescription] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [areaFocused, setAreaFocused] = useState(false);
  const [priceFocused, setPriceFocused] = useState(false);
  const [commissionFocused, setCommissionFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [meterPriceFocused, setMeterPriceFocused] = useState(false);
  const [monthlyRentFocused, setMonthlyRentFocused] = useState(false);
  const [quarterlyRentFocused, setQuarterlyRentFocused] = useState(false);
  const [semiAnnualRentFocused, setSemiAnnualRentFocused] = useState(false);
  const [acceptMonthlyPayment, setAcceptMonthlyPayment] = useState(false);
  const [acceptQuarterlyPayment, setAcceptQuarterlyPayment] = useState(false);
  const [acceptSemiAnnualPayment, setAcceptSemiAnnualPayment] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  /** Skip one annual→meter pass when annual amount was just set from area × meter (farm / office rent). */
  const areaMeterAnnualSyncRef = useRef(false);

  const commissionOptions = useMemo(
    () => [t("listings.percentage"), t("listings.fixed")],
    [t]
  );

  const rtlStyles = useMemo(
    () => ({
      fieldRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      labelText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      inputSuffixRow: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      errorAndHelperText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
    }),
    [isRTL]
  );

  const toNumber = (value: string): number => {
    const cleaned = value.replace(/[^\d]/g, "");
    return cleaned ? Number(cleaned) : 0;
  };

  const normalizeNumericInput = (value: string): string => {
    const digitsOnly = value.replace(/[^\d]/g, "");
    return digitsOnly.replace(/^0+(?=\d)/, "");
  };

  /** Single decimal point; digits only otherwise (for commission %). */
  const normalizeCommissionPercentageInput = (value: string): string => {
    let out = "";
    let dotSeen = false;
    for (const ch of value) {
      if (ch >= "0" && ch <= "9") out += ch;
      else if (ch === "." && !dotSeen) {
        dotSeen = true;
        out += ".";
      }
    }
    return out;
  };

  const parseCommissionNumber = (): number => {
    if (commissionType === "percentage") {
      const n = parseFloat(normalizeCommissionPercentageInput(commissionValue));
      return Number.isNaN(n) ? 0 : n;
    }
    return toNumber(commissionValue);
  };

  const normalizeCommissionForNavigate = (): string => {
    if (commissionType === "percentage") {
      return normalizeCommissionPercentageInput(commissionValue).replace(/\.+$/, "");
    }
    return normalizeNumericInput(commissionValue);
  };

  const formatValidationNumber = (n: number): string => n.toLocaleString("en-US");

  // Farm sale & office rent: area × meter → annual/total amount (`price`). Omit `price` from deps so typing price does not immediately reset before meter sync.
  useEffect(() => {
    if (!isAreaMeterAnnualSyncCategory) return;
    const a = toNumber(area);
    const m = toNumber(meterPrice);
    if (m > 0 && a > 0) {
      const nextPrice = a * m;
      if (nextPrice !== toNumber(price)) {
        areaMeterAnnualSyncRef.current = true;
        setPrice(normalizeNumericInput(String(nextPrice)));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: react to area/meter only; compare to latest price inside effect
  }, [area, meterPrice, isAreaMeterAnnualSyncCategory]);

  // User edits annual/total → update meter as round(price / area) only while meter price > 0; if meter is 0, do not derive meter from price.
  useEffect(() => {
    if (!isAreaMeterAnnualSyncCategory) return;
    if (areaMeterAnnualSyncRef.current) {
      areaMeterAnnualSyncRef.current = false;
      return;
    }
    const a = toNumber(area);
    const m = toNumber(meterPrice);
    const p = toNumber(price);
    if (m <= 0 || a <= 0 || price.trim().length === 0) return;
    const nextMeter = Math.round(p / a);
    if (nextMeter !== m) {
      setMeterPrice(normalizeNumericInput(String(Math.max(0, nextMeter))));
    }
  }, [price, area, meterPrice, isAreaMeterAnnualSyncCategory]);

  const areaNumber = toNumber(area);
  const priceNumber = toNumber(price);
  const monthlyRentNumber = toNumber(monthlyRentAmount);
  const quarterlyRentNumber = toNumber(quarterlyRentAmount);
  const semiAnnualRentNumber = toNumber(semiAnnualRentAmount);
  const shouldShowRentInstallments =
    isRentCategory &&
    rentRule?.hasInstallments === true &&
    (hasAnnualAmountFieldForRent ? price.trim().length > 0 : false);
  const hasValidationRule = hasCategoryValidationRule || isRentCategory;
  const effectiveAreaMin = hasCategoryValidationRule ? saleRule?.areaMin : rentRule?.areaMin;
  const effectivePriceMin = hasCategoryValidationRule ? saleRule?.priceMin : rentRule?.annualMin;

  const areaRequiredError = submitAttempted && hasValidationRule && area.trim().length === 0;
  const areaMinError =
    submitAttempted &&
    hasValidationRule &&
    effectiveAreaMin !== undefined &&
    area.trim().length > 0 &&
    areaNumber <= effectiveAreaMin;

  const priceRequiredError =
    submitAttempted &&
    hasValidationRule &&
    (hasCategoryValidationRule || hasAnnualAmountFieldForRent) &&
    price.trim().length === 0;
  const priceMinError =
    submitAttempted &&
    hasValidationRule &&
    effectivePriceMin !== undefined &&
    (hasCategoryValidationRule || hasAnnualAmountFieldForRent) &&
    price.trim().length > 0 &&
    priceNumber <= effectivePriceMin;

  const landMeterPriceTooManyDigits =
    hasCategoryValidationRule &&
    selectedCategory === "sale-2" &&
    price.replace(/[^\d]/g, "").length > 10;

  const areaMaxInvalid =
    maxRuleForCeiling?.areaMax !== undefined &&
    area.trim().length > 0 &&
    areaNumber >= maxRuleForCeiling.areaMax;

  const priceMaxInvalid =
    effectivePriceMaxExclusive !== undefined &&
    price.trim().length > 0 &&
    priceNumber >= effectivePriceMaxExclusive &&
    (hasCategoryValidationRule || (isRentCategory && hasAnnualAmountFieldForRent));

  const installmentAnnualCheckActive =
    isRentCategory &&
    rentRule?.hasInstallments === true &&
    hasAnnualAmountFieldForRent &&
    price.trim().length > 0 &&
    priceNumber > 0;

  const monthlyInstallmentBelowAnnualInvalid =
    installmentAnnualCheckActive &&
    acceptMonthlyPayment &&
    monthlyRentAmount.trim().length > 0 &&
    monthlyRentNumber * 12 < priceNumber;

  const quarterlyInstallmentBelowAnnualInvalid =
    installmentAnnualCheckActive &&
    acceptQuarterlyPayment &&
    quarterlyRentAmount.trim().length > 0 &&
    quarterlyRentNumber * 4 < priceNumber;

  const semiAnnualInstallmentBelowAnnualInvalid =
    installmentAnnualCheckActive &&
    acceptSemiAnnualPayment &&
    semiAnnualRentAmount.trim().length > 0 &&
    semiAnnualRentNumber * 2 < priceNumber;

  const installmentBelowAnnualInvalid =
    monthlyInstallmentBelowAnnualInvalid ||
    quarterlyInstallmentBelowAnnualInvalid ||
    semiAnnualInstallmentBelowAnnualInvalid;

  const areaMaxError = areaMaxInvalid;
  const priceMaxError = priceMaxInvalid;

  const commissionInvalid =
    hasCommission && (commissionValue.trim().length === 0 || parseCommissionNumber() <= 0);
  const commissionRequiredError = submitAttempted && commissionInvalid;
  const meterPriceRequiredError =
    submitAttempted &&
    hasMeterPriceField &&
    meterPrice.trim().length === 0;
  const monthlyPaymentRequiredError =
    submitAttempted &&
    isRentCategory &&
    acceptMonthlyPayment &&
    monthlyRentAmount.trim().length === 0;
  const quarterlyPaymentRequiredError =
    submitAttempted &&
    isRentCategory &&
    acceptQuarterlyPayment &&
    quarterlyRentAmount.trim().length === 0;
  const semiAnnualPaymentRequiredError =
    submitAttempted &&
    isRentCategory &&
    acceptSemiAnnualPayment &&
    semiAnnualRentAmount.trim().length === 0;
  const monthlyAnnualTotal = acceptMonthlyPayment && monthlyRentAmount.trim().length > 0
    ? monthlyRentNumber * 12
    : null;
  const quarterlyAnnualTotal = acceptQuarterlyPayment && quarterlyRentAmount.trim().length > 0
    ? quarterlyRentNumber * 4
    : null;
  const semiAnnualTotal = acceptSemiAnnualPayment && semiAnnualRentAmount.trim().length > 0
    ? semiAnnualRentNumber * 2
    : null;

  const formatAnnualTotal = (value: number | null): string => {
    if (value === null) return "---";
    const loc = i18n.language?.startsWith("ar") ? "ar-SA" : "en-US";
    return value.toLocaleString(loc);
  };

  const showTermsError = !agreedToTerms;

  // Raw validation (independent of submitAttempted) to prevent accidental navigation.
  const areaRequiredInvalid = hasValidationRule && area.trim().length === 0;
  const areaMinInvalid =
    hasValidationRule &&
    effectiveAreaMin !== undefined &&
    area.trim().length > 0 &&
    areaNumber <= effectiveAreaMin;
  const priceRequiredInvalid =
    hasValidationRule &&
    (hasCategoryValidationRule || hasAnnualAmountFieldForRent) &&
    price.trim().length === 0;
  const priceMinInvalid =
    hasValidationRule &&
    effectivePriceMin !== undefined &&
    (hasCategoryValidationRule || hasAnnualAmountFieldForRent) &&
    price.trim().length > 0 &&
    priceNumber <= effectivePriceMin;
  const meterPriceRequiredInvalid = hasMeterPriceField && meterPrice.trim().length === 0;
  const monthlyPaymentRequiredInvalid =
    isRentCategory && acceptMonthlyPayment && monthlyRentAmount.trim().length === 0;
  const quarterlyPaymentRequiredInvalid =
    isRentCategory && acceptQuarterlyPayment && quarterlyRentAmount.trim().length === 0;
  const semiAnnualPaymentRequiredInvalid =
    isRentCategory && acceptSemiAnnualPayment && semiAnnualRentAmount.trim().length === 0;
  const commissionRequiredInvalid = commissionInvalid;
  const termsNotAgreedInvalid = !agreedToTerms;

  const hasSaleCategoryValidationErrors =
    areaRequiredError ||
    areaMinError ||
    areaMaxError ||
    priceRequiredError ||
    priceMinError ||
    priceMaxError ||
    meterPriceRequiredError ||
    monthlyPaymentRequiredError ||
    quarterlyPaymentRequiredError ||
    semiAnnualPaymentRequiredError ||
    commissionRequiredError ||
    showTermsError ||
    installmentBelowAnnualInvalid;

  const categoryCeilingInvalid =
    areaMaxInvalid || priceMaxInvalid || landMeterPriceTooManyDigits;

  const coreBlockingInvalid =
    hasValidationRule &&
    (areaRequiredInvalid ||
      areaMinInvalid ||
      priceRequiredInvalid ||
      priceMinInvalid ||
      meterPriceRequiredInvalid ||
      monthlyPaymentRequiredInvalid ||
      quarterlyPaymentRequiredInvalid ||
      semiAnnualPaymentRequiredInvalid ||
      installmentBelowAnnualInvalid ||
      commissionRequiredInvalid ||
      termsNotAgreedInvalid);

  /** Next stays enabled until the user taps it; only then stay disabled while validation still fails. */
  const hasAnyBlockingInvalid =
    (hasValidationRule && coreBlockingInvalid) ||
    (!hasValidationRule && (!agreedToTerms || commissionRequiredInvalid)) ||
    Boolean(categoryCeilingInvalid);

  const nextDisabled = submitAttempted && hasAnyBlockingInvalid;

  /** Property information on publish: meter / farm total only (no rent installments or commission rows). */
  const pricingDetailsForPublish = useMemo((): PropertyDetailsDisplayItem[] => {
    const loc = i18n.language?.startsWith("ar") ? "ar-SA" : "en-US";
    const items: PropertyDetailsDisplayItem[] = [];

    const moneyLabel = (raw: string): string | null => {
      const n = normalizeNumericInput(raw);
      if (!n || Number(n) <= 0) return null;
      return `${Number(n).toLocaleString(loc)} ${t("listings.sar")}`;
    };

    if (isMeterPriceCategory) {
      const m = moneyLabel(price);
      if (m) items.push({ type: "value", label: t("listings.pricePerMeter"), value: m });
    } else if (hasMeterPriceField && meterPrice.trim()) {
      const m = moneyLabel(meterPrice);
      if (m) items.push({ type: "value", label: t("listings.pricePerMeter"), value: m });
    }

    return items;
  }, [hasMeterPriceField, i18n.language, isMeterPriceCategory, meterPrice, price, t]);

  const handleNextPress = () => {
    setSubmitAttempted(true);
    const hasBlockingErrorsForRules =
      areaRequiredInvalid ||
      areaMinInvalid ||
      priceRequiredInvalid ||
      priceMinInvalid ||
      meterPriceRequiredInvalid ||
      monthlyPaymentRequiredInvalid ||
      quarterlyPaymentRequiredInvalid ||
      semiAnnualPaymentRequiredInvalid ||
      commissionRequiredInvalid ||
      termsNotAgreedInvalid ||
      areaMaxInvalid ||
      priceMaxInvalid ||
      landMeterPriceTooManyDigits ||
      installmentBelowAnnualInvalid;

    if (hasValidationRule && hasBlockingErrorsForRules) {
      return;
    }
    if (!hasValidationRule && (!agreedToTerms || commissionRequiredInvalid)) {
      setSubmitAttempted(true);
      return;
    }
    if (!agreedToTerms) {
      return;
    }
    navigation.navigate("MarketingRequestPublishAd", {
      selectedCategory,
      attachments: params.attachments ?? [],
      selectedLocation: params.selectedLocation,
      locationDisplayName: params.locationDisplayName,
      ...((params as any)?.deed ? { deed: (params as any).deed } : {}),
      propertyDetailsItems: params.propertyDetailsItems ?? [],
      pricingDetailsItems: pricingDetailsForPublish,
      area: normalizeNumericInput(area),
      price: normalizeNumericInput(price),
      description,
      hasCommission,
      commissionType,
      commissionValue: normalizeCommissionForNavigate(),
      meterPrice: normalizeNumericInput(meterPrice),
      rentPaymentOptions:
        isRentCategory && priceNumber > 0
          ? {
              annualSar: priceNumber,
              ...(rentRule?.hasInstallments === true
                ? {
                    acceptMonthly: acceptMonthlyPayment,
                    monthlyInstallmentSar:
                      acceptMonthlyPayment && monthlyRentAmount.trim().length > 0
                        ? monthlyRentNumber
                        : undefined,
                    acceptQuarterly: acceptQuarterlyPayment,
                    quarterlyInstallmentSar:
                      acceptQuarterlyPayment && quarterlyRentAmount.trim().length > 0
                        ? quarterlyRentNumber
                        : undefined,
                    acceptSemiAnnual: acceptSemiAnnualPayment,
                    semiAnnualInstallmentSar:
                      acceptSemiAnnualPayment && semiAnnualRentAmount.trim().length > 0
                        ? semiAnnualRentNumber
                        : undefined,
                  }
                : {}),
            }
          : undefined,
    });
  };

  const handleClosePress = () => setShowCancelModal(true);
  const handleCancelBack = () => setShowCancelModal(false);
  const handleCancelYes = () => {
    setShowCancelModal(false);
    navigateToMapScreen(navigation);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.propertyDetails")}
        onBackPress={() => navigation.goBack()}
        showRightSide
        rightComponent={
          <TouchableOpacity onPress={handleClosePress} style={styles.closeButton}>
            <Ionicons name="close" size={wp(6)} color={COLORS.primary} />
          </TouchableOpacity>
        }
        titleFontWeight="700"
        fontSize={wp(5)}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.fieldRow, rtlStyles.fieldRow]}>
          <Text style={[styles.label, rtlStyles.labelText]}>{t("listings.area")}</Text>
          <View style={[styles.inputBlock, isRTL && styles.inputBlockRTL]}>
            <View
              style={[
                styles.inputWithSuffix,
                rtlStyles.inputSuffixRow,
                (areaRequiredError || areaMinError || areaMaxError) && styles.inputWithSuffixError,
                areaFocused && styles.inputWithSuffixFocused,
              ]}
            >
              <TextInput
                value={area}
                onChangeText={(text) => setArea(normalizeNumericInput(text))}
                placeholder={t("listings.enterHere")}
                style={[styles.input, isRTL && styles.inputRTL]}
                keyboardType="number-pad"
                placeholderTextColor={COLORS.textTertiary}
                onFocus={() => setAreaFocused(true)}
                onBlur={() => setAreaFocused(false)}
              />
              <Text style={styles.suffixText}>({t("listings.m2")})</Text>
            </View>
            {areaRequiredError ? (
              <Text style={[styles.inputErrorText, rtlStyles.errorAndHelperText]}>
                {t("listings.pleaseEnterArea")}
              </Text>
            ) : null}
            {areaMinError && effectiveAreaMin !== undefined ? (
              <Text style={[styles.inputErrorText, rtlStyles.errorAndHelperText]}>
                {t("listings.mustBeGreaterThan")} {formatValidationNumber(effectiveAreaMin)}
              </Text>
            ) : null}
            {areaMaxError && maxRuleForCeiling?.areaMax !== undefined ? (
              <Text style={[styles.inputErrorText, rtlStyles.errorAndHelperText]}>
                {t("listings.mustBeLessThan")} {formatValidationNumber(maxRuleForCeiling.areaMax)}
              </Text>
            ) : null}
          </View>
        </View>

        {(hasCategoryValidationRule || hasAnnualAmountFieldForRent) ? (
          <View style={[styles.fieldRow, rtlStyles.fieldRow]}>
            <Text style={[styles.label, rtlStyles.labelText]}>
              {isRentCategory
                ? t("listings.annualRentAmount")
                : isMeterPriceCategory
                ? t("listings.meterPrice")
                : t("listings.price")}
            </Text>
            <View style={[styles.inputBlock, isRTL && styles.inputBlockRTL]}>
              <View
                style={[
                  styles.inputWithSuffix,
                  rtlStyles.inputSuffixRow,
                  (priceRequiredError || priceMinError || priceMaxError) && styles.inputWithSuffixError,
                  priceFocused && styles.inputWithSuffixFocused,
                ]}
              >
                <TextInput
                  value={price}
                  onChangeText={(text) => setPrice(normalizeNumericInput(text))}
                  placeholder={t("listings.enterHere")}
                  style={[styles.input, isRTL && styles.inputRTL]}
                  keyboardType="number-pad"
                  placeholderTextColor={COLORS.textTertiary}
                  onFocus={() => setPriceFocused(true)}
                  onBlur={() => setPriceFocused(false)}
                />
                <Text style={styles.suffixText}>{t("listings.sar")}</Text>
              </View>
              {priceRequiredError ? (
                <Text style={[styles.inputErrorText, rtlStyles.errorAndHelperText]}>
                  {isMeterPriceCategory
                    ? t("listings.pleaseEnterMeterPrice")
                    : isRentCategory
                    ? t("listings.pleaseEnterAnnualRentAmount")
                    : t("listings.pleaseEnterPrice")}
                </Text>
              ) : null}
              {priceMinError && effectivePriceMin !== undefined ? (
                <Text style={[styles.inputErrorText, rtlStyles.errorAndHelperText]}>
                  {t("listings.mustBeGreaterThan")} {formatValidationNumber(effectivePriceMin)}
                </Text>
              ) : null}
              {priceMaxError && effectivePriceMaxExclusive !== undefined ? (
                <Text style={[styles.inputErrorText, rtlStyles.errorAndHelperText]}>
                  {t("listings.mustBeLessThan")} {formatValidationNumber(effectivePriceMaxExclusive)}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {hasMeterPriceField ? (
          <View style={[styles.fieldRow, rtlStyles.fieldRow]}>
            <Text style={[styles.label, rtlStyles.labelText]}>{t("listings.meterPrice")}</Text>
            <View style={[styles.inputBlock, isRTL && styles.inputBlockRTL]}>
              <View
                style={[
                  styles.inputWithSuffix,
                  rtlStyles.inputSuffixRow,
                  meterPriceRequiredError && styles.inputWithSuffixError,
                  meterPriceFocused && styles.inputWithSuffixFocused,
                ]}
              >
                <TextInput
                  value={meterPrice}
                  onChangeText={(text) => setMeterPrice(normalizeNumericInput(text))}
                  placeholder={t("listings.enterHere")}
                  style={[styles.input, isRTL && styles.inputRTL]}
                  keyboardType="number-pad"
                  placeholderTextColor={COLORS.textTertiary}
                  onFocus={() => setMeterPriceFocused(true)}
                  onBlur={() => setMeterPriceFocused(false)}
                />
                <Text style={styles.suffixText}>{t("listings.sar")}</Text>
              </View>
              {meterPriceRequiredError ? (
                <Text style={[styles.inputErrorText, rtlStyles.errorAndHelperText]}>
                  {t("listings.pleaseEnterMeterPrice")}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {shouldShowRentInstallments ? (
          <View style={styles.rentInstallmentsContainer}>
            <View style={[styles.toggleRow, isRTL && styles.rowReverse]}>
              <Text
                style={[styles.toggleLabel, styles.paymentToggleLabel, rtlStyles.labelText]}
              >
                {t("listings.acceptMonthlyPayment")}
              </Text>
              <ToggleSwitch
                value={acceptMonthlyPayment}
                onValueChange={setAcceptMonthlyPayment}
                thumbSize={wp(5.5)}
                trackWidth={wp(9)}
                trackHeight={hp(1.5)}
              />
            </View>
            <View
              style={[
                styles.rentInstallmentInputWithSuffix,
                rtlStyles.inputSuffixRow,
                !acceptMonthlyPayment && styles.disabledInputWithSuffix,
                monthlyRentFocused && styles.inputWithSuffixFocused,
              ]}
            >
              <TextInput
                value={monthlyRentAmount}
                onChangeText={(text) => setMonthlyRentAmount(normalizeNumericInput(text))}
                placeholder={t("listings.enterHere")}
                style={[styles.input, isRTL && styles.inputRTL]}
                keyboardType="number-pad"
                placeholderTextColor={COLORS.textTertiary}
                onFocus={() => setMonthlyRentFocused(true)}
                onBlur={() => setMonthlyRentFocused(false)}
                editable={acceptMonthlyPayment}
              />
              <Text style={styles.suffixText}>{t("listings.sar")}</Text>
            </View>
            {monthlyPaymentRequiredError ? (
              <Text style={[styles.inputErrorText, rtlStyles.errorAndHelperText]}>
                {t("listings.fillRentOrCloseOption")}
              </Text>
            ) : null}
            {monthlyInstallmentBelowAnnualInvalid ? (
              <Text
                style={[
                  styles.inputErrorText,
                  styles.installmentAnnualErrorText,
                  rtlStyles.errorAndHelperText,
                ]}
              >
                {t("listings.installmentAnnualMustMeetAnnualRent")}
              </Text>
            ) : null}
            <Text
              style={[
                styles.rentSummaryText,
                rtlStyles.errorAndHelperText,
                monthlyPaymentRequiredError && styles.rentSummaryTextWithError,
              ]}
            >
              {t("listings.totalAnnualRent")}:{" "}
              <Text style={styles.rentSummaryValue}>
                {formatAnnualTotal(monthlyAnnualTotal) === "---"
                  ? "---"
                  : `${formatAnnualTotal(monthlyAnnualTotal)} ${t("listings.sar")}`}
              </Text>
            </Text>

            <View style={[styles.toggleRow, isRTL && styles.rowReverse]}>
              <Text
                style={[styles.toggleLabel, styles.paymentToggleLabel, rtlStyles.labelText]}
              >
                {t("listings.acceptQuarterlyPayment")}
              </Text>
              <ToggleSwitch
                value={acceptQuarterlyPayment}
                onValueChange={setAcceptQuarterlyPayment}
                thumbSize={wp(5.5)}
                trackWidth={wp(9)}
                trackHeight={hp(1.5)}
              />
            </View>
            <View
              style={[
                styles.rentInstallmentInputWithSuffix,
                rtlStyles.inputSuffixRow,
                !acceptQuarterlyPayment && styles.disabledInputWithSuffix,
                quarterlyRentFocused && styles.inputWithSuffixFocused,
              ]}
            >
              <TextInput
                value={quarterlyRentAmount}
                onChangeText={(text) => setQuarterlyRentAmount(normalizeNumericInput(text))}
                placeholder={t("listings.enterHere")}
                style={[styles.input, isRTL && styles.inputRTL]}
                keyboardType="number-pad"
                placeholderTextColor={COLORS.textTertiary}
                onFocus={() => setQuarterlyRentFocused(true)}
                onBlur={() => setQuarterlyRentFocused(false)}
                editable={acceptQuarterlyPayment}
              />
              <Text style={styles.suffixText}>{t("listings.sar")}</Text>
            </View>
            {quarterlyPaymentRequiredError ? (
              <Text style={[styles.inputErrorText, rtlStyles.errorAndHelperText]}>
                {t("listings.fillRentOrCloseOption")}
              </Text>
            ) : null}
            {quarterlyInstallmentBelowAnnualInvalid ? (
              <Text
                style={[
                  styles.inputErrorText,
                  styles.installmentAnnualErrorText,
                  rtlStyles.errorAndHelperText,
                ]}
              >
                {t("listings.installmentAnnualMustMeetAnnualRent")}
              </Text>
            ) : null}
            <Text
              style={[
                styles.rentSummaryText,
                rtlStyles.errorAndHelperText,
                quarterlyPaymentRequiredError && styles.rentSummaryTextWithError,
              ]}
            >
              {t("listings.totalAnnualRent")}:{" "}
              <Text style={styles.rentSummaryValue}>
                {formatAnnualTotal(quarterlyAnnualTotal) === "---"
                  ? "---"
                  : `${formatAnnualTotal(quarterlyAnnualTotal)} ${t("listings.sar")}`}
              </Text>
            </Text>

            <View style={[styles.toggleRow, isRTL && styles.rowReverse]}>
              <Text
                style={[styles.toggleLabel, styles.paymentToggleLabel, rtlStyles.labelText]}
              >
                {t("listings.acceptSemiAnnualPayment")}
              </Text>
              <ToggleSwitch
                value={acceptSemiAnnualPayment}
                onValueChange={setAcceptSemiAnnualPayment}
                thumbSize={wp(5.5)}
                trackWidth={wp(9)}
                trackHeight={hp(1.5)}
              />
            </View>
            <View
              style={[
                styles.rentInstallmentInputWithSuffix,
                rtlStyles.inputSuffixRow,
                !acceptSemiAnnualPayment && styles.disabledInputWithSuffix,
                semiAnnualRentFocused && styles.inputWithSuffixFocused,
              ]}
            >
              <TextInput
                value={semiAnnualRentAmount}
                onChangeText={(text) => setSemiAnnualRentAmount(normalizeNumericInput(text))}
                placeholder={t("listings.enterHere")}
                style={[styles.input, isRTL && styles.inputRTL]}
                keyboardType="number-pad"
                placeholderTextColor={COLORS.textTertiary}
                onFocus={() => setSemiAnnualRentFocused(true)}
                onBlur={() => setSemiAnnualRentFocused(false)}
                editable={acceptSemiAnnualPayment}
              />
              <Text style={styles.suffixText}>{t("listings.sar")}</Text>
            </View>
            {semiAnnualPaymentRequiredError ? (
              <Text style={[styles.inputErrorText, rtlStyles.errorAndHelperText]}>
                {t("listings.fillRentOrCloseOption")}
              </Text>
            ) : null}
            {semiAnnualInstallmentBelowAnnualInvalid ? (
              <Text
                style={[
                  styles.inputErrorText,
                  styles.installmentAnnualErrorText,
                  rtlStyles.errorAndHelperText,
                ]}
              >
                {t("listings.installmentAnnualMustMeetAnnualRent")}
              </Text>
            ) : null}
            <Text
              style={[
                styles.rentSummaryText,
                rtlStyles.errorAndHelperText,
                semiAnnualPaymentRequiredError && styles.rentSummaryTextWithError,
              ]}
            >
              {t("listings.totalAnnualRent")}:{" "}
              <Text style={styles.rentSummaryValue}>
                {formatAnnualTotal(semiAnnualTotal) === "---"
                  ? "---"
                  : `${formatAnnualTotal(semiAnnualTotal)} ${t("listings.sar")}`}
              </Text>
            </Text>
          </View>
        ) : null}

        <View style={[styles.toggleRow, isRTL && styles.rowReverse]}>
          <Text style={[styles.toggleLabel, rtlStyles.labelText]}>
            {t("listings.isThereCommission")}
          </Text>
          <ToggleSwitch value={hasCommission} onValueChange={setHasCommission} thumbSize={wp(5.5)} trackWidth={wp(9)} trackHeight={hp(1.5)} />
        </View>

        {hasCommission ? (
          <View style={styles.commissionSection}>
            <SegmentedControl
              variant="large"
              options={commissionOptions}
              selectedIndex={commissionType === "percentage" ? 0 : 1}
              onSelect={(index) => setCommissionType(index === 0 ? "percentage" : "fixed")}
              segmentHeight={hp(5)}
            />

            <Text style={[styles.label, rtlStyles.labelText]}>
              {commissionType === "percentage"
                ? t("listings.commissionPercentage")
                : t("listings.commissionAmount")}
            </Text>
            <View
              style={[
                styles.inputWithSuffixFull,
                rtlStyles.inputSuffixRow,
                commissionRequiredError && styles.inputWithSuffixError,
                commissionFocused && styles.inputWithSuffixFocused,
              ]}
            >
              <TextInput
                value={commissionValue}
                onChangeText={(text) =>
                  setCommissionValue(
                    commissionType === "percentage"
                      ? normalizeCommissionPercentageInput(text)
                      : normalizeNumericInput(text)
                  )
                }
                placeholder={
                  commissionType === "percentage"
                    ? t("listings.commissionPercentage")
                    : t("listings.commissionAmount")
                }
                style={[styles.input, isRTL && styles.inputRTL]}
                keyboardType={commissionType === "percentage" ? "decimal-pad" : "number-pad"}
                placeholderTextColor={COLORS.textTertiary}
                onFocus={() => setCommissionFocused(true)}
                onBlur={() => setCommissionFocused(false)}
              />
              <Text style={styles.suffixText}>
                {commissionType === "percentage" ? "%" : t("listings.riyals")}
              </Text>
            </View>
            {commissionRequiredError ? (
              <Text style={[styles.errorText, rtlStyles.errorAndHelperText]}>
                {commissionType === "percentage"
                  ? t("listings.pleaseEnterCommissionPercentage")
                  : t("listings.pleaseEnterCommissionValue")}
              </Text>
            ) : null}
          </View>
        ) : null}

        <Text style={[styles.descriptionLabel, rtlStyles.labelText]}>
          {t("listings.description")}
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t("listings.propertyAdditionalDetailsPlaceholder")}
          placeholderTextColor={COLORS.textTertiary}
          multiline
          textAlignVertical="top"
          style={[
            styles.descriptionInput,
            descriptionFocused && styles.inputWithSuffixFocused,
            isRTL && styles.inputRTL,
            isRTL && rtlStyles.labelText,
          ]}
          onFocus={() => setDescriptionFocused(true)}
          onBlur={() => setDescriptionFocused(false)}
        />

        <TouchableOpacity
          style={[styles.checkboxRow, isRTL && styles.rowReverse]}
          activeOpacity={0.9}
          onPress={() => setAgreedToTerms((v) => !v)}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms ? <Ionicons name="checkmark" size={wp(4.2)} color="#fff" /> : null}
          </View>
          <Text style={[styles.checkboxText, rtlStyles.errorAndHelperText]}>
            {t("listings.agreeTo")}{" "}
            <Text style={styles.linkText}>{t("listings.termsOfUse")}</Text>{" "}
            {t("listings.andPay")}{" "}
            <Text style={styles.linkText}>{t("listings.advertisingFee")}</Text>
          </Text>
        </TouchableOpacity>

        {showTermsError ? (
          <Text style={[styles.errorText, rtlStyles.errorAndHelperText]}>
            {t("listings.thisFieldRequired")}
          </Text>
        ) : null}
      </ScrollView>

      <ListingFooter
        currentStep={5}
        totalSteps={5}
        onBackPress={() => navigation.goBack()}
        onNextPress={handleNextPress}
        nextDisabled={nextDisabled}
        backText={t("common.back")}
        nextText={t("common.next")}
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
    backgroundColor: COLORS.background,
  },
  closeButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(3),
    paddingTop: hp(1.5),
    paddingBottom: hp(1),
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: hp(1.6),
    gap: wp(3),
  },
  inputBlock: {
    flex: 1,
    maxWidth: wp(50),
  },
  inputBlockRTL: {
    alignItems: "flex-end",
  },
  label: {
    fontSize: wp(4.5),
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  inputWithSuffix: {
    width: "100%",
    height: hp(5),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: wp(2),
  },
  inputErrorText: {
    marginTop: hp(0.6),
    color: COLORS.error,
    fontSize: wp(4),
  },
  installmentAnnualErrorText: {
    marginBottom: hp(1.2),
  },
  inputWithSuffixFull: {
    height: hp(5),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: wp(2),
    marginTop: hp(0.8),
    marginBottom: hp(1),
  },
  inputWithSuffixError: {
    borderColor: COLORS.error,
  },
  inputWithSuffixFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.activeChipBackground,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: wp(4),
    color: COLORS.textPrimary,
  },
  inputRTL: {
    textAlign: "right",
  },
  suffixText: {
    fontSize: wp(4),
    color: COLORS.primary,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(1.6),
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  toggleLabel: {
    fontSize: wp(4.5),
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  paymentToggleLabel: {
    flex: 1,
    fontSize: wp(4.3),
  },
  commissionSection: {
    marginBottom: hp(1.2),
  },
  rentInstallmentsContainer: {
    marginBottom: hp(1),
  },
  rentInstallmentInputWithSuffix: {
    height: hp(5),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: wp(2),
    marginTop: hp(0.1),
    marginBottom: hp(0.8),
  },
  disabledInputWithSuffix: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    opacity: 0.55,
  },
  rentSummaryText: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    marginBottom: hp(1.2),
  },
  rentSummaryTextWithError: {
    marginTop: hp(0.6),
  },
  rentSummaryValue: {
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  descriptionLabel: {
    fontSize: wp(4.5),
    color: COLORS.textPrimary,
    fontWeight: "500",
    marginTop: hp(0.5),
    marginBottom: hp(1),
  },
  descriptionInput: {
    minHeight: hp(28),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(4),
    paddingTop: hp(1.2),
    fontSize: wp(3.8),
    color: COLORS.textPrimary,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: hp(2),
    gap: wp(4),
  },
  checkbox: {
    width: wp(5),
    height: wp(5),
    borderRadius: wp(1.2),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp(0.2),
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: wp(4),
    color: COLORS.textPrimary,
    lineHeight: hp(2.6),
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  errorText: {
    marginTop: hp(0.6),
    color: COLORS.error,
    fontSize: wp(4.2),
  },
  spacer: {
    height: hp(2),
  },
});

