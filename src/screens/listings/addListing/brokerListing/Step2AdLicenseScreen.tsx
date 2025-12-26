import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader, ListingFooter, CancelModal, ToggleSwitch, WheelPickerModal } from "../../../../components";
import { navigateToMapScreen } from "../../../../utils";
import { COLORS } from "@/constants";

type NavigationProp = NativeStackNavigationProp<any>;

export default function Step2AdLicenseScreen(): React.JSX.Element {
    const navigation = useNavigation<NavigationProp>();
    const [brokerageContract, setBrokerageContract] = useState("");
    const [deedNumber, setDeedNumber] = useState("");
    const [propertyPrice, setPropertyPrice] = useState("");
    const [adType, setAdType] = useState<string | null>(null);
    const [isAgent, setIsAgent] = useState(false);
    const [attorneyNumber, setAttorneyNumber] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const [brokerageFocused, setBrokerageFocused] = useState(false);
    const [deedFocused, setDeedFocused] = useState(false);
    const [priceFocused, setPriceFocused] = useState(false);
    const [attorneyFocused, setAttorneyFocused] = useState(false);
    const [showAdTypeModal, setShowAdTypeModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Validations
    const isValidBrokerage = /^(61|62)\d{8}$/.test(brokerageContract.trim());
    const isValidDeed = /^\d{12}$|^\d{16}$/.test(deedNumber.trim());
    const isValidPrice = propertyPrice.trim().length > 0;
    const isValidAttorney = !isAgent || attorneyNumber.trim().length > 0;

    // Check if all required fields are filled
    const canProceed = isValidBrokerage && 
                       isValidDeed && 
                       isValidPrice && 
                       adType !== null && 
                       isValidAttorney && 
                       agreedToTerms;

    const handleBackPress = () => {
        navigation.goBack();
    };
    const handleClosePress = () => {
        setShowCancelModal(true);
    };
    const handleCancelBack = () => {
        setShowCancelModal(false);
    };
    const handleCancelYes = () => {
        setShowCancelModal(false);
        navigateToMapScreen(navigation);
    };
    const handleNextPress = () => {
        if (!canProceed) return;
        console.log("Next step");
        // Navigate to next step in listing process
    };
    const handleFooterBackPress = () => {
        setShowCancelModal(true);
    };
    const handleAdTypeSelect = (value: string) => {
        setAdType(value);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={{ flex: 1 }}>
                    <ScreenHeader
                        title="Issuing an ad license"
                        onBackPress={handleBackPress}
                        showRightSide={true}
                        rightComponent={
                            <TouchableOpacity
                                onPress={handleClosePress}
                                activeOpacity={0.7}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={wp(6)} color="#0e856a" />
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
                        <View style={styles.contentContainer}>
                            {/* 1. Brokerage contract number */}
                            <Text style={styles.sectionTitle}>Brokerage contract number</Text>
                            <TextInput
                                style={[styles.textInput, brokerageFocused && styles.textInputFocused]}
                                value={brokerageContract}
                                onChangeText={setBrokerageContract}
                                keyboardType="number-pad"
                                placeholder="Enter here..."
                                maxLength={10}
                                onFocus={() => setBrokerageFocused(true)}
                                onBlur={() => setBrokerageFocused(false)}
                            />
                            {brokerageContract.length > 0 && !isValidBrokerage && (
                                <Text style={styles.errorText}>
                                    Brokerage contract number must be 10 digits starting with 61 or 62
                                </Text>
                            )}

                            {/* 2. Deed number */}
                            <Text style={styles.sectionTitle}>Deed number</Text>
                            <TextInput
                                style={[styles.textInput, deedFocused && styles.textInputFocused]}
                                value={deedNumber}
                                onChangeText={setDeedNumber}
                                keyboardType="number-pad"
                                placeholder="Enter here..."
                                maxLength={16}
                                onFocus={() => setDeedFocused(true)}
                                onBlur={() => setDeedFocused(false)}
                            />
                            {deedNumber.length > 0 && !isValidDeed && (
                                <Text style={styles.errorText}>
                                    Deed number must be either 12 or 16 digits
                                </Text>
                            )}

                            {/* 3. Property price */}
                            <Text style={styles.sectionTitle}>Property price</Text>
                            <View style={[styles.priceInputContainer, priceFocused && styles.priceInputContainerFocused]}>
                                <TextInput
                                    style={styles.priceInput}
                                    value={propertyPrice}
                                    onChangeText={setPropertyPrice}
                                    keyboardType="number-pad"
                                    placeholder="Enter here..."
                                    onFocus={() => setPriceFocused(true)}
                                    onBlur={() => setPriceFocused(false)}
                                />
                                <Text style={styles.sarText}>SAR</Text>
                            </View>

                            {/* 4. Ad Type */}
                            <Text style={styles.sectionTitle}>Ad Type</Text>
                            <TouchableOpacity
                                style={[styles.selectField, adType && styles.selectFieldActive]}
                                onPress={() => setShowAdTypeModal(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.selectFieldText, adType && styles.selectFieldTextActive]}>
                                    {adType || "Please make a selection..."}
                                </Text>
                                <Ionicons 
                                    name="chevron-down" 
                                    size={wp(5)} 
                                    color={COLORS.primary } 
                                />
                            </TouchableOpacity>

                            {/* 5. Are you an agent? Toggle */}
                            <View style={styles.toggleRow}>
                                <Text style={styles.toggleLabel}>Are you an agent?</Text>
                                <ToggleSwitch
                                    value={isAgent}
                                    onValueChange={setIsAgent}
                                />
                            </View>

                            {/* Attorney number - Only show when toggle is ON */}
                            {isAgent && (
                                <View style={styles.attorneyContainer}>
                                    <Text style={styles.sectionTitle}>Attorney number</Text>
                                    <TextInput
                                        style={[styles.textInput, attorneyFocused && styles.textInputFocused]}
                                        value={attorneyNumber}
                                        onChangeText={setAttorneyNumber}
                                        keyboardType="number-pad"
                                        placeholder="Enter here..."
                                        onFocus={() => setAttorneyFocused(true)}
                                        onBlur={() => setAttorneyFocused(false)}
                                    />
                                </View>
                            )}

                            {/* 6. Checkbox Agreement */}
                            <TouchableOpacity
                                style={styles.checkboxRow}
                                onPress={() => setAgreedToTerms(!agreedToTerms)}
                                activeOpacity={1}
                            >
                                <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                                    {agreedToTerms && (
                                        <Ionicons name="checkmark" size={wp(4.5)} color={COLORS.white} />
                                    )}
                                </View>
                                <Text style={styles.checkboxText}>
                                    I agree to use this license only on Aqar platform, and if it is found to be used on another platform, Aqar platform has the right to delete the ad.
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>

            <ListingFooter
                currentStep={2}
                totalSteps={6}
                onBackPress={handleFooterBackPress}
                onNextPress={handleNextPress}
                nextDisabled={!canProceed}
            />

            <CancelModal
                visible={showCancelModal}
                onBack={handleCancelBack}
                onConfirm={handleCancelYes}
            />

            {/* Ad Type Modal */}
            <WheelPickerModal
                visible={showAdTypeModal}
                onClose={() => setShowAdTypeModal(false)}
                onSelect={handleAdTypeSelect}
                title="Ad Type"
                options={["Sale", "Rent"]}
                initialValue={adType || undefined}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: wp(4),
    },
    sectionTitle: {
        fontSize: wp(4),
        fontWeight: "500",
        color: COLORS.textPrimary,
        marginBottom: hp(1.5),
        // marginTop: hp(2),
    },
    textInput: {
        height: hp(5),
        backgroundColor: COLORS.white,
        borderRadius: wp(2),
        borderWidth: 1.2,
        borderColor: "#ccc",
        paddingHorizontal: wp(4),
        fontSize: wp(4),
        color: COLORS.textPrimary,
        marginBottom: hp(2),
    },
    textInputFocused: {
        backgroundColor: '#e6fff6',
        borderColor: COLORS.primary,
        borderWidth: 1.5,
    },
    errorText: {
        color: COLORS.error,
        marginTop: hp(1),
        fontSize: wp(3.5),
        marginBottom: hp(0.5),
    },
    priceInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.white,
        borderRadius: wp(2),
        borderWidth: 1.2,
        borderColor: "#ccc",
        paddingRight: wp(4),
        marginBottom: hp(2),
    },
    priceInputContainerFocused: {
        backgroundColor: '#e6fff6',
        borderColor: COLORS.primary,
        borderWidth: 1.5,
    },
    priceInput: {
        flex: 1,
        height: hp(5),
        paddingHorizontal: wp(4),
        fontSize: wp(4),
        color: COLORS.textPrimary,
    },
    sarText: {
        fontSize: wp(4),
        fontWeight: "500",
        color: COLORS.primary,
    },
    selectField: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: hp(5),
        backgroundColor: COLORS.white,
        borderRadius: wp(2),
        borderWidth: 1.2,
        borderColor: "#ccc",
        paddingHorizontal: wp(4),
        marginBottom: hp(1),
    },
    selectFieldActive: {
        backgroundColor: '#e6fff6',
        borderColor: COLORS.primary,
        borderWidth: 1.5,
    },
    selectFieldText: {
        flex: 1,
        fontSize: wp(4),
        color: COLORS.textTertiary,
    },
    selectFieldTextActive: {
        color: COLORS.textPrimary,
    },
    toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: hp(2),
        marginBottom: hp(1),
    },
    toggleLabel: {
        flex: 1,
        fontSize: wp(4),
        fontWeight: "500",
        color: COLORS.textPrimary,
        marginRight: wp(3),
    },
    attorneyContainer: {
        marginTop: hp(2),
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: hp(1),
        marginBottom: hp(2),
    },
    checkbox: {
        width: wp(5.5),
        height: wp(5.5),
        borderRadius: wp(1),
        borderWidth: 2,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
        marginRight: wp(3),
        marginTop: hp(0.2),
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxChecked: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    checkboxText: {
        flex: 1,
        fontSize: wp(4.3),
        fontWeight: "400",
        color: COLORS.textPrimary,
        lineHeight: hp(2.5),
    },
    closeButton: {
        width: wp(12),
        height: wp(12),
        justifyContent: "center",
        alignItems: "center",
    },
});
