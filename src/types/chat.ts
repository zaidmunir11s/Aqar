// Chat type definitions

export interface ChatUser {
  _id: string | number;
  name: string;
  avatar?: string;
}

export interface ChatMessage {
  _id: string | number;
  text: string;
  createdAt: Date | number;
  user: ChatUser;
  image?: string;
  video?: string;
  audio?: string;
  system?: boolean;
  sent?: boolean;
  received?: boolean;
  pending?: boolean;
}

export interface ChatConversation {
  id: string | number;
  userId: string | number; // Property owner/advertiser ID
  userName: string;
  userAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date | number;
  unreadCount?: number;
  propertyId?: number; // Related property ID
  propertyAdNumber?: string; // Property ad number for reference
}




