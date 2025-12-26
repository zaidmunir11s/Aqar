import React, { memo, useCallback, useRef } from "react";
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
    const tabScrollViewRef = useRef<ScrollView>(null);

    const tabs = [
      { id: "main" as TabType, label: "Listing Main details" },
      { id: "additional" as TabType, label: "Additional Information" },
      { id: "location" as TabType, label: "Location Details" },
    ];

    const renderMainTabContent = useCallback(() => {
      const mainDetails = [
        {
          label: "Listing ID",
          value: property.id.toString(),
          showCopy: true,
        },
        { label: "Created At", value: "2025/12/01" },
        { label: "License Number", value: "7200780161" },
        { label: "Last updated", value: "2 hours ago" },
        { label: "License Expiration Date", value: "01/12/2026" },
        { label: "Source", value: "الهيئة العامة للعقار" },
        { label: "Deed Area", value: `${property.area} m²` },
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
    }, [property, onCopyId]);

    const renderAdditionalTabContent = useCallback(() => {
      const additionalDetails = [
        { label: "Obligations", value: "لا يوجد" },
        {
          label: "Employee name",
          value: "محمد خالد بن عبد العزيز الجبير",
        },
        { label: "Employee phone", value: "505419444" },
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
    }, []);

    const renderLocationTabContent = useCallback(() => {
      const locationDetails = [
        { label: "Region/Region Number", value: "منطقة الرياض" },
        { label: "City/City Number", value: "الرياض" },
        { label: "District/District Number", value: "أم الحمام الشرقي" },
        {
          label: "Street/Building Number",
          value: "ابراهيم المروزي / 6234",
        },
        { label: "Postal Code", value: "12321" },
        { label: "Additional Number", value: "5860" },
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
    }, []);

    return (
      <>
        <ScrollView
          ref={tabScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContentContainer}
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
    backgroundColor: "#ebf1f1",
    borderWidth: 2,
    borderColor: "#dadee1",
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
    backgroundColor: "#fff",
    borderRadius: wp(1.5),
    borderWidth: 2,
    borderColor: "#dadee1",
    minWidth: wp(30),
  },
  activeTab: {
    backgroundColor: "#fff",
    borderColor: "#dadee1",
    borderWidth: 2,
  },
  tabText: {
    fontSize: wp(3.2),
    color: "#6b7280",
  },
  activeTabText: {
    color: "#383f49",
    fontWeight: "bold",
  },
  tabContent: {
    backgroundColor: "#ebf1f1",
  },
});

export default PropertyTabs;
