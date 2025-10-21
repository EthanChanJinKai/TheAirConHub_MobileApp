// App.js

import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import ToastMessage from './src/components/ToastMessage';
import GameModal from './src/components/GameModal';
import TabNavigator from './src/navigation/TabNavigator';
import { styles } from './src/styles/AppStyles';

export default function App() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [gameVisible, setGameVisible] = useState(false);
  const [points, setPoints] = useState(850);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleEarnPoints = (earnedPoints) => {
    setPoints((prev) => prev + earnedPoints);
    showToast(`You earned ${earnedPoints} points!`);
  };

  const Container = Platform.OS === 'web' ? View : SafeAreaView;

  return (
    <Container style={styles.safeArea}>
      <NavigationContainer>
        <TabNavigator
          showToast={showToast}
          onOpenGame={() => setGameVisible(true)}
          points={points}
        />
      </NavigationContainer>

      <ToastMessage
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />

      <GameModal
        visible={gameVisible}
        onClose={() => setGameVisible(false)}
        onEarnPoints={handleEarnPoints}
      />
    </Container>
  );
}