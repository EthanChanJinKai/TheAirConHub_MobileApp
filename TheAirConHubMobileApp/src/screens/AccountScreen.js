// src/screens/AccountScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import MenuItem from '../components/MenuItem';
import { styles } from '../styles/AppStyles';

const AccountScreen = ({ onShowToast }) => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Load user data from storage
    const loadUser = async () => {
      const session = await AsyncStorage.getItem('userSession');
      if (session) {
        setUserData(JSON.parse(session));
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userSession');
    navigation.replace('Login'); // Go back to Login Screen
  };

  if (!userData) {
    return <View style={{flex:1, justifyContent:'center'}}><Text>Loading...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.accountHeader}>
        <Text style={styles.screenHeaderTitle}>Account</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatarContainer}>
            <User size={32} color="#2563EB" />
          </View>
          <View>
            {/* Displaying Real Data from SQL DB */}
            <Text style={styles.userName}>{userData.name || userData.fullName}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <Text style={styles.userPhone}>Points: {userData.pointsBalance || 0}</Text>
          </View>
        </View>
      </View>

      <View style={styles.accountContent}>
        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <MenuItem Icon={Settings} title="Account Settings" onPress={() => onShowToast('Settings - Coming soon!')} />
        <MenuItem Icon={HelpCircle} title="Help & Support" onPress={() => onShowToast('Help & Support - Coming soon!')} />
        
        {/* Real Logout Button */}
        <MenuItem Icon={LogOut} title="Logout" onPress={handleLogout} showChevron={false} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0 (MVP)</Text>
      </View>
    </ScrollView>
  );
};

export default AccountScreen;