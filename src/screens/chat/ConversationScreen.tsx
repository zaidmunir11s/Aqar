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
  Image,
  Keyboard,
  Animated,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  getUserAvatar,
  isAdminUser,
  MOCK_USERS,
} from "../../data/chatData";
import type { ChatMessage } from "../../types/chat";
import { COLORS } from "../../constants";
import { useLocalization } from "../../hooks/useLocalization";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  conversationId?: string | number;
  propertyId?: number;
  advertiserName?: string;
  advertiserId?: string | number;
  defaultMessage?: string;
}

// Format date like "2026 January 06" or "06 January 2026" in RTL
const formatDate = (date: Date | number, t: any, isRTL: boolean): string => {
  const d = typeof date === "number" ? new Date(date) : date;
  const year = d.getFullYear();
  const monthKeys = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const month = t(`listings.calendar.months.${monthKeys[d.getMonth()]}`);
  const day = d.getDate().toString().padStart(2, "0");
  
  // In RTL, show day first, then month, then year (DD Month YYYY)
  // In LTR, show year first, then month, then day (YYYY Month DD)
  if (isRTL) {
    return `${day} ${month} ${year}`;
  }
  return `${year} ${month} ${day}`;
};

// Format time like "01:33 PM" or "01:33 م" in RTL
const formatTime = (date: Date | number, t: any, isRTL: boolean): string => {
  const d = typeof date === "number" ? new Date(date) : date;
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? t("listings.time.pm") : t("listings.time.am");
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const timeStr = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  
  // Convert Arabic-Indic numerals to Western numerals for RTL
  if (isRTL) {
    return timeStr.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
  }
  
  return timeStr;
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
  const { t, isRTL } = useLocalization();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  const {
    conversationId,
    propertyId,
    advertiserName,
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
      if (conv) {
        // Use advertiserName from params if available, otherwise use stored name or get from data
        if (advertiserName) {
          conv.userName = advertiserName;
        } else if (!conv.userName || conv.userName === "Property Owner") {
          // Get name from data - don't translate, keep as is
          const nameFromUsers = getUserName(conv.userId);
          conv.userName = nameFromUsers !== "Property Owner" 
            ? nameFromUsers 
            : (advertiserName || "Property Owner");
        }
        // For admin, always use Arabic name
        if (isAdminUser(conv.userId)) {
          conv.userName = "تطبيق العقارات";
        }
        // Ensure userAvatar is set
        if (!conv.userAvatar) {
          const avatar = getUserAvatar(conv.userId);
          if (avatar) {
            conv.userAvatar = avatar;
          }
        }
      }
      // Ensure userAvatar is set
      if (conv && !conv.userAvatar) {
        const avatar = getUserAvatar(conv.userId);
        if (avatar) {
          conv.userAvatar = avatar;
        }
      }
    } else if (propertyId && advertiserId) {
      // Create or find conversation by advertiserId (owner)
      // This ensures same owner = same conversation
      const defaultName = advertiserName || getUserName(advertiserId) || "Property Owner";
      conv = getOrCreateConversationForProperty(
        propertyId,
        defaultName,
        advertiserId
      );
      // Use advertiserName from params if available (keep as is, no translation)
      if (advertiserName && conv) {
        conv.userName = advertiserName;
      }
      // For admin, always use Arabic name
      if (conv && isAdminUser(conv.userId)) {
        conv.userName = "تطبيق العقارات";
      }
    }
    return conv;
  }, [conversationId, propertyId, advertiserId, advertiserName]);

  // Check if this is an admin conversation
  const isAdminChat = useMemo(() => {
    return conversation ? isAdminUser(conversation.userId) : false;
  }, [conversation]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState(defaultMessage || "");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [blockConfirmationModalVisible, setBlockConfirmationModalVisible] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const modalSlideAnim = useRef(new Animated.Value(0)).current;

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

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? e.duration || 250 : 100,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? e.duration || 250 : 100,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [keyboardHeight]);

  const handleBackPress = () => {
    // Go back to where we came from: PropertyDetails when opened from message icon,
    // or ChatScreen when opened from the chat list
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate("Chat", { screen: "ChatScreen" });
      } else {
        navigation.navigate("ChatScreen");
      }
    }
  };

  const handleMenuPress = useCallback(() => {
    setOptionsModalVisible(true);
    // Animate modal slide up
    Animated.spring(modalSlideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [modalSlideAnim]);

  const handleCloseOptionsModal = useCallback(() => {
    // Animate modal slide down
    Animated.timing(modalSlideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setOptionsModalVisible(false);
    });
  }, [modalSlideAnim]);

  const handleBlockUser = useCallback(() => {
    // If already blocked, unblock directly
    if (isBlocked) {
      setIsBlocked(false);
      handleCloseOptionsModal();
      return;
    }
    // If not blocked, show confirmation modal
    setBlockConfirmationModalVisible(true);
    handleCloseOptionsModal();
  }, [isBlocked, handleCloseOptionsModal]);

  const handleBlockConfirm = useCallback(() => {
    setIsBlocked(true);
    setBlockConfirmationModalVisible(false);
    // TODO: Implement actual block functionality (API call, etc.)
    console.log("User blocked");
  }, []);

  const handleBlockCancel = useCallback(() => {
    setBlockConfirmationModalVisible(false);
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
  const renderMessageText = useCallback((text: string | undefined, isReceived: boolean = false) => {
    if (!text || typeof text !== 'string') {
      return <Text style={[styles.messageText, isReceived && styles.receivedMessageText]}></Text>;
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
      return <Text style={[styles.messageText, isReceived && styles.receivedMessageText]}>{text}</Text>;
    }

    return (
      <Text style={[styles.messageText, isReceived && styles.receivedMessageText]}>
        {parts.map((part, index) => (
          <Text
            key={index}
            style={part.isAdNumber ? (isReceived ? styles.receivedAdNumberText : styles.adNumberText) : undefined}
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
              <Text style={styles.dateText}>{formatDate(item.createdAt, t, isRTL)}</Text>
            </View>
          )}
          <View
            style={[
              styles.messageContainer,
              // In RTL: user messages on left, received on right
              // In LTR: user messages on right, received on left
              isRTL
                ? (isCurrentUser ? styles.messageLeft : styles.messageRight)
                : (isCurrentUser ? styles.messageRight : styles.messageLeft),
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                // In RTL: swap margins but keep colors
                // User messages: white background, on left in RTL (use left margins), on right in LTR (use right margins)
                // Received messages: primaryLight background, on right in RTL (use right margins), on left in LTR (use left margins)
                isRTL
                  ? (isCurrentUser ? styles.messageBubbleLeft : styles.messageBubbleRight)
                  : (isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft),
                // Override background color to maintain: user messages = white, received = primaryLight
                {
                  backgroundColor: isCurrentUser ? "#fff" : COLORS.primaryLight,
                },
              ]}
            >
              {renderMessageText(item.text, !isCurrentUser)}
              <Text style={[styles.timeText, !isCurrentUser && styles.receivedTimeText]}>
                {formatTime(item.createdAt, t, isRTL)}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [messages, renderMessageText, t, isRTL]
  );

  const keyExtractor = useCallback((item: ChatMessage) => String(item._id), []);

  if (!conversation) {
    return (
      <View style={styles.container}>
        <Text>{t("chat.conversationNotFound")}</Text>
      </View>
    );
  }
  
  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      customHeader: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      headerLeft: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      backButton: {
        marginRight: isRTL ? 0 : 0,
        marginLeft: isRTL ? 0 : 0,
      },
      headerAvatarContainer: {
        marginRight: isRTL ? 0 : wp(2.5),
        marginLeft: isRTL ? wp(2.5) : 0,
      },
      headerTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        marginLeft: isRTL ? 0 : wp(2.5),
        marginRight: isRTL ? wp(2.5) : 0,
      },
      menuButton: {
        alignItems: (isRTL ? "flex-start" : "flex-end") as "flex-start" | "flex-end",
      },
      inputContainer: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      textInput: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      sendButton: {
        marginLeft: isRTL ? 0 : wp(2),
        marginRight: isRTL ? wp(2) : 0,
      },
      modalHeader: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      modalTitle: {
        marginLeft: isRTL ? 0 : wp(2),
        marginRight: isRTL ? wp(2) : 0,
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      modalOptionItem: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      modalOptionText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      blockModalContent: {
        alignItems: (isRTL ? "flex-end" : "flex-start") as "flex-start" | "flex-end",
      },
      blockModalText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      blockModalButtons: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
        justifyContent: (isRTL ? "flex-end" : "flex-end") as "flex-start" | "flex-end",
      },
      blockModalCancelText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      blockModalOkText: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrapper}>
          <View style={[styles.customHeader, rtlStyles.customHeader]}>
            <View style={[styles.headerLeft, rtlStyles.headerLeft]}>
              {handleBackPress && (
                <TouchableOpacity
                  style={[styles.backButton, rtlStyles.backButton]}
                  onPress={handleBackPress}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={isRTL ? "arrow-forward" : "arrow-back"} 
                    size={wp(7)} 
                    color={COLORS.backButton} 
                  />
                </TouchableOpacity>
              )}
              {conversation?.userAvatar && (
                <View style={[styles.headerAvatarContainer, rtlStyles.headerAvatarContainer]}>
                  <Image
                    source={typeof conversation.userAvatar === "string" ? { uri: conversation.userAvatar } : conversation.userAvatar}
                    style={styles.headerAvatar}
                    resizeMode="cover"
                  />
                </View>
              )}
              <Text style={[styles.headerTitle, rtlStyles.headerTitle]}>
                {(() => {
                  // For admin, always show Arabic name
                  if (conversation && isAdminUser(conversation.userId)) {
                    return "تطبيق العقارات";
                  }
                  // For others, use stored name or fallback - no translation
                  return conversation?.userName || advertiserName || "Property Owner";
                })()}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.menuButton, rtlStyles.menuButton]}
              onPress={handleMenuPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={wp(6)}
                color={COLORS.backButton}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages */}
        <Animated.View
          style={[
            styles.messagesContainer,
            {
              marginBottom: keyboardHeight,
            },
          ]}
        >
          {messages.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.messagesList}
              inverted={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            <View style={styles.emptyMessagesContainer}>
              <Text style={styles.emptyMessagesText}>{t("chat.noMessagesYet")}</Text>
              <Text style={styles.emptyMessagesSubtext}>
                {t("chat.startConversation")}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Input Bar - Hidden for admin chat */}
        {!isAdminChat && (
          <Animated.View
            style={[
              styles.inputContainer,
              rtlStyles.inputContainer,
              {
                paddingBottom: hp(1),
                transform: [
                  {
                    translateY: keyboardHeight.interpolate({
                      inputRange: [0, 1000],
                      outputRange: [0, -1000],
                      extrapolate: 'clamp',
                    }) as any,
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.inputWrapper,
                isInputFocused && styles.inputWrapperFocused,
              ]}
            >
              <TextInput
                style={[styles.textInput, rtlStyles.textInput]}
                value={inputText}
                onChangeText={setInputText}
                placeholder={t("chat.typeMessage")}
                multiline
                placeholderTextColor="#9ca3af"
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendButton, rtlStyles.sendButton]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send-sharp"
                size={wp(6)}
                color={inputText.trim() ? "#0ab63a" : "#9ca3af"}
                style={{ transform: [{ rotate: isRTL ? '0deg' : '-180deg' }] }}
              />
            </TouchableOpacity>
          </Animated.View>
        )}

      {/* Options Modal */}
      <Modal
        visible={optionsModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseOptionsModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseOptionsModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [
                    {
                      translateY: modalSlideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [hp(50), 0],
                      }),
                    },
                  ],
                },
              ]}
            >
            {/* Header */}
            <View style={[styles.modalHeader, rtlStyles.modalHeader]}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={handleCloseOptionsModal}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isRTL ? "arrow-forward" : "arrow-back"}
                  size={wp(6)}
                  color={COLORS.arrows}
                />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, rtlStyles.modalTitle]}>
                {t("chat.options")}
              </Text>
              <View style={styles.modalHeaderSpacer} />
            </View>
            <View style={styles.modalSeparator} />

            {/* Options List */}
            <View style={styles.modalOptionsListContainer}>
              <View style={styles.modalOptionsList}>
                <TouchableOpacity
                  style={[styles.modalOptionItem, rtlStyles.modalOptionItem]}
                  onPress={handleBlockUser}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalOptionText, rtlStyles.modalOptionText]}>
                    {isBlocked ? t("chat.unblockUser") : t("chat.blockUser")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalSeparator} />
            </View>
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Block User Confirmation Modal */}
      <Modal
        visible={blockConfirmationModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleBlockCancel}
      >
        <View style={styles.blockModalOverlay}>
          <View style={[styles.blockModalContent, rtlStyles.blockModalContent]}>
            <Text style={[styles.blockModalText, rtlStyles.blockModalText]}>
              {t("chat.blockUserConfirmation")}
            </Text>
            <View style={[styles.blockModalButtons, rtlStyles.blockModalButtons]}>
              <TouchableOpacity
                style={styles.blockModalCancelButton}
                onPress={handleBlockCancel}
                activeOpacity={0.7}
              >
                <Text style={[styles.blockModalCancelText, rtlStyles.blockModalCancelText]}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.blockModalOkButton}
                onPress={handleBlockConfirm}
                activeOpacity={0.7}
              >
                <Text style={[styles.blockModalOkText, rtlStyles.blockModalOkText]}>
                  {t("common.ok")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerWrapper: {
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: wp(12),
    height: wp(12),
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: wp(2.5),
  },
  headerAvatar: {
    width: "100%",
    height: "100%",
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: "500",
    flex: 1,
  },
  messageContainer: {
    marginVertical: hp(0.5),
    paddingHorizontal: wp(2),
    flexDirection: "row",
    alignItems: "flex-end",
  },
  messageRight: {
    justifyContent: "flex-end",
  },
  messageLeft: {
    justifyContent: "flex-start",
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
    backgroundColor: COLORS.primaryLight,
  },
  messageText: {
    fontSize: wp(3.8),
    color: "#111827",
    lineHeight: hp(2.5),
  },
  receivedMessageText: {
    // color: "",
  },
  adNumberText: {
    color: "#3b82f6", // Light blue color for ad numbers
  },
  receivedAdNumberText: {
    color: "#fff", // White color for ad numbers in received messages
  },
  timeText: {
    fontSize: wp(3),
    color: "#6b7280",
    marginTop: hp(0.3),
  },
  receivedTimeText: {
    color: COLORS.PinColor,
  },
  inputContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    width: "100%",
    minHeight: hp(16),
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(1.5),
  },
  modalBackButton: {
    padding: wp(0.5),
  },
  modalTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: COLORS.textPrimary,
    flex: 1,
  },
  modalHeaderSpacer: {
    // Spacer for alignment
  },
  modalSeparator: {
    height: 1.5,
    backgroundColor: "#d1d5db",
    width: "100%",
  },
  modalOptionsListContainer: {
    paddingTop: hp(0.5),
    paddingBottom: hp(2),
  },
  modalOptionsList: {
    paddingHorizontal: wp(4),
  },
  modalOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.2),
    gap: wp(2),
  },
  modalOptionText: {
    fontSize: wp(4.2),
    color: COLORS.textSecondary,
  },
  blockModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  blockModalContent: {
    backgroundColor: "#fff",
    padding: wp(5),
    width: wp(80),
    borderRadius: wp(0.5),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  blockModalText: {
    fontSize: wp(4),
    fontWeight: "400",
    color: COLORS.textPrimary,
    marginBottom: hp(2),
  },
  blockModalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-end",
  },
  blockModalCancelButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
  },
  blockModalCancelText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  blockModalOkButton: {
    borderRadius: wp(2),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
  },
  blockModalOkText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: "#c13234",
  },
});
