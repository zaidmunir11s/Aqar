import { useMemo, useCallback } from "react";
import { PanResponder } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getPropertyById } from "../utils";
import { calculateDays } from "../utils";
import type { CalendarDates } from "./useCalendar";
import type { DailyProperty } from "../types/property";

export interface UsePropertyDetailNavigationParams {
  propertyId: number;
  visiblePropertyIds: number[];
  /** Dates used to filter visible properties (e.g. for minimum nights). Pass null to skip date filtering. */
  dates: CalendarDates | null | undefined;
  listingType?: string;
  navigation: NativeStackNavigationProp<any>;
  /** When provided, included as selectedDates in replace params (PropertyDetails). Omit for DailyDetail. */
  selectedDatesForReplace?: CalendarDates | null;
  /**
   * If true, pass filteredVisiblePropertyIds as visiblePropertyIds in replace.
   * If false, pass the original visiblePropertyIds. Default: true.
   */
  useFilteredIdsForReplace?: boolean;
}

/**
 * Shared hook for PropertyDetailsScreen and DailyDetailScreen:
 * - Filtered visible property IDs (based on dates + minimum nights)
 * - Prev/next property navigation
 * - PanResponder for swipe between properties
 */
export function usePropertyDetailNavigation({
  propertyId,
  visiblePropertyIds,
  dates,
  listingType,
  navigation,
  selectedDatesForReplace,
  useFilteredIdsForReplace = true,
}: UsePropertyDetailNavigationParams) {
  const filteredVisiblePropertyIds = useMemo(() => {
    if (!dates?.startDate || !dates?.endDate) {
      return visiblePropertyIds;
    }

    const days = calculateDays(dates.startDate, dates.endDate);

    return visiblePropertyIds.filter((id) => {
      const prop = getPropertyById(id);
      if (!prop || prop.listingType !== "daily") {
        return true;
      }

      const dailyProp = prop as DailyProperty;
      if (dailyProp.bookingType === "monthly") {
        return days >= 30;
      }
      if (dailyProp.bookingType === "daily") {
        return days >= 1;
      }
      return true;
    });
  }, [visiblePropertyIds, dates?.startDate, dates?.endDate]);

  const currentPropertyIndex = useMemo(() => {
    if (!filteredVisiblePropertyIds || filteredVisiblePropertyIds.length === 0)
      return -1;
    return filteredVisiblePropertyIds.indexOf(propertyId);
  }, [filteredVisiblePropertyIds, propertyId]);

  const hasNavigation = currentPropertyIndex >= 0;
  const canGoPrev = hasNavigation && currentPropertyIndex > 0;
  const canGoNext =
    hasNavigation &&
    currentPropertyIndex < filteredVisiblePropertyIds.length - 1;

  const idsForReplace = useFilteredIdsForReplace
    ? filteredVisiblePropertyIds
    : visiblePropertyIds;

  const handlePrevProperty = useCallback(() => {
    if (!canGoPrev) return;
    const prevPropertyId = filteredVisiblePropertyIds[currentPropertyIndex - 1];
    const prevProperty = getPropertyById(prevPropertyId);
    const screenName =
      prevProperty?.listingType === "daily" ? "DailyDetails" : "PropertyDetails";
    navigation.replace(screenName, {
      propertyId: prevPropertyId,
      visiblePropertyIds: idsForReplace,
      listingType,
      ...(selectedDatesForReplace && { selectedDates: selectedDatesForReplace }),
    });
  }, [
    canGoPrev,
    currentPropertyIndex,
    filteredVisiblePropertyIds,
    idsForReplace,
    listingType,
    navigation,
    selectedDatesForReplace,
  ]);

  const handleNextProperty = useCallback(() => {
    if (!canGoNext) return;
    const nextPropertyId = filteredVisiblePropertyIds[currentPropertyIndex + 1];
    const nextProperty = getPropertyById(nextPropertyId);
    const screenName =
      nextProperty?.listingType === "daily" ? "DailyDetails" : "PropertyDetails";
    navigation.replace(screenName, {
      propertyId: nextPropertyId,
      visiblePropertyIds: idsForReplace,
      listingType,
      ...(selectedDatesForReplace && { selectedDates: selectedDatesForReplace }),
    });
  }, [
    canGoNext,
    currentPropertyIndex,
    filteredVisiblePropertyIds,
    idsForReplace,
    listingType,
    navigation,
    selectedDatesForReplace,
  ]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const { dx, dy } = gestureState;
          return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
        },
        onPanResponderRelease: (_, gestureState) => {
          const { dx, vx } = gestureState;
          const swipeThreshold = 50;
          const velocityThreshold = 0.3;

          if (dx > swipeThreshold || vx > velocityThreshold) {
            if (canGoPrev) handlePrevProperty();
          } else if (dx < -swipeThreshold || vx < -velocityThreshold) {
            if (canGoNext) handleNextProperty();
          }
        },
      }),
    [canGoPrev, canGoNext, handlePrevProperty, handleNextProperty]
  );

  return {
    filteredVisiblePropertyIds,
    currentPropertyIndex,
    canGoPrev,
    canGoNext,
    handlePrevProperty,
    handleNextProperty,
    panResponder,
  };
}
