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
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: string;
}

interface Props {
  onBack: () => void;
  onSelectContact: (id: string) => void;
}

const COLORS = {
  bgDark: '#101922',
  ivory: '#FAF9F6',
  primary: '#137fec',
  slate800: '#1e293b',
  slate400: '#94a3b8',
  border: 'rgba(255, 255, 255, 0.05)',
};

const NewMessageScreen: React.FC<Props> = ({ onBack, onSelectContact }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const contacts: Contact[] = [
    { id: '1', name: 'Amara Vance', status: 'Life is beautiful', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyM_j40Sd5gvFDaX_z319P-A4gdNOahOp7Y7sh-7hpmQqz1HjCJrIbDwTXvs-gI3_KZC_AUj6qprzwugz7V_AbyaDY47a37Op389WTy1wq0g9sZn0Jz7XFmStnzWcJvhNb2nGaUBybLmPX_BEaoWbJ706w9h7AvkI3wnF-nIqOD7c7_DMtcXJ1RrDacQMO9nUm_-zLP4pVa22m_p__6iA0WpBDZpf2pEO-1qpgPtqvfW5avkEU7yzUe9hz7eRl1r19EqlEzeFwcbRy' },
    { id: '2', name: 'Julian Thorne', status: 'Working on something new', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPK5JCsfsM1A5U2GhvO42juDC6SLNICaQpeoCoOlCObm223hlx1BcbYWq2PoB_HQrYoK3mTJwKrdOY-ZBKMpGglAtK14Mrd5Vmc6ypK_Dia2xq2-wJU-u0d-_omJwwm2AkdP7ytWFpHjkyKAjA9sZ2A5U9Hho53uI_D8JKSe2APLd5_kMkPEuaA09sRDS-JqojxCuehjZRdwn0W8Dn7fmAb0FfnZKSjRKldTutpROri6xMGVCOJluZkAUUqozMeE9ggSmwaUNFyNgo' },
    { id: '3', name: 'Elena Rossi', status: 'In a meeting', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUS2jdgQBU19s15H3bbxvQHSfa6rYKC3pEnYtUE7MbPpWL96YsnZY98cyy_8t55SRqYsv0e3xoiQ4ukXYhxN6Zees2A9LrOv1t4CYn6zvfnmHTdsF62Bkn0tfVUmu3gBT6wKGSH37d9u6JPhlfnXNfUJ0StVDV4PmEKeNFp-UrtiZwxU0a3MaPZm913_ipo35ekZ1Os7alIa-4V6KBbIQPwAJnQLFEn83qz2Knj_jcbtc21d3RiOmzmAunlIa0OXy1GS3a3-RbC8gG' },
  ];

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      onPress={() => onSelectContact(item.id)}
      style={styles.contactItem}
    >
      <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactStatus}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={onBack} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Message</Text>
          <View style={{ width: 60 }} />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.toLabel}>To:</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={COLORS.slate400}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    backgroundColor: COLORS.bgDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  cancelBtn: {
    width: 60,
  },
  cancelText: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Newsreader',
    fontWeight: '700',
    color: COLORS.ivory,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  toLabel: {
    color: COLORS.slate400,
    fontSize: 16,
    marginRight: 10,
    fontFamily: 'Plus Jakarta Sans',
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Newsreader',
    fontWeight: '700',
    color: COLORS.ivory,
    marginBottom: 2,
  },
  contactStatus: {
    fontSize: 13,
    color: COLORS.slate400,
    fontFamily: 'Plus Jakarta Sans',
  },
});

export default NewMessageScreen;
