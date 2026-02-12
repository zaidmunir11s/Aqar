import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from "react-native-gesture-handler";
import { CartesianChart, Line, useChartPressState } from "victory-native";
import { Circle, matchFont, useFont } from "@shopify/react-native-skia";
import { useAnimatedReaction } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MIN_WIDTH_PER_POINT = 88;

export type ChartDataPoint = {
  period: string;
  value: number;
};

// Match reference: bright blue line and dots, white halo on dots (drawn as fill, not stroke, so it renders correctly)
const CHART_LINE_COLOR = "#2563EB";
const TOOLTIP_BG_COLOR = "#2563EB";
const AXIS_LABEL_COLOR = "#6B7280";
const Y_GRID_LINE_COLOR = "#E5E7EB";
const DOT_FILL_RADIUS = 3;
const DOT_HALO_RADIUS = 6;
const LINE_STROKE_WIDTH = 5;
const WHITE_HALO = "#2563EB";

/**
 * Format value for display with translated thousand/million suffixes
 */
function formatChartValue(value: number, thousand: string, million: string): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} ${million}`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)} ${thousand}`;
  }
  return Math.round(value).toString();
}

/**
 * Format Y-axis labels as prices (e.g. 67,910)
 */
function formatYAxisLabel(value: number): string {
  if (value == null || typeof value !== "number") return "";
  return Math.round(value).toLocaleString();
}

/**
 * Format X-axis labels - return empty to hide (we use custom overlay for multi-line labels)
 * Skia Text doesn't support \n, so built-in labels can't show "Period\nYear" on two lines.
 */
function formatXLabel(_value: unknown): string {
  return "";
}

/**
 * Format Y-axis - return empty to hide (we use fixed overlay so Y-axis doesn't scroll)
 */
function formatYLabelHidden(_value: number): string {
  return "";
}

const Y_AXIS_WIDTH = 48;
const PLOT_TOP = 8;
const Y_LABEL_FONT_SIZE = 10;
const Y_LABEL_HALF_HEIGHT = Y_LABEL_FONT_SIZE / 2;
const X_FIRST_LINE_HEIGHT = 12;
const X_FIRST_LINE_CENTER_OFFSET = X_FIRST_LINE_HEIGHT / 2;

export type ChartPeriodMode = "yearly" | "halfYear";

export interface AveragePriceChartProps {
  data: ChartDataPoint[];
  height?: number;
  containerStyle?: object;
  /** When "yearly", x-axis shows single-line labels (e.g. "2024"); when "halfYear", two lines (e.g. "First half" / "2024"). */
  periodMode?: ChartPeriodMode;
}

const X_AXIS_LABELS_HEIGHT_HALF_YEAR = 28;
const X_AXIS_LABELS_HEIGHT_YEARLY = 20;

export default function AveragePriceChart({
  data,
  height = 220,
  containerStyle,
  periodMode = "halfYear",
}: AveragePriceChartProps): React.JSX.Element {
  const { isRTL, t } = useLocalization();
  const scrollRef = useRef<ScrollView>(null);
  const thousandLabel = t("listings.thousand");
  const millionLabel = t("listings.million");

  const xAxisLabelsHeight =
    periodMode === "yearly"
      ? X_AXIS_LABELS_HEIGHT_YEARLY
      : X_AXIS_LABELS_HEIGHT_HALF_YEAR;
  const plotBottom = xAxisLabelsHeight;

  const customFont = useFont(
    require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    12
  );
  const font = customFont ?? matchFont({ fontSize: 12 });
  const { state: chartPressState } = useChartPressState({
    x: 0,
    y: { value: 0 },
  });

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    value: number;
  }>({ visible: false, x: 0, y: 0, value: 0 });

  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const TOOLTIP_VISIBLE_MS = 500;

  const scheduleHideTooltipRef = useRef<() => void>(() => {});
  const rtlRef = useRef<{ isRTL: boolean; chartWidth: number } | null>(null);

  const updateTooltip = useCallback(
    (visible: boolean, x: number, y: number, value: number) => {
      const rtl = rtlRef.current;
      const tooltipX =
        rtl?.isRTL && rtl.chartWidth != null ? rtl.chartWidth - x : x;
      setTooltip({ visible, x: tooltipX, y, value });
      if (visible) scheduleHideTooltipRef.current();
    },
    []
  );

  useAnimatedReaction(
    () => ({
      active: chartPressState.isActive.value,
      x: chartPressState.x.position.value,
      y: chartPressState.y.value.position.value,
      value: chartPressState.y.value.value.value,
    }),
    (current) => {
      if (current.active && typeof current.value === "number") {
        scheduleOnRN(
          updateTooltip,
          true,
          current.x,
          current.y + LINE_STROKE_WIDTH - 44,
          current.value
        );
      }
      // Don't hide when active becomes false – tooltip stays until auto-hide or next tap
    }
  );

  const chartWidth = Math.max(
    SCREEN_WIDTH,
    data.length * MIN_WIDTH_PER_POINT
  );

  rtlRef.current = { isRTL, chartWidth };

  // Data with numeric x so we can align dots to X-axis label centers (domain -0.5..n-0.5)
  // In RTL, reverse xIndex so first period is drawn on the right
  const chartData = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        xIndex: isRTL ? data.length - 1 - i : i,
      })),
    [data, isRTL]
  );

  // Origin at 0: Y-axis always starts at 0; max is rounded up for a clean scale (reference: 0, 236, 473, … 1420)
  const { yDomain, yAxisOverlay, plotHeight, maxVal } = useMemo(() => {
    const values = data.map((d) => d.value).filter((v) => typeof v === "number");
    const dataMax = values.length ? Math.max(...values) : 100;
    const max = dataMax <= 0 ? 100 : dataMax;
    const plotH = height - PLOT_TOP - plotBottom;
    const tickCount = 6;
    const ticks: { value: number; y: number }[] = [];
    for (let i = 0; i < tickCount; i++) {
      const t = i / (tickCount - 1);
      const value = t * max;
      const y = PLOT_TOP + (1 - t) * plotH;
      ticks.push({ value, y });
    }
    return {
      yDomain: [0, max] as [number, number],
      yAxisOverlay: ticks,
      plotHeight: plotH,
      maxVal: max,
    };
  }, [data, height]);

  const plotWidth = chartWidth - 2 * Y_AXIS_WIDTH;
  const cellWidth = data.length > 0 ? plotWidth / data.length : 0;

  const scheduleHideTooltip = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      hideTimeoutRef.current = null;
      setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    }, TOOLTIP_VISIBLE_MS);
  }, []);

  scheduleHideTooltipRef.current = scheduleHideTooltip;

  const handleTap = useCallback(
    (localX: number, localY: number) => {
      if (data.length === 0 || cellWidth <= 0) return;
      const inPlotX = localX - Y_AXIS_WIDTH;
      const inPlotY = localY - PLOT_TOP;
      if (
        inPlotX < 0 ||
        inPlotX > plotWidth ||
        inPlotY < 0 ||
        inPlotY > plotHeight
      )
        return;
      const visualIndex = Math.round(inPlotX / cellWidth - 0.5);
      const clampedIndex = Math.max(
        0,
        Math.min(
          isRTL ? data.length - 1 - visualIndex : visualIndex,
          data.length - 1
        )
      );
      const datum = data[clampedIndex];
      if (!datum || typeof datum.value !== "number") return;
      const dotXLtr = Y_AXIS_WIDTH + (clampedIndex + 0.5) * cellWidth;
      const tooltipX = isRTL ? chartWidth - dotXLtr : dotXLtr;
      const dotY =
        PLOT_TOP +
        (1 - datum.value / maxVal) * plotHeight +
        LINE_STROKE_WIDTH;
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      setTooltip({
        visible: true,
        x: tooltipX,
        y: dotY - 44,
        value: datum.value,
      });
      scheduleHideTooltip();
    },
    [data, cellWidth, plotWidth, plotHeight, maxVal, isRTL, chartWidth]
  );

  const tapGesture = useMemo(
    () =>
      Gesture.Tap().onEnd((e) => {
        "worklet";
        scheduleOnRN(handleTap, e.x, e.y);
      }),
    [handleTap]
  );

  const scrollToEndIfRTL = useCallback(() => {
    if (isRTL && data.length > 0) {
      scrollRef.current?.scrollToEnd({ animated: false });
    }
  }, [isRTL, data.length]);

  const resetScrollToVisible = useCallback(() => {
    if (data.length === 0) return;
    if (isRTL) {
      scrollRef.current?.scrollToEnd({ animated: false });
    } else {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [isRTL, data.length]);

  useEffect(() => {
    scrollToEndIfRTL();
  }, [scrollToEndIfRTL]);

  useEffect(() => {
    resetScrollToVisible();
  }, [periodMode, data.length, resetScrollToVisible]);

  return (
    <View style={[styles.container, containerStyle, { height: height + 24 }]}>
      {/* Fixed Y-axis overlay - full height including X-axis strip; "0" at bottom; right side when RTL */}
      <View
        style={[
          styles.yAxisOverlay,
          {
            width: Y_AXIS_WIDTH,
            height: height,
            top: hp(1.5),
            ...(isRTL ? { right: wp(3), left: undefined } : { left: wp(3) }),
          },
        ]}
        pointerEvents="none"
      >
        {yAxisOverlay.map(({ value, y }, i) => {
          const isOrigin = i === 0;
          const originAlignedTop =
            height -
            xAxisLabelsHeight +
            X_FIRST_LINE_CENTER_OFFSET -
            Y_LABEL_HALF_HEIGHT;
          const top = isOrigin ? originAlignedTop : y - Y_LABEL_HALF_HEIGHT;
          return (
            <Text
              key={i}
              style={[styles.yAxisLabel, { top }]}
              numberOfLines={1}
            >
              {formatYAxisLabel(value)}
            </Text>
          );
        })}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        onContentSizeChange={() => {
          scrollToEndIfRTL();
          resetScrollToVisible();
        }}
      >
        <View style={[styles.chartWrapper, { width: chartWidth, height }]}>
          <View style={[styles.chartArea, { height }]}>
          {/* Horizontal grid lines at Y price ticks only (not at 0) - behind chart */}
          <View
            style={[styles.yGridOverlay, { width: chartWidth, height }]}
            pointerEvents="none"
          >
            {yAxisOverlay.slice(1).map(({ y }, i) => (
              <View
                key={i}
                style={[
                  styles.yGridLine,
                  {
                    top: y - 0.5,
                    left: 0,
                    width: chartWidth,
                  },
                ]}
              />
            ))}
          </View>
            <CartesianChart
          data={chartData}
          xKey="xIndex"
          yKeys={["value"]}
          domain={{ x: [-0.5, data.length - 0.5], y: yDomain }}
          domainPadding={{ left: Y_AXIS_WIDTH, right: Y_AXIS_WIDTH, top: PLOT_TOP, bottom: plotBottom }}
          axisOptions={{
            font,
            tickCount: { x: data.length, y: 6 },
            labelColor: AXIS_LABEL_COLOR,
            formatXLabel,
            formatYLabel: formatYLabelHidden,
          }}
          xAxis={{ lineWidth: 0, lineColor: "transparent" }}
          yAxis={[{ lineWidth: 0, lineColor: "transparent" }]}
          frame={{ lineWidth: 0, lineColor: "transparent" }}
          chartPressState={chartPressState}
          chartPressConfig={{
            pan: {
              activateAfterLongPress: 30,
            },
          }}
        >
          {({ points }) => (
            <>
              <Line
                points={points.value}
                color={CHART_LINE_COLOR}
                strokeWidth={LINE_STROKE_WIDTH}
                curveType="catmullRom"
              />
              {points.value.map((point, index) => {
                const cx = point.x ?? 0;
                const cy = (point.y ?? 0) + LINE_STROKE_WIDTH;
                return (
                  <React.Fragment key={index}>
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={DOT_HALO_RADIUS}
                      color={WHITE_HALO}
                      style="fill"
                    />
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={DOT_FILL_RADIUS}
                      color="white"
                      style="fill"
                    />
                  </React.Fragment>
                );
              })}
            </>
          )}
        </CartesianChart>
          {/* Tap overlay: show tooltip on tap when chart press misses (e.g. after scroll) */}
          <GestureDetector gesture={tapGesture}>
            <View
              style={[
                StyleSheet.absoluteFill,
                { width: chartWidth, height },
              ]}
            />
          </GestureDetector>
          </View>

          {/* X-axis labels inside chart area at bottom (Y-axis extends through this strip); row-reverse in RTL */}
          <View
            style={[
              styles.xAxisLabels,
              {
                width: chartWidth,
                height: xAxisLabelsHeight,
                paddingHorizontal: Y_AXIS_WIDTH,
                flexDirection: isRTL ? "row-reverse" : "row",
              },
            ]}
          >
            {data.map((d, i) => {
              const parts = String(d.period).split("\n");
              const periodLabel = parts[0] ?? "";
              const yearLabel = periodMode === "halfYear" ? (parts[1] ?? "") : "";
              return (
                <View key={i} style={styles.xAxisLabelCell}>
                  <Text style={styles.xAxisPeriod}>{periodLabel}</Text>
                  {yearLabel ? (
                    <Text style={styles.xAxisYear}>{yearLabel}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>

        {/* Interactive tooltip overlay */}
        {tooltip.visible && (
          <View
            style={[
              styles.tooltip,
              {
                left: Math.max(0, Math.min(tooltip.x - 28, chartWidth - 56)),
                top: Math.max(0, tooltip.y),
              },
            ]}
            pointerEvents="none"
          >
            <View style={styles.tooltipBubble}>
              <Text style={styles.tooltipText}>
                {formatChartValue(tooltip.value, thousandLabel, millionLabel)}
              </Text>
            </View>
            <View style={styles.tooltipArrow} />
          </View>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: wp(3),
    paddingTop: hp(1.5),
    backgroundColor: COLORS.white,
    borderRadius: wp(2),
  },
  scrollContent: {
    flexGrow: 0,
  },
  chartWrapper: {
    position: "relative",
    overflow: "visible",
  },
  chartArea: {
    position: "relative",
  },
  yGridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  yGridLine: {
    position: "absolute",
    height: 1,
    backgroundColor: Y_GRID_LINE_COLOR,
  },
  yAxisOverlay: {
    position: "absolute",
    left: wp(3),
    backgroundColor: COLORS.white,
    zIndex: 5,
  },
  yAxisLabel: {
    position: "absolute",
    left: 0,
    width: Y_AXIS_WIDTH - 4,
    fontSize: Y_LABEL_FONT_SIZE,
    color: AXIS_LABEL_COLOR,
    lineHeight: Y_LABEL_FONT_SIZE,
    textAlign: "center",
  },
  xAxisLabels: {
    position: "absolute",
    bottom: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  xAxisLabelCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  xAxisPeriod: {
    fontSize: 10,
    lineHeight: X_FIRST_LINE_HEIGHT,
    color: AXIS_LABEL_COLOR,
    textAlign: "center",
  },
  xAxisYear: {
    fontSize: 10,
    lineHeight: 12,
    color: AXIS_LABEL_COLOR,
    textAlign: "center",
    marginTop: 1,
  },
  tooltip: {
    position: "absolute",
    alignItems: "center",
    zIndex: 10,
  },
  tooltipBubble: {
    backgroundColor: TOOLTIP_BG_COLOR,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(1.5),
  },
  tooltipText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: "600",
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: TOOLTIP_BG_COLOR,
  },
});
