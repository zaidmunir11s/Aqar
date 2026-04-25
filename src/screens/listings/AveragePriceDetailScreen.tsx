import React, { useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  AverageCard,
  AverageSaleCard,
  AveragePriceChart,
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
import { useGetPublicListingsQuery } from "@/redux/api";
import {
  buildMarketListingsQueryArgs,
  computeListingPriceInsights,
  getPrismaPropertyTypeForQuery,
  INSIGHTS_DAYS,
  type ListingPriceFilters,
} from "@/utils/listingPriceInsights";

export interface AveragePriceDetailParams {
  property: Property;
  averageType: "rent" | "sale";
  filters?: ListingPriceFilters;
}

export default function AveragePriceDetailScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, isRTL } = useLocalization();
  const params = route.params as AveragePriceDetailParams;
  const { property, averageType, filters } = params ?? {};

  const formatCompactSar = useCallback(
    (n: number | null): string => {
      if (n == null) return "---";
      if (!Number.isFinite(n)) return "---";
      const abs = Math.abs(n);
      const loc = isRTL ? "ar-SA" : "en-US";
      const thousand = t("listings.thousand") || "K";
      const million = t("listings.million") || "M";
      const billion = t("listings.billion") || "B";

      const fmt = (value: number, suffix: string) =>
        `${value.toLocaleString(loc, { maximumFractionDigits: 1 })} ${suffix} ${t("listings.sar")}`;

      if (abs >= 1_000_000_000) return fmt(n / 1_000_000_000, billion);
      if (abs >= 1_000_000) return fmt(n / 1_000_000, million);
      if (abs >= 1_000) return fmt(n / 1_000, thousand);
      return `${Math.round(n).toLocaleString(loc)} ${t("listings.sar")}`;
    },
    [isRTL, t],
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleEditPress = useCallback(() => {
    (navigation as { navigate: (name: string) => void }).navigate(
      "AqarResidentialStats",
    );
  }, [navigation]);

  const prismaPropertyType = useMemo(
    () => getPrismaPropertyTypeForQuery(property?.type),
    [property?.type],
  );

  const marketQueryArgs = useMemo(() => {
    if (!property || !averageType) return undefined;
    return buildMarketListingsQueryArgs(
      property,
      averageType === "rent" ? "rent" : "sale",
      filters,
    );
  }, [property, averageType, filters]);

  const { data: publicListingsData, isLoading } = useGetPublicListingsQuery(
    marketQueryArgs ?? { page: 1, limit: 200, listingType: "SALE" },
    { skip: !marketQueryArgs },
  );

  const insights = useMemo(
    () =>
      computeListingPriceInsights(publicListingsData?.listings ?? [], {
        excludeListingId: property?.serverListingId,
      }),
    [publicListingsData, property?.serverListingId],
  );

  const chartData = insights.chart as ChartDataPoint[];

  if (!property || !averageType) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title={t("listings.aqarResidentialStats")}
          onBackPress={handleBackPress}
        />
      </View>
    );
  }

  const formatSar = (n: number | null) => formatCompactSar(n);
  const formatSarPerSqm = (n: number | null) =>
    n == null
      ? "---"
      : `${Math.round(n).toLocaleString(isRTL ? "ar-SA" : "en-US")} ${t("listings.sar")}/m²`;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.aqarResidentialStats")}
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
              insightFilters={filters}
              onEditPress={handleEditPress}
            />
          ) : (
            <AverageSaleCard
              property={property}
              variant="detail"
              insightFilters={filters}
              onEditPress={handleEditPress}
              minArea={filters?.minArea}
              maxArea={filters?.maxArea}
            />
          )}
        </View>
        <View style={styles.section}>
          <Text
            style={[
              styles.priceTableTitle,
              { textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {t("listings.viewAveragePriceIndexForEach")}
          </Text>

          <Text
            style={[
              styles.chartDataSource,
              { textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {`${t("listings.latest")}: ${INSIGHTS_DAYS} ${t("listings.days") ?? "days"} · ${t("listings.city")}: ${
              filters?.city?.trim() ||
              property?.city?.trim() ||
              "---"
            } · ${t("listings.property")}: ${prismaPropertyType ?? "---"}`}
          </Text>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator />
            </View>
          ) : (
            <>
              <View style={styles.metricsCard}>
                {[
                  {
                    label: t("listings.listings", { defaultValue: "Listings" }),
                    value: String(insights.sampleSize),
                  },
                  { label: "Median", value: formatSar(insights.medianPrice) },
                  { label: "Average", value: formatSar(insights.avgPrice) },
                  {
                    label: "Min/Max",
                    value:
                      insights.minPrice != null && insights.maxPrice != null
                        ? `${formatSar(insights.minPrice)} / ${formatSar(insights.maxPrice)}`
                        : "---",
                  },
                  {
                    label: "Median SAR/m²",
                    value: formatSarPerSqm(insights.medianPricePerSqm),
                  },
                ].map((m) => (
                  <View key={m.label} style={styles.metricRow}>
                    <Text style={styles.metricLabel}>{m.label}</Text>
                    <Text style={styles.metricValue}>{m.value}</Text>
                  </View>
                ))}
              </View>

              <AveragePriceChart
                data={chartData}
                periodMode="halfYear"
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
                  const priceText = formatCompactSar(item.value);
                  const labelSlot = (
                    <View
                      style={[
                        styles.priceTableLabelSlot,
                        {
                          alignItems: isRTL ? "flex-end" : "flex-start",
                        },
                      ]}
                    >
                      <Text style={styles.priceTablePeriod}>{item.period}</Text>
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
                          <Text style={styles.priceTablePrice}>
                            {priceText}
                          </Text>
                          {labelSlot}
                        </>
                      ) : (
                        <>
                          {labelSlot}
                          <Text style={styles.priceTablePrice}>
                            {priceText}
                          </Text>
                          <View style={styles.priceTableSpacer} />
                        </>
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          )}
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
  loadingBox: {
    paddingVertical: hp(4),
    alignItems: "center",
    justifyContent: "center",
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
  metricsCard: {
    marginTop: hp(1),
    backgroundColor: COLORS.white,
    borderRadius: wp(2),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(0.9),
  },
  metricLabel: {
    flex: 1,
    fontSize: wp(3.7),
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontSize: wp(3.8),
    fontWeight: "700",
    color: COLORS.textPrimary,
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
