import React, {
  memo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Dimensions,
  FlatList,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  interpolate,
  interpolateColor,
  Extrapolation,
  runOnJS,
  SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface WheelPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  title: string;
  options: string[];
  initialValue?: string;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const PickerItem = memo(
  ({
    item,
    index,
    scrollY,
    isRTL,
  }: {
    item: string;
    index: number;
    scrollY: SharedValue<number>;
    isRTL: boolean;
  }) => {
    const animStyle = useAnimatedStyle(() => {
      const center = index * ITEM_HEIGHT;
      const input = [
        center - 2 * ITEM_HEIGHT,
        center - ITEM_HEIGHT,
        center,
        center + ITEM_HEIGHT,
        center + 2 * ITEM_HEIGHT,
      ];
      const scale = interpolate(
        scrollY.value,
        input,
        [0.82, 0.9, 1.12, 0.9, 0.82],
        Extrapolation.CLAMP,
      );
      const opacity = interpolate(
        scrollY.value,
        input,
        [0.2, 0.45, 1, 0.45, 0.2],
        Extrapolation.CLAMP,
      );
      return { opacity, transform: [{ scale }] };
    });

    const colorStyle = useAnimatedStyle(() => {
      const center = index * ITEM_HEIGHT;
      const input = [center - ITEM_HEIGHT, center, center + ITEM_HEIGHT];
      const color = interpolateColor(scrollY.value, input, [
        COLORS.textSecondary,
        COLORS.primary,
        COLORS.textSecondary,
      ]);
      return { color };
    });

    return (
      <View style={styles.itemContainer}>
        <Animated.Text
          style={[
            styles.itemText,
            isRTL ? styles.itemTextRtl : null,
            animStyle,
            colorStyle,
          ]}
        >
          {item}
        </Animated.Text>
      </View>
    );
  },
);

PickerItem.displayName = "PickerItem";

const WheelPickerModal = memo<WheelPickerModalProps>(
  ({ visible, onClose, onSelect, title, options, initialValue }) => {
    const { t, isRTL } = useLocalization();

    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollY = useSharedValue(0);
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const flatListRef = useRef<any>(null);
    /** Prevents scroll/index resets while the sheet is open (avoids flicker when parent re-renders). */
    const wasVisibleRef = useRef(false);

    const indexFromProps = useMemo(() => {
      if (initialValue && options.length > 0) {
        const idx = options.indexOf(initialValue);
        return idx >= 0 ? idx : 0;
      }
      return 0;
    }, [initialValue, options]);

    const headerRtlStyles = useMemo(
      () => ({
        pickerHeader: {
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        pickerHeaderText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
          writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
          marginLeft: isRTL ? 0 : wp(2),
          marginRight: isRTL ? wp(2) : 0,
        },
        okButtonText: {
          textAlign: (isRTL ? "right" : "left") as "left" | "right",
          writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
        },
      }),
      [isRTL],
    );

    useEffect(() => {
      if (!visible) {
        wasVisibleRef.current = false;
        translateY.value = SCREEN_HEIGHT;
        setSelectedIndex(indexFromProps);
        return;
      }

      if (wasVisibleRef.current) {
        return;
      }
      wasVisibleRef.current = true;

      const idx = indexFromProps;
      setSelectedIndex(idx);
      scrollY.value = idx * ITEM_HEIGHT;
      translateY.value = withTiming(0, { duration: 260 });

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({
          offset: idx * ITEM_HEIGHT,
          animated: false,
        });
      });
    }, [visible, indexFromProps, scrollY, translateY]);

    const handleClose = useCallback(() => {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 220 });
      setTimeout(onClose, 240);
    }, [onClose, translateY]);

    const handleOk = useCallback(() => {
      onSelect(options[selectedIndex]);
      handleClose();
    }, [options, selectedIndex, onSelect, handleClose]);

    const updateIndex = useCallback((idx: number) => setSelectedIndex(idx), []);

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollY.value = event.contentOffset.y;
      },
      onMomentumEnd: (event) => {
        const idx = Math.round(event.contentOffset.y / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(idx, options.length - 1));
        runOnJS(updateIndex)(clamped);
      },
    });

    const sheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const keyExtractor = useCallback(
      (item: string, i: number) => `${item}-${i}`,
      [],
    );

    const renderItem = useCallback(
      ({ item, index }: { item: string; index: number }) => (
        <PickerItem item={item} index={index} scrollY={scrollY} isRTL={isRTL} />
      ),
      [scrollY, isRTL],
    );

    const getItemLayout = useCallback(
      (_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      }),
      [],
    );

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleClose} />
          <Animated.View style={[styles.pickerContainer, sheetStyle]}>
            <View style={[styles.pickerHeader, headerRtlStyles.pickerHeader]}>
              <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                <Ionicons
                  name={isRTL ? "arrow-forward" : "arrow-back"}
                  size={wp(6)}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.pickerHeaderText,
                  headerRtlStyles.pickerHeaderText,
                ]}
              >
                {title}
              </Text>
              <TouchableOpacity style={styles.okButton} onPress={handleOk}>
                <Text
                  style={[styles.okButtonText, headerRtlStyles.okButtonText]}
                >
                  {t("common.confirm")}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.wheelWrapper,
                isRTL && styles.wheelWrapperForceLtr,
              ]}
            >
              <Animated.FlatList
                ref={flatListRef}
                data={options}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                bounces={false}
                contentContainerStyle={{
                  paddingVertical: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
                }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                removeClippedSubviews={false}
                maxToRenderPerBatch={15}
                initialNumToRender={15}
                windowSize={5}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

WheelPickerModal.displayName = "WheelPickerModal";

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    paddingBottom: hp(3),
    maxHeight: hp(60),
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp(4),
    paddingBottom: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: wp(1),
  },
  pickerHeaderText: {
    flex: 1,
    flexShrink: 1,
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#111827",
    marginHorizontal: wp(2),
  },
  okButton: {
    backgroundColor: COLORS.okButton,
    paddingVertical: hp(1.2),
    borderRadius: wp(4),
    paddingHorizontal: wp(3),
  },
  okButtonText: {
    color: "#ffffff",
    fontSize: wp(4.5),
    fontWeight: "600",
  },
  wheelWrapper: {
    height: PICKER_HEIGHT,
  },
  /** Keeps scroll offset / first item aligned when app language is RTL but layout isn’t fully mirrored. */
  wheelWrapperForceLtr: {
    direction: "ltr",
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
  },
  itemText: {
    textAlign: "center",
    fontSize: wp(4.5),
    fontWeight: "600",
  },
  itemTextRtl: {
    writingDirection: "rtl",
  },
});

export default WheelPickerModal;
