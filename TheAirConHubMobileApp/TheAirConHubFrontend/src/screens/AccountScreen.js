// src/screens/AccountScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { User, Settings, HelpCircle, LogOut, LogIn } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MenuItem from '../components/MenuItem';
import { styles } from '../styles/AppStyles';

const AccountScreen = ({ onShowToast }) => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  // Refresh data every time we visit this tab
  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const session = await AsyncStorage.getItem('userSession');
        if (session) {
          setUserData(JSON.parse(session));
        } else {
          setUserData(null);
        }
      };
      loadUser();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userSession');
    setUserData(null);
    onShowToast('Logged out successfully');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.accountHeader}>
        <Text style={styles.screenHeaderTitle}>Account</Text>
        
        {/* --- CONDITIONAL HEADER --- */}
        {userData ? (
          <View style={styles.profileCard}>
            <View style={styles.profileAvatarContainer}>
              <User size={32} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.userName}>{userData.fullName}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
              <Text style={styles.userPhone}>Points: {userData.pointsBalance || 0}</Text>
            </View>
          </View>
        ) : (
          // SHOW THIS IF NOT LOGGED IN
          <View style={[styles.profileCard, { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 }]}>
            
            <TouchableOpacity 
              style={{ backgroundColor: '#2563EB', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => navigation.navigate('Login')}
            >
              <LogIn size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Login / Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.accountContent}>
        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <MenuItem Icon={Settings} title="Account Settings" onPress={() => onShowToast('Settings - Coming soon!')} />
        <MenuItem Icon={HelpCircle} title="Help & Support" onPress={() => onShowToast('Help & Support - Coming soon!')} />
        
        {/* Only show Logout if logged in */}
        {userData && (
          <MenuItem Icon={LogOut} title="Logout" onPress={handleLogout} showChevron={false} />
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0 (MVP)</Text>
      </View>
    </ScrollView>
  );
};

export default AccountScreen;