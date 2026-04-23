import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader } from "../../../../components";
import { COLORS } from "@/constants";
import { useLocalization } from "../../../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

type Mode = "photos" | "videos";

type RouteParams = {
  albumId: string;
  albumTitle: string;
  mode: Mode;
  selectedCategory?: string;
  attachments?: Array<{
    id: string;
    uri: string;
    mediaType?: "photo" | "video" | "unknown";
    note?: string;
  }>;
  virtualTourLink?: string;
};

const MAX_PHOTOS = 30;
const MAX_VIDEOS = 1;

export default function MarketingRequestAlbumAssetsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();

  const params = route.params as RouteParams;
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const maxAllowed = params.mode === "photos" ? MAX_PHOTOS : MAX_VIDEOS;
  const mediaType = useMemo(
    () =>
      params.mode === "photos"
        ? [MediaLibrary.MediaType.photo]
        : [MediaLibrary.MediaType.video],
    [params.mode]
  );

  useEffect(() => {
    let mounted = true;

    const loadAssets = async () => {
      const res = await MediaLibrary.getAssetsAsync({
        album: params.albumId,
        mediaType,
        first: 300,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
      if (mounted) {
        setAssets(res.assets);
      }
    };

    void loadAssets();
    return () => {
      mounted = false;
    };
  }, [mediaType, params.albumId]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleSelect = useCallback(
    (assetId: string) => {
      setSelectedIds((prev) => {
        const exists = prev.includes(assetId);
        if (exists) {
          return prev.filter((id) => id !== assetId);
        }
        if (prev.length >= maxAllowed) {
          return prev;
        }
        return [...prev, assetId];
      });
    },
    [maxAllowed]
  );

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedAssets = useMemo(() => {
    if (selectedIds.length === 0) return [];
    return assets.filter((asset) => selectedIdSet.has(asset.id));
  }, [assets, selectedIdSet, selectedIds.length]);

  const selectedIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    selectedIds.forEach((id, index) => map.set(id, index + 1));
    return map;
  }, [selectedIds]);

  const handleAttach = useCallback(() => {
    if (selectedAssets.length === 0) return;
    const existingAttachments = params.attachments ?? [];
    const newAttachments = selectedAssets.map((asset) => ({
      id: asset.id,
      uri: asset.uri,
      mediaType: asset.mediaType === "video" ? "video" : "photo",
    }));
    const mergedMap = new Map<string, { id: string; uri: string; mediaType: "photo" | "video" }>();
    [...existingAttachments, ...newAttachments].forEach((item) => {
      mergedMap.set(item.id, item as { id: string; uri: string; mediaType: "photo" | "video" });
    });
    const merged = Array.from(mergedMap.values());
    navigation.navigate("MarketingRequestAttachments", {
      selectedCategory: params.selectedCategory,
      attachments: merged,
      virtualTourLink: params.virtualTourLink,
      ...((params as any)?.deed ? { deed: (params as any).deed } : {}),
    });
  }, [navigation, params.attachments, params.selectedCategory, params.virtualTourLink, selectedAssets]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<MediaLibrary.Asset>) => {
      const badgeIndex = selectedIndexMap.get(item.id);
      const isSelected = typeof badgeIndex === "number";
      return (
        <TouchableOpacity
          style={styles.assetCell}
          onPress={() => toggleSelect(item.id)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: item.uri }} style={styles.assetImage} />
          {isSelected && (
            <View style={styles.selectionOverlay}>
              <View style={styles.selectionBadge}>
                <Text style={styles.selectionBadgeText}>{badgeIndex}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [selectedIndexMap, toggleSelect]
  );

  const keyExtractor = useCallback((item: MediaLibrary.Asset) => item.id, []);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={`${params.albumTitle} (${assets.length})`}
        onBackPress={handleBackPress}
        titleFontWeight="600"
        fontSize={wp(5)}
      />

      <FlatList
        data={assets}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={4}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + hp(1) }]}>
        <Text style={styles.footerText}>
          {params.mode === "photos"
            ? t("listings.addUpTo30Photos")
            : t("listings.addUpTo1Video")}
        </Text>
        <TouchableOpacity
          onPress={handleAttach}
          disabled={selectedAssets.length === 0}
          style={[
            styles.attachButton,
            selectedAssets.length === 0 && styles.attachButtonDisabled,
          ]}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.attachButtonText,
              selectedAssets.length === 0 && styles.attachButtonTextDisabled,
            ]}
          >
            {t("listings.attach")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gridContent: {
    paddingTop: hp(0.8),
    paddingBottom: hp(11),
  },
  gridRow: {
    gap: 1,
  },
  assetCell: {
    width: "25%",
    aspectRatio: 1,
    backgroundColor: "#dfe4e4",
  },
  assetImage: {
    width: "100%",
    height: "100%",
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.22)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: hp(0.6),
    paddingRight: wp(1.5),
  },
  selectionBadge: {
    width: wp(5.5),
    height: wp(5.5),
    borderRadius: wp(2.75),
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionBadgeText: {
    color: "#fff",
    fontSize: wp(3.1),
    fontWeight: "700",
    lineHeight: wp(3.8),
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: wp(4.4),
    marginRight: wp(3),
  },
  attachButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(2),
    minWidth: wp(30),
    height: hp(5.6),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(4),
  },
  attachButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  attachButtonText: {
    color: "#fff",
    fontSize: wp(4.8),
    fontWeight: "600",
  },
  attachButtonTextDisabled: {
    color: "#cfe7d6",
  },
});
