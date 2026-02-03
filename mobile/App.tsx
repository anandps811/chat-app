import React, { useState } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Screen } from './types';
import { useFonts } from 'expo-font';

// Screen Imports
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import OTPScreen from './screens/OTPScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import ChatListScreen from './screens/ChatListScreen';
import NewMessageScreen from './screens/NewMessageScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Newsreader_400Regular,
} from '@expo-google-fonts/newsreader';
import {
  NotoSans_400Regular,
} from '@expo-google-fonts/noto-sans';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold
} from '@expo-google-fonts/playfair-display';

const App: React.FC = () => {
  let [fontsLoaded] = useFonts({
    'Plus Jakarta Sans': PlusJakartaSans_400Regular,
    'Newsreader': Newsreader_400Regular,
    'Noto Sans': NotoSans_400Regular,
    'Playfair Display': PlayfairDisplay_400Regular,
  });

  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.WELCOME);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  if (!fontsLoaded) {
    return null;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.WELCOME:
        return (
          <WelcomeScreen
            onGetStarted={() => navigate(Screen.SIGNUP)}
            onLogin={() => navigate(Screen.LOGIN)}
          />
        );
      case Screen.LOGIN:
        return (
          <LoginScreen
            onBack={() => navigate(Screen.WELCOME)}
            onContinue={() => navigate(Screen.OTP)}
          />
        );
      case Screen.SIGNUP:
        return (
          <SignUpScreen
            onBack={() => navigate(Screen.WELCOME)}
            onContinue={() => navigate(Screen.OTP)}
            onLogin={() => navigate(Screen.LOGIN)}
          />
        );
      case Screen.OTP:
        return (
          <OTPScreen
            onBack={() => navigate(Screen.SIGNUP)}
            onVerify={() => navigate(Screen.PROFILE_SETUP)}
            onResend={() => { }}
          />
        );
      case Screen.PROFILE_SETUP:
        return (
          <ProfileSetupScreen
            onBack={() => navigate(Screen.OTP)}
            onContinue={() => navigate(Screen.CHAT_LIST)}
          />
        );
      case Screen.CHAT_LIST:
        return (
          <ChatListScreen
            onNewMessage={() => navigate(Screen.NEW_MESSAGE)}
            onChatClick={(id) => {
              setSelectedChatId(id);
              navigate(Screen.CHAT_DETAIL);
            }}
          />
        );
      case Screen.NEW_MESSAGE:
        return (
          <NewMessageScreen
            onBack={() => navigate(Screen.CHAT_LIST)}
            onSelectContact={(id) => {
              setSelectedChatId(id);
              navigate(Screen.CHAT_DETAIL);
            }}
          />
        );
      case Screen.CHAT_DETAIL:
        return (
          <ChatDetailScreen
            onBack={() => navigate(Screen.CHAT_LIST)}
            chatId={selectedChatId || ''}
          />
        );
      default:
        return <WelcomeScreen onGetStarted={() => navigate(Screen.SIGNUP)} onLogin={() => navigate(Screen.LOGIN)} />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        {renderScreen()}
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#101922',
  },
});

export default App;
