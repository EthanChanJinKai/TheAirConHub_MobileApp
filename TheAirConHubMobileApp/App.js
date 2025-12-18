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

const Stack = createStackNavigator();

export default function App() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [gameVisible, setGameVisible] = useState(false);
  const [points, setPoints] = useState(850);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  // Check if user is already logged in when app starts
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userSession = await AsyncStorage.getItem('userSession');
        if (userSession) {
          setInitialRoute('MainTabs');
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

  const handleEarnPoints = (earnedPoints) => {
    setPoints((prev) => prev + earnedPoints);
    showToast(`You earned ${earnedPoints} points!`);
  };

  const Container = Platform.OS === 'web' ? View : SafeAreaView;

  if (isLoading) {
    return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator size="large" color="#2563EB" /></View>;
  }

  return (
    <Container style={styles.safeArea}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          
          {/* Auth Screens */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />

          {/* Main App (Your existing Tabs) */}
          <Stack.Screen name="MainTabs">
            {() => (
              <TabNavigator
                showToast={showToast}
                onOpenGame={() => setGameVisible(true)}
                points={points}
              />
            )}
          </Stack.Screen>

        </Stack.Navigator>
      </NavigationContainer>

      {/* Global Modals */}
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