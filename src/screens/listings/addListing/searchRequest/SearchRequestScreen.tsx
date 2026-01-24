import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { ScreenHeader } from "../../../../components";
import { COLORS } from "@/constants";
import { useSearchRequest } from "@/context/searchRequest-context";
import SearchRequestCard from "../../../../components/searchRequest/SearchRequestCard";
import { useLocalization } from "../../../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

export default function SearchRequestScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { requests, loadRequests, deleteRequest } = useSearchRequest();
  const { t, isRTL } = useLocalization();

  useFocusEffect(
    React.useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  const handleBackPress = () => {
    navigation.navigate("AddListing");
  };

  const handleNewOrderPress = () => {
    navigation.navigate("NewOrder");
  };

  const handleDelete = async (id: string) => {
    await deleteRequest(id);
  };

  const handleCardPress = (request: any, matchedCount: number) => {
    if (matchedCount > 0) {
      navigation.navigate("MatchedListings", { request });
    }
  };

  // RTL-aware styles (only apply RTL-specific changes, preserve LTR styling)
  const rtlStyles = useMemo(
    () => ({
      newOrderText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      emptyText: {
        textAlign: (isRTL ? "right" : "center") as "left" | "center" | "right",
      },
    }),
    [isRTL]
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <ScreenHeader
        title={t("listings.requests")}
        onBackPress={handleBackPress}
        showRightSide
        rightComponent={
          <TouchableOpacity
            onPress={handleNewOrderPress}
            activeOpacity={0.7}
            style={styles.newOrderButton}
          >
            <Text style={[styles.newOrderText, rtlStyles.newOrderText]}>
              + {t("listings.newOrder")}
            </Text>
          </TouchableOpacity>
        }
        fontWeightBold
        fontSize={wp(4.5)}
      />

      {/* CONTENT */}
      {requests.length === 0 ? (
        <View style={styles.content}>
          <Text style={[styles.emptyText, rtlStyles.emptyText]}>
            {t("listings.noPreviousOrders")}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {requests.map((request) => (
            <SearchRequestCard
              key={request.id}
              request={request}
              onDelete={handleDelete}
              onPress={handleCardPress}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  newOrderButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
  },
  newOrderText: {
    fontSize: wp(4),
    fontWeight: "600",
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: wp(5),
    paddingBottom: hp(3),
  },
  emptyText: {
    fontSize: wp(4),
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
