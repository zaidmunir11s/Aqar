// Mock chat data - will be replaced with backend data later
import type { ChatConversation, ChatMessage, ChatUser } from "../types/chat";

// Mock users
export const MOCK_USERS: Record<string, ChatUser> = {
  currentUser: {
    _id: "current-user",
    name: "You",
  },
  advertiser1: {
    _id: "advertiser-1",
    name: "Abdullah Fawaz",
    avatar: undefined,
  },
  advertiser2: {
    _id: "advertiser-2",
    name: "Salam Real Estate",
    avatar: undefined,
  },
  advertiser3: {
    _id: "advertiser-3",
    name: "Mohammed Ali",
    avatar: undefined,
  },
  advertiser4: {
    _id: "advertiser-4",
    name: "Ahmed Realty Group",
    avatar: undefined,
  },
};

// Mock conversations (chats with messages) - populated dynamically
export const MOCK_CONVERSATIONS: ChatConversation[] = [];

// Mock messages for conversations - only populated when user sends messages
export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  // Messages are added dynamically when user sends them
};

// Helper function to get user name from MOCK_USERS
export const getUserName = (userId: string | number): string => {
  const userIdStr = String(userId);
  // Try direct lookup first
  let user = MOCK_USERS[userIdStr];
  
  // If not found, try normalizing the ID (handle "advertiser-1" -> "advertiser1")
  if (!user && userIdStr.includes("-")) {
    const normalizedId = userIdStr.replace("-", "");
    user = MOCK_USERS[normalizedId];
  }
  
  // If still not found, try with "advertiser" prefix
  if (!user && !userIdStr.startsWith("advertiser")) {
    user = MOCK_USERS[`advertiser${userIdStr}`];
  }
  
  return user?.name || "Property Owner";
};

// Helper function to get messages for a conversation
export const getMessagesForConversation = (
  conversationId: string | number
): ChatMessage[] => {
  return MOCK_MESSAGES[String(conversationId)] || [];
};

// Helper function to get or create conversation for a property
// Groups conversations by owner (advertiserId) - same owner = same conversation
export const getOrCreateConversationForProperty = (
  propertyId: number,
  advertiserName: string,
  advertiserId: string | number = `advertiser-${propertyId}`
): ChatConversation => {
  // Find existing conversation by advertiserId (owner), not propertyId
  // This allows same owner with multiple properties to share one conversation
  const existingConv = MOCK_CONVERSATIONS.find(
    (conv) => String(conv.userId) === String(advertiserId)
  );

  if (existingConv) {
    // Update property reference if this is a different property from same owner
    if (existingConv.propertyId !== propertyId) {
      // Keep the conversation but note it's related to multiple properties
      // You could store an array of propertyIds if needed
      existingConv.propertyId = propertyId; // Update to latest property
      existingConv.propertyAdNumber = `#${propertyId}`;
    }
    // Update userName if it's missing or if a new name is provided
    if (!existingConv.userName || existingConv.userName === "Property Owner") {
      const nameFromUsers = getUserName(advertiserId);
      existingConv.userName = nameFromUsers !== "Property Owner" 
        ? nameFromUsers 
        : (advertiserName || "Property Owner");
    }
    return existingConv;
  }

  // Get name from MOCK_USERS if available, otherwise use provided name
  const nameFromUsers = getUserName(advertiserId);
  const finalName = nameFromUsers !== "Property Owner" 
    ? nameFromUsers 
    : (advertiserName || "Property Owner");

  // Create new conversation for this owner
  const newConv: ChatConversation = {
    id: `conv-${advertiserId}`, // Use advertiserId as conversation ID
    userId: advertiserId,
    userName: finalName,
    propertyId,
    propertyAdNumber: `#${propertyId}`,
    lastMessage: undefined,
    lastMessageTime: undefined,
    unreadCount: 0,
  };

  // Add to mock data
  MOCK_CONVERSATIONS.push(newConv);
  MOCK_MESSAGES[newConv.id] = [];

  return newConv;
};

// Helper function to update conversation with new message
export const addMessageToConversation = (
  conversationId: string | number,
  message: ChatMessage
): void => {
  const convId = String(conversationId);
  if (!MOCK_MESSAGES[convId]) {
    MOCK_MESSAGES[convId] = [];
  }
  MOCK_MESSAGES[convId].push(message);

  // Update conversation last message
  const conversation = MOCK_CONVERSATIONS.find((c) => c.id === conversationId);
  if (conversation) {
    conversation.lastMessage = message.text;
    conversation.lastMessageTime = message.createdAt;
  }
};

