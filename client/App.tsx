
import React, { useState } from 'react';
import { Screen } from './types';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import OTPScreen from './screens/OTPScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import ChatListScreen from './screens/ChatListScreen';
import NewMessageScreen from './screens/NewMessageScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.WELCOME);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleChatSelection = (chatId: string) => {
    setSelectedChatId(chatId);
    navigate(Screen.CHAT_DETAIL);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.WELCOME:
        return <WelcomeScreen onGetStarted={() => navigate(Screen.SIGNUP)} onLogin={() => navigate(Screen.LOGIN)} />;
      case Screen.LOGIN:
        return (
          <LoginScreen 
            onBack={() => navigate(Screen.WELCOME)} 
            onContinue={(id) => {
              setLoginIdentifier(id);
              navigate(Screen.OTP);
            }} 
          />
        );
      case Screen.SIGNUP:
        return (
          <SignUpScreen 
            onBack={() => navigate(Screen.WELCOME)} 
            onSignUp={() => navigate(Screen.OTP)} 
            onLogin={() => navigate(Screen.LOGIN)}
          />
        );
      case Screen.OTP:
        return (
          <OTPScreen 
            identifier={loginIdentifier || '+1 (555) 0123'}
            onBack={() => navigate(Screen.LOGIN)} 
            onVerify={() => navigate(Screen.PROFILE_SETUP)} 
          />
        );
      case Screen.PROFILE_SETUP:
        return (
          <ProfileSetupScreen 
            onComplete={() => navigate(Screen.CHAT_LIST)} 
            onSkip={() => navigate(Screen.CHAT_LIST)}
            onBack={() => navigate(Screen.OTP)}
          />
        );
      case Screen.CHAT_LIST:
        return (
          <ChatListScreen 
            onNewMessage={() => navigate(Screen.NEW_MESSAGE)} 
            onChatClick={handleChatSelection}
          />
        );
      case Screen.CHAT_DETAIL:
        return (
          <ChatDetailScreen 
            chatId={selectedChatId || '1'} 
            onBack={() => navigate(Screen.CHAT_LIST)} 
          />
        );
      case Screen.NEW_MESSAGE:
        return (
          <NewMessageScreen 
            onCancel={() => navigate(Screen.CHAT_LIST)} 
          />
        );
      default:
        return <WelcomeScreen onGetStarted={() => navigate(Screen.SIGNUP)} onLogin={() => navigate(Screen.LOGIN)} />;
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-black overflow-hidden">
      <div className="relative w-full max-w-[430px] h-screen bg-background-dark shadow-2xl overflow-hidden border-x border-slate-800">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
