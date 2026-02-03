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
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  onBack: () => void;
  onVerify: (code: string) => void;
  onResend: () => void;
}

const COLORS = {
  ivory: '#FAF9F6',
  charcoal: '#1A1A1A',
  bgDark: '#101922',
  primary: '#137fec',
  slate400: '#94a3b8',
  slate700: '#334155',
};

const OTPScreen: React.FC<Props> = ({ onBack, onVerify, onResend }) => {
  const [code, setCode] = useState('');
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
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code we sent{"\n"}to your email.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Security Code</Text>
            <TextInput
              style={styles.input}
              placeholder="0 0 0 0 0 0"
              placeholderTextColor="#475569"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              letterSpacing={8}
              textAlign="center"
            />
          </View>

          {/* Action Button */}
          <TouchableOpacity
            disabled={code.length < 6}
            onPress={() => onVerify(code)}
            style={[styles.primaryButton, code.length < 6 && styles.buttonDisabled]}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Verify Code</Text>
          </TouchableOpacity>

          {/* Secondary Action */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendLabel}>Didn't receive a code?</Text>
            <TouchableOpacity onPress={onResend}>
              <Text style={styles.resendBtn}>Resend code</Text>
            </TouchableOpacity>
          </View>
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
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: COLORS.ivory,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    height: 64,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: COLORS.slate700,
    borderRadius: 12,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.ivory,
    fontFamily: 'Plus Jakarta Sans',
  },
  primaryButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: COLORS.ivory,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Plus Jakarta Sans',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  resendLabel: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    color: COLORS.slate400,
  },
  resendBtn: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});

export default OTPScreen;
