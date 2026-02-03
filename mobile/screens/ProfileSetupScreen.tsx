import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  onBack: () => void;
  onContinue: (data: { avatar?: string; bio: string }) => void;
}

const COLORS = {
  ivory: '#FAF9F6',
  charcoal: '#1A1A1A',
  bgDark: '#101922',
  primary: '#137fec',
  slate400: '#94a3b8',
  slate700: '#334155',
  slate800: '#1e293b',
};

const ProfileSetupScreen: React.FC<Props> = ({ onBack, onContinue }) => {
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>

        {/* Navigation */}
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your profile</Text>
          <Text style={styles.subtitle}>
            Tell us a bit about yourself to{"\n"}personalize your profile.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Avatar Upload Placeholder */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarCircle} activeOpacity={0.8}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImg} />
              ) : (
                <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.primary} />
              )}
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Add a profile photo</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Small Bio</Text>
            <TextInput
              style={styles.textArea}
              placeholder="What's on your mind?"
              placeholderTextColor="#475569"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length}/150</Text>
          </View>

          {/* Action Button */}
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => onContinue({ avatar, bio })}
            style={styles.primaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Finish Setup</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    marginLeft: -12,
  },
  header: {
    marginTop: 32,
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontFamily: 'Newsreader',
    fontWeight: '700',
    color: COLORS.ivory,
    lineHeight: 48,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Newsreader',
    color: COLORS.slate400,
    lineHeight: 26,
  },
  form: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarHint: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: COLORS.ivory,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textArea: {
    minHeight: 120,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: COLORS.slate700,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    color: COLORS.ivory,
    fontFamily: 'Plus Jakarta Sans',
  },
  charCount: {
    alignSelf: 'flex-end',
    marginTop: 8,
    fontSize: 12,
    color: COLORS.slate400,
    fontFamily: 'Plus Jakarta Sans',
  },
  primaryButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: COLORS.ivory,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Plus Jakarta Sans',
  },
});

export default ProfileSetupScreen;
