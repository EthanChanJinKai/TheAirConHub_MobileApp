// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Imports
import ToastMessage from './src/components/ToastMessage';
import GameModal from './src/components/GameModal';
import TabNavigator from './src/navigation/TabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { styles } from './src/styles/AppStyles';
import { API_URL } from './src/config';

const Stack = createStackNavigator();

export default function App() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [gameVisible, setGameVisible] = useState(false);
  const [activeGameId, setActiveGameId] = useState(null); 

  const [points, setPoints] = useState(0); 
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  const [initialRoute, setInitialRoute] = useState('MainTabs');
  const [isLoading, setIsLoading] = useState(true);

  // --- CENTRAL DATA FETCHING FUNCTION ---
  // We wrap this in useCallback so we can pass it down efficiently
  const fetchUserData = useCallback(async () => {
    try {
      const session = await AsyncStorage.getItem('userSession');
      
      // 1. HANDLE LOGGED OUT / GUEST
      if (!session) {
        setPoints(0);
        setAttemptsLeft(3); // Reset to default for guests
        setIsLoading(false);
        return; 
      }
      
      // 2. HANDLE LOGGED IN
      const user = JSON.parse(session);
      const response = await fetch(`${API_URL}/Users/${user.userId}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (response.ok) {
        const data = await response.json();
        setPoints(data.pointsBalance || 0);

        // Calc Daily Attempts
        const today = new Date().toDateString();
        const lastGameDate = data.lastGameDate ? new Date(data.lastGameDate).toDateString() : null;
        
        let usedAttempts = 0;
        if (lastGameDate === today) {
            usedAttempts = data.dailyAttempts || 0;
        } 
        setAttemptsLeft(Math.max(0, 3 - usedAttempts));
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setIsLoading(false); 
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  const handleEarnPoints = async (earnedPoints) => {
    try {
      const session = await AsyncStorage.getItem('userSession');
      if (!session) {
        showToast(`You earned ${earnedPoints} pts! (Login to save)`);
        return;
      }
      const user = JSON.parse(session);

      const response = await fetch(`${API_URL}/Users/AddPoints`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ userId: user.userId, points: earnedPoints }),
      });

      if (response.ok) {
        const data = await response.json();
        setPoints(data.newBalance); 
        showToast(`Saved! You earned ${earnedPoints} points.`);
      } else {
        showToast(`Error saving points`);
      }
    } catch (error) {
      showToast("Connection Error - Points not saved");
    }
  };

  const handleOpenGame = (gameId) => {
    setActiveGameId(gameId);
    setGameVisible(true);
  };

  const handleVerifyStartGame = async () => {
    const session = await AsyncStorage.getItem('userSession');
    if (!session) return true; 

    const user = JSON.parse(session);

    try {
      const response = await fetch(`${API_URL}/Users/StartGameAttempt`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({ userId: user.userId }),
      });

      const data = await response.json();

      if (response.ok && data.canPlay) {
        setAttemptsLeft(data.remaining);
        showToast(`Game Started! Daily attempts left ${data.remaining}/3`);
        return true; 
      } else {
        showToast("Daily attempts left 0/3. Come back tomorrow!");
        return false; 
      }
    } catch (error) {
      showToast("Connection Error");
      return false;
    }
  };

  const Container = Platform.OS === 'web' ? View : SafeAreaView;

  if (isLoading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Container style={styles.safeArea}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          
          {/* PASS refreshUserData DOWN TO TABS */}
          <Stack.Screen name="MainTabs">
            {() => (
              <TabNavigator
                showToast={showToast}
                onOpenGame={handleOpenGame}
                points={points} 
                attemptsLeft={attemptsLeft}
                refreshUserData={fetchUserData} // <--- NEW PROP
              />
            )}
          </Stack.Screen>

          {/* PASS refreshUserData DOWN TO LOGIN/REGISTER */}
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} refreshUserData={fetchUserData} />}
          </Stack.Screen>
          
          <Stack.Screen name="Register">
            {(props) => <RegisterScreen {...props} refreshUserData={fetchUserData} />}
          </Stack.Screen>

        </Stack.Navigator>
      </NavigationContainer>

      <ToastMessage
        visible={toastVisible}
        message={toastMessage}
        onHide={hideToast}
      />
      <GameModal
        visible={gameVisible}
        initialGameKey={activeGameId}
        onClose={() => setGameVisible(false)}
        onEarnPoints={handleEarnPoints}
        onStartGame={handleVerifyStartGame}
        toastVisible={toastVisible}
        toastMessage={toastMessage}
        onHideToast={hideToast}
      />
    </Container>
  );
}