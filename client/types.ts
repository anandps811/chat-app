
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
