
export enum Screen {
  WELCOME = 'WELCOME',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  OTP = 'OTP',
  PROFILE_SETUP = 'PROFILE_SETUP',
  CHAT_LIST = 'CHAT_LIST',
  NEW_MESSAGE = 'NEW_MESSAGE',
  CHAT_DETAIL = 'CHAT_DETAIL'
}

export interface UserProfile {
  fullName: string;
  email: string;
  bio: string;
  avatar?: string;
}

export interface ChatPreview {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isOnline?: boolean;
  avatar: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

// Backend API Response Types
export interface BackendChat {
  id: string;
  chatId: string;
  userId: string;
  name: string;
  profileImage: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface BackendMessage {
  id: string;
  chatId?: string;
  content: string;
  senderId: string | { _id: string; toString(): string } | { toString(): string };
  senderName?: string;
  senderPicture?: string;
  createdAt: string;
  imageUrl?: string;
  voiceMessageUrl?: string;
  voiceMessageDuration?: number;
  likesCount: number;
  isLiked: boolean;
}

export interface BackendChatResponse {
  _id?: string;
  id?: string;
  chatId?: string;
  participants?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface MessagesQueryData {
  messages: Message[];
  rawMessages: BackendMessage[];
}

// Socket Event Types
export interface SocketMessageEvent {
  message: BackendMessage;
}

export interface SocketMessageSentEvent {
  messageId: string;
  chatId: string;
  wasNewChat?: boolean;
}

export interface SocketMessageReadEvent {
  chatId: string;
  messageIds: string[];
}

export interface SocketMessageLikedEvent {
  chatId: string;
  messageId: string;
  isLiked: boolean;
  likesCount: number;
}

export interface SocketUserStatusEvent {
  userId: string;
}

export interface SocketChatUpdatedEvent {
  chatId: string;
  lastMessage: string;
  timestamp: string;
}

export interface SocketChatCreatedEvent {
  chatId: string;
  participants: string[];
}

export interface SocketTypingEvent {
  chatId: string;
  userId: string;
  isTyping: boolean;
}
