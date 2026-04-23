import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
  Image,
  Modal,
  Pressable,
  Linking,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
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

type AlbumWithCover = {
  album: MediaLibrary.Album;
  coverUri: string | null;
  modeCount: number;
};

export default function MarketingRequestAlbumsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { t, isRTL } = useLocalization();

  const params = (route.params ?? { mode: "photos" }) as RouteParams;
  const mode = params.mode;

  const [albums, setAlbums] = useState<AlbumWithCover[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const rtlStyles = useMemo(
    () => ({
      row: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      text: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      titleWrap: {
        alignItems: (isRTL ? "flex-end" : "flex-start") as
          | "flex-start"
          | "flex-end",
      },
      modalButtons: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      modalText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  const openSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePermissionLater = useCallback(() => {
    setShowPermissionModal(false);
    navigation.goBack();
  }, [navigation]);

  const handlePermissionOk = useCallback(async () => {
    setShowPermissionModal(false);
    await openSettings();
  }, [openSettings]);

  useEffect(() => {
    let mounted = true;

    const loadAlbums = async () => {
      setIsLoading(true);

      const perm = await MediaLibrary.getPermissionsAsync();
      if (!perm.granted) {
        const req = await MediaLibrary.requestPermissionsAsync();
        if (!req.granted) {
          if (mounted) setShowPermissionModal(true);
          if (mounted) setIsLoading(false);
          return;
        }
      }

      try {
        const list = await MediaLibrary.getAlbumsAsync({
          includeSmartAlbums: true,
        });
        const mapped: AlbumWithCover[] = await Promise.all(
          list.map(async (album) => {
            const assetsRes = await MediaLibrary.getAssetsAsync({
              album,
              first: 1,
              mediaType:
                mode === "photos"
                  ? [MediaLibrary.MediaType.photo]
                  : [MediaLibrary.MediaType.video],
              sortBy: [MediaLibrary.SortBy.creationTime],
            });
            const coverUri = assetsRes.assets[0]?.uri ?? null;
            return {
              album,
              coverUri,
              // totalCount here is for the selected media mode only
              modeCount: assetsRes.totalCount ?? 0,
            };
          })
        );
        if (mounted) {
          // Keep only albums that actually contain assets for the active mode.
          setAlbums(mapped.filter((entry) => entry.modeCount > 0));
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadAlbums();
    return () => {
      mounted = false;
    };
  }, [mode]);

  const handleAlbumPress = useCallback(
    (album: MediaLibrary.Album) => {
      navigation.navigate("MarketingRequestAlbumAssets", {
        albumId: album.id,
        albumTitle: album.title,
        mode,
        selectedCategory: params.selectedCategory,
        attachments: params.attachments ?? [],
        virtualTourLink: params.virtualTourLink,
        ...((params as any)?.deed ? { deed: (params as any).deed } : {}),
      });
    },
    [mode, navigation, params.attachments, params.selectedCategory, params.virtualTourLink]
  );

  const renderAlbum = useCallback(
    ({ item }: ListRenderItemInfo<AlbumWithCover>) => (
      <TouchableOpacity
        style={styles.albumCard}
        onPress={() => handleAlbumPress(item.album)}
        activeOpacity={0.85}
      >
        {item.coverUri ? (
          <Image source={{ uri: item.coverUri }} style={styles.albumImage} />
        ) : (
          <View style={styles.albumImagePlaceholder}>
            <Ionicons name="images" size={wp(8)} color={COLORS.textTertiary} />
          </View>
        )}
        <View style={[styles.albumTextWrap, rtlStyles.titleWrap]}>
          <Text style={[styles.albumTitle, rtlStyles.text]} numberOfLines={1}>
            {item.album.title} ({item.modeCount})
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [handleAlbumPress, rtlStyles.text, rtlStyles.titleWrap]
  );

  const keyExtractor = useCallback((item: AlbumWithCover) => item.album.id, []);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("listings.albums")}
        onBackPress={handleBackPress}
        titleFontWeight="600"
        fontSize={wp(5)}
      />

      <FlatList
        data={albums}
        keyExtractor={keyExtractor}
        renderItem={renderAlbum}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.column}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? null : (
            <Text style={styles.emptyText}>
              {mode === "videos"
                ? t("listings.noAlbumsFound")
                : t("listings.noAlbumsFound")}
            </Text>
          )
        }
      />

      <Modal
        transparent
        visible={showPermissionModal}
        animationType="fade"
        onRequestClose={handlePermissionLater}
      >
        <Pressable style={styles.permissionModalOverlay} onPress={handlePermissionLater}>
          <Pressable style={styles.permissionModalCard}>
            <Text style={[styles.permissionModalTitle, rtlStyles.modalText]}>
              {t("common.appName")}
            </Text>
            <Text style={[styles.permissionModalMessage, rtlStyles.modalText]}>
              {t("listings.mediaPermissionDeniedModal")}
            </Text>
            <View style={[styles.permissionModalButtons, rtlStyles.modalButtons]}>
              <TouchableOpacity
                style={styles.permissionModalButton}
                onPress={handlePermissionLater}
                activeOpacity={0.7}
              >
                <Text style={styles.permissionModalLaterText}>
                  {t("common.later")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.permissionModalButton}
                onPress={handlePermissionOk}
                activeOpacity={0.7}
              >
                <Text style={styles.permissionModalOkText}>{t("common.ok")}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(2),
    gap: hp(1.2),
  },
  column: {
    justifyContent: "space-between",
  },
  albumCard: {
    width: "48.6%",
    marginBottom: hp(1.2),
  },
  albumImage: {
    width: "100%",
    height: hp(15.5),
    borderRadius: wp(2.4),
    backgroundColor: "#dfe4e4",
  },
  albumImagePlaceholder: {
    width: "100%",
    height: hp(15.5),
    borderRadius: wp(2.4),
    backgroundColor: "#dfe4e4",
    alignItems: "center",
    justifyContent: "center",
  },
  albumTextWrap: {
    marginTop: hp(0.6),
  },
  albumTitle: {
    color: COLORS.textPrimary,
    fontSize: wp(5),
    fontWeight: "500",
  },
  emptyText: {
    paddingTop: hp(2),
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: wp(4),
  },
  permissionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
  },
  permissionModalCard: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: wp(2.5),
    paddingHorizontal: wp(5),
    paddingTop: hp(2.4),
    paddingBottom: hp(1.2),
  },
  permissionModalTitle: {
    fontSize: wp(5.1),
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: hp(1),
  },
  permissionModalMessage: {
    fontSize: wp(4.3),
    color: COLORS.textSecondary,
    lineHeight: hp(3.4),
    marginBottom: hp(2),
  },
  permissionModalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: wp(2),
  },
  permissionModalButton: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
  },
  permissionModalLaterText: {
    color: COLORS.textSecondary,
    fontSize: wp(4.3),
    fontWeight: "500",
  },
  permissionModalOkText: {
    color: COLORS.primary,
    fontSize: wp(4.3),
    fontWeight: "600",
  },
});
