import React, { memo, useCallback, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { DetailRow } from "./PropertyInfo";
import type { Property } from "../../types/property";
import { useLocalization } from "../../hooks/useLocalization";
import { COLORS } from "../../constants";

export type TabType = "main" | "additional" | "location";

export interface PropertyTabsProps {
  activeTab: TabType;
  onTabChange: (tabId: TabType) => void;
  property: Property;
  onCopyId?: () => void;
}

/**
 * Property tabs component with tab content
 */
const PropertyTabs = memo<PropertyTabsProps>(
  ({ activeTab, onTabChange, property, onCopyId }) => {
    const { t, isRTL } = useLocalization();
    const tabScrollViewRef = useRef<ScrollView>(null);

    const tabs = useMemo(() => [
      { id: "main" as TabType, label: t("listings.listingMainDetails") },
      { id: "additional" as TabType, label: t("listings.additionalInformation") },
      { id: "location" as TabType, label: t("listings.locationDetails") },
    ], [t]);

    // In RTL, scroll to the end so the first tab (visually on the right) is in focus
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (isRTL) {
          tabScrollViewRef.current?.scrollToEnd({ animated: false });
        } else {
          tabScrollViewRef.current?.scrollTo({ x: 0, animated: false });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }, [isRTL]);

    const renderMainTabContent = useCallback(() => {
      const mainDetails = [
        {
          label: t("listings.listingId"),
          value: property.id.toString(),
          showCopy: true,
        },
        { label: t("listings.createdAt"), value: "2025/12/01" },
        { label: t("listings.licenseNumber"), value: "7200780161" },
        { label: t("listings.lastUpdated"), value: "2 hours ago" },
        { label: t("listings.licenseExpirationDate"), value: "01/12/2026" },
        { label: t("listings.source"), value: "الهيئة العامة للعقار" },
        { label: t("listings.deedArea"), value: `${property.area} ${t("listings.m2")}` },
      ];

      return (
        <View style={styles.tabContent}>
          {mainDetails.map((detail, index) => (
            <DetailRow
              key={detail.label}
              label={detail.label}
              value={detail.value}
              showCopy={detail.showCopy}
              onCopy={onCopyId}
              backgroundColor={index % 2 === 0 ? "#fff" : "#ebf1f1"}
              isLast={index === mainDetails.length - 1}
            />
          ))}
        </View>
      );
    }, [property, onCopyId, t]);

    const renderAdditionalTabContent = useCallback(() => {
      const additionalDetails = [
        { label: t("listings.obligations"), value: "لا يوجد" },
        {
          label: t("listings.employeeName"),
          value: "محمد خالد بن عبد العزيز الجبير",
        },
        { label: t("listings.employeePhone"), value: "505419444" },
      ];

      return (
        <View style={styles.tabContent}>
          {additionalDetails.map((detail, index) => (
            <DetailRow
              key={detail.label}
              label={detail.label}
              value={detail.value}
              backgroundColor={index % 2 === 0 ? "#fff" : "#ebf1f1"}
              isLast={index === additionalDetails.length - 1}
            />
          ))}
        </View>
      );
    }, [t]);

    const renderLocationTabContent = useCallback(() => {
      const locationDetails = [
        { label: t("listings.regionRegionNumber"), value: "منطقة الرياض" },
        { label: t("listings.cityCityNumber"), value: "الرياض" },
        { label: t("listings.districtDistrictNumber"), value: "أم الحمام الشرقي" },
        {
          label: t("listings.streetBuildingNumber"),
          value: "ابراهيم المروزي / 6234",
        },
        { label: t("listings.postalCode"), value: "12321" },
        { label: t("listings.additionalNumber"), value: "5860" },
      ];

      return (
        <View style={styles.tabContent}>
          {locationDetails.map((detail, index) => (
            <DetailRow
              key={detail.label}
              label={detail.label}
              value={detail.value}
              backgroundColor={index % 2 === 0 ? "#fff" : "#ebf1f1"}
              isLast={index === locationDetails.length - 1}
            />
          ))}
        </View>
      );
    }, [t]);

    return (
      <>
        <ScrollView
          ref={tabScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={[
            styles.tabsContentContainer,
            isRTL && styles.tabsContentContainerRTL,
          ]}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => onTabChange(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === "main" && renderMainTabContent()}
        {activeTab === "additional" && renderAdditionalTabContent()}
        {activeTab === "location" && renderLocationTabContent()}
      </>
    );
  }
);

PropertyTabs.displayName = "PropertyTabs";

const styles = StyleSheet.create({
  tabsContainer: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabsContentContainer: {
    paddingHorizontal: wp(3),
    paddingTop: hp(2),
    paddingBottom: hp(1),
    gap: wp(2),
    flexDirection: "row",
  },
  tab: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: wp(1.5),
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: wp(30),
  },
  activeTab: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  tabText: {
    fontSize: wp(3.2),
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  tabContent: {
    backgroundColor: COLORS.background,
  },
  tabsContentContainerRTL: {
    flexDirection: "row-reverse",
  },
});

export default PropertyTabs;
