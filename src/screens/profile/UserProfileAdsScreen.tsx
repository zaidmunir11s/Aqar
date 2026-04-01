import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Platform,
  ViewStyle,
  FlatList,
  ListRenderItem,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, STORAGE_KEYS } from "../../constants";
import {
  ScreenHeader,
  UserInfoCard,
  ProfileAdsTabs,
  ListingTypeSegmentFilter,
  PropertyCard,
} from "../../components";
import type { ProfileAdsTabKey } from "../../components/profile/ProfileAdsTabs";
import type { ListingTypeFilter } from "../../components/profile/ListingTypeSegmentFilter";
import { useLocalization, useTabNavigation } from "../../hooks";
import { getUserProfilePublishedAds } from "../../utils/publishedListingsStore";
import {
  formatProfileLastSeen,
  formatProfileSinceDate,
  getAccountProfileMeta,
  getLastActiveAtMs,
  syncAccountProfileMetaOnAuth,
  touchLastActiveAt,
} from "../../utils/accountActivityStorage";
import { buildProfileAdCardLines } from "../../utils/profileAdCard";
import type { Property } from "../../types/property";

type NavigationProp = NativeStackNavigationProp<any>;

export default function UserProfileAdsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { navigateToListings } = useTabNavigation();
  const { t, isRTL, i18n } = useLocalization();
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [userPhoneDigits, setUserPhoneDigits] = useState<string>("");
  const [listTick, setListTick] = useState(0);
  const [adsTab, setAdsTab] = useState<ProfileAdsTabKey>("current");
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingTypeFilter>(null);
  const [sinceDisplay, setSinceDisplay] = useState<string>("");
  const [lastSeenDisplay, setLastSeenDisplay] = useState<string>("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const [name, uri, phone] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.loggedInDisplayName),
            AsyncStorage.getItem(STORAGE_KEYS.loggedInProfileImageUri),
            AsyncStorage.getItem(STORAGE_KEYS.loggedInPhoneNumber),
          ]);
          const phoneDigits = (phone ?? "").replace(/\D/g, "");
          let meta = await getAccountProfileMeta();
          if (phoneDigits.length > 0 && !meta) {
            await syncAccountProfileMetaOnAuth(phoneDigits);
            meta = await getAccountProfileMeta();
          }
          const previousLastMs = await getLastActiveAtMs();
          await touchLastActiveAt();
          if (!active) return;
          setDisplayName(name?.trim() ?? "");
          setAvatarUri(uri && uri.length > 0 ? uri : null);
          setUserPhoneDigits(phoneDigits);

          const nowLabel = t("profile.now");
          if (meta && meta.phoneDigits === phoneDigits) {
            setSinceDisplay(formatProfileSinceDate(meta.createdAtMs, i18n.language));
          } else {
            setSinceDisplay(t("listings.notAvailable"));
          }
          const lastSeen =
            previousLastMs != null
              ? formatProfileLastSeen(previousLastMs, i18n.language, nowLabel)
              : nowLabel;
          setLastSeenDisplay(lastSeen);
        } catch {
          if (!active) return;
          setDisplayName("");
          setAvatarUri(null);
          setUserPhoneDigits("");
          setSinceDisplay(t("listings.notAvailable"));
          setLastSeenDisplay(t("profile.now"));
        } finally {
          if (active) setListTick((x) => x + 1);
        }
      })();
      return () => {
        active = false;
      };
    }, [t, i18n.language])
  );

  const { current, archived } = useMemo(
    () => getUserProfilePublishedAds(userPhoneDigits || null),
    [userPhoneDigits, listTick]
  );

  const baseList = adsTab === "current" ? current : archived;

  const filteredAds = useMemo(() => {
    if (listingTypeFilter == null) return baseList;
    return baseList.filter((p) => p.listingType === listingTypeFilter);
  }, [baseList, listingTypeFilter]);

  const headerTitleCount = current.length;

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSharePress = useCallback(() => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("Share pressed");
    }
  }, []);

  const handleMorePress = useCallback(() => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("More options pressed");
    }
  }, []);

  const handlePropertyPress = useCallback(
    (item: Property) => {
      navigateToListings("PropertyDetails", {
        propertyId: item.id,
        visiblePropertyIds: filteredAds.map((p) => p.id),
        listingType: item.listingType,
      });
    },
    [navigateToListings, filteredAds]
  );

  const renderItem: ListRenderItem<Property> = useCallback(
    ({ item }) => {
      const { title, priceLine, listingTypeForCard } = buildProfileAdCardLines(
        item,
        t,
        i18n.language
      );
      return (
        <View style={styles.cardRow}>
          <PropertyCard
            property={item}
            onPress={() => handlePropertyPress(item)}
            title={title || t("listings.property")}
            priceLine={priceLine || t("listings.priceNotAvailable")}
            listingType={listingTypeForCard}
          />
        </View>
      );
    },
    [t, i18n.language, handlePropertyPress]
  );

  const keyExtractor = useCallback((item: Property) => String(item.id), []);

  const rtlStyles = useMemo(
    () => ({
      rightIconsContainer: {
        flexDirection: isRTL ? "row-reverse" : "row",
      } as ViewStyle,
      profileName: {
        textAlign: (isRTL ? "right" : "center") as "center" | "right" | "left",
      },
      emptyText: {
        textAlign: (isRTL ? "right" : "center") as "center" | "right" | "left",
      },
    }),
    [isRTL]
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <View style={styles.profilePlaceholder}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatarFill}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("../../../assets/User.png")}
              style={styles.userImage}
              resizeMode="cover"
            />
          )}
        </View>
        {displayName.length > 0 ? (
          <Text style={[styles.profileName, rtlStyles.profileName]} numberOfLines={2}>
            {displayName}
          </Text>
        ) : null}
        <UserInfoCard sinceDate={sinceDisplay} lastSeen={lastSeenDisplay} />
        <ProfileAdsTabs
          activeTab={adsTab}
          onTabChange={setAdsTab}
          currentCount={current.length}
          archivedCount={archived.length}
        />
        <ListingTypeSegmentFilter value={listingTypeFilter} onChange={setListingTypeFilter} />
      </View>
    ),
    [
      avatarUri,
      displayName,
      rtlStyles.profileName,
      adsTab,
      current.length,
      archived.length,
      listingTypeFilter,
      sinceDisplay,
      lastSeenDisplay,
    ]
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t("profile.userProfileAdsTitle", { count: headerTitleCount })}
        onBackPress={handleBackPress}
        fontWeightBold={true}
        backButtonColor={COLORS.primary}
        rightComponent={
          <View style={[styles.rightIconsContainer, rtlStyles.rightIconsContainer]}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSharePress}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social" size={wp(6)} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleMorePress}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={wp(6)} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        }
        showRightSide={true}
      />
      <FlatList
        data={filteredAds}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <Text style={[styles.emptyText, rtlStyles.emptyText]}>
            {t("profile.noAdsFound")}
          </Text>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  rightIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
  iconButton: {
    padding: wp(1),
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
    flexGrow: 1,
  },
  listHeader: {
    alignItems: "center",
    paddingTop: hp(4),
    width: "100%",
  },
  profilePlaceholder: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    backgroundColor: COLORS.textTertiary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(1.5),
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  avatarFill: {
    width: "100%",
    height: "100%",
  },
  userImage: {
    width: "100%",
    height: "100%",
    bottom: wp(-3),
  },
  profileName: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(2),
    paddingHorizontal: wp(2),
    width: "100%",
    textAlign: "center",
  },
  cardRow: {
    width: "100%",
    marginBottom: hp(0.65),
  },
  emptyText: {
    marginTop: hp(3),
    fontSize: wp(4),
    color: COLORS.textSecondary,
    width: "100%",
    textAlign: "center",
  },
});
