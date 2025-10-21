// src/screens/AccountScreen.js

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react-native';
import MenuItem from '../components/MenuItem';
import { styles } from '../styles/AppStyles';

const AccountScreen = ({ onShowToast }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.accountHeader}>
        <Text style={styles.screenHeaderTitle}>Account</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatarContainer}>
            <User size={32} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>johndoe@email.com</Text>
            <Text style={styles.userPhone}>+65 9123 4567</Text>
          </View>
        </View>
      </View>

      <View style={styles.accountContent}>
        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <MenuItem
          Icon={Settings}
          title="Account Settings"
          onPress={() => onShowToast('Settings - Coming soon!')}
        />
        <MenuItem
          Icon={HelpCircle}
          title="Help & Support"
          onPress={() => onShowToast('Help & Support - Coming soon!')}
        />
        <MenuItem
          Icon={LogOut}
          title="Logout"
          onPress={() => onShowToast('Logout - Coming soon!')}
          showChevron={false}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0 (MVP)</Text>
        <Text style={styles.footerText}>© 2025 TheAirConHub</Text>
      </View>
    </ScrollView>
  );
};

export default AccountScreen;