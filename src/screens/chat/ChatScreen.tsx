import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Platform,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader } from "../../components";
import { COLORS } from "../../constants";
import { MOCK_CONVERSATIONS, getUserName, getUserAvatar } from "../../data/chatData";
import type { ChatConversation } from "../../types/chat";

type NavigationProp = NativeStackNavigationProp<any>;

// Format time for last message - show year/month/day and time
const formatLastMessageTime = (date: Date | number | undefined): string => {
  if (!date) return "";
  const d = typeof date === "number" ? new Date(date) : date;
  
  // Format as YYYY/MM/DD HH:MM
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  
  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

interface ChatListItemProps {
  conversation: ChatConversation;
  onPress: () => void;
  isLast?: boolean;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ conversation, onPress, isLast = false }) => {
  const avatar = conversation.userAvatar || getUserAvatar(conversation.userId);
  
  return (
    <TouchableOpacity
      style={[styles.chatItem, isLast && styles.chatItemLast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
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
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {conversation.userName || "Unknown"}
          </Text>
          {conversation.lastMessageTime ? (
            <Text style={styles.chatTime}>
              {formatLastMessageTime(conversation.lastMessageTime)}
            </Text>
          ) : null}
        </View>
        {conversation.lastMessage ? (
          <Text style={styles.chatLastMessage} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
        ) : null}
      </View>
      {conversation.unreadCount && conversation.unreadCount > 0 ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export default function ChatScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  // Load and filter conversations that have messages
  const loadConversations = useCallback(() => {
    const filtered = MOCK_CONVERSATIONS.filter(
      (conv) => conv.lastMessage && conv.lastMessage.trim().length > 0
    );
    // Ensure all conversations have userName set
    filtered.forEach((conv) => {
      if (!conv.userName || conv.userName === "Property Owner") {
        conv.userName = getUserName(conv.userId);
      }
    });
    // Sort by last message time (newest first)
    const sorted = [...filtered].sort((a, b) => {
      if (!a.lastMessageTime || !b.lastMessageTime) return 0;
      const timeA = typeof a.lastMessageTime === "number" 
        ? a.lastMessageTime 
        : a.lastMessageTime.getTime();
      const timeB = typeof b.lastMessageTime === "number" 
        ? b.lastMessageTime 
        : b.lastMessageTime.getTime();
      return timeB - timeA; // Newest first
    });
    setConversations(sorted);
  }, []);

  // Load conversations on mount and when screen comes into focus
  useEffect(() => {
    loadConversations();
    const unsubscribe = navigation.addListener('focus', () => {
      loadConversations();
    });
    return unsubscribe;
  }, [navigation, loadConversations]);

  const handleBackPress = () => {
    // Navigate back to Listings tab
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("Listings");
    } else {
      navigation.navigate("Listings");
    }
  };

  const handleChatPress = (conversation: ChatConversation) => {
    // Navigate to Chat tab -> Conversation screen
    // Pass conversationId which is based on advertiserId
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("Chat", {
        screen: "Conversation",
        params: {
          conversationId: conversation.id,
          propertyId: conversation.propertyId,
          advertiserName: conversation.userName,
          advertiserId: conversation.userId,
        },
      });
    } else {
      navigation.navigate("Chat", {
        screen: "Conversation",
        params: {
          conversationId: conversation.id,
          propertyId: conversation.propertyId,
          advertiserName: conversation.userName,
          advertiserId: conversation.userId,
        },
      });
    }
  };

  const renderChatItem = ({ item, index }: { item: ChatConversation; index: number }) => (
    <ChatListItem
      conversation={item}
      onPress={() => handleChatPress(item)}
      isLast={index === conversations.length - 1}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={wp(15)} color={COLORS.textTertiary} />
      <Text style={styles.emptyText}>No conversations yet</Text>
      <Text style={styles.emptySubtext}>
        Start a chat from a property listing
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Chat" onBackPress={handleBackPress} />
      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderChatItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
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
