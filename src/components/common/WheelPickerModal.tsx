import React, { memo, useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../constants";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface WheelPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  title: string;
  options: string[];
  initialValue?: string;
}

// Constants for picker dimensions
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

/**
 * Wheel picker modal with smooth scrolling for option selection
 */
const WheelPickerModal = memo<WheelPickerModalProps>(
  ({ visible, onClose, onSelect, title, options, initialValue }) => {
    const [selectedIndex, setSelectedIndex] = useState(() => {
      if (initialValue) {
        const index = options.findIndex((opt) => opt === initialValue);
        return index >= 0 ? index : 0;
      }
      return 0;
    });

    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<any>(null);

    // Initialize scroll position when modal opens
    useEffect(() => {
      if (visible) {
        // Animate modal slide up
        Animated.timing(translateY, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }).start();

        // Scroll to initial value
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
              index: selectedIndex,
              animated: false,
            });
          }
        }, 100);
      } else {
        translateY.setValue(SCREEN_HEIGHT);
      }
    }, [visible, selectedIndex, translateY]);

    const handleClose = () => {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    };

    const handleOk = useCallback(() => {
      onSelect(options[selectedIndex]);
      handleClose();
    }, [options, selectedIndex, onSelect, handleClose]);

    const keyExtractor = useCallback((item: string, i: number) => `${item}-${i}`, []);

    const renderItem = useCallback(
      ({ item, index }: { item: string; index: number }) => {
        const inputRange = [
          (index - 2) * ITEM_HEIGHT,
          (index - 1) * ITEM_HEIGHT,
          index * ITEM_HEIGHT,
          (index + 1) * ITEM_HEIGHT,
          (index + 2) * ITEM_HEIGHT,
        ];

        const scale = scrollY.interpolate({
          inputRange,
          outputRange: [0.85, 0.92, 1.1, 0.92, 0.85],
          extrapolate: "clamp",
        });

        const opacity = scrollY.interpolate({
          inputRange,
          outputRange: [0.25, 0.5, 1, 0.5, 0.25],
          extrapolate: "clamp",
        });

        // Color interpolation: center item gets primary color, others get textSecondary
        const color = scrollY.interpolate({
          inputRange,
          outputRange: [
            COLORS.textSecondary,
            COLORS.textSecondary,
            COLORS.primary,
            COLORS.textSecondary,
            COLORS.textSecondary,
          ],
          extrapolate: "clamp",
        });

        return (
          <View style={{ height: ITEM_HEIGHT, justifyContent: "center" }}>
            <Animated.Text
              style={[
                styles.itemText,
                { opacity, transform: [{ scale }], color },
              ]}
            >
              {item}
            </Animated.Text>
          </View>
        );
      },
      [scrollY]
    );

    const getItemLayout = useCallback(
      (_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      }),
      []
    );

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleClose} />
          <Animated.View
            style={[
              styles.pickerContainer,
              { transform: [{ translateY }] },
            ]}
          >
            {/* HEADER */}
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                <Ionicons name="arrow-back" size={wp(6)} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.pickerHeaderText}>{title}</Text>
              <TouchableOpacity style={styles.okButton} onPress={handleOk}>
                <Text style={styles.okButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>

            {/* WHEEL */}
            <View style={styles.wheelWrapper}>
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
                paddingVertical:
                  (ITEM_HEIGHT * VISIBLE_ITEMS) / 2 - ITEM_HEIGHT / 2,
              }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.y / ITEM_HEIGHT
                );
                const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
                setSelectedIndex(clampedIndex);
              }}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              initialNumToRender={10}
              windowSize={5}
            />
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }
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
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#111827",
    marginHorizontal: wp(2),
  },
  okButton: {
    backgroundColor: COLORS.okButton,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    borderRadius: wp(4),
  },
  okButtonText: {
    color: "#ffffff",
    fontSize: wp(4.5),
    fontWeight: "600",
  },
  wheelWrapper: {
    height: PICKER_HEIGHT,
    position: "relative",
  },
  itemText: {
    textAlign: "center",
    fontSize: wp(4.5),
    fontWeight: "600",
  },
});

export default WheelPickerModal;
