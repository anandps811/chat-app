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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface Props {
  onBack: () => void;
  onContinue: (identifier: string) => void;
}

const COLORS = {
  ivory: '#FAF9F6',
  charcoal: '#1A1A1A',
  bgDark: '#101922',
  primary: '#137fec',
  slate400: '#94a3b8',
  slate700: '#334155',
  slate900: '#0f172a',
};

const LoginScreen: React.FC<Props> = ({ onBack, onContinue }) => {
  const [identifier, setIdentifier] = useState('');
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to catch up on your{"\n"}latest conversations.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email or Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. name@email.com"
              placeholderTextColor="#475569"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Action Button */}
          <TouchableOpacity
            disabled={!identifier}
            onPress={() => onContinue(identifier)}
            style={[styles.primaryButton, !identifier && styles.buttonDisabled]}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>

          {/* Secondary Action */}
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot details?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{"\n"}
            <Text style={styles.underline}>Terms of Service</Text> and <Text style={styles.underline}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
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
    fontSize: 16,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '500',
    color: COLORS.ivory,
    marginBottom: 12,
  },
  input: {
    height: 56,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: COLORS.slate700,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
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
  forgotBtn: {
    alignSelf: 'center',
    marginTop: 20,
    padding: 8,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Newsreader',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Newsreader',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
  },
  underline: {
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
