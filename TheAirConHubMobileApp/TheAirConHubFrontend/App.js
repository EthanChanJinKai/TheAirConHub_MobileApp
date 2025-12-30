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
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  // --- NEW: Helper to fetch latest points from SQL ---
  const fetchUserPoints = async () => {
    try {
      const session = await AsyncStorage.getItem('userSession');
      if (!session) return;
      const user = JSON.parse(session);

      // Fetch User Details (which includes PointsBalance)
      const response = await fetch(`${API_URL}/Users/${user.userId}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (response.ok) {
        const data = await response.json();
        // Update state with the Real SQL Balance
        setPoints(data.pointsBalance || 0);
      }
    } catch (error) {
      console.error("Failed to fetch points:", error);
    }
  };

  // Check Login Status & Fetch Points on Startup
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userSession = await AsyncStorage.getItem('userSession');
        if (userSession) {
          setInitialRoute('MainTabs');
          // Fetch points immediately if logged in
          await fetchUserPoints();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  // --- UPDATED: Handle Earn Points (Auto-Refresh Logic) ---
  const handleEarnPoints = async (earnedPoints) => {
    try {
      const session = await AsyncStorage.getItem('userSession');
      if (!session) return;
      const user = JSON.parse(session);

      console.log(`Sending ${earnedPoints} points to User ID: ${user.userId}`);

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
        
        // KEY CHANGE: Use the 'newBalance' from the server directly
        // This ensures the UI is perfectly synced with the database.
        setPoints(data.newBalance); 
        
        showToast(`Saved! You earned ${earnedPoints} points.`);
      } else {
        console.error("Failed to save points");
        showToast(`Earned ${earnedPoints} pts (Local Only - Error Saving)`);
        // Fallback: update locally just in case
        setPoints(prev => prev + earnedPoints);
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

  if (isLoading) {
    return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator size="large" color="#2563EB" /></View>;
  }

  return (
    <Container style={styles.safeArea}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          
          <Stack.Screen name="MainTabs">
            {() => (
              <TabNavigator
                showToast={showToast}
                onOpenGame={handleOpenGame}
                points={points} // Passes the live points down
              />
            )}
          </Stack.Screen>
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