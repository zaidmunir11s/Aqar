// Mock chat data - will be replaced with backend data later
import type { ChatConversation, ChatMessage, ChatUser } from "../types/chat";

// Mock users
export const MOCK_USERS: Record<string, ChatUser> = {
  currentUser: {
    _id: "current-user",
    name: "You",
  },
  admin: {
    _id: "admin",
    name: "Real State App",
    avatar: require("../../assets/images/admin-logo.png"),
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

// Helper function to initialize admin conversation
const initializeAdminConversation = (): void => {
  const adminConvId = "conv-admin";
  
  // Check if admin conversation already exists
  const existingAdminConv = MOCK_CONVERSATIONS.find(
    (conv) => conv.id === adminConvId
  );
  
  if (!existingAdminConv) {
    // Create admin conversation
    const adminConversation: ChatConversation = {
      id: adminConvId,
      userId: "admin",
      userName: "Real State App",
      userAvatar: require("../../assets/images/admin-logo.png"),
      lastMessage: "Welcome to Real State App! We're here to help you.",
      lastMessageTime: new Date(),
      unreadCount: 0,
    };
    
    MOCK_CONVERSATIONS.push(adminConversation);
    
    // Add predefined messages from admin
    const adminMessages: ChatMessage[] = [
      {
        _id: "admin-msg-1",
        text: "Welcome to Real State App! We're here to help you with any questions about properties, listings, or our services.",
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        user: MOCK_USERS.admin,
        sent: true,
        received: true,
      },
      {
        _id: "admin-msg-2",
        text: "If you need assistance, feel free to browse our listings or contact property owners directly through the app.",
        createdAt: new Date(Date.now() - 43200000), // 12 hours ago
        user: MOCK_USERS.admin,
        sent: true,
        received: true,
      },
    ];
    
    MOCK_MESSAGES[adminConvId] = adminMessages;
  }
};

// Initialize admin conversation on module load
initializeAdminConversation();

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
  if (!user && !userIdStr.startsWith("advertiser") && userIdStr !== "admin") {
    user = MOCK_USERS[`advertiser${userIdStr}`];
  }
  
  return user?.name || "Property Owner";
};

// Helper function to get user avatar from MOCK_USERS
export const getUserAvatar = (userId: string | number): string | number | undefined => {
  const userIdStr = String(userId);
  // Try direct lookup first
  let user = MOCK_USERS[userIdStr];
  
  // If not found, try normalizing the ID (handle "advertiser-1" -> "advertiser1")
  if (!user && userIdStr.includes("-")) {
    const normalizedId = userIdStr.replace("-", "");
    user = MOCK_USERS[normalizedId];
  }
  
  // If still not found, try with "advertiser" prefix
  if (!user && !userIdStr.startsWith("advertiser") && userIdStr !== "admin") {
    user = MOCK_USERS[`advertiser${userIdStr}`];
  }
  
  return user?.avatar;
};

// Helper function to check if a user is admin
export const isAdminUser = (userId: string | number): boolean => {
  return String(userId) === "admin";
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

