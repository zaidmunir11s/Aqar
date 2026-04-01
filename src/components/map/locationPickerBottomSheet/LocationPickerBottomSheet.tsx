import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocalization } from "../../../hooks/useLocalization";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  Keyboard,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../../../constants";

interface LocationPickerBottomSheetProps {
  visible: boolean;
  title: string;
  searchPlaceholder: string;
  searchValue: string;
  options: string[];
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelect: (value: string) => void;
}

export default function LocationPickerBottomSheet({
  visible,
  title,
  searchPlaceholder,
  searchValue,
  options,
  onSearchChange,
  onClose,
  onSelect,
}: LocationPickerBottomSheetProps): React.JSX.Element {
  const { isRTL } = useLocalization();
  const insets = useSafeAreaInsets();
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const windowHeightRef = useRef(Dimensions.get("window").height);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const dimensionsSub = Dimensions.addEventListener("change", ({ window }) => {
      windowHeightRef.current = window.height;
    });

    const onShow = (event: any) => {
      const screenY = event?.endCoordinates?.screenY;
      const eventHeight = event?.endCoordinates?.height;
      const overlapFromScreenY =
        typeof screenY === "number" ? Math.max(0, windowHeightRef.current - screenY) : 0;
      const overlapFromHeight = typeof eventHeight === "number" ? Math.max(0, eventHeight) : 0;
      const overlapFromMetrics = Keyboard.metrics?.()?.height ?? 0;
      const keyboardHeight = Math.max(overlapFromScreenY, overlapFromHeight, overlapFromMetrics);
      const compensatedHeight = keyboardHeight + (Platform.OS === "android" ? insets.bottom : 0);
      setIsKeyboardVisible(true);
      Animated.timing(keyboardOffset, {
        toValue: compensatedHeight,
        duration: event?.duration ?? 250,
        useNativeDriver: false,
      }).start();
    };

    const onHide = (event: any) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: event?.duration ?? 250,
        useNativeDriver: false,
      }).start(() => setIsKeyboardVisible(false));
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      dimensionsSub.remove();
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom, keyboardOffset]);

  const bottomPadding = useMemo(
    () => (isKeyboardVisible ? hp(1) : insets.bottom + hp(1)),
    [insets.bottom, isKeyboardVisible]
  );

  const rtlStyles = useMemo(
    () => ({
      header: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      headerTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      searchWrap: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      searchInput: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
      listItemText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      },
    }),
    [isRTL]
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.sheet, { marginBottom: keyboardOffset, paddingBottom: bottomPadding }]}>
          <View style={[styles.header, rtlStyles.header]}>
            <TouchableOpacity onPress={onClose} style={styles.headerIconButton}>
              <Ionicons
                name={isRTL ? "arrow-forward" : "arrow-back"}
                size={wp(5)}
                color={COLORS.primary}
              />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, rtlStyles.headerTitle]}>{title}</Text>
          </View>

          <View style={[styles.searchWrap, rtlStyles.searchWrap]}>
            <TextInput
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder={searchPlaceholder}
              placeholderTextColor={COLORS.textTertiary}
              style={[styles.searchInput, rtlStyles.searchInput]}
            />
            {searchValue ? (
              <TouchableOpacity onPress={() => onSearchChange("")} style={styles.searchAction}>
                <Ionicons name="close" size={wp(5)} color="#6b7280" />
              </TouchableOpacity>
            ) : null}
            <Ionicons name="search" size={wp(5)} color={COLORS.primary} />
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
              <View>
                <TouchableOpacity style={styles.listItem} activeOpacity={0.75} onPress={() => onSelect(item)}>
                  <Text style={[styles.listItemText, rtlStyles.listItemText]}>{item}</Text>
                </TouchableOpacity>
                {index < options.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            )}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    height: hp(45),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(5.5),
    paddingTop: hp(1),
    paddingBottom: hp(0.6),
  },
  headerIconButton: {
    padding: wp(0.5),
  },
  headerTitle: {
    flex: 1,
    fontSize: wp(4.5),
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginStart: wp(2),
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: wp(2),
    marginHorizontal: wp(5.5),
    marginTop: hp(1),
    marginBottom: hp(1),
    paddingHorizontal: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: wp(4.2),
    color: COLORS.textPrimary,
    minHeight: hp(5),
  },
  searchAction: {
    padding: wp(1),
    marginHorizontal: wp(0.6),
  },
  listContent: {
    paddingBottom: hp(2.5),
    paddingTop: hp(0.4),
  },
  listItem: {
    paddingVertical: hp(1.75),
    paddingHorizontal: wp(5.5),
  },
  listItemText: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
