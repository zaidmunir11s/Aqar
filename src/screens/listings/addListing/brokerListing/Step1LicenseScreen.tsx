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
import { ScreenHeader, ListingFooter, CancelModal, SegmentedControl } from "../../../../components";
import { openURL, navigateToMapScreen } from "../../../../utils";
import { COLORS } from "@/constants";


type NavigationProp = NativeStackNavigationProp<any>;

export default function Step1LicenseScreen(): React.JSX.Element {
    const navigation = useNavigation<NavigationProp>();
    const [hasLicense, setHasLicense] = useState<number | null>(null); // 0 = Yes, 1 = No (based on array index)
    const [licenseNumber, setLicenseNumber] = useState("");
    const [nationalId, setNationalId] = useState("");
    const [licenseFocused, setLicenseFocused] = useState(false);
    const [nationalIdFocused, setNationalIdFocused] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Validate license number: 10 digits starting with 71 or 72
    const isValidLicense = /^(71|72)\d{8}$/.test(licenseNumber.trim());

    // Check if all required fields are filled
    // hasLicense === 0 means "Yes" (first option), hasLicense === 1 means "No" (second option)
    const canProceed = hasLicense === 0
        ? isValidLicense && nationalId.trim().length > 0
        : hasLicense === 1;

    const handleBackPress = () => {
        setShowCancelModal(true);
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
        navigation.navigate("Step2AdLicense");
    };
    const handleFooterBackPress = () => {
        setShowCancelModal(true);
    };
    const handleWhatIsLicensePress = () => {
        // Open URL or show modal about ad license
        openURL("https://google.com");
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
                        title="Add Listing"
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
                            {/* Info Text */}
                            <Text style={styles.infoText}>
                                To add an ad on the Aqar Platform, you must have ad license issued by the REGA
                            </Text>

                            {/* Do you have ad license? */}
                            <View style={styles.licenseQuestionRow}>
                                <Text style={styles.licenseQuestion}>Do you have ad license?</Text>
                                <TouchableOpacity
                                    onPress={handleWhatIsLicensePress}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.licenseLink}>What is an ad license?</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Tab Bar: Yes/No */}
                            <View style={styles.tabBarContainer}>
                                <SegmentedControl
                                    options={["Yes", "No"]}
                                    selectedIndex={hasLicense !== null ? hasLicense : -1}
                                    onSelect={(index) => {
                                        setHasLicense(index);
                                        // Reset fields when switching to "No" (index 1)
                                        if (index === 1) {
                                            setLicenseNumber("");
                                            setNationalId("");
                                        }
                                    }}
                                />
                            </View>

                            {/* Yes Section - index 0 */}
                            {hasLicense === 0 && (
                                <View style={styles.yesSection}>
                                    {/* Ad License Number */}
                                    <Text style={styles.sectionTitle}>Ad license Number</Text>
                                    <TextInput
                                        style={[styles.textInput, licenseFocused && styles.textInputFocused]}
                                        value={licenseNumber}
                                        onChangeText={setLicenseNumber}
                                        onFocus={() => setLicenseFocused(true)}
                                        onBlur={() => setLicenseFocused(false)}
                                    />
                                    {licenseNumber.length > 0 && !isValidLicense && (
                                        <Text style={styles.errorText}>
                                            Please enter the valid ad license number (10 numbers starts with 71 or 72)
                                        </Text>
                                    )}

                                    {/* National ID - Only show when license is valid */}
                                    {isValidLicense && (
                                        <View style={styles.nationalIdContainer}>
                                            <Text style={styles.sectionTitle}>National ID</Text>
                                            <TextInput
                                                style={[styles.textInput, nationalIdFocused && styles.textInputFocused]}
                                                value={nationalId}
                                                onChangeText={setNationalId}
                                                onFocus={() => setNationalIdFocused(true)}
                                                onBlur={() => setNationalIdFocused(false)}
                                            />
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* No Section - index 1 */}
                            {hasLicense === 1 && (
                                <View style={styles.noSection}>
                                    <Text style={styles.noSectionText}>
                                        Aqar platform allows licensed brokers to issue a free ad license and publish it within the platform. The service requires:
                                    </Text>

                                    {/* Bullet Points */}
                                    <View style={styles.bulletItem}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <Text style={styles.bulletText}>Brokerage Contract</Text>
                                    </View>

                                    <View style={styles.bulletItem}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <Text style={styles.bulletText}>
                                            Commitment to use the license only within Aqar platform.
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>

            <ListingFooter
                currentStep={1}
                totalSteps={5}
                onBackPress={handleFooterBackPress}
                onNextPress={handleNextPress}
                nextDisabled={!canProceed}
            />

            <CancelModal
                visible={showCancelModal}
                onBack={handleCancelBack}
                onConfirm={handleCancelYes}
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
        padding: wp(5),
    },
    infoText: {
        fontSize: wp(4.3),
        fontWeight: "400",
        color: COLORS.textSecondary,
        marginBottom: hp(3),
        lineHeight: hp(2.5),
    },
    licenseQuestionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: hp(2),
    },
    licenseQuestion: {
        fontSize: wp(4.5),
        fontWeight: "500",
        color: COLORS.textPrimary,
        flex: 1,
    },
    licenseLink: {
        fontSize: wp(3.2),
        fontWeight: "400",
        color: COLORS.primary,
    },
    tabBarContainer: {
    
    },
    yesSection: {
    },
    sectionTitle: {
        fontSize: wp(4),
        fontWeight: "500",
        color: COLORS.textPrimary,
        marginBottom: hp(1.5),
        marginTop: hp(2),
    },
    textInput: {
        height: hp(6),
        backgroundColor: COLORS.white,
        borderRadius: wp(2),
        borderWidth: 1,
        borderColor: "#ccc",
        paddingHorizontal: wp(4),
        fontSize: wp(4),
        color: COLORS.textPrimary,
    },
    textInputFocused: {
        backgroundColor: '#e6fff6',
        borderColor: COLORS.primary,
        borderWidth: 1,
    },
    errorText: {
        color: COLORS.error,
        marginTop: hp(1),
        fontSize: wp(3.5),
        marginBottom: hp(0.5),
    },
    nationalIdContainer: {
    },
    noSection: {
        marginTop: hp(2),
    },

    noSectionText: {
        fontSize: wp(4.3),
        fontWeight: "400",
        color: COLORS.textSecondary,
        marginBottom: hp(2),
        lineHeight: hp(2.8),
    },

    bulletItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginLeft: wp(2),
    },

    bulletDot: {
        fontSize: wp(5),
        color: COLORS.textSecondary,
        marginRight: wp(3),
        marginTop: -hp(0.3), // Slight vertical alignment tweak
    },

    bulletText: {
        flex: 1,
        fontSize: wp(4),
        fontWeight: "400",
        color: COLORS.textSecondary,
        lineHeight: hp(2.5),
    },
    closeButton: {
        width: wp(12),
        height: wp(12),
        justifyContent: "center",
        alignItems: "center",
    },
});
