// App.js
import React, { useState, useEffect } from 'react';
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
  
  // FIXED: Default route is now MainTabs (Home), not Login
  const [initialRoute, setInitialRoute] = useState('MainTabs');

  // --- Check for existing session in background ---
  const fetchUserPoints = async () => {
    try {
      const session = await AsyncStorage.getItem('userSession');
      if (!session) return; // If no user, just stay at 0 points
      
      const user = JSON.parse(session);
      const response = await fetch(`${API_URL}/Users/${user.userId}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (response.ok) {
        const data = await response.json();
        setPoints(data.pointsBalance || 0);
      }
    } catch (error) {
      console.error("Failed to fetch points:", error);
    }
  };

  useEffect(() => {
    fetchUserPoints();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  // --- UPDATED: Handle Earn Points (Safe for Guest) ---
  const handleEarnPoints = async (earnedPoints) => {
    try {
      const session = await AsyncStorage.getItem('userSession');
      
      // 1. If NOT logged in, just show toast but don't save to DB
      if (!session) {
        showToast(`You earned ${earnedPoints} pts! (Login to save)`);
        return;
      }

      const user = JSON.parse(session);

      // 2. If Logged In, save to SQL
      const response = await fetch(`${API_URL}/Users/AddPoints`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ 
          userId: user.userId, 
          points: earnedPoints 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPoints(data.newBalance); 
        showToast(`Saved! You earned ${earnedPoints} points.`);
      } else {
        console.error("Failed to save points");
        showToast(`Error saving points`);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      showToast("Connection Error - Points not saved");
    }
  };

  const handleOpenGame = (gameId) => {
    setActiveGameId(gameId);
    setGameVisible(true);
  };

  const Container = Platform.OS === 'web' ? View : SafeAreaView;

  return (
    <Container style={styles.safeArea}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          
          {/* Main App acts as the Landing Page now */}
          <Stack.Screen name="MainTabs">
            {() => (
              <TabNavigator
                showToast={showToast}
                onOpenGame={handleOpenGame}
                points={points} 
              />
            )}
          </Stack.Screen>

          {/* Auth Screens accessible from Account Screen */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          
        </Stack.Navigator>
      </NavigationContainer>

      <ToastMessage
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
      <GameModal
        visible={gameVisible}
        gameId={activeGameId}
        onClose={() => setGameVisible(false)}
        onEarnPoints={handleEarnPoints}
      />
    </Container>
  );
}