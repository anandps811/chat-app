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
import { ChatMessage } from '../types';

interface Props {
  onBack: () => void;
  chatId: string;
}

const COLORS = {
  bgDark: '#101922',
  ivory: '#FAF9F6',
  primary: '#137fec',
  slate800: '#1e293b',
  slate400: '#94a3b8',
  border: 'rgba(255, 255, 255, 0.05)',
  bubbleUser: '#137fec',
  bubbleOther: '#1e293b',
};

const ChatDetailScreen: React.FC<Props> = ({ onBack, chatId }) => {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');

  const messages: ChatMessage[] = [
    { id: '1', text: 'Hey Julian, did you get the chance to look at the latest designs?', time: '10:00 AM', senderId: 'other' },
    { id: '2', text: 'Yes! They look amazing. Especially the typography choice.', time: '10:02 AM', senderId: 'me' },
    { id: '3', text: 'I agree. It feels much more premium now.', time: '10:05 AM', senderId: 'other' },
    { id: '4', text: 'Shall we discuss the implementation tomorrow?', time: '10:06 AM', senderId: 'me' },
    { id: '5', text: 'That works for me. 10 AM?', time: '10:10 AM', senderId: 'other' },
  ];

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === 'me';
    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageMe : styles.messageOther]}>
        <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.messageText, isMe ? styles.textMe : styles.textOther]}>{item.text}</Text>
        </View>
        <Text style={styles.messageTime}>{item.time}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.ivory} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPK5JCsfsM1A5U2GhvO42juDC6SLNICaQpeoCoOlCObm223hlx1BcbYWq2PoB_HQrYoK3mTJwKrdOY-ZBKMpGglAtK14Mrd5Vmc6ypK_Dia2xq2-wJU-u0d-_omJwwm2AkdP7ytWFpHjkyKAjA9sZ2A5U9Hho53uI_D8JKSe2APLd5_kMkPEuaA09sRDS-JqojxCuehjZRdwn0W8Dn7fmAb0FfnZKSjRKldTutpROri6xMGVCOJluZkAUUqozMeE9ggSmwaUNFyNgo' }}
            style={styles.headerAvatar}
          />
          <View>
            <Text style={styles.headerName}>Julian Thorne</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color={COLORS.ivory} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.inputArea, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.attachmentBtn}>
            <MaterialCommunityIcons name="plus" size={24} color={COLORS.slate400} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.slate400}
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, !message && styles.sendBtnDisabled]}
            disabled={!message}
          >
            <MaterialCommunityIcons name="send" size={20} color={COLORS.ivory} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgDark,
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerName: {
    fontSize: 16,
    fontFamily: 'Newsreader',
    fontWeight: '700',
    color: COLORS.ivory,
  },
  headerStatus: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  headerAction: {
    padding: 8,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageWrapper: {
    marginBottom: 20,
    maxWidth: '80%',
  },
  messageMe: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleMe: {
    backgroundColor: COLORS.bubbleUser,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: COLORS.bubbleOther,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Plus Jakarta Sans',
  },
  textMe: {
    color: COLORS.ivory,
  },
  textOther: {
    color: COLORS.ivory,
  },
  messageTime: {
    fontSize: 10,
    color: COLORS.slate400,
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bgDark,
  },
  attachmentBtn: {
    padding: 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.slate800,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    minHeight: 40,
    maxHeight: 100,
    justifyContent: 'center',
  },
  input: {
    color: COLORS.ivory,
    fontSize: 15,
    fontFamily: 'Plus Jakarta Sans',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});

export default ChatDetailScreen;
