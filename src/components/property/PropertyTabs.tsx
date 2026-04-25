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
  copyIdLabel?: string;
}

/**
 * Property tabs component with tab content
 */
const PropertyTabs = memo<PropertyTabsProps>(
  ({ activeTab, onTabChange, property, onCopyId, copyIdLabel }) => {
    const { t, isRTL } = useLocalization();
    const tabScrollViewRef = useRef<ScrollView>(null);
    const [nowTs, setNowTs] = React.useState<number>(Date.now());

    const isPublished = useMemo(
      () =>
        Boolean(
          property.listingId ||
          property.createdAt ||
          property.updatedAt ||
          property.detailsItems?.length,
        ),
      [
        property.createdAt,
        property.detailsItems,
        property.listingId,
        property.updatedAt,
      ],
    );

    const tabs = useMemo(
      () =>
        isPublished
          ? [{ id: "main" as TabType, label: t("listings.listingMainDetails") }]
          : [
              {
                id: "main" as TabType,
                label: t("listings.listingMainDetails"),
              },
              {
                id: "additional" as TabType,
                label: t("listings.additionalInformation"),
              },
              {
                id: "location" as TabType,
                label: t("listings.locationDetails"),
              },
            ],
      [isPublished, t],
    );

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

    useEffect(() => {
      const timer = setInterval(() => {
        setNowTs(Date.now());
      }, 60000);
      return () => clearInterval(timer);
    }, []);

    const formatAbsoluteDate = useCallback(
      (iso?: string): string => {
        if (!iso) return "---";
        const dt = new Date(iso);
        if (Number.isNaN(dt.getTime())) return "---";
        return dt.toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      },
      [isRTL],
    );

    const formatRelativeUpdated = useCallback(
      (iso?: string): string => {
        if (!iso) return "---";
        const dt = new Date(iso);
        if (Number.isNaN(dt.getTime())) return "---";
        const diffMs = Math.max(0, nowTs - dt.getTime());
        const totalMinutes = Math.floor(diffMs / 60000);
        if (totalMinutes <= 0) {
          return t("listings.justNow");
        }
        if (totalMinutes < 60) {
          return t("listings.minutesAgo", { count: totalMinutes });
        }
        const hours = Math.floor(totalMinutes / 60);
        if (hours < 24) {
          return t("listings.hoursAgo", { count: hours });
        }
        const days = Math.floor(hours / 24);
        return t("listings.daysAgo", { count: days });
      },
      [nowTs, t],
    );

    const renderMainTabContent = useCallback(() => {
      const mainDetails = [
        {
          label: t("listings.listingId"),
          value: String(property.listingId ?? property.id),
          showCopy: true,
        },
        {
          label: t("listings.createdAt"),
          value: formatAbsoluteDate(property.createdAt),
        },
        {
          label: t("listings.lastUpdated"),
          value: formatRelativeUpdated(
            property.updatedAt ?? property.createdAt,
          ),
        },
        {
          label: t("listings.deedArea"),
          value: `${property.area} ${t("listings.m2")}`,
        },
        ...(!isPublished
          ? [
              { label: t("listings.licenseNumber"), value: "7200780161" },
              {
                label: t("listings.licenseExpirationDate"),
                value: "01/12/2026",
              },
              { label: t("listings.source"), value: "الهيئة العامة للعقار" },
            ]
          : []),
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
              copyLabel={detail.showCopy ? copyIdLabel : undefined}
              backgroundColor={
                index % 2 === 0 ? COLORS.white : COLORS.background
              }
              isLast={index === mainDetails.length - 1}
            />
          ))}
        </View>
      );
    }, [
      property,
      onCopyId,
      t,
      formatAbsoluteDate,
      formatRelativeUpdated,
      copyIdLabel,
    ]);

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
              backgroundColor={
                index % 2 === 0 ? COLORS.white : COLORS.background
              }
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
        {
          label: t("listings.districtDistrictNumber"),
          value: "أم الحمام الشرقي",
        },
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
              backgroundColor={
                index % 2 === 0 ? COLORS.white : COLORS.background
              }
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
  },
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
