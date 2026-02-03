import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  Image,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ChatPreview } from '../types';

interface Props {
  onNewMessage: () => void;
  onChatClick: (id: string) => void;
}

const COLORS = {
  bgDark: '#101922',
  ivory: '#FAF9F6',
  primary: '#137fec',
  slate800: '#1e293b',
  slate400: '#94a3b8',
  border: 'rgba(255, 255, 255, 0.05)',
  online: '#0bda5b',
};

const ChatListScreen: React.FC<Props> = ({ onNewMessage, onChatClick }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const chats: ChatPreview[] = [
    {
      id: '1',
      name: 'Amara Vance',
      lastMessage: 'Are we still on for coffee later?',
      time: '2m ago',
      unreadCount: 1,
      isOnline: true,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyM_j40Sd5gvFDaX_z319P-A4gdNOahOp7Y7sh-7hpmQqz1HjCJrIbDwTXvs-gI3_KZC_AUj6qprzwugz7V_AbyaDY47a37Op389WTy1wq0g9sZn0Jz7XFmStnzWcJvhNb2nGaUBybLmPX_BEaoWbJ706w9h7AvkI3wnF-nIqOD7c7_DMtcXJ1RrDacQMO9nUm_-zLP4pVa22m_p__6iA0WpBDZpf2pEO-1qpgPtqvfW5avkEU7yzUe9hz7eRl1r19EqlEzeFwcbRy'
    },
    {
      id: '2',
      name: 'Julian Thorne',
      lastMessage: 'The files are attached below.',
      time: '1h ago',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPK5JCsfsM1A5U2GhvO42juDC6SLNICaQpeoCoOlCObm223hlx1BcbYWq2PoB_HQrYoK3mTJwKrdOY-ZBKMpGglAtK14Mrd5Vmc6ypK_Dia2xq2-wJU-u0d-_omJwwm2AkdP7ytWFpHjkyKAjA9sZ2A5U9Hho53uI_D8JKSe2APLd5_kMkPEuaA09sRDS-JqojxCuehjZRdwn0W8Dn7fmAb0FfnZKSjRKldTutpROri6xMGVCOJluZkAUUqozMeE9ggSmwaUNFyNgo'
    },
    {
      id: '3',
      name: 'Elena Rossi',
      lastMessage: "See you then! Can't wait.",
      time: 'Yesterday',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUS2jdgQBU19s15H3bbxvQHSfa6rYKC3pEnYtUE7MbPpWL96YsnZY98cyy_8t55SRqYsv0e3xoiQ4ukXYhxN6Zees2A9LrOv1t4CYn6zvfnmHTdsF62Bkn0tfVUmu3gBT6wKGSH37d9u6JPhlfnXNfUJ0StVDV4PmEKeNFp-UrtiZwxU0a3MaPZm913_ipo35ekZ1Os7alIa-4V6KBbIQPwAJnQLFEn83qz2Knj_jcbtc21d3RiOmzmAunlIa0OXy1GS3a3-RbC8gG'
    },
    {
      id: '4',
      name: 'Marcus Wright',
      lastMessage: 'Sent a photo',
      time: 'Tue',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWyJmVO9evMrSW2YC7mkDyBPfJF8jFBkMoh3cYtjZrwDyh-lmaAvrsGR9gUvmcCgyl7lJ8cQ6GRet3Xm7jxVdwqbjFR7n5m7yXSs5Y6WST6Pq6u6t6haEe-64H6kjacJwj6PEgNqRifu4LmTV6zVQiDB41w-E8TBbtfBvsJV3O2xgrjBXAJ2ccIthhVlFyVnFWwHicxO6QjAtJA8vmnj1uKduZ3nlFMZfWo5C1S-Af25jMKpGMeG7kp29KUkOMrvtLMjBxTcFMLkpu'
    },
    {
      id: '5',
      name: 'Sophia Chen',
      lastMessage: 'The meeting has been rescheduled to Friday at 10 AM.',
      time: 'Mon',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAuTSso4Vaz87moWZYjhBFxhtmY87hLLszsSTie4A-xF_bx8f6gk8ibxF5a9E7ZLl8N3a6YEqn1w_Slct_RQ4e-yoPdOqKkrR8VXUZg4p9lK5xlYyZMvdaomei5VfJx19tnp1CJxaOyOIzrJkhtMaYyofUxEScervZKNG3bseflv0fw2B2Xwe_pTSMem-0HeBdTr48anO9tQrFzLPli1VHFqgI4KzuY9U5zmk-nwbQmwQnMcDvclYOL34r9TBcYBGSi9Kc3SdUI6UB'
    }
  ];

  const renderChatItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity
      onPress={() => onChatClick(item.id)}
      style={styles.chatItem}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.chatDetails}>
        <View style={styles.chatHeaderRow}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={[styles.chatTime, item.unreadCount > 0 && styles.chatTimeActive]}>{item.time}</Text>
        </View>
        <View style={styles.chatMessageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={onNewMessage} style={styles.addBtn}>
            <MaterialCommunityIcons name="plus" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.slate400} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={COLORS.slate400}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 4 }]}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="chat" size={28} color={COLORS.primary} />
          <Text style={styles.navTextActive}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="account-group" size={28} color={COLORS.slate400} />
          <Text style={styles.navText}>Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="cog" size={28} color={COLORS.slate400} />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    paddingHorizontal: 24,
    backgroundColor: COLORS.bgDark,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: 'Playfair Display',
    fontWeight: '700',
    color: COLORS.ivory,
    marginTop: 8,
    marginBottom: 12,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.ivory,
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
  },
  listContent: {
    paddingTop: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.bgDark,
  },
  chatDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 18,
    fontFamily: 'Newsreader',
    fontWeight: '700',
    color: COLORS.ivory,
  },
  chatTime: {
    fontSize: 11,
    color: COLORS.slate400,
    fontWeight: '700',
  },
  chatTimeActive: {
    color: COLORS.primary,
  },
  chatMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    color: COLORS.slate400,
    fontWeight: '300',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: COLORS.ivory,
    fontSize: 10,
    fontWeight: '700',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 84,
    backgroundColor: 'rgba(16, 25, 34, 0.95)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.slate400,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  navTextActive: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default ChatListScreen;
