// src/navigation/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Gift, User } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import BookingsScreen from '../screens/BookingsScreen';
import RewardsScreen from '../screens/RewardsScreen';
import AccountScreen from '../screens/AccountScreen';

const Tab = createBottomTabNavigator();

// Accept 'refreshUserData' prop
const TabNavigator = ({ showToast, onOpenGame, points, attemptsLeft, refreshUserData }) => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#2563EB',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
    }}
  >
    <Tab.Screen
      name="Home"
      options={{ tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }}
    >
      {() => <HomeScreen onShowToast={showToast} />}
    </Tab.Screen>

    <Tab.Screen
      name="Bookings"
      component={BookingsScreen}
      options={{ tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} /> }}
    />

    <Tab.Screen
      name="Rewards"
      options={{ tabBarIcon: ({ color, size }) => <Gift size={size} color={color} /> }}
    >
      {() => (
        <RewardsScreen
          onShowToast={showToast}
          onOpenGame={onOpenGame}
          points={points}
          attemptsLeft={attemptsLeft}
          refreshUserData={refreshUserData} // <--- Pass it here!
        />
      )}
    </Tab.Screen>

    <Tab.Screen
      name="Account"
      options={{ tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }}
    >
      {() => <AccountScreen onShowToast={showToast} refreshUserData={refreshUserData} />} 
      {/* Pass to Account for Logout */}
    </Tab.Screen>
  </Tab.Navigator>
);

export default TabNavigator;