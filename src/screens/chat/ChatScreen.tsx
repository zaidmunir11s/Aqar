import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Platform,
  Image,
  BackHandler,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader } from "../../components";
import { navigateToListingsMapFromOtherTab } from "../../utils";
import { COLORS } from "../../constants";
import {
  MOCK_CONVERSATIONS,
  getUserName,
  getUserAvatar,
  isAdminUser,
} from "../../data/chatData";
import type { ChatConversation } from "../../types/chat";
import { useLocalization, useTabNavigation } from "../../hooks";

type NavigationProp = NativeStackNavigationProp<any>;

// Format time for last message - show year/month/day and time
const formatLastMessageTime = (
  date: Date | number | undefined,
  isRTL: boolean,
): string => {
  if (!date) return "";
  const d = typeof date === "number" ? new Date(date) : date;

  // Format date and time components
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  const datePart = `${year}/${month}/${day}`;
  const timePart = `${hours}:${minutes}`;

  // In RTL, show time first, then date (HH:MM YYYY/MM/DD)
  // In LTR, show date first, then time (YYYY/MM/DD HH:MM)
  const dateStr = isRTL ? `${timePart} ${datePart}` : `${datePart} ${timePart}`;

  // Convert Arabic-Indic numerals to Western numerals for RTL
  if (isRTL) {
    return dateStr.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
  }

  return dateStr;
};

interface ChatListItemProps {
  conversation: ChatConversation;
  onPress: (conversation: ChatConversation) => void;
  isLast?: boolean;
}

const ChatListItem = React.memo<ChatListItemProps>(function ChatListItem({
  conversation,
  onPress,
  isLast = false,
}) {
  const { t, isRTL } = useLocalization();
  const avatar = conversation.userAvatar || getUserAvatar(conversation.userId);

  const rtlStyles = useMemo(
    () => ({
      chatItem: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      avatarContainer: {
        marginRight: isRTL ? 0 : wp(3),
        marginLeft: isRTL ? wp(3) : 0,
      },
      chatHeader: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      chatName: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      chatTime: {
        marginLeft: isRTL ? 0 : wp(2),
        marginRight: isRTL ? wp(2) : 0,
      },
      chatLastMessage: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      unreadBadge: {
        marginLeft: isRTL ? 0 : wp(2),
        marginRight: isRTL ? wp(2) : 0,
      },
    }),
    [isRTL],
  );

  return (
    <TouchableOpacity
      style={[
        styles.chatItem,
        isLast && styles.chatItemLast,
        rtlStyles.chatItem,
      ]}
      onPress={() => onPress(conversation)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatarContainer, rtlStyles.avatarContainer]}>
        {avatar ? (
          <Image
            source={typeof avatar === "string" ? { uri: avatar } : avatar}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="person" size={wp(6)} color={COLORS.textTertiary} />
        )}
      </View>
      <View style={styles.chatContent}>
        <View style={[styles.chatHeader, rtlStyles.chatHeader]}>
          <Text style={[styles.chatName, rtlStyles.chatName]} numberOfLines={1}>
            {(() => {
              // For admin, always show Arabic name
              if (isAdminUser(conversation.userId)) {
                return "تطبيق العقارات";
              }
              // For others, use stored name - no translation
              return conversation.userName || "Unknown";
            })()}
          </Text>
          {conversation.lastMessageTime ? (
            <Text style={[styles.chatTime, rtlStyles.chatTime]}>
              {formatLastMessageTime(conversation.lastMessageTime, isRTL)}
            </Text>
          ) : null}
        </View>
        {conversation.lastMessage ? (
          <Text
            style={[styles.chatLastMessage, rtlStyles.chatLastMessage]}
            numberOfLines={1}
          >
            {conversation.lastMessage}
          </Text>
        ) : null}
      </View>
      {conversation.unreadCount && conversation.unreadCount > 0 ? (
        <View style={[styles.unreadBadge, rtlStyles.unreadBadge]}>
          <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
});

export default function ChatScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { navigateToChat } = useTabNavigation();
  const { t } = useLocalization();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  // Load and filter conversations that have messages (no mutation of source data)
  const loadConversations = useCallback(() => {
    const filtered = MOCK_CONVERSATIONS.filter(
      (conv) => conv.lastMessage && conv.lastMessage.trim().length > 0,
    );
    // Map to new objects with userName set - never mutate MOCK_CONVERSATIONS
    const withNames = filtered.map((conv) => {
      let userName = conv.userName;
      if (isAdminUser(conv.userId)) {
        userName = "تطبيق العقارات";
      } else if (!userName || userName === "Property Owner") {
        const nameFromUsers = getUserName(conv.userId);
        userName =
          nameFromUsers && nameFromUsers !== "Property Owner"
            ? nameFromUsers
            : "Property Owner";
      }
      return { ...conv, userName };
    });
    // Sort by last message time (newest first)
    const sorted = [...withNames].sort((a, b) => {
      if (!a.lastMessageTime || !b.lastMessageTime) return 0;
      const timeA =
        typeof a.lastMessageTime === "number"
          ? a.lastMessageTime
          : a.lastMessageTime.getTime();
      const timeB =
        typeof b.lastMessageTime === "number"
          ? b.lastMessageTime
          : b.lastMessageTime.getTime();
      return timeB - timeA; // Newest first
    });
    setConversations(sorted);
  }, []);

  // Load conversations on mount and when screen comes into focus
  useEffect(() => {
    loadConversations();
    const unsubscribe = navigation.addListener("focus", () => {
      loadConversations();
    });
    return unsubscribe;
  }, [navigation, loadConversations]);

  const handleBackPress = useCallback(() => {
    // Switch to Listings tab and pop to map (MapLanding) without resetting map state,
    // same approach as AddListingScreen close button / navigateToMapScreen
    navigateToListingsMapFromOtherTab(navigation);
    return true; // Prevent default back behavior
  }, [navigation]);

  // Handle mobile back button to always go to Listings
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true; // Prevent default back behavior
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => backHandler.remove();
    }, [handleBackPress]),
  );

  const handleChatPress = useCallback(
    (conversation: ChatConversation) => {
      navigateToChat("Conversation", {
        conversationId: conversation.id,
        propertyId: conversation.propertyId,
        advertiserName: conversation.userName,
        advertiserId: conversation.userId,
      });
    },
    [navigateToChat],
  );

  const renderChatItem = useCallback(
    ({ item, index }: { item: ChatConversation; index: number }) => (
      <ChatListItem
        conversation={item}
        onPress={handleChatPress}
        isLast={index === conversations.length - 1}
      />
    ),
    [handleChatPress, conversations.length],
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="chatbubbles-outline"
          size={wp(15)}
          color={COLORS.textTertiary}
        />
        <Text style={styles.emptyText}>{t("chat.noConversationsYet")}</Text>
        <Text style={styles.emptySubtext}>
          {t("chat.startChatFromProperty")}
        </Text>
      </View>
    ),
    [t],
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title={t("chat.title")} onBackPress={handleBackPress} />
      <FlatList
        data={conversations}
        renderItem={renderChatItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          conversations.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingTop: hp(1),
    paddingBottom: hp(1),
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatItemLast: {
    borderBottomWidth: 0,
  },
  avatarContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  chatName: {
    fontSize: wp(4),
    fontWeight: "600",
    color: COLORS.primary,
    flex: 1,
  },
  chatTime: {
    fontSize: wp(3),
    color: COLORS.textTertiary,
    marginLeft: wp(2),
  },
  chatLastMessage: {
    fontSize: wp(3.5),
    color: COLORS.textPrimary,
  },
  unreadBadge: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp(2),
  },
  unreadText: {
    fontSize: wp(2.5),
    fontWeight: "600",
    color: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
  },
  emptyText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: hp(2),
  },
  emptySubtext: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    marginTop: hp(1),
    textAlign: "center",
  },
});
