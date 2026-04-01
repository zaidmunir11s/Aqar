import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  LayoutChangeEvent,
  PanResponder,
  GestureResponderEvent,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "@/constants";
import { useLocalization } from "@/hooks/useLocalization";

export interface SliderWithInputProps {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  max: number;
}

const SLIDER_THUMB_WIDTH = wp(3.5);
const SLIDER_TRACK_HEIGHT = 2;

/** Above this max, parent updates are coalesced to one per frame during drag (reduces form re-render flicker, e.g. street width 0–100). */
const HEAVY_SLIDER_MAX = 30;

/** Ignore a second grant at ~same spot shortly after release (double-tap / duplicate touch). */
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_MAX_DX = 22;

export default function SliderWithInput({
  label,
  value,
  onChangeValue,
  max,
}: SliderWithInputProps): React.JSX.Element {
  const { isRTL } = useLocalization();
  const [focused, setFocused] = useState(false);
  /** While dragging a heavy slider, thumb/input follow this until release (parent value may update slower). */
  const [panTransient, setPanTransient] = useState<number | null>(null);

  const trackWidthRef = useRef(1);
  const maxRef = useRef(max);
  const isRTLRef = useRef(isRTL);
  const onChangeValueRef = useRef(onChangeValue);
  const dragStartRef = useRef({ pageX: 0, startRatio: 0 });
  const rafRef = useRef<number | null>(null);
  const latestPanRef = useRef(0);
  const isPanningRef = useRef(false);
  const lastGestureEndRef = useRef({ time: 0, pageX: 0 });
  const setPanTransientRef = useRef(setPanTransient);
  setPanTransientRef.current = setPanTransient;

  maxRef.current = max;
  isRTLRef.current = isRTL;
  onChangeValueRef.current = onChangeValue;

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const cancelScheduledEmit = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const scheduleHeavyEmit = (next: number) => {
    latestPanRef.current = next;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const v = latestPanRef.current;
      setPanTransientRef.current(v);
      onChangeValueRef.current(v);
    });
  };

  const endPan = (evt?: GestureResponderEvent) => {
    if (evt?.nativeEvent != null) {
      lastGestureEndRef.current = {
        time: Date.now(),
        pageX: evt.nativeEvent.pageX,
      };
    }
    cancelScheduledEmit();
    if (maxRef.current > HEAVY_SLIDER_MAX && isPanningRef.current) {
      onChangeValueRef.current(latestPanRef.current);
    }
    isPanningRef.current = false;
    setPanTransientRef.current(null);
  };

  const onTrackLayout = (e: LayoutChangeEvent) => {
    trackWidthRef.current = Math.max(1, e.nativeEvent.layout.width);
  };

  const thumbPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          if (isPanningRef.current) return;
          const now = Date.now();
          const x = evt.nativeEvent.pageX;
          const last = lastGestureEndRef.current;
          if (
            last.time > 0 &&
            now - last.time < DOUBLE_TAP_MS &&
            Math.abs(x - last.pageX) < DOUBLE_TAP_MAX_DX
          ) {
            return;
          }
          const tw = trackWidthRef.current;
          if (tw <= 0) return;
          const ratioRaw = evt.nativeEvent.locationX / tw;
          const ratio = isRTLRef.current
            ? Math.max(0, Math.min(1, 1 - ratioRaw))
            : Math.max(0, Math.min(1, ratioRaw));
          const next = Math.round(ratio * maxRef.current);
          dragStartRef.current = {
            pageX: evt.nativeEvent.pageX,
            startRatio: ratio,
          };
          isPanningRef.current = true;
          cancelScheduledEmit();
          latestPanRef.current = next;
          if (maxRef.current > HEAVY_SLIDER_MAX) {
            setPanTransientRef.current(next);
            onChangeValueRef.current(next);
          } else {
            setPanTransientRef.current(null);
            onChangeValueRef.current(next);
          }
        },
        onPanResponderMove: (evt) => {
          if (!isPanningRef.current) return;
          const tw = trackWidthRef.current;
          if (tw <= 0) return;
          const dx = evt.nativeEvent.pageX - dragStartRef.current.pageX;
          const deltaRatio = (dx / tw) * (isRTLRef.current ? -1 : 1);
          const ratio = Math.max(
            0,
            Math.min(1, dragStartRef.current.startRatio + deltaRatio)
          );
          const next = Math.round(ratio * maxRef.current);
          if (maxRef.current > HEAVY_SLIDER_MAX) {
            scheduleHeavyEmit(next);
          } else {
            onChangeValueRef.current(next);
          }
        },
        onPanResponderRelease: (e) => endPan(e),
        onPanResponderTerminate: (e) => endPan(e),
      }),
    []
  );

  const displayValue = panTransient !== null ? panTransient : value;
  const percent = max <= 0 ? 0 : (displayValue / max) * 100;
  const thumbLeftPct = isRTL ? 100 - percent : percent;

  const rtlStyles = useMemo(
    () => ({
      label: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      row: {
        flexDirection: (isRTL
          ? "row-reverse"
          : "row") as "row" | "row-reverse",
      },
      trackFill: isRTL
        ? ({ right: 0, left: undefined } as const)
        : ({ left: 0, right: undefined } as const),
    }),
    [isRTL]
  );

  return (
    <View style={styles.section}>
      <Text style={[styles.label, rtlStyles.label]}>{label}</Text>

      <View style={[styles.row, rtlStyles.row]}>
        <View
          style={styles.trackArea}
          onLayout={onTrackLayout}
          {...thumbPanResponder.panHandlers}
        >
          <View style={styles.track} />
          <View
            style={[
              styles.trackFill,
              rtlStyles.trackFill,
              { width: `${percent}%` },
            ]}
          />
          <View
            style={[
              styles.thumb,
              {
                left: `${thumbLeftPct}%`,
                marginLeft: -SLIDER_THUMB_WIDTH / 2,
              },
            ]}
          />
        </View>

        <TextInput
          style={[styles.input, focused && styles.inputFocused]}
          keyboardType="number-pad"
          value={`${displayValue}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChangeText={(text) => {
            setPanTransient(null);
            const nextRaw = Number(text.replace(/[^\d]/g, ""));
            if (Number.isNaN(nextRaw)) return onChangeValue(0);
            const next = Math.max(0, Math.min(max, nextRaw));
            onChangeValue(next);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: wp(3.8),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(0.8),
  },
  row: {
    alignItems: "center",
    gap: wp(2.5),
  },
  trackArea: {
    flex: 1,
    height: hp(4),
    justifyContent: "center",
  },
  track: {
    height: SLIDER_TRACK_HEIGHT,
    backgroundColor: COLORS.border,
    borderRadius: 1,
  },
  trackFill: {
    position: "absolute",
    height: SLIDER_TRACK_HEIGHT,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
  thumb: {
    position: "absolute",
    width: SLIDER_THUMB_WIDTH,
    height: SLIDER_THUMB_WIDTH,
    borderRadius: wp(1.75),
    backgroundColor: COLORS.primary,
  },
  input: {
    width: wp(13),
    height: hp(4.2),
    textAlign: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(1.5),
    backgroundColor: COLORS.white,
    fontSize: wp(3.8),
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.activeChipBackground,
  },
});
