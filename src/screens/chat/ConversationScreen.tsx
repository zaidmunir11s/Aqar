import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  FlatList,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  getMessagesForConversation,
  getOrCreateConversationForProperty,
  addMessageToConversation,
  getUserName,
  MOCK_USERS,
} from "../../data/chatData";
import type { ChatMessage } from "../../types/chat";
import { COLORS } from "../../constants";
import { ScreenHeader } from "../../components";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  conversationId?: string | number;
  propertyId?: number;
  advertiserName?: string;
  advertiserId?: string | number;
  defaultMessage?: string;
}

// Format date like "2026 January 06"
const formatDate = (date: Date | number): string => {
  const d = typeof date === "number" ? new Date(date) : date;
  const year = d.getFullYear();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[d.getMonth()];
  const day = d.getDate().toString().padStart(2, "0");
  return `${year} ${month} ${day}`;
};

// Format time like "01:33 PM"
const formatTime = (date: Date | number): string => {
  const d = typeof date === "number" ? new Date(date) : date;
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
};

// Check if two dates are on the same day
const isSameDay = (date1: Date | number, date2: Date | number): boolean => {
  const d1 = typeof date1 === "number" ? new Date(date1) : date1;
  const d2 = typeof date2 === "number" ? new Date(date2) : date2;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export default function ConversationScreen(): React.JSX.Element {
  const route = useRoute();
  const params = route.params as RouteParams;
  const navigation = useNavigation<NavigationProp>();
  const flatListRef = useRef<FlatList>(null);

  const {
    conversationId,
    propertyId,
    advertiserName = "Property Owner",
    advertiserId,
    defaultMessage,
  } = params;

  // Get or create conversation
  const conversation = useMemo(() => {
    let conv = null;
    if (conversationId) {
      // Find existing conversation by conversationId (which is now based on advertiserId)
      const { MOCK_CONVERSATIONS } = require("../../data/chatData");
      conv = MOCK_CONVERSATIONS.find((c: any) => c.id === conversationId);
      // Ensure userName is set
      if (conv && (!conv.userName || conv.userName === "Property Owner")) {
        conv.userName = getUserName(conv.userId) || advertiserName || "Property Owner";
      }
    } else if (propertyId && advertiserId) {
      // Create or find conversation by advertiserId (owner)
      // This ensures same owner = same conversation
      conv = getOrCreateConversationForProperty(
        propertyId,
        advertiserName,
        advertiserId
      );
    }
    return conv;
  }, [conversationId, propertyId, advertiserName, advertiserId]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState(defaultMessage || "");
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Load messages - only show messages that have been sent
  useEffect(() => {
    if (conversation) {
      const chatMessages = getMessagesForConversation(conversation.id);
      // Sort by date (oldest first for display)
      const sorted = [...chatMessages].sort((a, b) => {
        const dateA = typeof a.createdAt === "number" ? a.createdAt : a.createdAt.getTime();
        const dateB = typeof b.createdAt === "number" ? b.createdAt : b.createdAt.getTime();
        return dateA - dateB;
      });
      setMessages(sorted);
    } else {
      setMessages([]);
    }
  }, [conversation]);

  // Set default message in input when component mounts
  useEffect(() => {
    if (defaultMessage) {
      setInputText(defaultMessage);
    }
  }, [defaultMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleBackPress = () => {
    // Navigate back to ChatScreen within the same stack
    // Fallback: navigate to ChatScreen
    navigation.navigate("ChatScreen");

  };

  const handleMenuPress = useCallback(() => {
    // TODO: Implement menu actions
    console.log("Menu pressed");
  }, []);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !conversation) return;

    const newMessage: ChatMessage = {
      _id: Date.now().toString(),
      text: inputText.trim(),
      createdAt: new Date(),
      user: MOCK_USERS.currentUser,
      sent: true,
      received: true,
    };

    // Add message to conversation
    addMessageToConversation(conversation.id, newMessage);

    // Update local state
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // TODO: Send message to backend
    console.log("Message sent:", newMessage.text);
  }, [inputText, conversation]);

  // Render message text with ad number highlighting
  const renderMessageText = useCallback((text: string | undefined) => {
    if (!text || typeof text !== 'string') {
      return <Text style={styles.messageText}></Text>;
    }

    // Match any text starting with # (not just numbers)
    const adNumberPattern = /#[^\s]*/g;
    const parts: Array<{ text: string; isAdNumber: boolean }> = [];
    let lastIndex = 0;
    let match;
    adNumberPattern.lastIndex = 0;

    while ((match = adNumberPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, match.index),
          isAdNumber: false,
        });
      }
      parts.push({
        text: match[0],
        isAdNumber: true,
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        isAdNumber: false,
      });
    }

    if (parts.length === 0) {
      return <Text style={styles.messageText}>{text}</Text>;
    }

    return (
      <Text style={styles.messageText}>
        {parts.map((part, index) => (
          <Text
            key={index}
            style={part.isAdNumber ? styles.adNumberText : undefined}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    );
  }, []);

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      const isCurrentUser = item.user._id === MOCK_USERS.currentUser._id;
      const showDateSeparator =
        index === 0 ||
        !isSameDay(
          item.createdAt,
          messages[index - 1]?.createdAt || item.createdAt
        );

      return (
        <View>
          {showDateSeparator && (
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
          )}
          <View
            style={[
              styles.messageContainer,
              isCurrentUser ? styles.messageRight : styles.messageLeft,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
              ]}
            >
              {renderMessageText(item.text)}
              <Text style={styles.timeText}>
                {formatTime(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [messages, renderMessageText]
  );

  const keyExtractor = useCallback((item: ChatMessage) => String(item._id), []);

  if (!conversation) {
    return (
      <View style={styles.container}>
        <Text>Conversation not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <ScreenHeader
          title={conversation?.userName || advertiserName || "Property Owner"}
          onBackPress={handleBackPress}
          showRightSide={true}
          rightComponent={
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleMenuPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={wp(6)}
                color={COLORS.backButton}
              />
            </TouchableOpacity>
          }
        />

        {/* Chat Messages */}
        {messages.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.messagesList}
            style={styles.messagesContainer}
            inverted={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyMessagesContainer}>
            <Text style={styles.emptyMessagesText}>No messages yet</Text>
            <Text style={styles.emptyMessagesSubtext}>
              Start the conversation by sending a message
            </Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <View
            style={[
              styles.inputWrapper,
              isInputFocused && styles.inputWrapperFocused,
            ]}
          >
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder=""
              multiline
              placeholderTextColor="#9ca3af"
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
            />
          </View>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send-sharp"
              size={wp(6)}
              color={inputText.trim() ? "#0ab63a" : "#9ca3af"}
              style={{ transform: [{ rotate: '-180deg' }] }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Light gray-blue background from image
  },
  menuButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "flex-end",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingVertical: hp(2),
    paddingHorizontal: wp(2),
  },
  dateContainer: {
    alignSelf: "center",
    backgroundColor: "#a0aab4",
    borderRadius: wp(4),
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    marginVertical: hp(1),
  },
  dateText: {
    fontSize: wp(3.5),
    color: "#fff",
  },
  messageContainer: {
    marginVertical: hp(0.5),
    paddingHorizontal: wp(2),
  },
  messageRight: {
    alignItems: "flex-end",
  },
  messageLeft: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "65%",
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    backgroundColor: "#fff",
  },
  messageBubbleRight: {
    marginRight: wp(2),
    marginLeft: wp(20),
  },
  messageBubbleLeft: {
    marginLeft: wp(2),
    marginRight: wp(20),
  },
  messageText: {
    fontSize: wp(3.8),
    color: "#111827",
    lineHeight: hp(2.5),
  },
  adNumberText: {
    color: "#3b82f6", // Light blue color for ad numbers
  },
  timeText: {
    fontSize: wp(3),
    color: "#6b7280",
    marginTop: hp(0.3),
  },
  inputContainer: {
    backgroundColor: "#fff",
    // borderTopWidth: 1,
    // borderTopColor: "#e5e7eb",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: wp(3),
    paddingHorizontal: wp(2),
    minHeight: hp(5.5),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
  },
  textInput: {
    flex: 1,
    fontSize: wp(4),
    color: "#111827",
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    maxHeight: hp(15),
  },
  sendButton: {
    width: wp(10),
    height: wp(10),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp(2),
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
  },
  emptyMessagesText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: hp(1),
  },
  emptyMessagesSubtext: {
    fontSize: wp(3.5),
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
