import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StatusBar, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Props {
  onGetStarted: () => void;
  onLogin: () => void;
}

const COLORS = {
  ivory: '#FAF9F6',
  charcoal: '#1A1A1A',
  textGray: '#555555',
  border: 'rgba(26, 26, 26, 0.2)',
  overlay: 'rgba(250, 249, 246, 0.6)',
};

const WelcomeScreen: React.FC<Props> = ({ onGetStarted, onLogin }) => {
  const bgImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuAOho8UUhAyiUbfquD-vxZsC4-rjFTuzDCVfguzP6EgsIAzVRjKvHFLBFF4Q0ixPqlWDDXNsEbbDwcHhinMRtF3yw52pCkTtNeAhx5Oc6W8pa06ey5hou6mvPr2KntsKEbPPeiYuIq0d1CC-Q48o3nDTmzeIOGep1QTVJYVWBjJJyUaW-1GprMM41JH8xR3OV8SztNO2dFqX0b-ZLzx0qZNORG03arKAPy0O9f75DZr4knkzT_SED9hqKza0fkJ6TgUYyLL8F5bB1Wh";
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Background with Gradient Overlay */}
      <View style={StyleSheet.absoluteFill}>
        <ImageBackground
          source={{ uri: bgImg }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['transparent', COLORS.overlay, COLORS.ivory]}
            style={StyleSheet.absoluteFill}
            locations={[0, 0.5, 1]}
          />
        </ImageBackground>
      </View>

      {/* Header Label */}
      <View style={[styles.header, { paddingTop: insets.top + 32 }]}>
        <Text style={styles.headerLabel}>
          Collection
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.heroSubLabelContainer}>
          <Text style={styles.heroSubLabel}>The New Standard</Text>
        </View>
        <Text style={styles.heroTitle}>
          Connect{"\n"}Beautifully
        </Text>
        <View style={styles.divider}></View>
        <Text style={styles.heroDescription}>
          A sanctuary for meaningful conversation, designed with uncompromising simplicity.
        </Text>
      </View>

      {/* Footer Actions */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={onGetStarted}
            style={styles.primaryButton}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>
              Get Started
            </Text>
          </TouchableOpacity>

          <View style={styles.memberContainer}>
            <Text style={styles.memberLabel}>Existing Member?</Text>
            <TouchableOpacity onPress={onLogin}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  header: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  headerLabel: {
    fontSize: 10,
    fontFamily: 'Plus Jakarta Sans',
    textTransform: 'uppercase',
    letterSpacing: 4,
    opacity: 0.6,
    color: COLORS.charcoal,
  },
  mainContent: {
    flex: 1,
    zIndex: 10,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  heroSubLabelContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heroSubLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
    opacity: 0.4,
    color: COLORS.charcoal,
  },
  heroTitle: {
    color: COLORS.charcoal,
    textAlign: 'center',
    letterSpacing: -1,
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 50,
    fontFamily: 'Newsreader',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  divider: {
    width: 48,
    height: 1,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 32,
  },
  heroDescription: {
    fontFamily: 'Noto Sans',
    color: COLORS.textGray,
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 22,
    maxWidth: 240,
    alignSelf: 'center',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  footer: {
    zIndex: 10,
    paddingHorizontal: 40,
  },
  actionContainer: {
    gap: 24,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.charcoal,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: COLORS.ivory,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  memberContainer: {
    alignItems: 'center',
    gap: 4,
  },
  memberLabel: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.4,
    color: COLORS.charcoal,
  },
  loginLink: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    color: COLORS.charcoal,
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;
