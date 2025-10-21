// src/components/MenuItem.js

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { styles } from '../styles/AppStyles';

// Menu Item Component
const MenuItem = ({ Icon, title, onPress, showChevron = true }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuContent}>
      <View style={styles.menuIconContainer}>
        <Icon size={20} color="#2563EB" />
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
    </View>
    {showChevron && <ChevronRight size={20} color="#9CA3AF" />}
  </TouchableOpacity>
);

export default MenuItem;