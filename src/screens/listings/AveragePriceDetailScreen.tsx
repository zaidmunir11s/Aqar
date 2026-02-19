import React, { useCallback, useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  AverageCard,
  AverageSaleCard,
  AveragePriceChart,
  TabBarSection,
  type ChartDataPoint,
} from "../../components";
import ScreenHeader from "../../components/common/ScreenHeader";
import type { Property } from "../../types/property";
import { useLocalization } from "../../hooks/useLocalization";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "@/constants/colors";

const CHART_START_YEAR = 2019;
const CHART_END_YEAR = 2024;

/**
 * Chart data for 6 Months view: 12 points (2 per year), recent first.
 * Labels: "Second half" / "First half" on first line, year on second line.
 */
function buildChartData6Months(t: (key: string) => string): ChartDataPoint[] {
  const firstHalf = t("listings.firstHalf");
  const secondHalf = t("listings.secondHalf");
  const data: ChartDataPoint[] = [];
  const basePrices = [
    74500, 72000, 69500, 67910, 65000, 60000, 58000, 56591, 54800, 52000, 50200, 48500,
  ];
  let idx = 0;
  for (let year = CHART_END_YEAR; year >= CHART_START_YEAR; year--) {
    data.push({ period: `${secondHalf}\n${year}`, value: basePrices[idx++] ?? 0 });
    data.push({ period: `${firstHalf}\n${year}`, value: basePrices[idx++] ?? 0 });
  }
  return data;
}

/**
 * Chart data for Yearly view: one point per year (2024 → 2019), label = year only.
 */
function buildChartDataYearly(): ChartDataPoint[] {
  const yearlyPrices = [73250, 67750, 57295, 52400, 49350, 48500];
  const data: ChartDataPoint[] = [];
  let idx = 0;
  for (let year = CHART_END_YEAR; year >= CHART_START_YEAR; year--) {
    data.push({ period: String(year), value: yearlyPrices[idx++] ?? 0 });
  }
  return data;
}

export type AverageIndexPeriod = "yearly" | "6months" | "3months" | "monthly";

const PERIOD_OPTIONS: { key: AverageIndexPeriod; labelKey: string }[] = [
  { key: "yearly", labelKey: "listings.yearly" },
  { key: "6months", labelKey: "listings.sixMonths" },
  { key: "3months", labelKey: "listings.threeMonths" },
  { key: "monthly", labelKey: "listings.monthly" },
];

export interface AveragePriceDetailParams {
  property: Property;
  averageType: "rent" | "sale";
}

export default function AveragePriceDetailScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, isRTL } = useLocalization();
  const params = route.params as AveragePriceDetailParams;
  const { property, averageType } = params ?? {};

  const [selectedPeriod, setSelectedPeriod] = useState<AverageIndexPeriod>("6months");

  const chartData = useMemo(() => {
    switch (selectedPeriod) {
      case "yearly":
        return buildChartDataYearly();
      case "6months":
        return buildChartData6Months(t);
      case "3months":
      case "monthly":
      default:
        return buildChartData6Months(t);
    }
  }, [selectedPeriod, t]);
  const periodTabOptions = useMemo(
    () => PERIOD_OPTIONS.map((p) => t(p.labelKey)),
    [t]
  );
  const selectedPeriodValue = useMemo(
    () => t(PERIOD_OPTIONS.find((p) => p.key === selectedPeriod)!.labelKey),
    [t, selectedPeriod]
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleEditPress = useCallback(() => {
    (navigation as { navigate: (name: string) => void }).navigate(
      "AqarResidentialStats"
    );
  }, [navigation]);

  const handlePeriodSelect = useCallback((value: string) => {
    const index = periodTabOptions.indexOf(value);
    if (index >= 0) setSelectedPeriod(PERIOD_OPTIONS[index].key);
  }, [periodTabOptions]);

  if (!property || !averageType) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title={t("listings.residentialRealEstateIndicators")}
          onBackPress={handleBackPress}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.residentialRealEstateIndicators")}
        onBackPress={handleBackPress}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardWrapper}>
          {averageType === "rent" ? (
            <AverageCard
              property={property}
              variant="detail"
              onEditPress={handleEditPress}
            />
          ) : (
            <AverageSaleCard
              property={property}
              variant="detail"
              onEditPress={handleEditPress}
            />
          )}
        </View>
        <View style={styles.section}>
          <TabBarSection
            label={t("listings.viewAveragePriceIndexForEach")}
            options={periodTabOptions}
            selectedValue={selectedPeriodValue}
            onSelect={handlePeriodSelect}
            backgroundColor="#fff"
          />
          <AveragePriceChart
            data={chartData}
            periodMode={selectedPeriod === "yearly" ? "yearly" : "halfYear"}
            containerStyle={styles.chartContainer}
          />
          <Text
            style={[
              styles.priceTableTitle,
              { textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {t("listings.priceTable")}
          </Text>
          <View style={styles.priceTableCard}>
            {chartData.map((item, index) => {
              const periodLabel = item.period.replace(/\n/g, " ");
              const priceText = `${item.value.toLocaleString()} ${t("listings.sar")}`;
              const labelSlot = (
                <View
                  style={[
                    styles.priceTableLabelSlot,
                    {
                      alignItems: isRTL ? "flex-end" : "flex-start",
                    },
                  ]}
                >
                  <Text style={styles.priceTablePeriod}>{periodLabel}</Text>
                </View>
              );
              return (
                <View
                  key={`${item.period}-${index}`}
                  style={styles.priceTableRow}
                >
                  {isRTL ? (
                    <>
                      <View style={styles.priceTableSpacer} />
                      <Text style={styles.priceTablePrice}>{priceText}</Text>
                      {labelSlot}
                    </>
                  ) : (
                    <>
                      {labelSlot}
                      <Text style={styles.priceTablePrice}>{priceText}</Text>
                      <View style={styles.priceTableSpacer} />
                    </>
                  )}
                </View>
              );
            })}
          </View>
          <Text
            style={[
              styles.chartDataSource,
              { textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {t("listings.chartDataSource")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(10),
  },
  cardWrapper: {
    marginTop: hp(1),
  },
  section: {
    marginHorizontal: wp(4),
    marginTop: hp(2),
  },
  chartContainer: {
    marginTop: hp(1),
  },
  chartDataSource: {
    marginTop: hp(1.5),
    fontSize: wp(3.5),
    color: COLORS.textSecondary,   
  },
  priceTableTitle: {
    marginTop: hp(2.5),
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  priceTableCard: {
    marginTop: hp(1),
    backgroundColor: COLORS.white,
    borderRadius: wp(2),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceTableRow: {
    flexDirection: "row",
    paddingVertical: hp(1.2),
    alignItems: "center",
  },
  priceTableLabelSlot: {
    flex: 1,
  },
  priceTableSpacer: {
    flex: 0.5,
  },
  priceTablePrice: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  priceTablePeriod: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});
