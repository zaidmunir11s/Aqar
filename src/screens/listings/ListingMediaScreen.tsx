import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ListRenderItemInfo,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenHeader from "../../components/common/ScreenHeader";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

export type ListingMediaRouteParams = {
  images: string[];
};

const IMAGE_ITEM_HEIGHT = hp(40);

function ListingMediaScreen(): React.JSX.Element {
  const route = useRoute();
  const navigation = useNavigation();
  const { t, isRTL } = useLocalization();

  const params = route.params as ListingMediaRouteParams | undefined;
  const images = params?.images ?? [];

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<string>) => (
      <View style={styles.imageItemContainer}>
        <Image
          source={{ uri: item }}
          style={styles.imageItem}
          resizeMode="cover"
        />
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: string, index: number) => `image-${index}`, []);

  const ListHeaderComponent = useCallback(
    () => (
      <View style={styles.imagesSectionHeader}>
        <Text style={[styles.imagesSectionTitle, isRTL && styles.imagesSectionTitleRTL]}>
          {t("listings.images")}
        </Text>
        <View style={styles.imagesSectionBorder} />
      </View>
    ),
    [t, isRTL]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: IMAGE_ITEM_HEIGHT + hp(2),
      offset: (IMAGE_ITEM_HEIGHT + hp(2)) * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
        <ScreenHeader
          title={t("listings.listingMedia")}
          onBackPress={handleBackPress}
          backButtonColor={COLORS.backButton}
        />

      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        showsVerticalScrollIndicator
        getItemLayout={images.length > 20 ? getItemLayout : undefined}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  imagesSectionHeader: {
    paddingBottom: hp(1.5),
  },
  imagesSectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: hp(1),
    textAlign: "center",
  },
  imagesSectionTitleRTL: {
    textAlign: "center",
  },
  imagesSectionBorder: {
    height: wp(1),
    backgroundColor: COLORS.primary,
    width: "100%",
  },
  imageItemContainer: {
    marginBottom: hp(2),
    borderRadius: wp(2),
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  imageItem: {
    width: "100%",
    height: IMAGE_ITEM_HEIGHT,
    borderRadius: wp(2),
  },
});

export default ListingMediaScreen;
